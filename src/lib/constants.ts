// ============================================================
// src/lib/constants.ts
// ------------------------------------------------------------
// Konstanta master sisi klien: katalog MasterTemplate (slug, nama, kategori, harga, gambar) dan nomor WhatsApp admin.
// Dipakai di  : OrderPage, PaymentStatusPage, HomePage (katalog)
// Keterikatan : -(murni data konstanta)
// ============================================================

export interface MasterTemplate {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export interface TemplateOption {
  value: string;
  label: string;
  price: number;
  category: string;
  slug: string;
  name: string;
}

// --- BASE URL GAMBAR TEMA (Cloudflare R2, WebP) ---
// Gambar preview tema di-host di R2 lewat custom domain; konversi PNG->WebP sudah dilakukan.
const THEME_IMG_BASE = 'https://r2.loverse.my.id/themes';

// --- MASTER DATA TEMPLATE ---
// Edit di sini, semua halaman akan berubah otomatis.
export const MASTER_TEMPLATES: MasterTemplate[] = [
  // --- BASIC (Rp 40.000) ---
  { id: 1, slug: 'rustic-floral', name: 'Rustic Floral', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/rustic-floral.webp` },
  { id: 2, slug: 'modern-dark', name: 'Modern Dark', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/modern-dark.webp` },
  { id: 3, slug: 'botanical-gold', name: 'Botanical Gold', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/botanical-gold.webp` },
  { id: 4, slug: 'monochrome', name: 'Monochrome', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/monochrome.webp` },
  { id: 5, slug: 'navy-gold', name: 'Navy Gold', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/navy-gold.webp` },
  { id: 6, slug: 'bohaemin', name: 'Bohaemin', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/bohaemin.webp` },
  { id: 7, slug: 'rustic-boho', name: 'Rustic Boho', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/rustic-boho.webp` },
  { id: 8, slug: 'elegant-pastel', name: 'Elegant Pastel', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/elegant-pastel.webp` },
  { id: 9, slug: 'japanese', name: 'Japanese', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/japanese.webp` },
  { id: 10, slug: 'javanese', name: 'Javanese', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/javanese.webp` },
  { id: 11, slug: 'lilac', name: 'Lilac', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/lilac.webp` },
  { id: 19, slug: 'cyberpunk', name: 'Cyberpunk Neon', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/cyberpunk.webp` },
  { id: 21, slug: 'insta', name: 'Instagram Feed', category: 'Basic', price: 60000, image: `${THEME_IMG_BASE}/insta.webp` },

  // --- RSVP (Rp 65.000) ---
  { id: 20, slug: 'cinamon', name: 'Cinnamon Blue', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/cinamon.webp` },
  { id: 12, slug: 'playful-pop', name: 'Playful Pop', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/playful-pop.webp` },
  { id: 13, slug: 'static-canvas', name: 'Bubble Chat', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/static-canvas.webp` },
  { id: 14, slug: 'iphone', name: 'Iphone', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/iphone.webp` },
  { id: 15, slug: 'bit', name: '8bit Retro', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/bit.webp` },
  { id: 16, slug: 'comic', name: 'Comic', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/comic.webp` },
  { id: 17, slug: 'diary', name: 'Diary Book', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/diary.webp` },
  { id: 18, slug: 'cloud-sky', name: 'Cloudy Sky', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/cloud-sky.webp` },
  { id: 22, slug: 'hello-kitty', name: 'Hello Kitty Pink', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/hello-kitty.webp` },
  { id: 23, slug: 'mobile', name: 'Android Mobile', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/mobile.webp` },
  { id: 24, slug: 'binder-book', name: 'Binder Book', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/binder-book.webp` },
  { id: 25, slug: 'art-gallery', name: 'Art Gallery', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/art-gallery.webp` },
  { id: 26, slug: 'art-block', name: 'Art Block', category: 'RSVP', price: 80000, image: `${THEME_IMG_BASE}/art-block.webp` },
];

// --- HELPER UNTUK DASHBOARD (Mencari list Basic) ---
export const BASIC_TEMPLATES_SLUGS: string[] = MASTER_TEMPLATES
  .filter((t) => t.category === 'Basic')
  .map((t) => t.slug);

// --- HELPER UNTUK ADMIN PANEL & ORDER FORM (Dropdown Options) ---
export const TEMPLATE_OPTIONS: TemplateOption[] = MASTER_TEMPLATES.map((t) => ({
  value: t.slug,
  label: `${t.name} (${t.category})`,
  price: t.price,
  category: t.category,
  slug: t.slug,
  name: t.name,
}));

// --- KONTAK ADMIN (dipakai OrderForm, PaymentStatus, halaman sukses) ---
export const ADMIN_WHATSAPP = '6285179880092';

// --- TESTIMONI (STATIS — edit di sini untuk mengubah landing page) ---
export interface Testimonial {
  name: string;
  template: string;
  message: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Rina & Dedi',
    template: 'Cinnamon Blue',
    message:
      'Tamu-kamu sampai muasir lihat undangannya. Fitur RSVP-nya bikin kami gampang atur katering karena jumlah hadir kelihatan realtime.',
  },
  {
    name: 'Salsa Putri',
    template: 'Playful Pop',
    message:
      'Harganya murah banget tapi hasilnya premium. Edit foto dan musik sendiri cuma butuh 10 menit, langsung bisa disebar ke grup keluarga.',
  },
  {
    name: 'Bagas & Ayu',
    template: '8bit Retro',
    message:
      'Konsepnya unik, tamu pada kaget ada undangan bergaya game. Adminnya juga fast response waktu kami minta bantu ganti slug.',
  },
  {
    name: 'Fajar Ramadhan',
    template: 'Modern Dark',
    message:
      'Checkout Midtrans-nya lancar, langsung dapat dashboard tanpa perlu konfirmasi manual. Recommended buat yang mepet deadline.',
  },
  {
    name: 'Nadia & Rizky',
    template: 'Binder Book',
    message:
      'Buku tamunya rapi, bisa export Excel buat catatan amplop. Rekening digital juga otomatis ada di halaman gift.',
  },
  {
    name: 'Ibu Wati',
    template: 'Javanese',
    message:
      'Sederhana tapi anggun, cocok untuk acara pernikahan adat. Anak saya tinggal isi data, selesai dalam satu sore.',
  },
];