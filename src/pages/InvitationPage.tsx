// ============================================================
// src/pages/InvitationPage.tsx
// ------------------------------------------------------------
// Halaman /wedding/:slug?to=Nama - render undangan untuk tamu: fetch data publik via VIEW, pilih tema dari Registry, state RSVP & amplop.
// Dipakai di  : App.tsx (via InvitationLayout)
// Keterikatan : templates/Registry, lib/supabaseClient, types/database, types/template
// ============================================================

import { createElement, useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast';
import { getTemplateComponent } from '../templates/Registry';
import type { PublicInvitationRow, RsvpRow } from '../types/database';
import type { RsvpPayload } from '../types/template';
import { InvitationSkeleton } from '../components/ui/SkeletonLoaders';
import { Lock, FileX, Clock } from 'lucide-react';

export default function InvitationRender() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const guestName = searchParams.get('to') || 'Tamu Undangan';

  const [orderData, setOrderData] = useState<PublicInvitationRow | null>(null);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('loading');
  const [myRsvp, setMyRsvp] = useState<RsvpRow | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: order, error: orderError } = await supabase
          .from('public_invitations')
          .select('*')
          .eq('slug', slug)
          .single();

        if (orderError || !order) {
          setPageStatus('not_found');
          setLoading(false);
          return;
        }

        if (order.payment_status !== 'success') {
          setPageStatus('unpaid');
          setLoading(false);
          return;
        }

        setOrderData(order);
        setPageStatus('success');

        // Batasi ucapan yang dimuat untuk halaman publik: guestbook hanya
        // menampilkan N terbaru — payload & memori tidak tumbuh linear dengan
        // jumlah tamu (undangan populer bisa ribuan baris).
        const RSVP_PREVIEW_LIMIT = 100;
        const { data: rsvpList } = await supabase
          .from('rsvps')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: false })
          .limit(RSVP_PREVIEW_LIMIT);

        if (rsvpList) setRsvps(rsvpList);

        const sessionId = localStorage.getItem('rsvp_session_id');
        if (sessionId) {
          const { data: existingData } = await supabase
            .from('rsvps')
            .select('*')
            .match({ order_id: order.id, session_id: sessionId })
            .maybeSingle();

          if (existingData) {
            setMyRsvp(existingData);
          }
        }
      } catch (err) {
        console.error('System Error:', err);
        setPageStatus('not_found');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

    const handleRsvpSubmit = async (rsvpPayload: RsvpPayload): Promise<void> => {
    if (!orderData) return;
    if (myRsvp) {
      toast.warning('Anda sudah mengisi kehadiran.');
      return;
    }

    try {
      let sessionId = localStorage.getItem('rsvp_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('rsvp_session_id', sessionId);
      }

      const { data, error } = await supabase
        .from('rsvps')
        .insert({
          order_id: orderData.id,
          session_id: sessionId,
          guest_name: guestName,
          status: rsvpPayload.status,
          pax: rsvpPayload.pax,
          message: rsvpPayload.message,
        })
        .select()
        .single();

      if (error) throw error;

            setRsvps((prev) => [data, ...prev]);
      setMyRsvp(data);
    } catch (err) {
      console.error('RSVP Error:', err);
      toast.error('Gagal mengirim ucapan.');
    }
  };

    if (loading) {
    return <InvitationSkeleton />;
  }

  if (pageStatus === 'not_found') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full">
          <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Undangan Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm">Link yang Anda tuju mungkin salah atau sudah dihapus.</p>
        </div>
      </div>
    );
  }

  if (pageStatus === 'unpaid') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FFF0E0] p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-orange-200 max-w-md w-full relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-2xl" />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#712E1E] mb-2">Undangan Belum Aktif</h1>
            <p className="text-[#888870] text-sm mb-6 leading-relaxed">
              Mohon maaf, undangan ini sedang menunggu verifikasi pembayaran atau belum diselesaikan oleh pemilik acara.
            </p>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-500 mb-6 flex items-start gap-3 text-left">
              <Clock className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="font-bold text-gray-700">Apakah Anda pemilik undangan?</p>
                <p>Silakan selesaikan pembayaran atau hubungi admin untuk mengaktifkan link ini.</p>
              </div>
            </div>

            <a href="/" className="block w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) return null;

  const themeSlug = orderData.template_slug || 'rustic-floral';

  return (
    <Suspense fallback={<InvitationSkeleton />}>
      {/* createElement: komponen tema diambil dari registry dinamis berbasis
          slug — pola lazy-registry yang tidak lolos aturan react-hooks/static-components
          bila ditulis sebagai JSX dengan variabel hasil pemanggilan fungsi. */}
      {createElement(getTemplateComponent(themeSlug), {
        groom: orderData.groom_name,
        bride: orderData.bride_name,
        date: orderData.wedding_date,
        guestName,
        orderId: orderData.id,
        onRsvpSubmit: handleRsvpSubmit,
        submittedData: myRsvp,
        data: {
          ...orderData.event_details,
          gallery: orderData.event_details?.gallery || [],
          banks: orderData.event_details?.banks || [],
          rsvps: rsvps || [],
        },
      })}
    </Suspense>
  );
}
