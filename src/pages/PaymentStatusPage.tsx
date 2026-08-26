import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_WHATSAPP } from '../lib/constants';
import { CheckCircle, XCircle, Clock, ArrowRight, RefreshCcw, Home, CreditCard, MessageSquare, Mail, FileText } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { PaymentStatusSkeleton } from '../components/ui/SkeletonLoaders';
import { useTranslation } from '../i18n';
import { downloadClientInvoice } from '../lib/generateInvoicePdf';

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
  whatsapp?: string | null;
  wedding_date?: string | null;
  template_slug?: string | null;
  template_name?: string | null;
  price?: number | null;
  payment_method?: string | null;
  snap_token: string | null;
  pin_code: string | null;
}

export default function PaymentStatus() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<PaymentStatusResponse | null>(null);

    const orderId = searchParams.get('order_id');
    const isManualWhatsApp = !orderId;

    const fetchOrderStatus = useCallback(async (showLoader = false) => {
        if (!orderId) return;
        if (showLoader) setLoading(true);
        const { data, error } = await supabase.functions
            .invoke('payment-status', { body: { midtrans_order_id: orderId } });

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

    const paymentStatus = order?.payment_status;
    const isTerminal = !!paymentStatus && paymentStatus !== 'pending';

    useEffect(() => {
        if (isManualWhatsApp || !orderId || isTerminal) return;

        const BASE_MS = 4000;
        const CAP_MS = 60000;
        let delay = BASE_MS;
        let timerId: ReturnType<typeof setTimeout> | undefined;
        let cancelled = false;

        const poll = () => {
            if (cancelled) return;
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
            <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-3 sm:p-4 font-sans w-full max-w-full overflow-x-hidden">
                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 text-center border border-[#EBDFCE] relative overflow-hidden">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-[#25D366] shadow-md shadow-green-100">
                        <FaWhatsapp className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.manualTitle')}</h1>
                    <p className="text-stone-500 mb-6 text-xs sm:text-sm leading-relaxed">
                        {t('paymentStatus.manualDesc')}
                    </p>

                    <div className="bg-[#FAF6EE] p-3 sm:p-4 rounded-xl mb-6 text-left border border-[#EBDFCE]">
                        <p className="text-xs text-stone-600 leading-relaxed flex items-start gap-2">
                            <span className="text-[#E59A59] font-bold text-sm">💡</span>
                            <span>{t('paymentStatus.manualNote')}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 sm:gap-3">
                        <a
                            href={`https://wa.me/${ADMIN_WHATSAPP}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 sm:py-4 bg-[#25D366] text-white rounded-xl font-bold text-sm sm:text-base hover:bg-[#20bd5a] transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp className="w-5 h-5" /> {t('paymentStatus.btnWhatsapp')}
                        </a>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 sm:py-3.5 bg-[#FAF6EE] text-[#712E1E] rounded-xl font-bold text-xs sm:text-sm hover:bg-[#F3EBDF] transition border border-[#EBDFCE] flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> {t('paymentStatus.btnHome')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ====================================================================
    // RENDER 2: JIKA ORDER TIDAK DITEMUKAN
    // ====================================================================
    if (!order || !order.found) {
        return (
            <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-3 sm:p-4 font-sans w-full max-w-full overflow-x-hidden">
                <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 text-center border border-[#EBDFCE]">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-stone-400">
                        <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#712E1E] mb-2">{t('paymentStatus.notFoundTitle')}</h1>
                    <p className="text-stone-400 mb-6 sm:mb-8 text-xs sm:text-sm">
                        {t('paymentStatus.notFoundDesc')}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 sm:py-3.5 bg-[#FAF6EE] text-[#712E1E] rounded-xl font-bold text-xs sm:text-sm hover:bg-[#F3EBDF] transition border border-[#EBDFCE]"
                    >
                        {t('paymentStatus.btnHome')}
                    </button>
                </div>
            </div>
        );
    }

    // ====================================================================
    // RENDER 3: STATUS TRANSAKSI MIDTRANS
    // ====================================================================
    const isSuccess = order.payment_status === 'success';
    const isPending = order.payment_status === 'pending';
    const isFailed = ['failed', 'expired', 'deny', 'cancel'].includes(order.payment_status);

    return (
        <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-3 sm:p-4 font-sans w-full max-w-full overflow-x-hidden">
            <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 text-center border border-[#EBDFCE]">

                {/* --- SUCCESS --- */}
                {isSuccess && (
                    <div className="animate-fade-in-up">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-emerald-600 shadow-md shadow-emerald-100">
                            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.successTitle')}</h1>
                        <p className="text-stone-500 mb-6 text-xs sm:text-sm leading-relaxed">
                            {t('paymentStatus.successDesc', { groom: order.groom_name, bride: order.bride_name })}
                        </p>

                        {/* KOTAK PIN */}
                        {order.pin_code ? (
                            <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-2xl mb-4 sm:mb-6 border-2 border-dashed border-[#E59A59] text-center">
                                <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">
                                    {t('paymentStatus.pinLabel')}
                                </span>
                                <div className="text-3xl sm:text-4xl font-black text-[#712E1E] tracking-widest my-1 font-mono select-all">
                                    {order.pin_code}
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-stone-400 mt-1">
                                    {t('paymentStatus.pinSecurityNote')}
                                </p>
                            </div>
                        ) : null}

                        <div className="bg-[#F7EEE3] p-3 sm:p-4 rounded-xl mb-6 sm:mb-8 border border-dashed border-[#E59A59]">
                            <p className="text-xs text-[#712E1E] leading-relaxed flex items-start gap-2">
                                <Mail size={14} className="shrink-0 mt-0.5" />
                                <span>
                                    {t('paymentStatus.pinNote', { email: order.email || 'email' })}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            <button onClick={() => navigate('/login')} className="w-full py-3.5 sm:py-4 bg-[#712E1E] text-white rounded-xl font-bold text-sm sm:text-base hover:bg-[#5a2418] transition shadow-lg flex items-center justify-center gap-2">
                                {t('paymentStatus.btnDashboard')} <ArrowRight className="w-5 h-5" />
                            </button>
                            <button onClick={() => navigate(`/wedding/${order.slug}`)} className="w-full py-3.5 sm:py-4 bg-white border-2 border-[#712E1E] text-[#712E1E] rounded-xl font-bold text-sm sm:text-base hover:bg-stone-50 transition">
                                {t('paymentStatus.btnViewInvitation')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (order) {
                                        void downloadClientInvoice({
                                            orderId: orderId || 'ONLINE',
                                            groomName: order.groom_name,
                                            brideName: order.bride_name,
                                            email: order.email || undefined,
                                            whatsapp: order.whatsapp || undefined,
                                            weddingDate: order.wedding_date || undefined,
                                            templateName: order.template_name || 'Undangan Digital',
                                            price: typeof order.price === 'number' && order.price > 0 ? order.price : 10070,
                                            paymentMethod: order.payment_method || 'QRIS',
                                            pin: order.pin_code || undefined,
                                        });
                                    }
                                }}
                                className="w-full py-2.5 sm:py-3 bg-[#FAF6EE] border border-[#EBDFCE] text-[#712E1E] rounded-xl font-bold hover:bg-[#F3EBDF] transition flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xs"
                            >
                                <FileText className="w-4 h-4" /> {t('paymentStatus.btnDownloadInvoice')}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PENDING --- */}
                {isPending && (
                    <div className="animate-fade-in-up">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-yellow-600 shadow-lg shadow-yellow-100 animate-pulse">
                            <Clock className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.pendingTitle')}</h1>
                        <p className="text-stone-400 mb-6 sm:mb-8 text-xs sm:text-sm">
                            {t('paymentStatus.pendingDesc')}<br />
                            <span className="text-[11px] sm:text-xs mt-2 block">
                                {t('paymentStatus.pendingNote')}
                            </span>
                        </p>

                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            <button
                                type="button"
                                onClick={handlePayAgain}
                                className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0 bg-[#E59A59] text-white hover:bg-[#d48b4b] flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" /> {t('paymentStatus.btnPayNow')}
                            </button>
                            <button onClick={() => fetchOrderStatus()} className="w-full py-3.5 sm:py-4 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm sm:text-base hover:bg-stone-200 transition flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> {t('paymentStatus.btnCheckStatus')}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- FAILED --- */}
                {isFailed && (
                    <div className="animate-fade-in-up">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-red-600 shadow-lg shadow-red-100">
                            <XCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.failedTitle')}</h1>
                        <p className="text-stone-400 mb-6 sm:mb-8 text-xs sm:text-sm">
                            {t('paymentStatus.failedDesc')}
                        </p>

                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            <button onClick={() => navigate('/order')} className="w-full py-3.5 sm:py-4 bg-[#712E1E] text-white rounded-xl font-bold text-sm sm:text-base hover:bg-[#5a2418] transition shadow-lg">
                                {t('paymentStatus.btnNewOrder')}
                            </button>
                            <button onClick={() => navigate('/')} className="w-full py-3.5 sm:py-4 bg-white border border-stone-200 text-stone-500 rounded-xl font-bold text-sm sm:text-base hover:bg-stone-50 transition flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> {t('paymentStatus.btnHome')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}