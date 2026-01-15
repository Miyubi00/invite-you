import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Clock, ArrowRight, RefreshCcw, Home, CreditCard } from 'lucide-react';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  // Ambil ID dari URL (Midtrans mengirim 'order_id' which is our 'midtrans_order_id')
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
        setLoading(false);
        return;
    }
    fetchOrderStatus();
  }, [orderId]);

  const fetchOrderStatus = async () => {
    setLoading(true);
    // Cari order berdasarkan midtrans_order_id
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('midtrans_order_id', orderId)
      .single();

    if (error) console.error(error);
    if (data) setOrder(data);
    setLoading(false);
  };

  // Fungsi Munculin Popup Bayar Lagi
  const handlePayAgain = () => {
    if (order && order.snap_token) {
        window.snap.pay(order.snap_token, {
            onSuccess: function(result) { fetchOrderStatus(); },
            onPending: function(result) { fetchOrderStatus(); },
            onError: function(result) { fetchOrderStatus(); },
            onClose: function() { alert('Popup ditutup'); }
        });
    } else {
        alert("Token pembayaran kadaluarsa. Silakan buat pesanan baru.");
    }
  };

  // --- RENDER LOADING ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
    </div>
  );

  // --- RENDER JIKA ORDER TIDAK KETEMU ---
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Pesanan Tidak Ditemukan</h1>
            <p className="text-gray-500 mt-2">Pastikan link yang Anda akses benar.</p>
            <button onClick={() => navigate('/')} className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-bold">Ke Beranda</button>
        </div>
    </div>
  );

  // --- LOGIC UI BERDASARKAN STATUS ---
  const isSuccess = order.payment_status === 'success';
  const isPending = order.payment_status === 'pending';
  const isFailed = order.payment_status === 'failed' || order.payment_status === 'deny' || order.payment_status === 'expire';

  return (
    <div className="min-h-screen bg-[#FFD5AF]/20 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg text-center border border-white/50 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className={`absolute top-0 left-0 w-full h-2 ${isSuccess ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

        {/* --- 1. SUKSES --- */}
        {isSuccess && (
            <div className="animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-lg shadow-green-100">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Pembayaran Berhasil!</h1>
                <p className="text-[#888870] mb-8 leading-relaxed">
                    Terima kasih <b>{order.groom_name} & {order.bride_name}</b>.<br/>
                    Undangan Anda sudah aktif selamanya.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-dashed border-gray-300">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Kode Login / PIN</p>
                    <p className="text-2xl font-mono font-bold text-[#712E1E] tracking-widest">{order.pin_code}</p>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/login')} className="w-full py-4 bg-[#712E1E] text-white rounded-xl font-bold hover:bg-[#5a2418] transition shadow-lg flex items-center justify-center gap-2">
                        Masuk Dashboard <ArrowRight className="w-5 h-5"/>
                    </button>
                    <button onClick={() => navigate(`/wedding/${order.slug}`)} className="w-full py-4 bg-white border-2 border-[#712E1E] text-[#712E1E] rounded-xl font-bold hover:bg-gray-50 transition">
                        Lihat Undangan
                    </button>
                </div>
            </div>
        )}

        {/* --- 2. PENDING (Bayar Lagi) --- */}
        {isPending && (
            <div className="animate-fade-in-up">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 shadow-lg shadow-yellow-100 animate-pulse">
                    <Clock className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Menunggu Pembayaran</h1>
                <p className="text-[#888870] mb-8">
                    Selesaikan pembayaran untuk mengaktifkan undangan.<br/>
                    <span className="text-xs mt-2 block">(Jangan khawatir, data Anda aman tersimpan)</span>
                </p>

                <div className="flex flex-col gap-3">
                    <button onClick={handlePayAgain} className="w-full py-4 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-1">
                        <CreditCard className="w-5 h-5"/> Bayar Sekarang
                    </button>
                    <button onClick={fetchOrderStatus} className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4"/> Cek Status Pembayaran
                    </button>
                </div>
            </div>
        )}

        {/* --- 3. FAILED --- */}
        {isFailed && (
            <div className="animate-fade-in-up">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-lg shadow-red-100">
                    <XCircle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Pembayaran Gagal</h1>
                <p className="text-[#888870] mb-8">
                    Maaf, transaksi Anda gagal atau kadaluarsa.<br/>
                    Silakan membuat pesanan ulang.
                </p>

                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/order')} className="w-full py-4 bg-[#712E1E] text-white rounded-xl font-bold hover:bg-[#5a2418] transition shadow-lg">
                        Buat Pesanan Baru
                    </button>
                    <button onClick={() => navigate('/')} className="w-full py-4 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                        <Home className="w-4 h-4"/> Kembali ke Beranda
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}