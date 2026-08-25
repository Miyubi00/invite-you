// supabase/functions/_shared/resendEmail.ts
// Layanan email transaksional modular via Resend dengan Lampiran Invoice PDF otomatis.
// Dipanggil oleh midtrans-webhook (pembayaran otomatis) dan
// activate-pending-order (aktivasi manual oleh admin).

import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib';

export interface SendPinEmailArgs {
  to: string;
  groomName: string;
  brideName: string;
  pin: string;
  orderId?: string;
  whatsapp?: string;
  weddingDate?: string;
  templateName?: string;
  price?: number;
  paymentMethod?: string;
}

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';

/** Escape entitas HTML — nama mempelai berasal dari input publik. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Buat file PDF Invoice secara on-the-fly di memori tanpa memakan storage.
 */
export async function generateInvoicePdf(args: SendPinEmailArgs): Promise<string | null> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const orderIdStr = (args.orderId || 'LOVERSE').slice(-8).toUpperCase();
    const issueDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const priceNumber = typeof args.price === 'number' && args.price > 0 ? args.price : 60000;
    const formattedPrice = `Rp ${priceNumber.toLocaleString('id-ID')}`;
    const appUrl = Deno.env.get('APP_URL') || 'https://loverse.my.id';

    // 1. Header Banner
    page.drawRectangle({
      x: 0,
      y: 740,
      width: 595.28,
      height: 101.89,
      color: rgb(0.443, 0.18, 0.118), // #712E1E
    });

    page.drawText('LoVerse', {
      x: 40,
      y: 792,
      size: 24,
      font: fontBold,
      color: rgb(1, 0.835, 0.686), // #FFD5AF
    });

    page.drawText('Undangan Pernikahan Digital', {
      x: 40,
      y: 772,
      size: 10,
      font: fontRegular,
      color: rgb(1, 0.835, 0.686),
    });

    page.drawText('INVOICE / BUKTI PEMBAYARAN', {
      x: 340,
      y: 792,
      size: 12,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('loverse.my.id', {
      x: 475,
      y: 772,
      size: 10,
      font: fontRegular,
      color: rgb(1, 0.835, 0.686),
    });

    // 2. Info Transaksi & Pembeli
    // Kolom Kiri: Ditagihkan Kepada
    page.drawText('DITAGIHKAN KEPADA:', {
      x: 40,
      y: 705,
      size: 9,
      font: fontBold,
      color: rgb(0.55, 0.5, 0.46),
    });

    const coupleText = `${args.groomName} & ${args.brideName}`;
    page.drawText(coupleText.length > 35 ? coupleText.slice(0, 35) + '...' : coupleText, {
      x: 40,
      y: 687,
      size: 13,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    page.drawText(`WhatsApp : ${args.whatsapp || '-'}`, {
      x: 40,
      y: 669,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });

    page.drawText(`Email    : ${args.to}`, {
      x: 40,
      y: 653,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });

    if (args.weddingDate) {
      page.drawText(`Tgl Acara: ${args.weddingDate}`, {
        x: 40,
        y: 637,
        size: 10,
        font: fontRegular,
        color: rgb(0.34, 0.29, 0.24),
      });
    }

    // Kolom Kanan: Rincian Invoice
    page.drawText('RINCIAN TRANSAKSI:', {
      x: 350,
      y: 705,
      size: 9,
      font: fontBold,
      color: rgb(0.55, 0.5, 0.46),
    });

    page.drawText(`No. Invoice : INV-${orderIdStr}`, {
      x: 350,
      y: 687,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Tanggal     : ${issueDate}`, {
      x: 350,
      y: 669,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });

    page.drawText(`Metode      : ${args.paymentMethod || 'Midtrans / Online'}`, {
      x: 350,
      y: 653,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });

    // Badge Lunas
    page.drawRectangle({
      x: 350,
      y: 627,
      width: 100,
      height: 20,
      color: rgb(0.906, 0.969, 0.925),
      borderColor: rgb(0.749, 0.91, 0.8),
      borderWidth: 1,
    });

    page.drawText('LUNAS / PAID', {
      x: 366,
      y: 633,
      size: 9,
      font: fontBold,
      color: rgb(0.106, 0.478, 0.239),
    });

    // 3. Tabel Item Produk
    // Header Tabel
    page.drawRectangle({
      x: 40,
      y: 575,
      width: 515.28,
      height: 26,
      color: rgb(0.98, 0.965, 0.933),
      borderColor: rgb(0.92, 0.875, 0.81),
      borderWidth: 1,
    });

    page.drawText('DESKRIPSI PRODUK', {
      x: 52,
      y: 584,
      size: 9,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    page.drawText('KATEGORI', {
      x: 330,
      y: 584,
      size: 9,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    page.drawText('JUMLAH (IDR)', {
      x: 460,
      y: 584,
      size: 9,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    // Baris Produk
    page.drawRectangle({
      x: 40,
      y: 525,
      width: 515.28,
      height: 50,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.92, 0.875, 0.81),
      borderWidth: 1,
    });

    page.drawText('Undangan Digital Pernikahan (Aktif Selamanya)', {
      x: 52,
      y: 555,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Desain Tema: ${args.templateName || 'Custom Template'}`, {
      x: 52,
      y: 539,
      size: 9,
      font: fontRegular,
      color: rgb(0.55, 0.5, 0.46),
    });

    page.drawText('Web Invitation', {
      x: 330,
      y: 547,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(formattedPrice, {
      x: 460,
      y: 547,
      size: 10.5,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    // Baris Total
    page.drawRectangle({
      x: 40,
      y: 490,
      width: 515.28,
      height: 35,
      color: rgb(0.98, 0.965, 0.933),
      borderColor: rgb(0.92, 0.875, 0.81),
      borderWidth: 1,
    });

    page.drawText('TOTAL PEMBAYARAN :', {
      x: 310,
      y: 503,
      size: 10,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    page.drawText(formattedPrice, {
      x: 450,
      y: 502,
      size: 12,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    // 4. Kotak PIN Akses Dashboard
    page.drawRectangle({
      x: 40,
      y: 385,
      width: 515.28,
      height: 80,
      color: rgb(0.98, 0.965, 0.933),
      borderColor: rgb(0.898, 0.604, 0.349),
      borderWidth: 1.5,
    });

    page.drawText('KODE PIN MASUK DASHBOARD ANDA:', {
      x: 52,
      y: 442,
      size: 9,
      font: fontBold,
      color: rgb(0.55, 0.5, 0.46),
    });

    page.drawText(args.pin, {
      x: 52,
      y: 407,
      size: 26,
      font: fontBold,
      color: rgb(0.443, 0.18, 0.118),
    });

    page.drawText('Gunakan WhatsApp & PIN ini untuk edit undangan di:', {
      x: 230,
      y: 430,
      size: 9,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });

    page.drawText(`${appUrl}/login`, {
      x: 230,
      y: 412,
      size: 10.5,
      font: fontBold,
      color: rgb(0.898, 0.604, 0.349),
    });

    // 5. Footer & Ketentuan
    page.drawLine({
      start: { x: 40, y: 190 },
      end: { x: 555.28, y: 190 },
      thickness: 1,
      color: rgb(0.9, 0.85, 0.8),
    });

    page.drawText('Informasi & Ketentuan Layanan:', {
      x: 40,
      y: 172,
      size: 8.5,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText('1. Undangan digital Anda aktif secara otomatis dan dapat langsung disebarkan kepada para tamu undangan.', {
      x: 40,
      y: 156,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('2. Perubahan data acara, jadwal, lokasi peta, musik, dan foto dapat diperbarui mandiri kapan saja 24/7.', {
      x: 40,
      y: 142,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('3. Simpan invoice resmi ini sebagai arsip bukti pembayaran Anda yang sah.', {
      x: 40,
      y: 128,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('© LoVerse. Dokumen Bukti Pembayaran Digital Sah.', {
      x: 40,
      y: 80,
      size: 8,
      font: fontRegular,
      color: rgb(0.65, 0.65, 0.65),
    });

    const pdfBytes = await pdfDoc.save();
    return uint8ArrayToBase64(pdfBytes);
  } catch (err) {
    console.error('[resendEmail] Gagal membuat PDF Invoice:', err);
    return null;
  }
}

function buildHtml({ groomName, brideName, pin }: Omit<SendPinEmailArgs, 'to'>): string {
  const couple = `${escapeHtml(groomName)} &amp; ${escapeHtml(brideName)}`;
  const appUrl = Deno.env.get('APP_URL') || '';
  const loginSection = appUrl
    ? `<a href="${appUrl}/login" style="color:#E59A59;font-weight:bold;">${appUrl}/login</a>`
    : 'halaman <strong>Login Dashboard</strong> di website LoVerse';

  return `<!DOCTYPE html>
<html lang="id">
  <body style="margin:0;padding:0;background-color:#F1E8DC;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1E8DC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #EBDFCE;">
            <!-- Header -->
            <tr>
              <td style="background-color:#712E1E;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#FFD5AF;font-size:22px;letter-spacing:1px;">Lo&hearts;Verse</h1>
                <p style="margin:6px 0 0;color:#FFD5AF;opacity:.85;font-size:13px;">Undangan Digital Pernikahan</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 12px;color:#712E1E;font-size:15px;line-height:1.6;">
                  Terima kasih telah menggunakan jasa kami.
                </p>
                <p style="margin:0 0 20px;color:#57493D;font-size:14px;line-height:1.6;">
                  Pembayaran untuk undangan digital pernikahan
                  <strong style="color:#712E1E;">${couple}</strong> telah kami terima dengan sukses.
                  Undangan Anda kini aktif dan siap disebar ke para tamu.
                </p>

                <!-- Status -->
                <div style="text-align:center;margin:0 0 24px;">
                  <span style="display:inline-block;background-color:#E7F7EC;color:#1B7A3D;font-weight:bold;font-size:14px;padding:10px 22px;border-radius:999px;border:1px solid #BFE8CC;">
                    &#10004; Pembayaran Berhasil
                  </span>
                </div>

                <!-- PIN -->
                <div style="background-color:#FAF6EE;border:1px dashed #E59A59;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
                  <p style="margin:0 0 6px;color:#8C8075;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                    Kode PIN Dashboard Anda
                  </p>
                  <p style="margin:0;color:#712E1E;font-size:38px;font-weight:bold;letter-spacing:10px;font-family:'Courier New',monospace;">
                    ${pin}
                  </p>
                </div>

                <p style="margin:0 0 16px;color:#57493D;font-size:13px;line-height:1.6;">
                  Gunakan kombinasi <strong>No. WhatsApp</strong> dan <strong>PIN</strong> di atas untuk masuk melalui ${loginSection}.
                </p>

                <!-- Info Invoice Attachment -->
                <div style="background-color:#F7EEE3;border:1px solid #EBDFCE;border-radius:12px;padding:12px 16px;margin:0 0 6px;">
                  <p style="margin:0;color:#712E1E;font-size:12px;line-height:1.5;">
                    &#128196; <strong>Invoice Resmi Terlampir:</strong> Kami telah melampirkan berkas PDF bukti pembayaran resmi pada email ini untuk arsip Anda.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#FAF6EE;padding:18px 32px;text-align:center;">
                <p style="margin:0;color:#8C8075;font-size:11px;line-height:1.6;">
                  Simpan email ini sebagai catatan PIN Anda.<br/>
                  Butuh bantuan? Hubungi admin melalui WhatsApp.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Kirim email berisi ucapan terima kasih, status pembayaran berhasil,
 * PIN 6 digit milik pengguna, dan lampiran file PDF Invoice resmi.
 */
export async function sendPinEmail(args: SendPinEmailArgs): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM') || 'LoVerse <onboarding@resend.dev>';

  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY belum dikonfigurasi di Supabase secrets.' };
  if (!args.to) return { ok: false, error: 'Email pelanggan tidak tersedia.' };

  try {
    const attachments: Array<{ filename: string; content: string }> = [];

    // Generate file Invoice PDF secara on-the-fly di RAM
    const pdfBase64 = await generateInvoicePdf(args);
    if (pdfBase64) {
      const orderIdPart = (args.orderId || 'LOVERSE').slice(-8).toUpperCase();
      attachments.push({
        filename: `Invoice-LoVerse-${orderIdPart}.pdf`,
        content: pdfBase64,
      });
    }

    const payload: Record<string, unknown> = {
      from,
      to: [args.to],
      subject: `Pembayaran Berhasil & Invoice — PIN Undangan ${args.groomName} & ${args.brideName}`
        .replace(/[<>&"']/g, ''),
      html: buildHtml({ groomName: args.groomName, brideName: args.brideName, pin: args.pin }),
    };

    if (attachments.length > 0) {
      payload.attachments = attachments;
    }

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[resendEmail] Gagal kirim:', body);
      return { ok: false, error: `Resend API error (${response.status})` };
    }

    return { ok: true };
  } catch (err) {
    console.error('[resendEmail] Exception:', err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

