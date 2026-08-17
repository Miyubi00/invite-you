import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { TEMPLATE_COMPONENTS } from '../templates/Registry';
import { Loader2, Lock, FileX, Clock } from 'lucide-react';

export default function InvitationRender() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';

  const [orderData, setOrderData] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageStatus, setPageStatus] = useState('loading');
  const [myRsvp, setMyRsvp] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
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

        const { data: rsvpList } = await supabase
          .from('rsvps')
          .select('*')
          .eq('order_id', order.id)
          .order('created_at', { ascending: false });

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

  const handleRsvpSubmit = async (rsvpPayload) => {
    if (!orderData) return false;
    if (myRsvp) {
      alert('Anda sudah mengisi kehadiran.');
      return false;
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
      return true;
    } catch (err) {
      console.error('RSVP Error:', err);
      alert('Gagal mengirim ucapan.');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-sans text-gray-500 bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-2" />
        <p className="text-sm font-medium">Memuat Undangan...</p>
      </div>
    );
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

  const themeSlug = orderData.template_slug || 'rustic-floral';
  const TemplateRenderer = TEMPLATE_COMPONENTS[themeSlug] || TEMPLATE_COMPONENTS['rustic-floral'];

  return (
    <TemplateRenderer
      groom={orderData.groom_name}
      bride={orderData.bride_name}
      date={orderData.wedding_date}
      guestName={guestName}
      orderId={orderData.id}
      onRsvpSubmit={handleRsvpSubmit}
      submittedData={myRsvp}
      data={{
        ...orderData.event_details,
        gallery: orderData.event_details?.gallery || [],
        banks: orderData.event_details?.banks || [],
        rsvps: rsvps || [],
      }}
    />
  );
}
