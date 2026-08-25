// ============================================================
// src/pages/PaymentStatusPage.tsx
// ------------------------------------------------------------
// Halaman /payment-status - cek status pembayaran Midtrans via Edge Function payment-status (akses = tahu midtrans_order_id dari redirect URL).
// Dipakai di  : App.tsx
// Keterikatan : lib/supabaseClient, lib/constants, react-router-dom
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_WHATSAPP } from '../lib/constants';
import { CheckCircle, XCircle, Clock, ArrowRight, RefreshCcw, Home, CreditCard, MessageSquare, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { PaymentStatusSkeleton } from '../components/ui/SkeletonLoaders';

/**
 * Respons terbatas dari Edge Function `payment-status`.
 * Model kapabilitas: akses = mengetahui midtrans_order_id dari
 * redirect URL. PIN hanya dikirim saat sukses; snap_token hanya
 * saat pending.
 */
interface PaymentStatusResponse {
  found: boolean;
  payment_status: string;
  groom_name: string;
  bride_name: string;
  slug: string;
  email: string | null;
  snap_token: string | null;
  pin_code: string | null;
}

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<PaymentStatusResponse | null>(null);

    const orderId = searchParams.get('order_id');
    const isManualWhatsApp = !orderId;

    const fetchOrderStatus = useCallback(async (showLoader = false) => {
        if (!orderId) return;
        // Skeleton penuh hanya di muat pertama — refresh berikutnya silent
        // agar halaman tidak "berkedip" setiap polling.
        if (showLoader) setLoading(true);
        const { data, error } = await supabase.functions
            .invoke('payment-status', { body: { midtrans_order_id: orderId } });

        // 404 = order belum ketemu — biarkan polling lanjut seperti dulu.
        if (!error && data?.found) {
            setOrder(data as PaymentStatusResponse);
        } else if (error) {
            console.error('[payment-status] gagal:', error.message);
        }
        if (showLoader) setLoading(false);
    }, [orderId]);

    // Muat pertama kali
    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchOrderStatus(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchOrderStatus]);

    // Polling hanya selama status belum final (pending / belum ketemu).
    // Setelah success/failed → interval dibersihkan, halaman berhenti refresh.
    const paymentStatus = order?.payment_status;
    const isTerminal = !!paymentStatus && paymentStatus !== 'pending';

    useEffect(() => {
        if (isManualWhatsApp || !orderId || isTerminal) return;

        // Exponential backoff: 4s -> 8s -> 16s -> ... cap 60s. Tanpa ini tab
        // yang ditinggalkan pada status pending menembak Edge Function tiap
        // 4 detik berjam-jam (boros invocation + query DB).
        const BASE_MS = 4000;
        const CAP_MS = 60000;
        let delay = BASE_MS;
        let timerId: ReturnType<typeof setTimeout> | undefined;
        let cancelled = false;

        const poll = () => {
            if (cancelled) return;
            // Tab tak terlihat: skip putaran ini, tetap jadwalkan ulang.
            if (document.visibilityState === 'visible') {
                void fetchOrderStatus();
            }
            delay = Math.min(delay * 2, CAP_MS);
            timerId = setTimeout(poll, delay);
        };

        timerId = setTimeout(poll, delay);

        return () => {
            cancelled = true;
            if (timerId !== undefined) clearTimeout(timerId);
        };
    }, [fetchOrderStatus, isManualWhatsApp, orderId, isTerminal]);

    const handlePayAgain = () => {
        if (!order || !order.snap_token) {
            navigate('/order');
            return;
        }

        window.snap?.pay?.(order.snap_token, {
            onSuccess: function () {
                navigate(`/payment-status?order_id=${orderId}`);
                fetchOrderStatus();
            },
            onPending: function () {
                navigate(`/payment-status?order_id=${orderId}`);
                fetchOrderStatus();
            },
            onError: function () {
                fetchOrderStatus();
            },
            onClose: function () {
                navigate(`/payment-status?order_id=${orderId}`);
            }
        });
    };

        // --- RENDER LOADING ---
    if (loading) return <PaymentStatusSkeleton />;

    // ====================================================================
    // RENDER 1: UI KHUSUS MANUAL WHATSAPP (Jika tidak ada order_id)
    // ====================================================================
    if (isManualWhatsApp) {
        return (
            <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-4 font-sans">
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg text-center border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#25D366]"></div>
                    
                    <div className="animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#25D366] shadow-lg shadow-green-100">
                            <MessageSquare className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Pesanan Diterima!</h1>
                        <p className="text-stone-400 mb-6 leading-relaxed">
                            Terima kasih telah memesan. Silakan lanjutkan konfirmasi dan pembayaran Anda melalui <b>WhatsApp</b>.
                        </p>

                        <div className="bg-orange-50 p-4 rounded-xl mb-8 border border-dashed border-orange-200">
                            <p className="text-sm text-orange-800 font-medium">
                                Admin kami akan segera memverifikasi pembayaran Anda. Setelah disetujui,
                                <b> PIN 6 digit dibuat otomatis</b> dan dikirim ke <b>email</b> yang Anda daftarkan.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href={`https://wa.me/${ADMIN_WHATSAPP}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <FaWhatsapp className="w-6 h-6" /> Hubungi Admin via WA
                            </a>
                            <button onClick={() => navigate('/')} className="w-full py-4 bg-white border border-stone-200 text-stone-500 rounded-xl font-bold hover:bg-stone-50 transition flex items-center justify-center gap-2">
                                <Home className="w-5 h-5" /> Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER JIKA ORDER MIDTRANS TIDAK KETEMU ---
    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1E8DC] p-6 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <XCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-[#712E1E]">Pesanan Tidak Ditemukan</h1>
                <p className="text-stone-500 mt-2 text-sm">Pastikan link yang Anda akses benar atau ID transaksi valid.</p>
                <button onClick={() => navigate('/')} className="mt-6 w-full bg-[#E59A59] text-white px-6 py-3 rounded-xl font-bold shadow-md">Kembali ke Beranda</button>
            </div>
        </div>
    );

    // ====================================================================
    // RENDER 2: UI MIDTRANS (Berdasarkan Status Database)
    // ====================================================================
    const isSuccess = order.payment_status === 'success';
    const isPending = order.payment_status === 'pending';
    const isFailed = order.payment_status === 'failed' || order.payment_status === 'deny' || order.payment_status === 'expire';

    return (
        <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg text-center border border-white/50 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${isSuccess ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

                {/* --- SUKSES --- */}
                {isSuccess && (
                    <div className="animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-lg shadow-green-100">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Pembayaran Berhasil!</h1>
                        <p className="text-stone-400 mb-8 leading-relaxed">
                            Terima kasih telah menggunakan jasa kami.<br />
                            Undangan <b>{order.groom_name} & {order.bride_name}</b> sudah aktif selamanya.
                        </p>

                        {order.pin_code ? (
                            <div className="bg-stone-50 p-4 rounded-xl mb-4 border border-dashed border-stone-300">
                                <p className="text-xs text-stone-400 uppercase font-bold tracking-widest mb-1">Kode Login / PIN</p>
                                <p className="text-2xl font-mono font-bold text-[#712E1E] tracking-widest">{order.pin_code}</p>
                            </div>
                        ) : null}

                        <div className="bg-[#F7EEE3] p-4 rounded-xl mb-8 border border-dashed border-[#E59A59]">
                            <p className="text-xs text-[#712E1E] leading-relaxed flex items-start gap-2">
                                <Mail size={14} className="shrink-0 mt-0.5" />
                                <span>
                                    PIN ini juga telah dikirim ke <b>{order.email || 'email Anda'}</b>. Simpan email tersebut sebagai cadangan.
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/login')} className="w-full py-4 bg-[#712E1E] text-white rounded-xl font-bold hover:bg-[#5a2418] transition shadow-lg flex items-center justify-center gap-2">
                                Masuk Dashboard <ArrowRight className="w-5 h-5" />
                            </button>
                            <button onClick={() => navigate(`/wedding/${order.slug}`)} className="w-full py-4 bg-white border-2 border-[#712E1E] text-[#712E1E] rounded-xl font-bold hover:bg-stone-50 transition">
                                Lihat Undangan
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PENDING --- */}
                {isPending && (
                    <div className="animate-fade-in-up">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 shadow-lg shadow-yellow-100 animate-pulse">
                            <Clock className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Menunggu Pembayaran</h1>
                        <p className="text-stone-400 mb-8">
                            Selesaikan pembayaran untuk mengaktifkan undangan.<br />
                            <span className="text-xs mt-2 block">
                                Setelah lunas, PIN 6 digit dibuat otomatis &amp; dikirim ke email Anda.
                            </span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handlePayAgain}
                                className="w-full py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:-translate-y-1 bg-[#E59A59] text-white hover:bg-[#d48b4b] flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" /> Bayar Sekarang
                            </button>
                            <button onClick={() => fetchOrderStatus()} className="w-full py-4 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Cek Status Pembayaran
                            </button>
                        </div>
                    </div>
                )}

                {/* --- FAILED --- */}
                {isFailed && (
                    <div className="animate-fade-in-up">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-lg shadow-red-100">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#712E1E] mb-2">Pembayaran Gagal</h1>
                        <p className="text-stone-400 mb-8">
                            Maaf, transaksi Anda gagal atau kadaluarsa.<br />
                            Silakan membuat pesanan ulang.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button onClick={() => navigate('/order')} className="w-full py-4 bg-[#712E1E] text-white rounded-xl font-bold hover:bg-[#5a2418] transition shadow-lg">
                                Buat Pesanan Baru
                            </button>
                            <button onClick={() => navigate('/')} className="w-full py-4 bg-white border border-stone-200 text-stone-500 rounded-xl font-bold hover:bg-stone-50 transition flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}