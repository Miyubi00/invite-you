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
const RATE_WINDOW_MS = 15 * 60 * 1000 // 15 menit
const MAX_ORDERS_PER_IP = 10 // batas ketat anti-spam publik (10 percobaan per IP per 15 menit)
const RATE_LIMIT_MSG = 'Terlalu banyak pemesanan dari perangkat ini. Silakan coba lagi dalam beberapa menit.'

type SupabaseAdmin = ReturnType<typeof createClient>

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? req.headers.get('cf-connecting-ip') ?? 'unknown'
}

/**
 * Hitung jumlah pemesanan per IP dalam jendela waktu.
 * FAIL-CLOSED (3.4): bila tabel order_attempts belum ada / query gagal, error
 * dilempar ke pemanggil yang membalas 503 (pemesanan ditolak) — bukan lagi
 * membuka anti-spam tanpa batas. Wajib migrasi 20260824140000_order_attempts.sql.
 */
async function countRecentAttempts(admin: SupabaseAdmin, ip: string): Promise<number> {
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
  const { count } = await admin
    .from('order_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('attempted_at', since)
  return count ?? 0
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
    const { groom_name, bride_name, wedding_date, whatsapp, email, template_slug, payment_method, captcha_token } = await req.json()

    // --- Validasi Cloudflare Turnstile Captcha ---
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (turnstileSecret) {
      if (!captcha_token || typeof captcha_token !== 'string') {
        throw new Error('Verifikasi keamanan (Captcha) diperlukan.')
      }

      const form = new URLSearchParams()
      form.append('secret', turnstileSecret)
      form.append('response', captcha_token)
      if (ip && ip !== 'unknown') {
        form.append('remoteip', ip)
      }

      try {
        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        })

        const outcome = await turnstileRes.json()
        if (!outcome.success) {
          console.warn(`[create-order] Turnstile Captcha gagal (ip=${ip}):`, outcome['error-codes'])
          throw new Error('Verifikasi keamanan (Captcha) tidak valid atau telah kedaluwarsa. Silakan coba lagi.')
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('Verifikasi keamanan')) {
          throw err
        }
        console.error('[create-order] Gagal memverifikasi Turnstile:', err)
        throw new Error('Gagal memverifikasi keamanan Captcha. Silakan coba lagi.')
      }
    }

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
    const todayIso = new Date().toISOString().split('T')[0]
    if (wedding_date < todayIso) {
      throw new Error('Tanggal pernikahan tidak boleh di masa lalu.')
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

    // --- RATE LIMITING: cek sebelum melakukan kerja (fail-closed 3.4) ---
    let recent = 0
    try {
      recent = await countRecentAttempts(admin, ip)
    } catch (e) {
      console.error('[create-order] Rate limit tidak tersedia (fail-closed):', e)
      return new Response(
        JSON.stringify({ error: 'Sistem keamanan sedang tidak tersedia. Pastikan migrasi order_attempts sudah dijalankan, lalu hubungi admin.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 },
      )
    }
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

    // --- Hitung biaya layanan / admin fee sesuai metode pembayaran ---
    let adminFee = 0
    let feeName = ''

    if (payment_method === 'qris' || payment_method === 'other_qris') {
      adminFee = Math.ceil(template.price * 0.007) // 0.7% QRIS
      feeName = 'QRIS (0.7%)'
    } else if (payment_method === 'gopay' || payment_method === 'shopeepay' || payment_method === 'dana') {
      adminFee = Math.ceil(template.price * 0.015) // 1.5% E-Wallet
      feeName = 'E-Wallet (1.5%)'
    } else if (payment_method === 'whatsapp') {
      adminFee = 0
      feeName = 'Gratis (Transfer Manual)'
    } else {
      // Virtual Account Bank
      adminFee = 4000 // Flat Rp 4.000
      feeName = 'Virtual Account (Flat Rp 4.000)'
    }

    const grossAmount = template.price + adminFee

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
          price: grossAmount,
          event_details: {
            payment_method,
            base_price: template.price,
            admin_fee: adminFee,
            template_name: template.name,
          },
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

    let enabledPayments: string[] = ['other_qris']

    if (payment_method === 'qris' || payment_method === 'dana') {
      enabledPayments = ['other_qris']
    } else if (payment_method === 'gopay') {
      enabledPayments = ['gopay']
    } else if (payment_method === 'shopeepay') {
      enabledPayments = ['shopeepay']
    } else if (payment_method === 'bca_va') {
      enabledPayments = ['bca_va']
    } else if (payment_method === 'echannel' || payment_method === 'mandiri_va') {
      enabledPayments = ['echannel']
    } else if (payment_method === 'bni_va') {
      enabledPayments = ['bni_va']
    } else if (payment_method === 'bri_va') {
      enabledPayments = ['bri_va']
    } else if (payment_method === 'cimb_va') {
      enabledPayments = ['cimb_va']
    } else if (payment_method === 'permata_va') {
      enabledPayments = ['permata_va']
    } else if (payment_method === 'seabank_va' || payment_method === 'bsi_va' || payment_method === 'other_va') {
      enabledPayments = ['other_va']
    } else if (payment_method === 'bank_transfer') {
      enabledPayments = ['bca_va', 'echannel', 'bni_va', 'bri_va', 'cimb_va', 'other_va']
    }

    const itemDetails: Array<{ id: string; price: number; quantity: number; name: string }> = [
      {
        id: template_slug,
        price: template.price,
        quantity: 1,
        name: `Undangan Digital - ${template.name}`,
      },
    ]

    if (adminFee > 0) {
      itemDetails.push({
        id: `fee-${payment_method || 'admin'}`,
        price: adminFee,
        quantity: 1,
        name: `Biaya Layanan ${feeName}`,
      })
    }

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
      item_details: itemDetails,
      enabled_payments: enabledPayments,
      custom_expiry: {
        expiry_duration: 15,
        unit: 'minute',
      },
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