// supabase/functions/payment-status/index.ts
// Status pembayaran untuk halaman /payment-status.
//
// Model kapabilitas: pemanggil harus menyertakan `midtrans_order_id`
// (string acak yang hanya dibagikan ke pembayar lewat redirect URL
// Midtrans). Sebagai gantinya fungsi mengembalikan kolom terbatas —
// PIN hanya saat sukses, Snap token hanya saat pending (untuk
// "Bayar Sekarang"). Tidak ada enumerasi pesanan.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Kunci origin via secret ALLOWED_ORIGIN (mis. https://domainanda.com).
// Belum diset -> '*' agar development/sandbox tetap berfungsi.
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const { midtrans_order_id } = await req.json()

    if (
      typeof midtrans_order_id !== 'string' ||
      midtrans_order_id.length === 0 ||
      midtrans_order_id.length > 255
    ) {
      return json({ error: 'midtrans_order_id wajib dikirim.' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: order, error } = await admin
      .from('orders')
      .select(
        'payment_status, groom_name, bride_name, slug, email, snap_token, pin_code',
      )
      .eq('midtrans_order_id', midtrans_order_id)
      .maybeSingle()

    if (error) throw new Error(error.message)

    if (!order) {
      // Belum ketemu — klien boleh polling lagi (order bisa baru dibuat).
      return json({ found: false }, 404)
    }

    const isPending = order.payment_status === 'pending'
    const isSuccess = order.payment_status === 'success'

    return json(
      {
        found: true,
        payment_status: order.payment_status,
        groom_name: order.groom_name,
        bride_name: order.bride_name,
        slug: order.slug,
        email: order.email ?? null,
        // Token bayar-ulang hanya relevan (dan hanya diberikan) saat pending.
        snap_token: isPending ? order.snap_token : null,
        // PIN hanya ditampilkan kepada pemegang capability saat lunas.
        pin_code: isSuccess ? order.pin_code : null,
      },
      200,
    )
  } catch (err) {
    console.error('[payment-status] Error:', err)
    return json(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    )
  }
})
