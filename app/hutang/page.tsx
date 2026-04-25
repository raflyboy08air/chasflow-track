'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Tipe data untuk hutang
type Hutang = {
    id: string;
    tanggal: string;
    jumlah: number;
    keterangan: string;
    kategori: 'Masuk' | 'Keluar'; // Tipe data terkunci mutlak
};

export default function HutangPage() {
    const router = useRouter();

    // State Form
    const [tanggal, setTanggal] = useState('');
    const [kategori, setKategori] = useState<'Masuk' | 'Keluar'>('Masuk'); // Default aman
    const [jumlah, setJumlah] = useState('');
    const [keterangan, setKeterangan] = useState('');
    
    // State Mode Edit
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [dataHutang, setDataHutang] = useState<Hutang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // MENGAMBIL Seluruh Data (Tanpa Filter)
    const fetchHutang = async () => {
        setIsLoading(true);
        
        const { data, error } = await supabase
            .from('hutang')
            .select('*')
            .order('tanggal', { ascending: false }); 

        if (error) {
            console.error("Error mengambil data:", error.message);
        } else if (data) {
            setDataHutang(data);
        }
        setIsLoading(false);
    };

    // Panggil saat halaman pertama kali dibuka
    useEffect(() => {
        fetchHutang();
    }, []);

    // Menghitung Total Hutang (Global)
    const totalHutangMasuk = dataHutang
        .filter(item => item.kategori === 'Masuk')
        .reduce((total, item) => total + item.jumlah, 0);

    const totalHutangKeluar = dataHutang
        .filter(item => item.kategori === 'Keluar')
        .reduce((total, item) => total + item.jumlah, 0);

    // MENGIRIM / UPDATE Data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const payload = {
            tanggal: tanggal,
            jumlah: Number(jumlah),
            keterangan: keterangan,
            kategori: kategori, // Pasti mengirim antara "Masuk" atau "Keluar"
            sumber_input: 'manual'
        };

        if (isEditing && editId) {
            const { error } = await supabase
                .from('hutang')
                .update(payload)
                .eq('id', editId);

            if (error) {
                alert("Gagal mengupdate data: " + error.message);
            } else {
                fetchHutang();
                resetForm();
            }
        } else {
            const { error } = await supabase
                .from('hutang')
                .insert([payload]);

            if (error) {
                alert("Gagal menyimpan data: " + error.message);
            } else {
                fetchHutang();
                resetForm();
            }
        }
        setIsSaving(false);
    };

    // FUNGSI EDIT
    const handleEditClick = (item: Hutang) => {
        setTanggal(item.tanggal);
        setJumlah(item.jumlah.toString());
        setKeterangan(item.keterangan);
        setKategori(item.kategori);
        setEditId(item.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // FUNGSI HAPUS
    const handleDeleteClick = async (id: string) => {
        const confirmDelete = window.confirm("Hapus catatan hutang ini?");
        if (confirmDelete) {
            const { error } = await supabase
                .from('hutang')
                .delete()
                .eq('id', id);

            if (error) {
                alert("Gagal menghapus data: " + error.message);
            } else {
                setDataHutang(dataHutang.filter(item => item.id !== id));
            }
        }
    };

    const resetForm = () => {
        setTanggal('');
        setJumlah('');
        setKeterangan('');
        setKategori('Masuk');
        setIsEditing(false);
        setEditId(null);
    };

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0 
        }).format(angka);
    };

    return (
        <div className="relative min-h-screen bg-[#0B0B0F] text-white p-4 sm:p-6 font-sans overflow-x-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                
                <header className="relative flex items-center justify-between bg-[#151521]/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-xl border border-white/5">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-white hover:border-white/30"
                    >
                        <span className="relative z-10 flex items-center gap-2">← Kembali</span>
                    </button>
                    
                    <div className="absolute left-0 w-full text-center pointer-events-none">
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Catatan <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Hutang</span>
                        </h1>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* LIST DATA */}
                    <div className="flex-1 bg-[#151521]/70 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl flex flex-col min-h-[500px]">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Daftar Piutang & Pinjaman</h3>
                            <p className="text-sm text-gray-400">Seluruh data yang terdeteksi di database</p>
                        </div>

                        <div className="overflow-x-auto flex-1 p-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-white/5">
                                        <th className="p-4 font-medium">Tanggal</th>
                                        <th className="p-4 font-medium">Jumlah</th>
                                        <th className="p-4 font-medium">Keterangan</th>
                                        <th className="p-4 font-medium text-center">Tipe</th>
                                        <th className="p-4 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-10 text-center animate-pulse text-cyan-500/50">Memuat data...</td></tr>
                                    ) : dataHutang.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-gray-500 italic">Belum ada catatan hutang.</td></tr>
                                    ) : (
                                        dataHutang.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors text-sm border-b border-white/5 group">
                                                <td className="p-4 text-gray-300">{item.tanggal}</td>
                                                <td className="p-4 text-white font-bold">{formatRupiah(item.jumlah)}</td>
                                                <td className="p-4 text-gray-300 max-w-xs truncate">{item.keterangan}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-md border text-xs font-bold ${item.kategori === 'Masuk' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                        {item.kategori === 'Masuk' ? '+ MASUK' : '- KELUAR'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button onClick={() => handleEditClick(item)} className="text-blue-400 p-1 bg-blue-500/10 rounded hover:bg-blue-500/20">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(item.id)} className="text-red-500 p-1 bg-red-500/10 rounded hover:bg-red-500/20">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FORM & TOTAL */}
                    <div className="w-full lg:w-[350px] flex flex-col gap-6">
                        <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl h-fit">
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-4">
                                {isEditing ? 'Update Hutang' : 'Catat Hutang'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase ml-1">Tanggal</label>
                                    <input type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase ml-1">Tipe</label>
                                    <select 
                                        value={kategori} 
                                        onChange={(e) => setKategori(e.target.value as 'Masuk' | 'Keluar')} 
                                        className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer transition-all appearance-none"
                                    >
                                        <option value="Masuk" className="bg-[#151521]">Masuk (Piutang ke kita)</option>
                                        <option value="Keluar" className="bg-[#151521]">Keluar (Kita meminjam)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase ml-1">Nominal (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-gray-500 font-medium">Rp</span>
                                        <input 
                                            type="number" 
                                            required 
                                            value={jumlah} 
                                            onChange={(e) => setJumlah(e.target.value)} 
                                            className="w-full pl-10 pr-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-700" 
                                            placeholder="0" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase ml-1">Keterangan</label>
                                    <textarea required value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={2} className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none transition-all placeholder-gray-600" placeholder="Detail catatan..."></textarea>
                                </div>
                                <button type="submit" disabled={isSaving} className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 ${isSaving ? 'bg-gray-700' : isEditing ? 'bg-amber-500 text-gray-900' : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white'}`}>
                                    {isSaving ? 'Menyimpan...' : isEditing ? 'Update Perubahan' : '+ Catat Hutang'}
                                </button>
                                {isEditing && <button onClick={resetForm} type="button" className="w-full text-xs text-gray-500 hover:text-white mt-2">Batal Edit</button>}
                            </form>
                        </div>

                        {/* RINGKASAN GLOBAL */}
                        <div className="bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col gap-6">
                            <h3 className="text-white font-bold border-b border-white/5 pb-2">Total Akumulasi Hutang</h3>
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Kita Berhutang (Keluar)</p>
                                <p className="text-2xl font-bold text-rose-400">{formatRupiah(totalHutangKeluar)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Orang Berhutang (Masuk)</p>
                                <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalHutangMasuk)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}