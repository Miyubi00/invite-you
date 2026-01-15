// src/pages/InvitationRender.jsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getTemplateComponent } from '../templates/Registry'; // Import dari Registry

export default function InvitationRender() {
  const { slug } = useParams(); 
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) console.error("Error fetch:", error);
      if (data) setOrderData(data);
      setLoading(false);
    };

    fetchOrder();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center">Memuat Undangan...</div>;
  if (!orderData) return <div className="h-screen flex items-center justify-center text-red-500">Undangan tidak ditemukan.</div>;

  // --- LOGIC PEMILIHAN TEMA VIA REGISTRY ---
  
  // Pastikan nama kolom di database sesuai (template_slug / template_id)
  const themeSlug = orderData.template_slug || 'rustic-floral'; 
  
  // Panggil fungsi registry
  const TemplateComponent = getTemplateComponent(themeSlug);

  return (
    <TemplateComponent 
      groom={orderData.groom_name}
      bride={orderData.bride_name}
      date={orderData.wedding_date}
      guestName={guestName}
      data={orderData.event_details}
    />
  );
}