import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  Layout, 
  Users, 
  PenTool, 
  Clock, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import { useAds } from '../context/AdContext';
import { useAuth } from '../context/AuthContext';
import { AdPlacement, AdvertisementItem } from '../types';

interface AdminAdPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAdPanel: React.FC<AdminAdPanelProps> = ({ isOpen, onClose }) => {
  const { ads, approveAd, rejectAd, deleteAd, submitNewAd } = useAds();
  const { 
    isAdmin, 
    user, 
    isLocalServer, 
    isLocalAdminLoggedIn, 
    openAdminLoginModal, 
    logoutLocalAdmin,
    pendingContributors,
    approveContributor,
    rejectContributor,
    toggleAdminRoleForDev 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all' | 'new' | 'contributors'>('contributors');

  // Form State for New Ad
  const [title, setTitle] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [placement, setPlacement] = useState<AdPlacement>('top_banner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateAd = async (e: React.FormEvent) => {
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
        durationDays: 7,
        impressionsTotal: 10500, // Reduced 30% per new rule
        impressionsUsed: 0,
        remainingQuota: 10500,
        price: 350000
      });
      setSuccessMsg('Iklan baru berhasil didaftarkan ' + (isAdmin ? 'dan otomatis disetujui!' : 'menunggu persetujuan admin!'));
      setTitle('');
      setSponsorName('');
      setImageUrl('');
      setTargetUrl('');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab(isAdmin ? 'approved' : 'pending');
      }, 1500);
    } catch (err) {
      console.error('Error submitting ad:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAds = ads.filter(a => {
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'approved') return a.status === 'approved';
    return true;
  });

  const pendingContributorsCount = pendingContributors.filter(c => c.contributorStatus === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Panel Moderasi Admin
                {isAdmin ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Admin Aktif
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    Mode Pengajuan
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persetujuan pendaftaran kontributor berita dan pengawasan iklan sponsor portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Local Server Admin Login / Logout button (Only shown on local server) */}
            {isLocalServer && (
              isLocalAdminLoggedIn ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    Admin: bencreative
                  </span>
                  <button
                    onClick={logoutLocalAdmin}
                    className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline ml-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAdminLoginModal}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-xs"
                  title="Login Admin Server Lokal (bencreative)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Login Admin (Local)</span>
                </button>
              )
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {/* Moderasi Kontributor */}
          <button
            onClick={() => setActiveTab('contributors')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'contributors'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Moderasi Kontributor
            {pendingContributorsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-600 text-white font-bold animate-pulse">
                {pendingContributorsCount}
              </span>
            )}
          </button>

          {/* Moderasi Iklan */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'pending'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Iklan Menunggu
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold">
              {ads.filter(a => a.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'approved'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Iklan Tayang ({ads.filter(a => a.status === 'approved').length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Semua Iklan ({ads.length})
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-3 text-xs font-bold border-b-2 ml-auto flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'new'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-indigo-600 hover:text-indigo-700 dark:text-indigo-400'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Input Iklan Manual
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          
          {/* TAB 1: MODERASI KONTRIBUTOR */}
          {activeTab === 'contributors' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 flex items-start gap-3">
                <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-purple-950 dark:text-purple-200">
                    Kebijakan Approval Kontributor:
                  </h4>
                  <p className="text-purple-800 dark:text-purple-300 mt-0.5 leading-relaxed">
                    Pendaftar dengan role <strong>Kontributor</strong> harus disetujui admin terlebih dahulu di panel ini. Setelah disetujui, kontributor memiliki hak menulis berita yang <strong>langsung tayang di portal tanpa perlu moderasi tambahan</strong>.
                  </p>
                </div>
              </div>

              {pendingContributors.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Belum ada pendaftaran kontributor baru
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ketika pengguna mendaftar dengan role kontributor, data mereka akan muncul di sini untuk Anda setujui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingContributors.map((c) => {
                    const status = c.contributorStatus || 'pending';
                    return (
                      <div
                        key={c.userId}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {c.displayName?.charAt(0) || 'K'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {c.displayName}
                              </h4>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                status === 'approved'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              }`}>
                                {status === 'approved' ? 'Telah Disetujui' : status === 'pending' ? 'Menunggu Approval' : 'Ditolak'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {c.email} • Terdaftar: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID') : 'Baru saja'}
                            </p>

                            {c.contributorBio && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 mt-2 max-w-xl italic">
                                "{c.contributorBio}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                          {status !== 'approved' && (
                            <button
                              onClick={() => approveContributor(c.userId)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Setujui Kontributor
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              onClick={() => rejectContributor(c.userId)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INPUT IKLAN MANUAL */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateAd} className="max-w-xl mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Formulir Input Iklan Manual (Admin)</h3>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Iklan yang didaftarkan langsung oleh admin akan otomatis berstatus Disetujui.
                </p>
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

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
                  URL Tautan Tujuan (Landing Page) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://sponsor.com/promo"
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Penempatan Slot Iklan
                </label>
                <select
                  value={placement}
                  onChange={e => setPlacement(e.target.value as AdPlacement)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                >
                  <option value="top_banner">Leaderboard Banner (Bagian Atas Portal)</option>
                  <option value="breaking_ticker">Bar Sponsor Berita Hangat (Samping Ticker Breaking News)</option>
                  <option value="in_feed">In-Feed Native Card (Di Tengah Grid Berita)</option>
                  <option value="sidebar">Sidebar Sponsored Widget (Panel Rekomendasi Samping)</option>
                  <option value="article_interstitial">Sisipan Pembaca Artikel (Tampil di Tengah Isi Berita)</option>
                  <option value="footer_banner">Sticky Bottom Floating Banner (Bilah Melayang Bawah Layar)</option>
                  <option value="popup_billboard">Spotlight Billboard (Kartu Sorotan Besar Utama)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan Data...' : 'Simpan & Tayangkan Iklan'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADS LIST (PENDING / APPROVED / ALL) */}
          {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'all') && (
            <div className="space-y-3">
              {filteredAds.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Layout className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada iklan pada kategori ini</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Semua pengajuan telah diproses.</p>
                </div>
              ) : (
                filteredAds.map(ad => (
                  <div
                    key={ad.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-16 h-12 object-cover rounded-lg flex-shrink-0 bg-slate-200 dark:bg-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Slot: {ad.placement.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            ad.status === 'approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : ad.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            {ad.status === 'approved' ? 'Disetujui / Tayang' : ad.status === 'pending' ? 'Menunggu Persetujuan' : 'Ditolak'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                          {ad.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>Sponsor: {ad.sponsorName}</span>
                          <span>•</span>
                          <span>Durasi: {ad.durationDays || 7} Hari</span>
                          <span>•</span>
                          <span>Sisa Kuota: {(ad.remainingQuota || (ad.impressionsTotal || 15000)).toLocaleString('id-ID')} tayang</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      {isAdmin && ad.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveAd(ad.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Setujui Iklan
                          </button>
                          <button
                            onClick={() => rejectAd(ad.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </>
                      )}

                      {isAdmin && ad.status === 'rejected' && (
                        <button
                          onClick={() => approveAd(ad.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Pulihkan & Setujui
                        </button>
                      )}

                      {isAdmin && ad.status === 'approved' && (
                        <button
                          onClick={() => rejectAd(ad.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-100 hover:text-rose-700 text-xs font-semibold transition-colors"
                        >
                          Hentikan Tayang
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus Iklan Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
