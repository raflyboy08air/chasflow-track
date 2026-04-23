'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Pastikan path ini sesuai dengan file supabase-mu

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(''); // Bersihkan pesan error sebelumnya

        // Perintah sakti Supabase untuk mengecek kecocokan email & password
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setErrorMsg("Email atau Password salah!");
        } else if (data.session) {
            // Jika berhasil login, simpan token (otomatis oleh supabase) & pindah ke dashboard
            router.push('/dashboard');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <div className="w-full max-w-md bg-[#151521]/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                        Cashflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Tracker</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Masuk untuk mengelola keuanganmu</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center font-medium">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide ml-1">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="slamet@email.com"
                            className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide ml-1">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder-gray-700"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`relative w-full overflow-hidden group px-6 py-4 rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-lg
                            ${isLoading ? 'bg-gray-700 text-gray-400 cursor-wait' : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:-translate-y-1'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                        <span className="relative z-10 tracking-wider">
                            {isLoading ? 'MENGOTENTIKASI...' : 'MASUK KE DASHBOARD'}
                        </span>
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600">Secure Environment by Supabase</p>
                </div>
            </div>
        </div>
    );
}