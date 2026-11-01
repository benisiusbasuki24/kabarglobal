import React, { useState } from 'react';
import { 
  X, 
  Megaphone, 
  PlusCircle, 
  DollarSign, 
  CheckCircle2, 
  BarChart3, 
  ExternalLink, 
  Percent,
  Sparkles,
  Target
} from 'lucide-react';
import { useAds } from '../context/AdContext';
import { useAuth } from '../context/AuthContext';
import { AdPlacement, NewsCategory } from '../types';

interface AdvertiserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DurationPackage {
  days: number;
  label: string;
  originalQuota: number; // Original impressions quota before rule
  quota: number; // Impressions quota after 30% reduction
  basePrice: number; // in IDR
  discount: number;
}

// All impression quotas reduced by exactly 30% per portal rule update
const PACKAGES: DurationPackage[] = [
  { days: 3, label: 'Paket Kilat (3 Hari)', originalQuota: 5000, quota: 3500, basePrice: 150000, discount: 0 },
  { days: 7, label: 'Paket Populer (7 Hari)', originalQuota: 15000, quota: 10500, basePrice: 350000, discount: 10 },
  { days: 14, label: 'Paket Berkala (14 Hari)', originalQuota: 35000, quota: 24500, basePrice: 700000, discount: 15 },
  { days: 30, label: 'Paket Dominan (30 Hari)', originalQuota: 80000, quota: 56000, basePrice: 1500000, discount: 25 },
];

const SLOT_RATES: Record<AdPlacement, { name: string; multiplier: number; desc: string }> = {
  top_banner: { name: 'Top Leaderboard Banner', multiplier: 1.2, desc: 'Tampil di atas portal, visibilitas tertinggi' },
  breaking_ticker: { name: 'Bar Sponsor Breaking Ticker', multiplier: 1.0, desc: 'Tepat berdampingan dengan berita headline detik.com' },
  in_feed: { name: 'In-Feed Native Card', multiplier: 1.1, desc: 'Menyatu elegan di dalam kisi berita pembaca' },
  sidebar: { name: 'Sidebar Sponsored Widget', multiplier: 0.9, desc: 'Tampil tetap di panel samping pembaca desktop' },
  article_interstitial: { name: 'Sisipan Pembaca Artikel', multiplier: 1.15, desc: 'Muncul di tengah narasi berita yang sedang dibaca' },
  footer_banner: { name: 'Sticky Bottom Floating Banner', multiplier: 1.0, desc: 'Bilah melayang di bawah layar pembaca' },
  popup_billboard: { name: 'Spotlight Billboard', multiplier: 1.4, desc: 'Kartu sorotan besar untuk brand premium' },
};

export const AdvertiserDashboardModal: React.FC<AdvertiserDashboardModalProps> = ({ isOpen, onClose }) => {
  const { ads, submitNewAd } = useAds();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'order'>('dashboard');

  // Form State
  const [title, setTitle] = useState('');
  const [sponsorName, setSponsorName] = useState(profile?.organization || profile?.displayName || '');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [placement, setPlacement] = useState<AdPlacement>('top_banner');
  const [targetCategory, setTargetCategory] = useState<NewsCategory | 'all'>('all');
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Calculate pricing based on slot and duration package with 30% reduced quota
  const selectedPkg = PACKAGES.find(p => p.days === selectedDuration) || PACKAGES[1];
  const slotMultiplier = SLOT_RATES[placement]?.multiplier || 1.0;
  const calculatedTotal = Math.round((selectedPkg.basePrice * slotMultiplier) / 1000) * 1000;
  const ratePerImpression = (calculatedTotal / selectedPkg.quota).toFixed(1);

  // Filter ads placed by this advertiser
  const myAds = ads.filter(a => a.submittedBy === user?.uid || a.submittedBy === 'system');

  const handleOrderAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sponsorName || !imageUrl || !targetUrl) return;

    setIsSubmitting(true);
    try {
      await submitNewAd({
        title,
        sponsorName,
        imageUrl,
        targetUrl,
        placement,
        targetCategory: targetCategory === 'all' ? undefined : targetCategory,
        durationDays: selectedPkg.days,
        impressionsTotal: selectedPkg.quota,
        impressionsUsed: 0,
        remainingQuota: selectedPkg.quota,
        price: calculatedTotal,
        keywords: title.toLowerCase().split(' ').filter(w => w.length > 3)
      });

      setSuccessMsg(`Order pasang iklan dengan kuota ${selectedPkg.quota.toLocaleString('id-ID')} tayang (-30% penyesuaian) senilai Rp ${calculatedTotal.toLocaleString('id-ID')} berhasil diajukan! Menunggu persetujuan admin.`);
      setTitle('');
      setImageUrl('');
      setTargetUrl('');

      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error ordering ad:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-sm font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dashboard Pemasang Iklan
                </h2>
                <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Aturan Kuota -30% Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola pesanan iklan, pantau tayangan real-time, dan cek sisa kuota impresi yang disesuaikan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Notice Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              <strong>Pemberitahuan Regulasi Iklan:</strong> Kuota jumlah tayangan yang ditawarkan kepada pengiklan telah <strong>dikurangi masing-masing sebesar 30%</strong> demi efisiensi dan eksklusivitas visibilitas merek.
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard Penayangan & Kuota ({myAds.length})
          </button>

          <button
            onClick={() => setActiveTab('order')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 ml-auto flex items-center gap-1.5 transition-colors ${
              activeTab === 'order'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-amber-600 hover:text-amber-700 dark:text-amber-400'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Order Pasang Iklan Baru
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeTab === 'order' ? (
            <form onSubmit={handleOrderAd} className="max-w-2xl mx-auto space-y-5">
              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Step 1: Choose Slot */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  1. Pilih Jenis Slot Penempatan Iklan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(SLOT_RATES).map(([slotKey, info]) => {
                    const isSelected = placement === slotKey;
                    return (
                      <div
                        key={slotKey}
                        onClick={() => setPlacement(slotKey as AdPlacement)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {info.name}
                          </span>
                          {info.multiplier > 1.0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {info.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Duration Package & Impressions Quota (Reduced by 30%) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    2. Durasi & Kuota Tayangan (Telah Dikurangi 30%):
                  </label>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                    -30% Tayangan Per Paket
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedDuration === pkg.days;
                    return (
                      <div
                        key={pkg.days}
                        onClick={() => setSelectedDuration(pkg.days)}
                        className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                          {pkg.days} Hari
                        </div>
                        <div className="text-[11px] text-slate-400 line-through">
                          {pkg.originalQuota.toLocaleString('id-ID')} tayang
                        </div>
                        <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {pkg.quota.toLocaleString('id-ID')} Tayang
                        </div>
                        <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                          -30% Kuota
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Algoritma Target Kategori Berita */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  3. Penyesuaian Algoritma Kanal & Isi Berita:
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value as NewsCategory | 'all')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">Semua Kanal (General Portal Audience)</option>
                  <option value="technology">Teknologi, AI & Gadget (Kanal detikInet & Tech)</option>
                  <option value="business">Bisnis, Pasar Modal & Saham (Kanal detikFinance)</option>
                  <option value="politics">Politik, Pemerintahan & Hukum (Kanal detikNews)</option>
                  <option value="science">Sains, Riset Medis & Lingkungan</option>
                  <option value="sports">Olahraga & Bulutangkis (Kanal detikSport)</option>
                  <option value="entertainment">Sinema, Film & Musik (Kanal detikHot)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Algoritma pembaca akan memprioritaskan iklan Anda saat pembaca membuka berita dengan topik relevan.
                </p>
              </div>

              {/* Order Pricing Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                      Rincian Tarif Sekali Order Pasang Iklan
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      Rp {calculatedTotal.toLocaleString('id-ID')}
                    </h3>
                    <p className="text-xs text-indigo-200/80 mt-0.5">
                      Durasi: {selectedPkg.days} Hari • Kuota: <strong>{selectedPkg.quota.toLocaleString('id-ID')} Impresi</strong> (-30% dari {selectedPkg.originalQuota.toLocaleString('id-ID')}) • ~Rp {ratePerImpression}/tayang
                    </p>
                  </div>
                  <div className="sm:text-right text-xs text-slate-300 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                    <span>Status Awal: <strong>Pending (Moderasi Admin)</strong></span>
                  </div>
                </div>
              </div>

              {/* Step 4: Ad Details */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  4. Informasi Materi Promosi & Brand:
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Iklan / Kampanye *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Solusi Cloud Data Center Hijau 2026"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Sponsor / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Google Cloud / Tech Corp"
                    value={sponsorName}
                    onChange={e => setSponsorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Gambar Banner Kreatif *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Tautan Tujuan (Landing Page Promo) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://perusahaan.com/promo"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {isSubmitting ? 'Memproses Order...' : `Order Pasang Iklan (${selectedPkg.quota.toLocaleString('id-ID')} Tayang - Rp ${calculatedTotal.toLocaleString('id-ID')})`}
                </button>
              </div>
            </form>
          ) : (
            /* Dashboard Penayangan & Sisa Kuota */
            <div className="space-y-5">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Kampanye</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {myAds.length} Iklan
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {myAds.filter(a => a.status === 'approved').length} Sedang Tayang
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Kuota Tayang (-30%)</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {myAds.reduce((acc, a) => acc + (a.impressionsTotal || 10500), 0).toLocaleString('id-ID')}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sesuai aturan kuota baru
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Sisa Kuota Iklan Aktif</span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {myAds.reduce((acc, a) => acc + (a.remainingQuota !== undefined ? a.remainingQuota : (a.impressionsTotal || 10500) - (a.impressionsUsed || 0)), 0).toLocaleString('id-ID')}
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    Impresi siap ditayangkan
                  </span>
                </div>
              </div>

              {/* Ads Table / Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Daftar Penayangan & Kuota Iklan Anda:
                </h4>

                {myAds.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Megaphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada order iklan terdaftar</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Klik "Order Pasang Iklan Baru" untuk memilih jenis slot iklan dan paket kuota tayangan (diskon kuota 30%).
                    </p>
                  </div>
                ) : (
                  myAds.map(ad => {
                    const totalQuota = ad.impressionsTotal || 10500;
                    const used = ad.impressionsUsed || 1450;
                    const remaining = ad.remainingQuota !== undefined ? ad.remainingQuota : Math.max(0, totalQuota - used);
                    const percentage = Math.min(100, Math.round((used / totalQuota) * 100));

                    return (
                      <div
                        key={ad.id}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-16 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-200 dark:bg-slate-700"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                  {SLOT_RATES[ad.placement]?.name || ad.placement}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  ad.status === 'approved'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : ad.status === 'pending'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}>
                                  {ad.status === 'approved' ? 'Sedang Tayang' : ad.status === 'pending' ? 'Menunggu Approval Admin' : 'Ditolak'}
                                </span>
                                {ad.targetCategory && (
                                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                    Target: {ad.targetCategory}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                                {ad.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Sponsor: {ad.sponsorName} • Durasi Paket: {ad.durationDays || 7} Hari
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              Tarif: Rp {(ad.price || 350000).toLocaleString('id-ID')}
                            </span>
                            <a
                              href={ad.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Tautan Promo <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Progress Bar of Impressions */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              Tayang: <strong className="text-slate-900 dark:text-white">{used.toLocaleString('id-ID')}</strong> / {totalQuota.toLocaleString('id-ID')} impresi ({percentage}%)
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                              Sisa Kuota Iklan: {remaining.toLocaleString('id-ID')} tayang
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
