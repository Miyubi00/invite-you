import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getTemplateComponent } from '../templates/Registry'; 
import { Loader2, Lock, FileX, Clock } from 'lucide-react'; // Tambah icon

export default function InvitationRender() {
  const { slug } = useParams(); 
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';

  const [orderData, setOrderData] = useState(null);
  const [rsvps, setRsvps] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // STATE BARU: Untuk menangani berbagai status halaman
  // 'loading' | 'success' | 'unpaid' | 'not_found'
  const [pageStatus, setPageStatus] = useState('loading');

  // RSVP User State
  const [myRsvp, setMyRsvp] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Data Order
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

        // --- SECURITY CHECK DI SINI ---
        // Jika status bukan 'success', blokir akses!
        if (order.payment_status !== 'success') {
            setPageStatus('unpaid');
            setLoading(false);
            return;
        }

        // Jika Lolos Cek (Status Success)
        setOrderData(order);
        setPageStatus('success');

        // 2. Ambil Semua Ucapan (Public)
        const { data: rsvpList } = await supabase
            .from('rsvps')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false });

        if (rsvpList) setRsvps(rsvpList);

        // 3. Cek RSVP Session User
        const sessionId = localStorage.getItem('rsvp_session_id');
        if (sessionId) {
            const { data: existingData } = await supabase
                .from('rsvps')
                .select('*')
                .match({ order_id: order.id, session_id: sessionId })
                .single();
            
            if (existingData) setMyRsvp(existingData);
        }

      } catch (err) {
          console.error("System Error:", err);
          setPageStatus('not_found');
      } finally {
          setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Logic Submit RSVP (Sama seperti sebelumnya)
  const handleRsvpSubmit = async (rsvpData) => {
    if (!orderData) return false;
    if (myRsvp) { alert("Anda sudah mengisi kehadiran."); return false; }

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
                status: rsvpData.status,
                pax: rsvpData.pax,
                message: rsvpData.message
            })
            .select()
            .single();

        if (error) throw error;

        setRsvps(prev => [newEntry, ...prev]);
        setMyRsvp(data);
        return true; 
    } catch (err) {
        console.error("RSVP Error:", err);
        alert("Gagal mengirim ucapan.");
        return false;
    }
  };

  // --- RENDER UI BERDASARKAN STATUS ---

  // 1. Loading
  if (loading) {
      return (
        <div className="h-screen flex flex-col items-center justify-center font-sans text-gray-500 bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-2"/>
            <p className="text-sm font-medium">Memuat Undangan...</p>
        </div>
      );
  }

  // 2. Not Found (Slug Salah)
  if (pageStatus === 'not_found') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full">
                <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Undangan Tidak Ditemukan</h2>
                <p className="text-gray-500 text-sm">Link yang Anda tuju mungkin salah atau sudah dihapus.</p>
            </div>
        </div>
      );
  }

  // 3. UNPAID / BLOCKED (Ada data, tapi belum bayar)
  if (pageStatus === 'unpaid') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FFF0E0] p-6 text-center font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-orange-200 max-w-md w-full relative overflow-hidden">
                {/* Hiasan background */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                        <Lock size={32}/>
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#712E1E] mb-2">Undangan Belum Aktif</h1>
                    <p className="text-[#888870] text-sm mb-6 leading-relaxed">
                        Mohon maaf, undangan ini sedang menunggu verifikasi pembayaran atau belum diselesaikan oleh pemilik acara.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-500 mb-6 flex items-start gap-3 text-left">
                        <Clock className="w-5 h-5 text-orange-500 shrink-0"/>
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

  // 4. SUCCESS (Render Template)
  const themeSlug = orderData.template_slug || 'rustic-floral'; 
  const TemplateComponent = getTemplateComponent(themeSlug);

  if (!TemplateComponent) return <div className="h-screen flex items-center justify-center text-gray-500">Template Error</div>;

  return (
    <TemplateComponent 
      groom={orderData.groom_name}
      bride={orderData.bride_name}
      date={orderData.wedding_date}
      guestName={guestName}
      orderId={orderData.id} 
      onRsvpSubmit={handleRsvpSubmit} 
      submittedData={myRsvp} 
      data={{
          ...orderData.event_details,
          rsvps: rsvps 
      }}
    />
  );
}