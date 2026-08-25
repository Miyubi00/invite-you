// src/lib/generateInvoicePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ClientInvoiceData {
  orderId: string;
  groomName: string;
  brideName: string;
  whatsapp?: string;
  email?: string;
  weddingDate?: string;
  templateName?: string;
  price?: number;
  paymentMethod?: string;
  pin?: string;
}

export async function downloadClientInvoice(data: ClientInvoiceData): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const orderIdStr = (data.orderId || 'LOVERSE').slice(-8).toUpperCase();
  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const priceNumber = typeof data.price === 'number' && data.price > 0 ? data.price : 60000;
  const formattedPrice = `Rp ${priceNumber.toLocaleString('id-ID')}`;

  // 1. Header Banner (#712E1E)
  page.drawRectangle({
    x: 0,
    y: 740,
    width: 595.28,
    height: 101.89,
    color: rgb(0.443, 0.18, 0.118),
  });

  page.drawText('LoVerse', {
    x: 40,
    y: 792,
    size: 24,
    font: fontBold,
    color: rgb(1, 0.835, 0.686),
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
  page.drawText('DITAGIHKAN KEPADA:', {
    x: 40,
    y: 705,
    size: 9,
    font: fontBold,
    color: rgb(0.55, 0.5, 0.46),
  });

  const coupleText = `${data.groomName} & ${data.brideName}`;
  page.drawText(coupleText.length > 35 ? coupleText.slice(0, 35) + '...' : coupleText, {
    x: 40,
    y: 687,
    size: 13,
    font: fontBold,
    color: rgb(0.443, 0.18, 0.118),
  });

  if (data.whatsapp) {
    page.drawText(`WhatsApp : ${data.whatsapp}`, {
      x: 40,
      y: 669,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });
  }

  if (data.email) {
    page.drawText(`Email    : ${data.email}`, {
      x: 40,
      y: 653,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });
  }

  if (data.weddingDate) {
    page.drawText(`Tgl Acara: ${data.weddingDate}`, {
      x: 40,
      y: 637,
      size: 10,
      font: fontRegular,
      color: rgb(0.34, 0.29, 0.24),
    });
  }

  // Kolom Kanan
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

  page.drawText(`Metode      : ${data.paymentMethod || 'Midtrans Automated'}`, {
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

  page.drawText(`Desain Tema: ${data.templateName || 'Custom Template'}`, {
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
  if (data.pin) {
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

    page.drawText(data.pin, {
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

    page.drawText('https://loverse.my.id/login', {
      x: 230,
      y: 412,
      size: 10.5,
      font: fontBold,
      color: rgb(0.898, 0.604, 0.349),
    });
  }

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
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-LoVerse-${orderIdStr}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
