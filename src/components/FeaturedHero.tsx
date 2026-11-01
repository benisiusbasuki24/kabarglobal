import React from 'react';
import { Bookmark, Share2, Clock, Flame, ArrowRight, User, PenTool } from 'lucide-react';
import { NewsArticle } from '../types';
import { useBookmarks } from '../context/BookmarkContext';
import { formatRelativeTime, getCategoryBadgeColor, getCategoryLabel } from '../utils/formatters';

interface FeaturedHeroProps {
  article: NewsArticle;
  onSelectArticle: (article: NewsArticle) => void;
  onOpenShare: (article: NewsArticle) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  article,
  onSelectArticle,
  onOpenShare
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);
  const isContributorStory = article.isContributor || article.category === 'contributor' || !!article.authorId;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group my-6">
      {/* Background image with dramatic gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl flex flex-col justify-end min-h-[420px]">
        {/* Top badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {article.isDetikHeadline ? (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#002f6c] text-white flex items-center gap-1.5 shadow-lg border border-blue-400/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              detikcom Headline
            </span>
          ) : isContributorStory ? (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-700 text-white flex items-center gap-1.5 shadow-lg border border-purple-400/40">
              <PenTool className="w-3 h-3" />
              Karya Kontributor
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1.5 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Sorotan Utama
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(article.category)} bg-slate-900/80`}>
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-xs text-slate-300 font-medium px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
            {article.author || article.detikChannel || article.source}
          </span>
        </div>

        {/* Title */}
        <h2 
          onClick={() => onSelectArticle(article)}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight sm:leading-snug tracking-tight cursor-pointer hover:text-indigo-200 transition-colors drop-shadow-sm"
        >
          {article.title}
        </h2>

        {/* Description snippet */}
        <p className="text-slate-300 text-sm sm:text-base mt-3 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl">
          {article.description}
        </p>

        {/* Meta & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {article.author && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <User className="w-3.5 h-3.5" />
                {article.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(article.publishedAt)} • {article.readingTime} mnt baca
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenShare(article)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleBookmark(article)}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all active:scale-95 ${
                bookmarked
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={bookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onSelectArticle(article)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95 ml-2"
            >
              Baca Lengkap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
