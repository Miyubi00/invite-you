import React from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';

/* --- IMPORT COMPONENTS --- */
import Navbar from './components/Navbar'; // <--- Import Navbar Coklat Baru
import { ToastProvider } from './components/GlobalToast';

/* --- IMPORT PAGES --- */
import Landing from './pages/Landing';
import OrderForm from './pages/OrderForm';
import DashboardLogin from './pages/DashboardLogin';
import Dashboard from './pages/Dashboard';
import InvitationRender from './pages/InvitationRender';
import TemplateDemo from './pages/TemplateDemo';
import AdminPanel from './pages/AdminPanel'; // Import
import PaymentStatus from './pages/PaymentStatus'; // Import

/* --- LAYOUTS --- */

// 1. PUBLIC LAYOUT (Navbar Coklat + Konten)
//    Dipakai untuk: Home, Order, Login
const PublicLayout = () => {
  return (
    <>
      <Navbar /> {/* Navbar Coklat muncul disini */}
      <div className="min-h-screen bg-[#FFD5AF]"> {/* Background default */}
        <Outlet />
      </div>
    </>
  );
};

// 3. INVITATION LAYOUT (Fullscreen Tanpa Navbar)
const InvitationLayout = () => {
  return (
    <div className="w-full min-h-screen bg-white">
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <Routes>

        {/* GROUP 1: PUBLIC PAGES (Pakai Navbar Coklat) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/order" element={<OrderForm />} />
          <Route path="/login" element={<DashboardLogin />} />
          <Route path="/dashboard/:orderId" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
        </Route>

        <Route path="/demo/:slug" element={<TemplateDemo />} />


        {/* GROUP 3: UNDANGAN TAMU (Fullscreen) */}
        <Route element={<InvitationLayout />}>
          <Route path="/wedding/:slug" element={<InvitationRender />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="text-center mt-20">404 Not Found</div>} />

      </Routes>
    </ToastProvider>
  );
}

export default App;