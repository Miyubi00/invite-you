// supabase/functions/_shared/resendEmail.ts
// Layanan email transaksional modular via Resend.
// Dipanggil oleh midtrans-webhook (pembayaran otomatis) dan
// activate-pending-order (aktivasi manual oleh admin).

export interface SendPinEmailArgs {
  to: string;
  groomName: string;
  brideName: string;
  pin: string;
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

                <p style="margin:0 0 6px;color:#57493D;font-size:13px;line-height:1.6;">
                  Gunakan kombinasi <strong>No. WhatsApp</strong> dan <strong>PIN</strong> di atas untuk masuk melalui ${loginSection}.
                </p>
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
 * dan PIN 6 digit milik pengguna. Tidak melempar exception — hasilnya
 * dikembalikan agar pemanggil bisa memutuskan perilakunya.
 */
export async function sendPinEmail({ to, groomName, brideName, pin }: SendPinEmailArgs): Promise<SendEmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM') || 'LoVerse <onboarding@resend.dev>';

  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY belum dikonfigurasi di Supabase secrets.' };
  if (!to) return { ok: false, error: 'Email pelanggan tidak tersedia.' };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Pembayaran Berhasil — PIN Undangan ${groomName} & ${brideName}`
          .replace(/[<>&"']/g, ''),
        html: buildHtml({ groomName, brideName, pin }),
      }),
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
