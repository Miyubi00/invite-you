// supabase/functions/midtrans-webhook/index.ts
// Notifikasi pembayaran Midtrans.
//
// Keamanan (hardened):
// - Signature sha512(order_id + status_code + gross_amount + serverKey)
//   WAJIB ada dan cocok — signature hilang/salah/malformed => 403.
// - Payload malformed => 400. Status tak dikenal/refund/pending => di-ack
//   TANPA menulis ke database (tidak pernah menimpa status).
//
// Integritas pembayaran:
// - Aktivasi (pending -> success) memakai conditional update
//   (.neq payment_status 'success' + count). Webhook duplikat/retry dari
//   Midtrans hanya mengaktifkan sekali: PIN & email tidak pernah ganda.
// - Guard monotonik: notifikasi deny/cancel/expire yang datang terlambat
//   TIDAK BISA menurunkan pesanan yang sudah 'success'.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateUniquePin } from '../_shared/pin.ts'
import { sendPinEmail } from '../_shared/resendEmail.ts'
import { reportError } from '../_shared/monitoring.ts'
import {
  extractNotificationFields,
  mapTransactionStatus,
  verifyMidtransSignature,
} from '../_shared/midtrans.ts'

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    // --- 1. Parse & validate payload ---
    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const fields = extractNotificationFields(raw)
    if (!fields) {
      console.error('[webhook] Malformed notification payload')
      return json({ error: 'Malformed notification payload' }, 400)
    }

    // --- 2. STRICT signature verification (anti-forgery) ---
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    if (!serverKey) {
      console.error('[webhook] MIDTRANS_SERVER_KEY not configured')
      return json({ error: 'Server not configured' }, 500)
    }

    const signatureValid = await verifyMidtransSignature(fields, serverKey)
    if (!signatureValid) {
      console.error('[webhook] Invalid/missing signature for', fields.orderId)
      return json({ error: 'Invalid signature' }, 403)
    }

    // --- 3. Map status (null => jangan tulis apa pun ke DB) ---
    const mapped = mapTransactionStatus(
      (raw as Record<string, unknown>).transaction_status,
      (raw as Record<string, unknown>).fraud_status,
    )
    if (!mapped) {
      // pending / challenge / refund / unknown — ack tanpa mengubah state.
      return json({ ok: true, activated: false, ignored: true }, 200)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // --- 4. Ambil order ---
    const { data: order, error: fetchError } = await admin
      .from('orders')
      .select('id, payment_status, whatsapp, email, groom_name, bride_name')
      .eq('midtrans_order_id', fields.orderId)
      .single()

    if (fetchError || !order) {
      console.error('[webhook] Order not found:', fields.orderId)
      return json({ error: 'Order not found' }, 404)
    }

    // --- 5. Transisi pending -> success (atomik + idempoten) ---
    if (mapped === 'success') {
      if (order.payment_status === 'success') {
        // Webhook duplikat untuk pesanan yang sudah aktif.
        return json({ ok: true, activated: false, duplicate: true }, 200)
      }

      const pin = await generateUniquePin(admin, order.whatsapp)

      // Conditional update: hanya baris yang BELUM success bisa terupdate.
      // Bila dua webhook berjalan bersamaan, tepat satu mendapat count=1;
      // yang lain menerima count=0 dan berhenti tanpa kirim email kedua.
      const { count, error: updateError } = await admin
        .from('orders')
        .update(
          { pin_code: pin, payment_status: 'success' },
          { count: 'exact' },
        )
        .eq('id', order.id)
        .neq('payment_status', 'success')

      if (updateError) {
        throw new Error(`Gagal mengaktifkan pesanan: ${updateError.message}`)
      }
      if ((count ?? 0) === 0) {
        return json({ ok: true, activated: false, duplicate: true }, 200)
      }

      // Email PIN — kegagalan email tidak membatalkan aktivasi; cukup log.
      const emailResult = await sendPinEmail({
        to: order.email,
        groomName: order.groom_name,
        brideName: order.bride_name,
        pin,
      })
      if (!emailResult.ok) {
        console.error(
          `[webhook] Email PIN gagal terkirim untuk order ${order.id}: ${emailResult.error}`,
        )
        void reportError(new Error(`Email PIN gagal: ${emailResult.error}`), {
          fn: 'midtrans-webhook',
          orderId: order.id,
        })
      }

      return json(
        { ok: true, activated: true, email_sent: emailResult.ok },
        200,
      )
    }

    // --- 6. Transisi ke failed dengan guard monotonik ---
    // Tidak pernah menurunkan pesanan yang sudah 'success'.
    const { error: failError } = await admin
      .from('orders')
      .update({ payment_status: 'failed' }, { count: 'exact' })
      .eq('id', order.id)
      .neq('payment_status', 'success')

    if (failError) {
      throw new Error(`Gagal memperbarui status: ${failError.message}`)
    }

    return json({ ok: true, activated: false }, 200)
  } catch (error) {
    // 5xx agar Midtrans melakukan retry (error transient), bukan 4xx.
    console.error('[webhook] Error:', error)
    void reportError(error, { fn: 'midtrans-webhook' })
    return json(
      { error: error instanceof Error ? error.message : String(error) },
      500,
    )
  }
})
