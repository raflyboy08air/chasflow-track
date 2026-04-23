'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Pastikan path ini benar

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(''); // Bersihkan pesan error sebelumnya
        
        // Meminta Supabase untuk mencocokkan email dan password
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // Jika salah, tampilkan pesan error
            setErrorMsg("Email atau Password salah!");
            setIsLoading(false);
        } else if (data.session) {
            // Jika benar, pindah ke halaman dashboard
            router.push('/dashboard');
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0B0B0F] text-white p-4 overflow-hidden font-sans">
            
            {/* Efek Cahaya Neon (Blobs) - KECERAHAN DITINGKATKAN */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                {/* Bias Emas Kiri Atas */}
                <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-500/30 rounded-full blur-[80px]"></div>
                
                {/* Bias Amber Kanan Bawah */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/30 rounded-full blur-[100px]"></div>
            </div>

            {/* Kartu Login Glassmorphism */}
            <div className="relative z-10 w-full max-w-md bg-[#151521]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/5">
                
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                        Cashflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Tracker</span>
                    </h2>
                    <p className="text-gray-400 text-sm">Selamat datang kembali, silakan masuk.</p>
                </div>

                {/* Notifikasi Error */}
                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center font-medium">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3.5 bg-[#0B0B0F]/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            placeholder="nama@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3.5 bg-[#0B0B0F]/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`w-full mt-4 font-extrabold py-4 rounded-2xl transition-all transform active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.25)]
                            ${isLoading ? 'bg-gray-700 text-gray-400 cursor-wait' : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-gray-900'}`}
                    >
                        {isLoading ? 'MEMPROSES...' : 'Login'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Secure Environment by Supabase
                </p>
            </div>
        </div>
    );
}