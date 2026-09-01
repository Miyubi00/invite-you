// supabase/functions/og-meta/index.ts
// Server-side Open Graph injector untuk preview thumbnail WhatsApp/Twitter.
//
// Latar: situs ini SPA (semua path direwrite ke index.html) dan WhatsApp
// TIDAK menjalankan JavaScript, jadi crawler WA tidak pernah melihat meta
// tag yang disuntik React. Solusinya: vercel.json me-rewrite /wedding/:slug
// dan /demo/:slug ke function ini, yang:
//   1. Mengambil index.html produksi (cache 5 menit di memori),
//   2. Menyuntikkan og:* / twitter:* sesuai data undangan dari DB,
//   3. Mengembalikannya — browser tetap menjalankan SPA seperti biasa.
//
// Data diambil dari view `public_invitations` (hanya payment_status success)
// dan `templates` (nama tema untuk demo). Tidak ada data sensitif.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = (Deno.env.get('SITE_URL') ?? 'https://loverse.my.id').replace(/\/+$/, '')
const DEFAULT_OG_IMAGE = `${SITE_URL}/emerald-royale.png`

// Slug yang memiliki thumbnail statis di public/ (screenshot tema).
const DEMO_THUMBS = new Set([
  'board-game', 'chiikawa', 'cinamon', 'claymorphism', 'emerald-royale',
  'hello-kitty', 'lantern-night', 'motion-flow', 'neumorph', 'ocean-vows',
  'pop-card', 'roblox', 'sage-terracotta', 'sakura-breeze', 'spiderman', 'zine-raw',
])

// Cache index.html produksi agar tiap share WA tidak menembak situs utama.
let htmlCache: { html: string; at: number } | null = null
const HTML_CACHE_MS = 5 * 60 * 1000

async function getIndexHtml(): Promise<string> {
  if (htmlCache && Date.now() - htmlCache.at < HTML_CACHE_MS) return htmlCache.html
  const res = await fetch(SITE_URL, { headers: { 'User-Agent': 'loverse-og-meta' } })
  if (!res.ok) throw new Error(`Gagal mengambil index.html dari ${SITE_URL}: ${res.status}`)
  const html = await res.text()
  htmlCache = { html, at: Date.now() }
  return html
}

/** Escape karakter berbahaya untuk nilai atribut/meta HTML. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/** '2026-02-12' -> '12 Februari 2026' (aman terhadap format tak dikenal). */
function formatTanggal(iso: unknown): string {
  if (typeof iso !== 'string') return ''
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  return `${parseInt(m[3], 10)} ${BULAN[parseInt(m[2], 10) - 1] ?? ''} ${m[1]}`.trim()
}

function buildMetaBlock(opts: { title: string; description: string; image: string; url: string }): string {
  const { title, description, image, url } = opts
  return `    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:locale" content="id_ID" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />`
}

/** Ganti <title> & buang og/twitter lama, sisipkan blok meta baru sebelum </head>. */
function injectMeta(html: string, title: string, metaBlock: string): string {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  out = out.replace(/<meta\s+(?:property=["']og:[^"']*|name=["']twitter:[^"']*)[^>]*>/gi, '')
  out = out.replace('</head>', `${metaBlock}\n  </head>`)
  return out
}

serve(async (req) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })

  const url = new URL(req.url)
  const slug = (url.searchParams.get('slug') ?? '').trim()
  const mode = url.searchParams.get('mode') === 'demo' ? 'demo' : 'wedding'

  // Default (juga fallback bila DB gagal / undangan tidak ditemukan)
  let title = 'LoVerse — Undangan Pernikahan Digital Elegan &amp; Modern'
  let description = 'Buat & bagikan undangan pernikahan digital yang elegan dan interaktif. Coba demo gratis sekarang.'
  let image = DEFAULT_OG_IMAGE
  let canonical = SITE_URL

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    if (mode === 'wedding' && slug) {
      const { data: inv } = await admin
        .from('public_invitations')
        .select('groom_name, bride_name, wedding_date, event_details, payment_status')
        .eq('slug', slug)
        .maybeSingle()

      if (inv && inv.payment_status === 'success') {
        const bride = esc(inv.bride_name || 'Mempelai')
        const groom = esc(inv.groom_name || 'Mempelai')
        title = `Undangan Pernikahan ${bride} &amp; ${groom} — LoVerse`
        const tgl = formatTanggal(inv.wedding_date)
        description = tgl
          ? `Kepada Yth. Bapak/Ibu/Saudara/i — dengan hormat kami mengundang Anda pada acara pernikahan kami, ${tgl}. Klik untuk membuka undangan.`
          : 'Kepada Yth. Bapak/Ibu/Saudara/i — dengan hormat kami mengundang Anda pada acara pernikahan kami. Klik untuk membuka undangan.'
        const ed = (inv.event_details ?? {}) as Record<string, unknown>
        const cover = [ed.cover_photo, ed.groom_photo, ed.bride_photo]
          .find((v) => typeof v === 'string' && v.length > 0)
        if (typeof cover === 'string') image = cover
        canonical = `${SITE_URL}/wedding/${encodeURIComponent(slug)}`
      }
    } else if (mode === 'demo' && slug) {
      const { data: tpl } = await admin
        .from('templates')
        .select('name')
        .eq('slug', slug)
        .maybeSingle()
      const themeName = esc(tpl?.name || slug)
      title = `Demo Tema ${themeName} — LoVerse`
      description = `Coba demo gratis undangan digital bertema ${themeName}. Interaktif, lengkap, dan siap pakai.`
      image = DEMO_THUMBS.has(slug) ? `${SITE_URL}/${encodeURIComponent(slug)}.png` : DEFAULT_OG_IMAGE
      canonical = `${SITE_URL}/demo/${encodeURIComponent(slug)}`
    }

    const metaBlock = buildMetaBlock({ title, description, image, url: canonical })
    const html = await getIndexHtml()
    return new Response(injectMeta(html, title, metaBlock), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[og-meta] fallback ke index.html polos:', err)
    // Jangan pernah gagalkan halaman: kembalikan index.html polos (OG default).
    try {
      return new Response(await getIndexHtml(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      })
    } catch {
      return new Response('Service temporarily unavailable', { status: 503 })
    }
  }
})