// supabase/functions/create-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  resolveMidtransEnvironment,
  snapApiBaseUrl,
} from '../_shared/midtrans.ts'
import { normalizeWhatsapp } from '../_shared/whatsapp.ts'
import { reportError } from '../_shared/monitoring.ts'

// Kunci origin via secret ALLOWED_ORIGIN (mis. https://domainanda.com).
// Belum diset -> '*' agar development/sandbox tetap berfungsi.
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/* --- RATE LIMITING (anti-spam pemesanan) ---
 * Basis data: tabel public.order_attempts (lihat migrasi
 * 20260824140000_order_attempts.sql). Fail-open bila tabel belum ada.
 */
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 jam
const MAX_ORDERS_PER_IP = 5 // maksimal 5 pemanggilan/jam per IP
const RATE_LIMIT_MSG = 'Terlalu banyak pemesanan dari perangkat ini. Silakan coba lagi dalam 1 jam.'

type SupabaseAdmin = ReturnType<typeof createClient>

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? req.headers.get('cf-connecting-ip') ?? 'unknown'
}

async function countRecentAttempts(admin: SupabaseAdmin, ip: string): Promise<number> {
  try {
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count } = await admin
      .from('order_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('attempted_at', since)
    return count ?? 0
  } catch (e) {
    console.error('[create-order] Gagal cek rate limit:', e)
    return 0 // fail-open
  }
}

async function recordAttempt(admin: SupabaseAdmin, ip: string, success: boolean): Promise<void> {
  try {
    await admin.from('order_attempts').insert({ ip_address: ip, success })
  } catch (e) {
    console.error('[create-order] Gagal mencatat percobaan:', e)
  }
}

function generateSlug(groom: string, bride: string): string {
  const clean = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${clean(groom)}-${clean(bride)}-${rand}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders } as ResponseInit)
  }

  const ip = getClientIp(req)
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const { groom_name, bride_name, wedding_date, whatsapp, email, template_slug } = await req.json()

    // --- Validasi server-side (ketat) ---
    if (typeof groom_name !== 'string' || !groom_name.trim() || groom_name.trim().length > 80) {
      throw new Error('Nama mempelai pria wajib diisi (maks. 80 karakter).')
    }
    if (typeof bride_name !== 'string' || !bride_name.trim() || bride_name.trim().length > 80) {
      throw new Error('Nama mempelai wanita wajib diisi (maks. 80 karakter).')
    }
    if (typeof wedding_date !== 'string' || !DATE_RE.test(wedding_date)) {
      throw new Error('Tanggal pernikahan tidak valid (format YYYY-MM-DD).')
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 320) {
      throw new Error('Email tidak valid. PIN akan dikirim ke email ini.')
    }
    if (typeof whatsapp !== 'string') {
      throw new Error('Nomor WhatsApp tidak valid.')
    }
    const normalizedWa = normalizeWhatsapp(whatsapp)
    if (!normalizedWa) {
      throw new Error('Nomor WhatsApp tidak valid.')
    }
    if (typeof template_slug !== 'string' || !template_slug.trim()) {
      throw new Error('Template belum dipilih.')
    }

    // --- RATE LIMITING: cek sebelum melakukan kerja (Midtrans/DB tulis) ---
    const recent = await countRecentAttempts(admin, ip)
    if (recent >= MAX_ORDERS_PER_IP) {
      console.warn(`[create-order] Rate limit dipicu (ip=${ip}, hit=${recent} dalam 1 jam)`)
      return new Response(
        JSON.stringify({ error: RATE_LIMIT_MSG }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 },
      )
    }

    // --- Ambil harga template dari database ---
    const { data: template, error: tplError } = await admin
      .from('templates')
      .select('name, price')
      .eq('slug', template_slug)
      .single()

    if (tplError || !template) {
      throw new Error('Template tidak ditemukan.')
    }

    // --- Ambil & bersihkan Server Key ---
    const rawKey = Deno.env.get('MIDTRANS_SERVER_KEY') || ''
    const midtransServerKey = rawKey.trim().replace(/^["']|["']$/g, '')

    if (!midtransServerKey) {
      throw new Error('MIDTRANS_SERVER_KEY not configured')
    }

    // --- Pilih environment Midtrans (SATU sumber kebenaran) ---
    const midtransEnv = resolveMidtransEnvironment(
      Deno.env.get('MIDTRANS_IS_PRODUCTION'),
    )
    const midtransApiUrl = snapApiBaseUrl(midtransEnv)

    const orderId = `undangan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const grossAmount = template.price

    // --- Simpan order DULU (status pending, tanpa snap_token) ---
    // Urutan ini mencegah divergensi state: transaksi Midtrans tidak
    // pernah ada tanpa baris lokal. Bila pembuatan token gagal, baris
    // ditandai 'failed' sebagai jejak audit (bukan hilang diam-diam).
    let order: Record<string, unknown> | null = null
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await admin
        .from('orders')
        .insert({
          groom_name: groom_name.trim(),
          bride_name: bride_name.trim(),
          wedding_date,
          whatsapp: normalizedWa,
          email,
          template_slug,
          slug: generateSlug(groom_name, bride_name),
          midtrans_order_id: orderId,
          payment_status: 'pending',
          event_details: {},
        })
        .select()
        .single()

      if (!error) {
        order = data
        break
      }
      // 23505 = unique violation (slug bentrok) -> coba sufiks acak baru.
      if ((error as { code?: string }).code === '23505') continue
      console.error('[create-order] Database error:', error)
      throw new Error('Failed to create order')
    }
    if (!order) {
      throw new Error('Failed to create order')
    }

    // Redirect setelah pembayaran (Midtrans otomatis menambahkan
    // ?order_id=&status_code=&transaction_status= ke URL finish).
    const appUrl = Deno.env.get('APP_URL') || ''

    const transactionParams: Record<string, unknown> = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: groom_name.trim(),
        last_name: bride_name.trim(),
        phone: normalizedWa,
        email,
      },
      item_details: [
        {
          id: template_slug,
          price: grossAmount,
          quantity: 1,
          name: `Undangan Digital - ${template.name}`,
        },
      ],
    }

    if (appUrl) {
      transactionParams.callbacks = {
        finish: `${appUrl}/payment-status`,
        unfinish: `${appUrl}/payment-status`,
        error: `${appUrl}/payment-status`,
      }
    }

    const auth = btoa(`${midtransServerKey}:`)
    const snapResponse = await fetch(midtransApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionParams),
    })

    if (!snapResponse.ok) {
      const errorBody = await snapResponse.text()
      console.error('[create-order] Midtrans API error:', errorBody)
      // Tandai gagal agar terlihat di admin panel & halaman status.
      await admin.from('orders').update({ payment_status: 'failed' }).eq('id', (order as { id: string }).id)
      throw new Error('Failed to generate payment token')
    }

    const snapData = await snapResponse.json()

    // --- Simpan token ke baris yang sudah ada ---
    const { error: tokenError } = await admin
      .from('orders')
      .update({ snap_token: snapData.token })
      .eq('id', (order as { id: string }).id)
    if (tokenError) {
      // Token tetap dikirim — klien bisa lanjut bayar; webhook mengaktifkan.
      console.error('[create-order] Gagal menyimpan snap_token:', tokenError)
    }

    // Catat percobaan sukses (untuk statistik & konsumsi rate limit).
    await recordAttempt(admin, ip, true)

    return new Response(
      JSON.stringify({
        snap_token: snapData.token,
        order_id: orderId,
        redirect_url: snapData.redirect_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    console.error('[create-order] Function error:', error)
    void reportError(error, { fn: 'create-order', ip })
    // Catat percobaan gagal agar rate limit ikut menghitung request invalid.
    try {
      await recordAttempt(admin, ip, false)
    } catch {
      /* abaikan — catatan gagal tidak boleh menggagalkan respons */
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})