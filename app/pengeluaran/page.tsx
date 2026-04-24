'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Tipe data untuk pengeluaran
type Pengeluaran = {
    id: string;
    tanggal: string;
    jumlah: number;
    keterangan: string;
    kategori: string;
};

export default function PengeluaranPage() {
    const router = useRouter();

    // State Form
    const [tanggal, setTanggal] = useState('');
    const [kategori, setKategori] = useState('Jajan');
    const [jumlah, setJumlah] = useState('');
    const [keterangan, setKeterangan] = useState('');
    
    // State Mode Edit
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // State Filter Data
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());
    
    const [filterBulan, setFilterBulan] = useState(currentMonth);
    const [filterTahun, setFilterTahun] = useState(currentYear);

    // Daftar Tahun
    const tahunAwal = 2025;
    const daftarTahun = Array.from({ length: 11 }, (_, i) => (tahunAwal + i).toString());
    
    const daftarBulan = [
        { val: '01', nama: 'Januari' }, { val: '02', nama: 'Februari' }, { val: '03', nama: 'Maret' },
        { val: '04', nama: 'April' }, { val: '05', nama: 'Mei' }, { val: '06', nama: 'Juni' },
        { val: '07', nama: 'Juli' }, { val: '08', nama: 'Agustus' }, { val: '09', nama: 'September' },
        { val: '10', nama: 'Oktober' }, { val: '11', nama: 'November' }, { val: '12', nama: 'Desember' }
    ];

    const [dataPengeluaran, setDataPengeluaran] = useState<Pengeluaran[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // MENGAMBIL Data dengan Filter (Dan Fix Bug Tanggal)
    const fetchPengeluaran = async () => {
        setIsLoading(true);
        
        // Kalkulasi hari terakhir di bulan tersebut agar tidak error di database
        const tahunNum = parseInt(filterTahun);
        const bulanNum = parseInt(filterBulan);
        const hariTerakhir = new Date(tahunNum, bulanNum, 0).getDate();

        const startDate = `${filterTahun}-${filterBulan}-01`;
        const endDate = `${filterTahun}-${filterBulan}-${hariTerakhir}`;

        const { data, error } = await supabase
            .from('pengeluaran')
            .select('*')
            .gte('tanggal', startDate)
            .lte('tanggal', endDate)
            .order('tanggal', { ascending: false }); 

        if (error) {
            console.error("Error mengambil data:", error.message);
        } else if (data) {
            setDataPengeluaran(data);
        }
        setIsLoading(false);
    };

    // Refresh tabel saat filter berubah
    useEffect(() => {
        fetchPengeluaran();
    }, [filterBulan, filterTahun]);

    // MENGIRIM / UPDATE Data
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const payload = {
            tanggal: tanggal,
            jumlah: Number(jumlah),
            keterangan: keterangan,
            kategori: kategori,
            sumber_input: 'manual'
        };

        if (isEditing && editId) {
            // MODE EDIT
            const { error } = await supabase
                .from('pengeluaran')
                .update(payload)
                .eq('id', editId);

            if (error) {
                alert("Gagal mengupdate data: " + error.message);
            } else {
                fetchPengeluaran();
                resetForm();
            }
        } else {
            // MODE TAMBAH BARU
            const { error } = await supabase
                .from('pengeluaran')
                .insert([payload]);

            if (error) {
                alert("Gagal menyimpan data: " + error.message);
            } else {
                fetchPengeluaran();
                resetForm();
            }
        }
        setIsSaving(false);
    };

    // FUNGSI EDIT
    const handleEditClick = (item: Pengeluaran) => {
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
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus catatan pengeluaran ini?");
        
        if (confirmDelete) {
            const { error } = await supabase
                .from('pengeluaran')
                .delete()
                .eq('id', id);

            if (error) {
                alert("Gagal menghapus data: " + error.message);
            } else {
                setDataPengeluaran(dataPengeluaran.filter(item => item.id !== id));
            }
        }
    };

    // FUNGSI BATAL EDIT
    const resetForm = () => {
        setTanggal('');
        setJumlah('');
        setKeterangan('');
        setKategori('Jajan');
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
            
            {/* Background Glow Effects (Red/Rose Theme) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                
                {/* HEADER BERPUSAT DENGAN TOMBOL KEMBALI */}
                <header className="relative flex items-center justify-between bg-[#151521]/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-xl border border-white/5">
                    
                    {/* Tombol Kembali (Kiri) */}
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="relative overflow-hidden group px-6 py-2.5 text-sm font-semibold text-gray-300 bg-[#1c1c2a] border border-white/10 rounded-xl transition-all duration-300 hover:text-white hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 z-20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            <span>←</span> Kembali
                        </span>
                    </button>
                    
                    {/* Judul (Tengah Mutlak) */}
                    <div className="absolute left-0 w-full text-center pointer-events-none">
                        <h1 className="text-2xl font-extrabold tracking-tight">
                            Manajemen <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500">Pengeluaran</span>
                        </h1>
                    </div>

                    {/* Spacer Kanan (Agar flex balance) */}
                    <div className="w-[110px] invisible hidden sm:block"></div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* BAGIAN KIRI: Tabel Data dengan Filter */}
                    <div className="flex-1 bg-[#151521]/70 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-xl flex flex-col min-h-[500px]">
                        
                        {/* Header Tabel & Filter */}
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Riwayat Pengeluaran</h3>
                                <p className="text-sm text-gray-400">Data keluar berdasarkan bulan</p>
                            </div>

                            {/* Menu Filter */}
                            <div className="flex gap-3">
                                <select 
                                    value={filterBulan}
                                    onChange={(e) => setFilterBulan(e.target.value)}
                                    className="bg-[#1c1c2a] text-rose-400 font-bold border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500 cursor-pointer hover:bg-[#252536] transition-all"
                                >
                                    {daftarBulan.map((b) => (
                                        <option key={b.val} value={b.val} className="bg-[#151521] text-white">{b.nama}</option>
                                    ))}
                                </select>

                                <select 
                                    value={filterTahun}
                                    onChange={(e) => setFilterTahun(e.target.value)}
                                    className="bg-[#1c1c2a] text-rose-400 font-bold border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500 cursor-pointer hover:bg-[#252536] transition-all"
                                >
                                    {daftarTahun.map((tahun) => (
                                        <option key={tahun} value={tahun} className="bg-[#151521] text-white">{tahun}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Area Tabel */}
                        <div className="overflow-x-auto flex-1 p-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-white/5">
                                        <th className="p-4 font-medium">Tanggal</th>
                                        <th className="p-4 font-medium">Jumlah</th>
                                        <th className="p-4 font-medium">Keterangan</th>
                                        <th className="p-4 font-medium">Kategori</th>
                                        <th className="p-4 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-rose-500/50 animate-pulse font-medium">
                                                Mengambil riwayat pengeluaran...
                                            </td>
                                        </tr>
                                    ) : dataPengeluaran.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                                                Tidak ada catatan pengeluaran di bulan ini. Hebat!
                                            </td>
                                        </tr>
                                    ) : (
                                        dataPengeluaran.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors text-sm border-b border-white/5 group">
                                                <td className="p-4 text-gray-300 whitespace-nowrap">{item.tanggal}</td>
                                                <td className="p-4 text-rose-400 font-bold whitespace-nowrap">{formatRupiah(item.jumlah)}</td>
                                                <td className="p-4 text-gray-300 max-w-xs truncate">{item.keterangan}</td>
                                                <td className="p-4">
                                                    <span className="bg-rose-500/10 text-rose-300 px-3 py-1 rounded-full border border-rose-500/20 text-xs font-semibold tracking-wide shadow-[0_0_10px_rgba(244,63,94,0.05)]">
                                                        {item.kategori}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-3 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleEditClick(item)}
                                                            className="text-blue-400 hover:text-blue-300 hover:scale-110 transition-transform p-1 bg-blue-500/10 rounded hover:bg-blue-500/20"
                                                            title="Edit"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteClick(item.id)}
                                                            className="text-red-500 hover:text-red-400 hover:scale-110 transition-transform p-1 bg-red-500/10 rounded hover:bg-red-500/20"
                                                            title="Hapus"
                                                        >
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

                    {/* BAGIAN KANAN: Form Input Kaca (Glassmorphism) */}
                    <div className="w-full lg:w-[350px] bg-[#151521]/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-xl h-fit sticky top-6">
                        
                        <div className="mb-6 border-b border-white/5 pb-4 flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-wide">
                                    {isEditing ? 'Update Data' : 'Catat Keluar'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isEditing ? 'Perbaiki kesalahan input' : 'Tambahkan data pengeluaran'}
                                </p>
                            </div>
                            {isEditing && (
                                <button onClick={resetForm} className="text-xs text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-2">Batal Edit</button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide ml-1">Tanggal Transaksi</label>
                                <input 
                                    type="date" 
                                    required
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all [color-scheme:dark]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide ml-1">Kategori Pengeluaran</label>
                                <select 
                                    value={kategori}
                                    onChange={(e) => setKategori(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 cursor-pointer transition-all appearance-none"
                                >
                                    <option value="Aset" className="bg-[#151521]">Aset</option>
                                    <option value="Jajan" className="bg-[#151521]">Jajan</option>
                                    <option value="Hobi" className="bg-[#151521]">Hobi</option>
                                    <option value="Transport" className="bg-[#151521]">Transport</option>
                                    <option value="Rumah" className="bg-[#151521]">Rumah</option>
                                    <option value="Vape" className="bg-[#151521]">Vape</option>
                                    <option value="maintenance" className="bg-[#151521]">Maintenance</option>
                                    <option value="Reparasi" className="bg-[#151521]">Reparasi</option>
                                    <option value="Lain lain" className="bg-[#151521]">Lain lain</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide ml-1">Nominal (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-500 font-medium">Rp</span>
                                    <input 
                                        type="number" 
                                        required
                                        value={jumlah}
                                        onChange={(e) => setJumlah(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-rose-400 font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-gray-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide ml-1">Catatan Tambahan</label>
                                <textarea 
                                    required
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Contoh: Beli liquid vape..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#0B0B0F]/50 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 resize-none transition-all placeholder-gray-600"
                                ></textarea>
                            </div>

                            {/* Tombol Simpan Dinamis */}
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className={`relative w-full overflow-hidden group px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 active:scale-95 shadow-lg mt-2
                                    ${isSaving ? 'bg-gray-700 text-gray-400 cursor-wait' 
                                    : isEditing 
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]' 
                                        : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)]'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                                <span className="relative z-10 tracking-wide">
                                    {isSaving ? 'Memproses...' : isEditing ? 'Update Perubahan' : '- Tambah Pengeluaran'}
                                </span>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}