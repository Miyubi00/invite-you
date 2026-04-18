import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast';
import ConfirmDialog from '../components/ConfirmDialog';
import { ShieldCheck, LogOut } from 'lucide-react';

// Import Komponen Anak (Pastikan Anda akan membuat file-file ini)
import AdminLogin from '../components/admin/AdminLogin';
import OrdersTab from '../components/admin/OrdersTab';
import TemplatesTab from '../components/admin/TemplatesTab';
import EditOrderModal from '../components/admin/EditOrderModal';

export default function AdminPanel() {
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // STATE DATA
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]); 
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchTerm, setSearchTerm] = useState('');
  
  // STATE DIALOG & MODAL
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', isDanger: true, onConfirm: null });
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [rsvps, setRsvps] = useState([]);

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));
  const confirmAction = (title, message, isDanger, onConfirmFunc) => {
    setDialog({ isOpen: true, title, message, isDanger, onConfirm: onConfirmFunc });
  };

  // 1. CEK SESSION & FETCH DATA
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(); else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setOrders([]); setPendingOrders([]); setTemplates([]); 
    toast.success("Berhasil Logout"); 
  };

  const fetchData = async () => {
    setLoading(true);
    const [resOrders, resPending, resTemplates] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('pending_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('templates').select('*').order('name', { ascending: true })
    ]);

    if (!resOrders.error) setOrders(resOrders.data);
    if (!resPending.error) setPendingOrders(resPending.data);
    if (!resTemplates.error) setTemplates(resTemplates.data);
    setLoading(false);
  };

  // --- RENDER ---
  if (!session) {
    return <AdminLogin setSession={setSession} setLoading={setLoading} toast={toast} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header Statis */}
      <div className="bg-[#712E1E] text-[#FFD5AF] p-6 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" /> Admin Panel
            </h1>
            <p className="text-xs opacity-80">Superuser: {session.user.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2 font-medium">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Navigasi Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto custom-scroll pb-1">
          <button 
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }} 
            className={`pb-2 px-4 font-bold whitespace-nowrap transition-all ${activeTab === 'orders' ? 'border-b-4 border-[#712E1E] text-[#712E1E]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            📋 Data Pesanan ({orders.length + pendingOrders.length})
          </button>
          <button 
            onClick={() => { setActiveTab('templates'); setSearchTerm(''); }} 
            className={`pb-2 px-4 font-bold whitespace-nowrap transition-all ${activeTab === 'templates' ? 'border-b-4 border-[#712E1E] text-[#712E1E]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            🎨 Kelola Template ({templates.length})
          </button>
        </div>

        {/* TAMPILKAN KONTEN BERDASARKAN TAB */}
        {activeTab === 'orders' && (
           <OrdersTab 
              orders={orders} 
              pendingOrders={pendingOrders} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              confirmAction={confirmAction}
              fetchData={fetchData}
              setEditingOrder={setEditingOrder}
              setEditFormData={setEditFormData}
              setRsvps={setRsvps}
              toast={toast}
           />
        )}

        {activeTab === 'templates' && (
           <TemplatesTab 
              templates={templates} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              confirmAction={confirmAction}
              fetchData={fetchData}
              toast={toast}
              loading={loading}
           />
        )}
      </div>

      {/* MODAL EDIT DATA UNDANGAN */}
      {editingOrder && (
         <EditOrderModal 
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            rsvps={rsvps}
            setRsvps={setRsvps}
            templates={templates}
            uploading={uploading}
            setUploading={setUploading}
            fetchData={fetchData}
            confirmAction={confirmAction}
            toast={toast}
         />
      )}

      {/* COMPONENT CONFIRM DIALOG */}
      <ConfirmDialog 
        isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} 
        isDanger={dialog.isDanger} onCancel={closeDialog} onConfirm={dialog.onConfirm} 
      />
    </div>
  );
}