// ============================================================
// src/hooks/useDashboardData.ts
// ------------------------------------------------------------
// Otak data dashboard mempelai: validasi sesi, fetch order + RSVP, state form event_details, dan penyimpanan perubahan.
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : lib/customerClient, lib/persistQueue, components/GlobalToast, types/database
// ============================================================

// Hook untuk Dashboard mempelai: validasi sesi, fetch order + RSVP,
// state form event_details, serta simpan perubahan.

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCustomerToken, getCustomerToken, resolveDbClient } from '../lib/customerClient';
import { enqueuePersist } from '../lib/persistQueue';
import { useToast } from '../components/GlobalToast';
import type { OrderRow, BankAccount, EventDetails } from '../types/database';

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

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState<DashboardForm>(EMPTY_FORM);
  // Hanya total (badge sidebar) — daftar ucapan dikelola useRsvpServer.
  const [rsvpTotal, setRsvpTotal] = useState<number | null>(null);

  // Validasi sesi + fetch data order & RSVP
  useEffect(() => {
    let cancelled = false;

    const sessionID = sessionStorage.getItem('active_order_id');
    if (!sessionID || sessionID !== orderId) {
      toast.warning("Sesi berakhir. Silakan login kembali.");
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      // resolveDbClient(): JWT pelanggan bila ada, sesi admin/anon jika tidak.
      const db = resolveDbClient();
      const { data: orderData, error: orderError } = await db
        .from('orders').select('*').eq('id', orderId).single();

      // Navigasi cepat antar orderId: buang hasil fetch yang sudah basi agar
      // tidak menimpa state pesanan aktif.
      if (cancelled) return;

      if (orderError || !orderData) {
        // Error .single() TIDAK diabaikan lagi: token kedaluwarsa / diblokir
        // RLS / pesanan terhapus semua bermuara ke sini. Dengan token customer
        // masih ada, sesi jelas tidak layak — sebelumnya form KOSONG tetap
        // dirender dan bisa "disimpan" secara ilusif.
        if (getCustomerToken()) {
          clearCustomerToken();
          sessionStorage.removeItem('active_order_id');
          toast.warning('Sesi berakhir atau data tidak ditemukan. Silakan login kembali.');
          navigate('/login');
        } else {
          toast.error("Data tidak ditemukan.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, navigate]);

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
    if (error) toast.error('Gagal menyimpan: ' + error.message);
    else if ((count ?? 0) === 0) toast.error('Tidak ada perubahan tersimpan. Muat ulang halaman lalu coba lagi.');
    else toast.success('Tersimpan!');
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
