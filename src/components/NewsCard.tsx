import React from 'react';
import { Bookmark, Share2, Clock, MessageSquare, Flame, PenTool, User } from 'lucide-react';
import { NewsArticle } from '../types';
import { useBookmarks } from '../context/BookmarkContext';
import { formatRelativeTime, getCategoryBadgeColor, getCategoryLabel } from '../utils/formatters';

interface NewsCardProps {
  article: NewsArticle;
  onSelectArticle: (article: NewsArticle) => void;
  onOpenShare: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onSelectArticle,
  onOpenShare
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);
  const isContributorStory = article.isContributor || article.category === 'contributor' || !!article.authorId;

  return (
    <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Thumbnail */}
        <div 
          className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
          onClick={() => onSelectArticle(article)}
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // fallback if remote image fails
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            {article.isDetikHeadline && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-[#002f6c] text-white flex items-center gap-1 shadow-sm border border-blue-400/30">
                detikcom
              </span>
            )}
            {isContributorStory && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-purple-700 text-white flex items-center gap-1 shadow-sm border border-purple-400/40">
                <PenTool className="w-2.5 h-2.5" />
                Kontributor
              </span>
            )}
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md shadow-sm border ${getCategoryBadgeColor(article.category)} bg-white/90 dark:bg-slate-900/90`}>
              {getCategoryLabel(article.category)}
            </span>
            {article.isTrending && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                <Flame className="w-3 h-3 fill-current" />
                Populer
              </span>
            )}
          </div>

          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-white/90 font-medium">
            {article.readingTime} mnt baca
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className={`font-bold truncate max-w-[150px] flex items-center gap-1 ${
              article.isDetikHeadline 
                ? 'text-[#002f6c] dark:text-blue-400' 
                : isContributorStory 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              {isContributorStory && <User className="w-3 h-3 flex-shrink-0" />}
              {article.author || article.detikChannel || article.source}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(article.publishedAt)}
            </span>
          </div>

          <h3 
            onClick={() => onSelectArticle(article)}
            className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug line-clamp-2 cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div 
          onClick={() => onSelectArticle(article)}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{article.commentsCount || 0} komentar</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenShare(article)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleBookmark(article)}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title={bookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};
