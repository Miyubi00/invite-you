// src/lib/constants.js

// --- MASTER DATA TEMPLATE ---
// Edit di sini, semua halaman akan berubah otomatis.
export const MASTER_TEMPLATES = [
  // --- BASIC (Rp 40.000) ---
  { id: 1, slug: 'rustic-floral', name: 'Rustic Floral', category: 'Basic', price: 40000, image: '/rustic-floral.png' },
  { id: 2, slug: 'modern-dark', name: 'Modern Dark', category: 'Basic', price: 40000, image: '/modern-dark.png' },
  { id: 3, slug: 'botanical-gold', name: 'Botanical Gold', category: 'Basic', price: 40000, image: '/botanical-gold.png' },
  { id: 4, slug: 'monochrome', name: 'Monochrome', category: 'Basic', price: 40000, image: '/monochrome.png' },
  { id: 5, slug: 'navy-gold', name: 'Navy Gold', category: 'Basic', price: 40000, image: '/navy-gold.png' },
  { id: 6, slug: 'bohaemin', name: 'Bohaemin', category: 'Basic', price: 40000, image: '/bohaemin.png' },
  { id: 7, slug: 'rustic-boho', name: 'Rustic Boho', category: 'Basic', price: 40000, image: '/rustic-boho.png' },
  { id: 8, slug: 'elegant-pastel', name: 'Elegant Pastel', category: 'Basic', price: 40000, image: '/elegant-pastel.png' },
  { id: 9, slug: 'japanese', name: 'Japanese', category: 'Basic', price: 40000, image: '/japanese.png' },
  { id: 10, slug: 'javanese', name: 'Javanese', category: 'Basic', price: 40000, image: '/javanese.png' },
  { id: 11, slug: 'lilac', name: 'Lilac', category: 'Basic', price: 40000, image: '/lilac.png' },
  { id: 19, slug: 'cyberpunk', name: 'Cyberpunk Neon', category: 'Basic', price: 40000, image: '/cyberpunk.png' },
  { id: 21, slug: 'insta', name: 'Instagram Feed', category: 'Basic', price: 40000, image: '/insta.png' },

  // --- RSVP (Rp 65.000) ---
  { id: 20, slug: 'cinamon', name: 'Cinnamon Blue', category: 'RSVP', price: 65000, image: '/cinamon.png' },
  { id: 12, slug: 'playful-pop', name: 'Playful Pop', category: 'RSVP', price: 65000, image: '/playful-pop.png' },
  { id: 13, slug: 'static-canvas', name: 'Bubble Chat', category: 'RSVP', price: 65000, image: '/static-canvas.png' },
  { id: 14, slug: 'iphone', name: 'Iphone', category: 'RSVP', price: 65000, image: '/iphone.png' },
  { id: 15, slug: 'bit', name: '8bit Retro', category: 'RSVP', price: 65000, image: '/bit.png' },
  { id: 16, slug: 'comic', name: 'Comic', category: 'RSVP', price: 65000, image: '/comic.png' },
  { id: 17, slug: 'diary', name: 'Diary Book', category: 'RSVP', price: 65000, image: '/diary.png' },
  { id: 18, slug: 'cloud-sky', name: 'Cloudy Sky', category: 'RSVP', price: 65000, image: '/cloud-sky.png' },
  { id: 22, slug: 'hello-kitty', name: 'Hello Kitty Pink', category: 'RSVP', price: 65000, image: '/hello-kitty.png' },
];


// --- HELPER UNTUK DASHBOARD (Mencari list Basic) ---
// Otomatis mengambil semua slug yang category-nya 'Basic'
export const BASIC_TEMPLATES_SLUGS = MASTER_TEMPLATES
  .filter(t => t.category === 'Basic')
  .map(t => t.slug);

// --- HELPER UNTUK ADMIN PANEL & ORDER FORM (Dropdown Options) ---
// Otomatis membuat format { value, label, price, category }
export const TEMPLATE_OPTIONS = MASTER_TEMPLATES.map(t => ({
  value: t.slug,
  label: `${t.name} (${t.category})`,
  price: t.price,
  category: t.category,
  slug: t.slug, // jaga-jaga butuh raw slug
  name: t.name  // jaga-jaga butuh raw name
}));