// ============================================================
// src/lib/invoiceData.ts
// ------------------------------------------------------------
// SATU sumber data contoh invoice — dipakai oleh:
// - halaman preview dev (/dev/invoice) → data awal form + fallback cepat
// - (segera) generator PDF invoice versi baru
// Keterikatan : murni data konstanta, tanpa dependensi.
// ============================================================

export interface InvoiceSampleData {
  groomName: string;
  brideName: string;
  whatsapp: string;
  email: string;
  weddingDate: string;
  orderId: string;
  issueDate: string;
  templateName: string;
  price: number;
  paymentMethod: string;
}

export const INVOICE_SAMPLE: InvoiceSampleData = {
  groomName: 'daffa',
  brideName: 'windy',
  whatsapp: '+62 896 3964 3075',
  email: 'daffasuhandi1@gmail.com',
  weddingDate: '2026-10-09',
  orderId: 'LV-P2GQLR4P',
  issueDate: '19 September 2026',
  templateName: 'hello-kitty',
  price: 35245,
  paymentMethod: 'QRIS',
};

/** Kontak layanan LoVerse — satu tempat agar email, PDF, & preview konsisten. */
export const LOVERSE_CONTACT = {
  email: 'mail@loverse.id',
  whatsappDisplay: '+62 851-7988-0092',
  instagram: '@loverse.id',
  domain: 'loverse.id',
  siteUrl: 'https://loverse.id',
} as const;

/** Format Rp 35.245 (id-ID). */
export function formatInvoiceRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}
