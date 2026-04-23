'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; 

export default function BulananPage() {
    const router = useRouter();
    
    // Default: bulan & tahun saat ini
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const [bulanAktif, setBulanAktif] = useState(currentYearMonth);
    
    const [dataRekap, setDataRekap] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRekap = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('rekap_bulanan_kategori')
            .select('*')
            .eq('bulan_tahun', bulanAktif);

        if (!error && data) {
            setDataRekap(data);
        } else if (error) {
            console.error("Error mengambil rangkuman bulanan:", error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRekap();
    }, [bulanAktif]);

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const pemasukan = dataRekap.filter(d => d.tipe === 'Pemasukan');
    const pengeluaran = dataRekap.filter(d => d.tipe === 'Pengeluaran');

    const totalMasuk = pemasukan.reduce((acc, curr) => acc + curr.total, 0);
    const totalKeluar = pengeluaran.reduce((acc, curr) => acc + curr.total, 0);
    const sisaBulan = totalMasuk - totalKeluar;

    return (
        <div className="relative min-h-screen bg-[#0B0B0F] text-white p-4 sm:p-6 font-sans overflow-x-hidden">
            
            {/* Background Glow Effects (Blue/Purple Theme) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                
                {/* HEADER BERPUSAT DENGAN TOMBOL KEMBALI */}
                <header className="relative flex flex-col md:flex-row items-center justify-between bg-[#151521]/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-xl border border-white/5 gap-4">
                    
                    <div className="flex w-full md:w-auto justify-between md:justify-start items-center">
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-white hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 z-20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <span className="relative z-10 flex items-center gap-2">
                                <span>←</span> Dashboard
                            </span>
                        </button>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Rangkuman <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Otomatis</span>
                        </h1>
                    </div>

                    {/* Filter Bulan Menyatu dengan Header */}
                    <div className="w-full md:w-auto relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <input 
                            type="month" 
                            value={bulanAktif}
                            onChange={(e) => setBulanAktif(e.target.value)}
                            className="w-full md:w-auto pl-10 pr-4 py-2.5 bg-[#1c1c2a] border border-white/10 rounded-xl text-blue-400 font-bold focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-[#252536] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300 [color-scheme:dark]"
                        />
                    </div>
                </header>

                {/* Ringkasan Saldo Bulan Terpilih */}
                <div className="bg-gradient-to-br from-[#151521]/70 to-[#1c1c2a]/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-xl flex flex-col md:flex-row justify-around items-center gap-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-400 font-medium mb-1 uppercase tracking-widest">Total Pemasukan</p>
                        <p className="text-2xl font-bold text-teal-400">{formatRupiah(totalMasuk)}</p>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-white/10"></div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400 font-medium mb-1 uppercase tracking-widest">Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-rose-400">{formatRupiah(totalKeluar)}</p>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-white/10"></div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400 font-medium mb-1 uppercase tracking-widest">Surplus / Defisit</p>
                        <p className={`text-3xl font-extrabold ${sisaBulan >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500' : 'text-red-500'}`}>
                            {sisaBulan >= 0 ? '+' : ''}{formatRupiah(sisaBulan)}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-blue-500/50 animate-pulse font-medium text-lg">Menganalisa data bulanan...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                        
                        {/* Tabel Pemasukan Glassmorphism */}
                        <div className="bg-[#151521]/70 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl overflow-hidden flex flex-col h-fit">
                            <div className="bg-teal-500/10 py-4 text-center border-b border-teal-500/20 backdrop-blur-md">
                                <h2 className="text-teal-400 font-bold tracking-widest uppercase">Pemasukan Berdasarkan Kategori</h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 border-b border-white/5 bg-white/[0.01]">
                                        <th className="p-4 text-left font-medium uppercase tracking-wider">Kategori</th>
                                        <th className="p-4 text-right font-medium uppercase tracking-wider">Total Nominal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pemasukan.map((item, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-default">
                                            <td className="p-4 text-gray-300 font-medium group-hover:text-teal-300 transition-colors">{item.kategori}</td>
                                            <td className="p-4 text-right font-bold text-white">{formatRupiah(item.total)}</td>
                                        </tr>
                                    ))}
                                    {pemasukan.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="p-10 text-center text-gray-500 italic">Belum ada pemasukan di bulan ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-[#1c1c2a] border-t border-white/10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
                                    <tr>
                                        <td className="p-4 font-bold text-gray-300">GRAND TOTAL</td>
                                        <td className="p-4 text-right font-black text-teal-400 text-lg">{formatRupiah(totalMasuk)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Tabel Pengeluaran Glassmorphism */}
                        <div className="bg-[#151521]/70 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl overflow-hidden flex flex-col h-fit">
                            <div className="bg-rose-500/10 py-4 text-center border-b border-rose-500/20 backdrop-blur-md">
                                <h2 className="text-rose-400 font-bold tracking-widest uppercase">Pengeluaran Berdasarkan Kategori</h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 border-b border-white/5 bg-white/[0.01]">
                                        <th className="p-4 text-left font-medium uppercase tracking-wider">Kategori</th>
                                        <th className="p-4 text-right font-medium uppercase tracking-wider">Total Nominal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pengeluaran.map((item, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-default">
                                            <td className="p-4 text-gray-300 font-medium group-hover:text-rose-300 transition-colors">{item.kategori}</td>
                                            <td className="p-4 text-right font-bold text-white">{formatRupiah(item.total)}</td>
                                        </tr>
                                    ))}
                                    {pengeluaran.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="p-10 text-center text-gray-500 italic">Belum ada pengeluaran di bulan ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-[#1c1c2a] border-t border-white/10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
                                    <tr>
                                        <td className="p-4 font-bold text-gray-300">GRAND TOTAL</td>
                                        <td className="p-4 text-right font-black text-rose-400 text-lg">{formatRupiah(totalKeluar)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}