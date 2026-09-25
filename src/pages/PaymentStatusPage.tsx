import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_WHATSAPP } from '../lib/constants';
import { CheckCircle, XCircle, Clock, ArrowRight, RefreshCcw, Home, CreditCard, MessageSquare } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { PaymentStatusSkeleton } from '../components/ui/SkeletonLoaders';
import { useTranslation } from '../i18n';

/**
 * Respons terbatas dari Edge Function `payment-status`.
 * Model kapabilitas: akses = mengetahui midtrans_order_id dari
 * redirect URL. PIN hanya dikirim saat sukses; snap_token hanya
 * saat pending.
 */
interface PaymentStatusResponse {
  found: boolean;
  payment_status: string;
  order_id: string | null;
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
  created_at: string | null;
}

const formatIDR = (value: number) =>
    `Rp ${value.toLocaleString('id-ID')}`;

/** Kartu ringkasan order yang dipakai semua status. */
function OrderSummary({ order }: { order: PaymentStatusResponse }) {
    const { t } = useTranslation();
    const total = typeof order.price === 'number' && order.price > 0 ? order.price : 0;
    const rows: Array<[string, string]> = [
        [t('paymentStatus.sumCouple'), `${order.groom_name} & ${order.bride_name}`],
        [t('paymentStatus.sumTemplate'), order.template_name || 'Undangan Digital'],
        [t('paymentStatus.sumMethod'), order.payment_method || 'QRIS'],
    ];
    return (
        <div className="bg-[#FAF6EE] border border-[#EBDFCE] rounded-2xl p-4 text-left">
            <dl className="space-y-2 text-xs sm:text-sm">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                        <dt className="text-stone-400 shrink-0">{label}</dt>
                        <dd className="font-bold text-[#712E1E] text-right truncate">{value}</dd>
                    </div>
                ))}
                <div className="flex justify-between items-center gap-3 pt-2.5 mt-1 border-t border-[#EBDFCE]">
                    <dt className="text-stone-400 shrink-0">{t('paymentStatus.sumTotal')}</dt>
                    <dd className="font-black text-[#712E1E] text-right text-sm sm:text-base">
                        {formatIDR(total)}
                    </dd>
                </div>
            </dl>
            {order.order_id ? (
                <p className="mt-2.5 pt-2 border-t border-dashed border-[#EBDFCE] text-[10px] sm:text-[11px] text-stone-400 font-mono text-center select-all">
                    {order.order_id}
                </p>
            ) : null}
        </div>
    );
}

export default function PaymentStatus() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<PaymentStatusResponse | null>(null);

    const orderId = searchParams.get('order_id');
    const isManualWhatsApp = !orderId;

    // orderId di URL bisa berupa token terenkripsi (alur utama) atau id
    // mentah (link lama / redirect bawaan Midtrans). Server yang resolve.
    const fetchOrderStatus = useCallback(async (showLoader = false) => {
        if (!orderId) return;
        if (showLoader) setLoading(true);
        const { data, error } = await supabase.functions
            .invoke('payment-status', { body: { order_token: orderId } });

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

    // Polling status dengan backoff; berhenti saat terminal.
    // Status gagal datang dari webhook expire Midtrans (tanpa batas lokal).

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
    // Tanpa batas lokal: pending tampil sampai DB berubah (webhook sukses /
    // expire Midtrans). Polling di atas yang memutakhirkan tampilan.
    const showPending = isPending;
    const showFailed = isFailed;

    // Konfigurasi visual per status: pita gradien dan lingkaran ikon.
    const statusTheme = isSuccess
        ? {
            band: 'from-emerald-400 via-emerald-500 to-teal-500',
            iconWrap: 'bg-emerald-50 text-emerald-600 shadow-emerald-100',
            Icon: CheckCircle,
        }
        : showFailed
            ? {
                band: 'from-rose-400 via-rose-500 to-red-500',
                iconWrap: 'bg-rose-50 text-rose-600 shadow-rose-100',
                Icon: XCircle,
            }
            : {
                band: 'from-amber-300 via-[#E59A59] to-[#d48b4b]',
                iconWrap: 'bg-amber-50 text-amber-600 shadow-amber-100',
                Icon: Clock,
            };

    return (
        <div className="min-h-screen bg-[#F1E8DC] font-sans w-full max-w-full overflow-x-hidden flex items-center justify-center p-3 sm:p-6 relative">
            {/* dekorasi latar */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#E59A59]/15 blur-3xl" />
                <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-[#712E1E]/10 blur-3xl" />
            </div>

            <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-stone-900/10 text-center border border-[#EBDFCE] overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${statusTheme.band}`} />

                <div className="p-6 sm:p-8">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg ${statusTheme.iconWrap} ${showPending ? 'animate-pulse' : ''}`}>
                        <statusTheme.Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>

                    {/* --- SUCCESS --- */}
                    {isSuccess && (
                        <div className="animate-fade-in-up">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.successTitle')}</h1>
                            <p className="text-stone-500 mb-5 text-xs sm:text-sm leading-relaxed">
                                {t('paymentStatus.successDesc', { groom: order.groom_name, bride: order.bride_name })}
                            </p>

                            <div className="mb-5">
                                <OrderSummary order={order} />
                            </div>

                            <div className="bg-[#F7EEE3] p-3 sm:p-4 rounded-xl mb-6 border border-dashed border-[#E59A59]">
                                <p className="text-xs text-[#712E1E] leading-relaxed text-center">
                                    {t('paymentStatus.pinNote', { email: order.email || 'email' })}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button onClick={() => navigate('/login')} className="w-full py-3.5 bg-gradient-to-r from-[#712E1E] to-[#8f3d27] text-white rounded-xl font-bold text-sm sm:text-base hover:brightness-110 active:brightness-95 transition shadow-lg shadow-[#712E1E]/25 flex items-center justify-center gap-2">
                                    {t('paymentStatus.btnDashboard')} <ArrowRight className="w-5 h-5" />
                                </button>
                                <button onClick={() => navigate(`/wedding/${order.slug}`)} className="w-full py-3.5 bg-white border-2 border-[#712E1E]/20 text-[#712E1E] rounded-xl font-bold text-sm sm:text-base hover:border-[#712E1E] hover:bg-stone-50 transition">
                                    {t('paymentStatus.btnViewInvitation')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- PENDING --- */}
                    {showPending && (
                        <div className="animate-fade-in-up">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.pendingTitle')}</h1>
                            <p className="text-stone-400 mb-4 text-xs sm:text-sm">
                                {t('paymentStatus.pendingDesc')}
                            </p>

                            <div className="mb-5">
                                <OrderSummary order={order} />
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={handlePayAgain}
                                    className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-base shadow-xl shadow-[#E59A59]/30 transition transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#E59A59] to-[#d48b4b] text-white hover:brightness-105 flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" /> {t('paymentStatus.btnPayNow')}
                                </button>
                                <button onClick={() => fetchOrderStatus()} className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm hover:bg-stone-200 active:bg-stone-300 transition flex items-center justify-center gap-2">
                                    <RefreshCcw className="w-4 h-4" /> {t('paymentStatus.btnCheckStatus')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- FAILED --- */}
                    {showFailed && (
                        <div className="animate-fade-in-up">
                            <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E] mb-2">{t('paymentStatus.failedTitle')}</h1>
                            <p className="text-stone-400 mb-5 text-xs sm:text-sm">
                                {t('paymentStatus.failedDesc')}
                            </p>

                            <div className="mb-5">
                                <OrderSummary order={order} />
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button onClick={() => navigate('/order')} className="w-full py-3.5 bg-gradient-to-r from-[#712E1E] to-[#8f3d27] text-white rounded-xl font-bold text-sm sm:text-base hover:brightness-110 active:brightness-95 transition shadow-lg shadow-[#712E1E]/25">
                                    {t('paymentStatus.btnNewOrder')}
                                </button>
                                <button onClick={() => navigate('/')} className="w-full py-3 bg-white border border-stone-200 text-stone-500 rounded-xl font-bold text-sm hover:bg-stone-50 transition flex items-center justify-center gap-2">
                                    <Home className="w-4 h-4" /> {t('paymentStatus.btnHome')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}