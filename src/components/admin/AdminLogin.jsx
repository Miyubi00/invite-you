import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLogin({ setSession, setLoading, toast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoginLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    setLoginLoading(false);
    
    if (error) {
        toast.error("Login Gagal: " + error.message);
    } else {
        toast.success("Selamat datang, Admin!");
        // Supabase onAuthStateChange di AdminPanel akan otomatis mendeteksi login ini
    }
  };

  return (
    <div className="min-h-screen bg-[#FFD5AF] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border-2 border-[#712E1E] text-center">
        <div className="bg-[#712E1E] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-[#FFD5AF]" />
        </div>
        <h1 className="text-2xl font-bold text-[#712E1E] mb-2">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" required placeholder="admin@LoVerse.com" 
            value={email} onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#712E1E] outline-none" 
          />
          <input 
            type="password" required placeholder="Password" 
            value={password} onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#712E1E] outline-none" 
          />
          <button 
            disabled={loginLoading} 
            className="w-full bg-[#E59A59] text-white py-3 rounded-xl font-bold hover:bg-[#d48b4b] transition flex justify-center shadow-lg"
          >
            {loginLoading ? <Loader2 className="animate-spin" /> : "Masuk Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}