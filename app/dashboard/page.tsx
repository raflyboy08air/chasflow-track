'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
    const router = useRouter();
    const [tahunAktif, setTahunAktif] = useState('2026');

    const tahunAwal = 2025;
    const rentangTahun = 10; 
    const daftarTahun = Array.from({ length: rentangTahun + 1 }, (_, i) => (tahunAwal + i).toString());

    const [totalPemasukan, setTotalPemasukan] = useState(0);
    const [totalPengeluaran, setTotalPengeluaran] = useState(0);
    const [recentPemasukan, setRecentPemasukan] = useState<any[]>([]);
    const [recentPengeluaran, setRecentPengeluaran] = useState<any[]>([]);
    
    const [dataGaris, setDataGaris] = useState<any[]>([]);
    const [dataDonatPemasukan, setDataDonatPemasukan] = useState<any[]>([]);
    const [dataDonatPengeluaran, setDataDonatPengeluaran] = useState<any[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);

    const WARNA_GRADASI = [
        { id: 'gradTeal', start: '#5eead4', mid: '#14b8a6', end: '#0f766e' },
        { id: 'gradIndigo', start: '#a5b4fc', mid: '#6366f1', end: '#4338ca' },
        { id: 'gradAmber', start: '#fde68a', mid: '#f59e0b', end: '#b45309' },
        { id: 'gradPink', start: '#fbcfe8', mid: '#ec4899', end: '#be185d' },
        { id: 'gradEmerald', start: '#6ee7b7', mid: '#10b981', end: '#047857' },
        { id: 'gradViolet', start: '#c4b5fd', mid: '#8b5cf6', end: '#6d28d9' },
        { id: 'gradRose', start: '#fecdd3', mid: '#f43f5e', end: '#be123c' },
        { id: 'gradBlue', start: '#93c5fd', mid: '#3b82f6', end: '#1d4ed8' },
    ];

    // FUNGSI NORMALISASI KATEGORI (Merapikan data lama yang kotor otomatis)
    const normalisasiPemasukan = (kategoriLama: string) => {
        if (!kategoriLama) return 'Income Lain';
        const str = kategoriLama.toLowerCase();
        if (str.includes('gaji')) return 'Gaji';
        if (str.includes('saku') || str.includes('sangu')) return 'Uang Saku';
        if (str.includes('aset') || str.includes('invest')) return 'Aset';
        if (str.includes('side')) return 'Side Income';
        return 'Income Lain';
    };

    const normalisasiPengeluaran = (kategoriLama: string) => {
        if (!kategoriLama) return 'Lain-Lain';
        const str = kategoriLama.toLowerCase();
        if (str.includes('hobi')) return 'Hobi';
        if (str.includes('transport') || str.includes('trasport')) return 'Transport';
        if (str.includes('jajan') || str.includes('makan')) return 'Jajan';
        if (str.includes('aset')) return 'Aset';
        if (str.includes('reparasi')) return 'Reparasi';
        if (str.includes('mainten')) return 'Maintenance';
        if (str.includes('rumah')) return 'Rumah';
        if (str.includes('vape')) return 'Vape';
        return 'Lain-Lain';
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);

        const { data: dataMasuk } = await supabase.from('pemasukan').select('*').gte('tanggal', `${tahunAktif}-01-01`).lte('tanggal', `${tahunAktif}-12-31`);
        const { data: dataKeluar } = await supabase.from('pengeluaran').select('*').gte('tanggal', `${tahunAktif}-01-01`).lte('tanggal', `${tahunAktif}-12-31`);

        const bulanLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        const rekapBulanan = bulanLabel.map(b => ({ name: b, Pemasukan: 0, Pengeluaran: 0 }));
        
        let sumMasuk = 0;
        let sumKeluar = 0;
        
        const rekapKategoriMasuk: Record<string, number> = {};
        const rekapKategoriKeluar: Record<string, number> = {};

        if (dataMasuk) {
            dataMasuk.forEach(item => {
                sumMasuk += item.jumlah;
                const bulanIndex = parseInt(item.tanggal.split('-')[1]) - 1;
                rekapBulanan[bulanIndex].Pemasukan += item.jumlah;
                
                // Gunakan nama kategori yang sudah dirapikan
                const kategoriBersih = normalisasiPemasukan(item.kategori);
                rekapKategoriMasuk[kategoriBersih] = (rekapKategoriMasuk[kategoriBersih] || 0) + item.jumlah;
            });
        }

        if (dataKeluar) {
            dataKeluar.forEach(item => {
                sumKeluar += item.jumlah;
                const bulanIndex = parseInt(item.tanggal.split('-')[1]) - 1;
                rekapBulanan[bulanIndex].Pengeluaran += item.jumlah;
                
                // Gunakan nama kategori yang sudah dirapikan
                const kategoriBersih = normalisasiPengeluaran(item.kategori);
                rekapKategoriKeluar[kategoriBersih] = (rekapKategoriKeluar[kategoriBersih] || 0) + item.jumlah;
            });
        }

        setTotalPemasukan(sumMasuk);
        setTotalPengeluaran(sumKeluar);
        setDataGaris(rekapBulanan);

        // Map ke array dan filter yang valuenya 0 agar grafik bersih
        setDataDonatPemasukan(
            Object.keys(rekapKategoriMasuk)
                .map(key => ({ name: key, value: rekapKategoriMasuk[key] }))
                .filter(item => item.value > 0)
        );
        setDataDonatPengeluaran(
            Object.keys(rekapKategoriKeluar)
                .map(key => ({ name: key, value: rekapKategoriKeluar[key] }))
                .filter(item => item.value > 0)
        );

        const { data: lastMasuk } = await supabase.from('pemasukan').select('*').order('tanggal', { ascending: false }).limit(3);
        setRecentPemasukan(lastMasuk || []);

        const { data: lastKeluar } = await supabase.from('pengeluaran').select('*').order('tanggal', { ascending: false }).limit(3);
        setRecentPengeluaran(lastKeluar || []);

        setIsLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, [tahunAktif]);

    const handleLogout = () => {
        router.push('/'); 
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const sisaSaldo = totalPemasukan - totalPengeluaran;

    const renderCustomizedLabel = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, index } = props;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.4; 
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent === 0) return null;

        const textColor = WARNA_GRADASI[index % WARNA_GRADASI.length].mid;

        return (
            <text 
                x={x} y={y} 
                fill={textColor} 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central" 
                fontSize={12} 
                className="font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
                {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="relative min-h-screen bg-[#0B0B0F] text-white p-4 sm:p-6 font-sans overflow-x-hidden">
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                
                <header className="flex flex-col xl:flex-row justify-between items-center bg-[#151521]/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-xl border border-white/5 gap-5">
                    
                    <div className="flex gap-3 flex-wrap justify-center">
                        <Link href="/pemasukan" className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <span className="relative z-10">Pemasukan</span>
                        </Link>
                        <Link href="/pengeluaran" className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <span className="relative z-10">Pengeluaran</span>
                        </Link>
                        <Link href="/hutang" className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <span className="relative z-10">Hutang</span>
                        </Link>
                        <Link href="/bulanan" className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <span className="relative z-10">Bulanan</span>
                        </Link>
                    </div>
                    
                    <h1 className="text-2xl font-extrabold tracking-tight text-center">
                        Cashflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Tracker</span>
                    </h1>
                    
                    <button onClick={handleLogout} className="relative overflow-hidden group px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 border border-rose-400/50 rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(225,29,72,0.6)] hover:-translate-y-1 active:scale-95">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                        <span className="relative z-10 tracking-wide">Log out</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group hover:border-teal-500/30 transition-colors duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider relative z-10">Pemasukan ({tahunAktif})</h3>
                        <p className="text-3xl sm:text-4xl font-bold text-white relative z-10">{isLoading ? '...' : formatRupiah(totalPemasukan)}</p>
                    </div>
                    
                    <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-colors duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider relative z-10">Pengeluaran ({tahunAktif})</h3>
                        <p className="text-3xl sm:text-4xl font-bold text-white relative z-10">{isLoading ? '...' : formatRupiah(totalPengeluaran)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#1c1c2a] to-[#151521] backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125"></div>
                        <h3 className="text-amber-500/80 text-sm font-semibold mb-2 uppercase tracking-wider relative z-10">Sisa Saldo ({tahunAktif})</h3>
                        <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 relative z-10">
                            {isLoading ? '...' : formatRupiah(sisaSaldo)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Analytics</h3>
                                <p className="text-sm text-gray-400">Tren Cashflow Bulanan</p>
                            </div>
                            <select 
                                value={tahunAktif}
                                onChange={(e) => setTahunAktif(e.target.value)}
                                className="bg-[#1c1c2a] text-amber-400 font-bold border border-white/10 rounded-xl px-5 py-2.5 text-sm focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-[#252536] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300"
                            >
                                {daftarTahun.map((tahun) => (
                                    <option key={tahun} value={tahun} className="bg-[#151521] text-white">{tahun}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex-1 w-full h-full relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center"><p className="text-gray-500 animate-pulse">Menghitung Data...</p></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dataGaris} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp ${val/1000000}M`} /> 
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#151521', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                            formatter={(value: any) => formatRupiah(Number(value))}
                                            labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontWeight: 'bold' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" dataKey="Pemasukan" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorPemasukan)" activeDot={{ r: 8, stroke: '#0B0B0F', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="Pengeluaran" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorPengeluaran)" activeDot={{ r: 8, stroke: '#0B0B0F', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl flex-1 flex flex-col hover:border-rose-500/20 transition-colors duration-500">
                            <h4 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Pengeluaran Terakhir</h4>
                            <div className="flex-1 space-y-4">
                                {isLoading ? (
                                    <p className="text-sm text-gray-500 animate-pulse">Memuat...</p>
                                ) : recentPengeluaran.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Belum ada catatan.</p>
                                ) : (
                                    recentPengeluaran.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors border border-white/5 cursor-default">
                                            <div className="flex flex-col max-w-[60%]">
                                                <span className="text-white text-sm font-medium truncate">{item.keterangan}</span>
                                                <span className="text-gray-500 text-xs">{formatDate(item.tanggal)}</span>
                                            </div>
                                            <span className="text-rose-400 font-bold text-sm whitespace-nowrap">-{formatRupiah(item.jumlah)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl flex-1 flex flex-col hover:border-teal-500/20 transition-colors duration-500">
                            <h4 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Pemasukan Terakhir</h4>
                            <div className="flex-1 space-y-4">
                                {isLoading ? (
                                    <p className="text-sm text-gray-500 animate-pulse">Memuat...</p>
                                ) : recentPemasukan.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Belum ada catatan.</p>
                                ) : (
                                    recentPemasukan.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors border border-white/5 cursor-default">
                                            <div className="flex flex-col max-w-[60%]">
                                                <span className="text-white text-sm font-medium truncate">{item.keterangan}</span>
                                                <span className="text-gray-500 text-xs">{formatDate(item.tanggal)}</span>
                                            </div>
                                            <span className="text-teal-400 font-bold text-sm whitespace-nowrap">+{formatRupiah(item.jumlah)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col items-center justify-center min-h-[350px]">
                        <h4 className="text-white text-lg mb-6 w-full text-center font-bold">Porsi Pemasukan ({tahunAktif})</h4>
                        {isLoading ? (
                            <p className="text-gray-500 mt-auto mb-auto animate-pulse">Membuat Render 3D...</p>
                        ) : dataDonatPemasukan.length === 0 ? (
                            <p className="text-gray-500 mt-auto mb-auto italic">Belum ada data visual.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="2" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.8" />
                                        </filter>
                                        {WARNA_GRADASI.map((g) => (
                                            <linearGradient key={`in-${g.id}`} id={`in-${g.id}`} x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor={g.start} />
                                                <stop offset="40%" stopColor={g.mid} />
                                                <stop offset="100%" stopColor={g.end} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <Pie 
                                        data={dataDonatPemasukan} 
                                        cx="50%" cy="50%" 
                                        innerRadius={65} 
                                        outerRadius={90} 
                                        paddingAngle={8} 
                                        dataKey="value"
                                        label={renderCustomizedLabel} labelLine={false}
                                        stroke="#0B0B0F" 
                                        strokeWidth={2}
                                        cornerRadius={8}
                                        filter="url(#shadow3d)"
                                    >
                                        {dataDonatPemasukan.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#in-${WARNA_GRADASI[index % WARNA_GRADASI.length].id})`} className="hover:opacity-80 transition-opacity outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} contentStyle={{ backgroundColor: '#151521', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    
                    <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col items-center justify-center min-h-[350px]">
                        <h4 className="text-white text-lg mb-6 w-full text-center font-bold">Porsi Pengeluaran ({tahunAktif})</h4>
                        {isLoading ? (
                            <p className="text-gray-500 mt-auto mb-auto animate-pulse">Membuat Render 3D...</p>
                        ) : dataDonatPengeluaran.length === 0 ? (
                            <p className="text-gray-500 mt-auto mb-auto italic">Belum ada data visual.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <filter id="shadow3d-out" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="2" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.8" />
                                        </filter>
                                        {WARNA_GRADASI.map((g) => (
                                            <linearGradient key={`out-${g.id}`} id={`out-${g.id}`} x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor={g.start} />
                                                <stop offset="40%" stopColor={g.mid} />
                                                <stop offset="100%" stopColor={g.end} />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <Pie 
                                        data={dataDonatPengeluaran} 
                                        cx="50%" cy="50%" 
                                        innerRadius={65} 
                                        outerRadius={90} 
                                        paddingAngle={8} 
                                        dataKey="value"
                                        label={renderCustomizedLabel} labelLine={false}
                                        stroke="#0B0B0F" 
                                        strokeWidth={2}
                                        cornerRadius={8}
                                        filter="url(#shadow3d-out)"
                                    >
                                        {dataDonatPengeluaran.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#out-${WARNA_GRADASI[index % WARNA_GRADASI.length].id})`} className="hover:opacity-80 transition-opacity outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} contentStyle={{ backgroundColor: '#151521', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                    <div className="bg-[#151521]/70 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl overflow-hidden flex flex-col">
                        <div className="bg-teal-500/20 backdrop-blur-md text-teal-300 border-b border-teal-500/20 text-center py-4 font-bold text-sm tracking-widest uppercase">
                            Rekap Masuk ({tahunAktif})
                        </div>
                        <div className="p-6 flex flex-col gap-3 text-sm flex-1">
                            {isLoading ? (
                                <p className="text-gray-500 text-center italic py-4 animate-pulse">Merekap data...</p>
                            ) : dataGaris.every(m => m.Pemasukan === 0) ? (
                                <p className="text-gray-500 text-center italic py-4">Data kosong.</p>
                            ) : (
                                dataGaris.filter(m => m.Pemasukan > 0).map((m, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 hover:bg-white/[0.02] p-2 rounded-lg transition-colors cursor-default">
                                        <span className="text-gray-400 font-medium">{m.name}</span>
                                        <span className="text-teal-400 font-bold">{formatRupiah(m.Pemasukan)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-[#151521]/70 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl overflow-hidden flex flex-col">
                        <div className="bg-rose-500/20 backdrop-blur-md text-rose-300 border-b border-rose-500/20 text-center py-4 font-bold text-sm tracking-widest uppercase">
                            Rekap Keluar ({tahunAktif})
                        </div>
                        <div className="p-6 flex flex-col gap-3 text-sm flex-1">
                            {isLoading ? (
                                <p className="text-gray-500 text-center italic py-4 animate-pulse">Merekap data...</p>
                            ) : dataGaris.every(m => m.Pengeluaran === 0) ? (
                                <p className="text-gray-500 text-center italic py-4">Data kosong.</p>
                            ) : (
                                dataGaris.filter(m => m.Pengeluaran > 0).map((m, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 hover:bg-white/[0.02] p-2 rounded-lg transition-colors cursor-default">
                                        <span className="text-gray-400 font-medium">{m.name}</span>
                                        <span className="text-rose-400 font-bold">{formatRupiah(m.Pengeluaran)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}