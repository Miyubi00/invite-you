// src/pages/Placeholders.jsx
import { Link, useParams } from 'react-router-dom';

export const Home = () => (
  <div className="p-10 text-center">
    <h1 className="text-4xl font-serif text-gold-600 mb-4">Wedding Invitations</h1>
    <Link to="/order" className="bg-black text-white px-4 py-2 rounded">Buat Undangan</Link>
  </div>
);

export const Order = () => <div className="p-10"><h1>Form Pemesanan & Midtrans</h1></div>;
export const Login = () => <div className="p-10"><h1>Login Dashboard Mempelai</h1></div>;
export const Dashboard = () => <div className="p-10"><h1>Dashboard User (Tamu & Statistik)</h1></div>;
export const Admin = () => <div className="p-10 bg-gray-200"><h1>Halaman Admin</h1></div>;

// Ini halaman penting: Render Undangan
export const InvitationRender = () => {
  const { slug } = useParams();
  return (
    <div className="h-screen bg-pink-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Preview Undangan:</p>
        <h1 className="text-5xl font-serif text-gold-600 mb-4 capitalize">{slug.replace('-', ' & ')}</h1>
        <p>Tanpa Navbar SaaS (Fullscreen)</p>
      </div>
    </div>
  );
};