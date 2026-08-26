// ============================================================
// src/hooks/useDashboardData.ts
// ------------------------------------------------------------
// Otak data dashboard mempelai: validasi sesi, fetch order + RSVP, state form event_details, dan penyimpanan perubahan.
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : lib/customerClient, lib/persistQueue, components/GlobalToast, types/database
// ============================================================

// Hook untuk Dashboard mempelai: validasi sesi, fetch order + RSVP,
// state form event_details, serta simpan perubahan.

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCustomerToken, getCustomerToken, resolveDbClient } from '../lib/customerClient';
import { enqueuePersist } from '../lib/persistQueue';
import { useToast } from '../components/GlobalToast';
import type { OrderRow, BankAccount, EventDetails } from '../types/database';
import { useTranslation } from '../i18n';

export type DashboardForm = EventDetails & { gallery: string[]; banks: BankAccount[] };

const EMPTY_FORM: DashboardForm = {
  venue_name: '', venue_address: '', maps_link: '',
  akad_date: '', akad_time: '',
  resepsi_date: '', resepsi_time: '',
  groom_parents: '', bride_parents: '',
  groom_photo: '', bride_photo: '', cover_photo: '',
  gallery: [], banks: [],
  audio_url: '', quote: '', quote_src: '',
};

export function useDashboardData(orderId: string | undefined) {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState<DashboardForm>(EMPTY_FORM);
  // Hanya total (badge sidebar) — daftar ucapan dikelola useRsvpServer.
  const [rsvpTotal, setRsvpTotal] = useState<number | null>(null);

  // Validasi sesi + fetch data order & RSVP
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!orderId) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      const db = resolveDbClient();
      const { data: orderData, error } = await db
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !orderData) {
        // RLS / pesanan terhapus semua bermuara ke sini. Dengan token customer
        // masih ada, sesi jelas tidak layak — sebelumnya form KOSONG tetap
        // dirender dan bisa "disimpan" secara ilusif.
        if (getCustomerToken()) {
          clearCustomerToken();
          sessionStorage.removeItem('active_order_id');
          toast.warning(tRef.current('toast.sessionExpired'));
          navigate('/login');
        } else {
          toast.error(tRef.current('toast.dataNotFound'));
        }
        setDataLoading(false);
        return;
      }

      setOrder(orderData);
      setFormData(prev => ({
        ...prev,
        ...orderData.event_details,
        gallery: orderData.event_details?.gallery || [],
        banks: orderData.event_details?.banks || []
      }));

      // Total RSVP untuk badge: query head-only (tanpa memuat baris).
      // Daftar ucapan kini dimuat + dipaginasi server-side oleh useRsvpServer.
      const { count: totalRsvp } = await db
        .from('rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', orderId);

      if (cancelled) return;
      setRsvpTotal(typeof totalRsvp === 'number' ? totalRsvp : null);
      setDataLoading(false);
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [orderId, navigate, toast]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value } as DashboardForm));

  const handleSaveData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    // Satu antrean dengan auto-save upload agar tidak saling menimpa.
    const { count, error } = await enqueuePersist(() =>
      resolveDbClient()
        .from('orders')
        .update({ event_details: formData }, { count: 'exact' })
        .eq('id', orderId),
    );
    setLoading(false);
    if (error) toast.error(t('toast.saveFailed', { error: error.message }));
    else if ((count ?? 0) === 0) toast.error(t('toast.noChangesSaved'));
    else toast.success(t('toast.savedSuccess'));
  };

  return {
    order, setOrder,
    loading, setLoading,
    dataLoading,
    formData, setFormData,
    rsvpTotal,
    handleChange, handleSaveData,
  };
}
