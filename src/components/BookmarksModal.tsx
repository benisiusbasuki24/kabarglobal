import React, { useState } from 'react';
import { X, Bookmark, Trash2, ExternalLink, Search, Sparkles } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';
import { NewsArticle } from '../types';
import { formatRelativeTime, getCategoryBadgeColor, getCategoryLabel } from '../utils/formatters';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  onSelectArticle
}) => {
  const { bookmarks, deleteBookmark } = useBookmarks();
  const { user, openLoginModal } = useAuth();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Artikel Tersimpan
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  {bookmarks.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Koleksi berita favorit yang siap Anda baca kembali kapan saja
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

        {/* Guest Warning / Cloud Sync Notice */}
        {!user && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Bookmark saat ini hanya tersimpan di browser ini. Masuk ke Firebase untuk sinkronisasi di semua perangkat.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                openLoginModal();
              }}
              className="text-amber-900 dark:text-amber-200 font-bold underline hover:opacity-80 flex-shrink-0"
            >
              Masuk Sekarang
            </button>
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dalam artikel tersimpan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-6 space-y-3">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {bookmarks.length === 0 ? 'Belum ada artikel yang disimpan' : 'Tidak ditemukan artikel yang sesuai kata kunci'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Klik ikon bookmark pada kartu berita mana saja untuk menyimpannya ke daftar bacaan Anda.
              </p>
            </div>
          ) : (
            filteredBookmarks.map(b => (
              <div
                key={b.id}
                className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm"
              >
                <div 
                  className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                  onClick={() => {
                    onClose();
                    onSelectArticle({
                      id: b.articleId,
                      title: b.title,
                      description: b.title,
                      content: b.title,
                      url: b.url,
                      imageUrl: b.imageUrl,
                      source: b.source,
                      category: (b.category as any) || 'world',
                      publishedAt: b.publishedAt,
                      readingTime: 3
                    });
                  }}
                >
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-200 dark:bg-slate-700"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryBadgeColor(b.category)}`}>
                        {getCategoryLabel(b.category)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {b.source}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {b.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => deleteBookmark(b.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus dari tersimpan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
