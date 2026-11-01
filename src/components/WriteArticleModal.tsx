import React, { useState } from 'react';
import { 
  X, 
  PenTool, 
  Send, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NewsService } from '../services/newsService';
import { NewsCategory, NewsArticle } from '../types';

interface WriteArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticlePublished?: (article: NewsArticle) => void;
}

export const WriteArticleModal: React.FC<WriteArticleModalProps> = ({
  isOpen,
  onClose,
  onArticlePublished
}) => {
  const { user, profile, isAdmin, isApprovedContributor } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NewsCategory>('contributor');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [sourceDesk, setSourceDesk] = useState('Kabar Kontributor');
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const authorName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Kontributor Terverifikasi';

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPublishing(true);
    try {
      const published = await NewsService.publishContributorArticle({
        title: title.trim(),
        description: description.trim() || title.trim().slice(0, 150) + '...',
        content: content.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
        source: sourceDesk.trim() || `Kontributor - ${authorName}`,
        category,
        author: authorName,
        authorId: user?.uid || 'local-admin',
      });

      setSuccessMsg('Berita berhasil diterbitkan dan langsung tayang di portal berita utama!');
      if (onArticlePublished) {
        onArticlePublished(published);
      }

      setTimeout(() => {
        setSuccessMsg('');
        setTitle('');
        setDescription('');
        setContent('');
        setImageUrl('');
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Error publishing article:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  // Check moderation status
  const isPending = profile?.role === 'contributor' && profile?.contributorStatus === 'pending' && !isAdmin;
  const isRejected = profile?.role === 'contributor' && profile?.contributorStatus === 'rejected' && !isAdmin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ruang Tulis Kontributor
                <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                  Langsung Tayang
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Karya jurnalistik Anda akan langsung dipublikasikan ke pembaca tanpa menunggu antrean moderasi.
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

        {/* Status Check if Pending Approval */}
        {isPending && (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pendaftaran Kontributor Sedang Diverifikasi Admin
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Halo <strong>{authorName}</strong>, akun kontributor Anda sedang dalam proses peninjauan oleh tim editorial. Setelah admin memberikan persetujuan di panel moderasi, tombol tulis artikel akan segera terbuka.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:opacity-90"
              >
                Tutup Sementara
              </button>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pendaftaran Kontributor Belum Disetujui
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Mohon maaf, pengajuan akun kontributor Anda belum memenuhi kualifikasi editorial saat ini. Anda tetap dapat membaca dan berdiskusi sebagai pembaca aktif.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {/* Content Form for Approved Contributors or Admins */}
        {(!isPending && !isRejected) && (
          <form onSubmit={handlePublish} className="overflow-y-auto p-6 space-y-4 flex-1">
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Author Attribution pill */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Penulis: {authorName}
                  </span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300">
                    Status: Kontributor Resmi Terverifikasi
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Langsung Tayang
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Berita *
              </label>
              <input
                type="text"
                required
                placeholder="Tulis judul berita yang menarik dan akurat..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Category and Desk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kanal Kategori *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as NewsCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="contributor">⭐ Kanal Kontributor (Liputan Komunitas & Warga)</option>
                  <option value="world">Dunia & Internasional</option>
                  <option value="business">Bisnis & Keuangan</option>
                  <option value="technology">Teknologi & AI</option>
                  <option value="sports">Olahraga</option>
                  <option value="entertainment">Hiburan & Kultur</option>
                  <option value="science">Sains & Kesehatan</option>
                  <option value="politics">Politik & Hukum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Rubrik / Desk Liputan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Liputan Investigasi / Kabar Warga"
                  value={sourceDesk}
                  onChange={e => setSourceDesk(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                URL Gambar Utama (Cover Thumbnail)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (kosongkan untuk gambar otomatis)"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Summary Lede */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ringkasan Berita (Lede) *
              </label>
              <textarea
                rows={2}
                required
                maxLength={400}
                placeholder="1-2 kalimat ringkasan inti berita..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            {/* Full Story Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Naskah Lengkap Berita *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Tuliskan naskah berita lengkap dengan unsur 5W+1H..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isPublishing ? 'Menerbitkan Berita...' : 'Terbitkan Berita Sekarang (Langsung Tayang)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
