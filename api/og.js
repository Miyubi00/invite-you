// ============================================================
// api/og.js — Vercel Function: server-side Open Graph injector
// ------------------------------------------------------------
// Latar: situs ini SPA (semua path direwrite ke index.html) dan
// WhatsApp TIDAK menjalankan JavaScript, jadi crawler WA tidak
// pernah melihat meta tag yang disuntik React.
//
// Kenapa BUKAN Supabase Edge Function? Supabase memaksa semua
// response HTML dari edge function menjadi `text/plain` dengan
// CSP `default-src 'none'; sandbox` (kebijakan anti-phishing),
// sehingga halaman tampil mentah. Function di Vercel bebas
// mengirim `text/html`.
//
// Dipasang via vercel.json:
//   /wedding/:slug -> /api/og?mode=wedding&slug=:slug
//   /demo/:slug    -> /api/og?mode=demo&slug=:slug
// Browser tetap menerima index.html + meta OG (SPA jalan normal,
// query ?to=Nama untuk link personal tetap diteruskan).
// ============================================================

const HTML_CACHE_MS = 5 * 60 * 1000
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// Slug tema yang punya screenshot statis di public/ (thumbnail demo).
const DEMO_THUMBS = new Set([
  'board-game', 'chiikawa', 'cinamon', 'claymorphism', 'emerald-royale',
  'hello-kitty', 'lantern-night', 'motion-flow', 'neumorph', 'ocean-vows',
  'pop-card', 'roblox', 'sage-terracotta', 'sakura-breeze', 'spiderman', 'zine-raw',
])

// Cache index.html produksi agar tiap share WA tidak fetch ulang.
let htmlCache = { html: null, at: 0 }

async function getIndexHtml(origin) {
  if (htmlCache.html && Date.now() - htmlCache.at < HTML_CACHE_MS) return htmlCache.html
  const res = await fetch(`${origin}/index.html`, { headers: { 'User-Agent': 'loverse-og-meta' } })
  if (!res.ok) throw new Error(`Gagal mengambil index.html dari ${origin}: ${res.status}`)
  const html = await res.text()
  htmlCache = { html, at: Date.now() }
  return html
}

/** Escape karakter berbahaya untuk nilai atribut/meta HTML. */
function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** '2026-02-12' -> '12 Februari 2026' (aman terhadap format tak dikenal). */
function formatTanggal(iso) {
  if (typeof iso !== 'string') return ''
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  return `${parseInt(m[3], 10)} ${BULAN[parseInt(m[2], 10) - 1] ?? ''} ${m[1]}`.trim()
}

function buildMetaBlock({ title, description, image, url }) {
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
function injectMeta(html, title, metaBlock) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
  out = out.replace(/<meta\s+(?:property=["']og:[^"']*|name=["']twitter:[^"']*)[^>]*>/gi, '')
  out = out.replace('</head>', `${metaBlock}\n  </head>`)
  return out
}
/** Query data undangan publik via Supabase REST (anon — view sudah dibuka RLS-nya). */
async function fetchInvitation(slug) {
  const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
  const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''
  if (!SUPABASE_URL || !ANON_KEY) return null
  const select = encodeURIComponent('groom_name,bride_name,wedding_date,event_details,payment_status')
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/public_invitations?slug=eq.${encodeURIComponent(slug)}&select=${select}`,
    {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      signal: AbortSignal.timeout(4000),
    },
  )
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

/** Query nama tema untuk halaman demo. */
async function fetchTemplateName(slug) {
  const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '')
  const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''
  if (!SUPABASE_URL || !ANON_KEY) return null
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/templates?slug=eq.${encodeURIComponent(slug)}&select=name`,
    {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      signal: AbortSignal.timeout(4000),
    },
  )
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? rows[0].name : null
}

export default async function handler(req, res) {
  const origin = `https://${req.headers.host || 'loverse.my.id'}`
  const mode = req.query.mode === 'demo' ? 'demo' : 'wedding'
  const slug = String(req.query.slug ?? '').trim()

  // Default (juga fallback bila DB gagal / undangan tidak ditemukan)
  let title = 'LoVerse — Undangan Pernikahan Digital Elegan &amp; Modern'
  let description = 'Buat & bagikan undangan pernikahan digital yang elegan dan interaktif. Coba demo gratis sekarang.'
  let image = `${origin}/emerald-royale.png`
  let canonical = origin

  try {
    if (mode === 'wedding' && slug) {
      const inv = await fetchInvitation(slug)
      if (inv && inv.payment_status === 'success') {
        const bride = esc(inv.bride_name || 'Mempelai')
        const groom = esc(inv.groom_name || 'Mempelai')
        title = `Undangan Pernikahan ${bride} &amp; ${groom} — LoVerse`
        const tgl = formatTanggal(inv.wedding_date)
        description = tgl
          ? `Kepada Yth. Bapak/Ibu/Saudara/i — dengan hormat kami mengundang Anda pada acara pernikahan kami, ${tgl}. Klik untuk membuka undangan.`
          : 'Kepada Yth. Bapak/Ibu/Saudara/i — dengan hormat kami mengundang Anda pada acara pernikahan kami. Klik untuk membuka undangan.'
        let ed = inv.event_details ?? {}
        if (typeof ed === 'string') {
          try { ed = JSON.parse(ed) } catch { ed = {} }
        }
        const cover = [ed.cover_photo, ed.groom_photo, ed.bride_photo]
          .find((v) => typeof v === 'string' && v.length > 0)
        if (typeof cover === 'string') image = cover
        canonical = `${origin}/wedding/${encodeURIComponent(slug)}`
      }
    } else if (mode === 'demo' && slug) {
      const themeName = esc((await fetchTemplateName(slug)) || slug)
      title = `Demo Tema ${themeName} — LoVerse`
      description = `Coba demo gratis undangan digital bertema ${themeName}. Interaktif, lengkap, dan siap pakai.`
      image = DEMO_THUMBS.has(slug) ? `${origin}/${encodeURIComponent(slug)}.png` : `${origin}/emerald-royale.png`
      canonical = `${origin}/demo/${encodeURIComponent(slug)}`
    }
  } catch (err) {
    console.error('[og] fallback ke meta default:', err)
  }

  try {
    const html = await getIndexHtml(origin)
    const metaBlock = buildMetaBlock({ title, description, image, url: canonical })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=300')
    res.status(200).send(injectMeta(html, title, metaBlock))
  } catch (err) {
    console.error('[og] gagal total:', err)
    res.status(503).send('Service temporarily unavailable')
  }
}

