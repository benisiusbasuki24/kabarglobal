import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  Share2, 
  ExternalLink, 
  Clock, 
  User, 
  Send, 
  Heart, 
  Trash2, 
  MessageSquare, 
  Flame,
  Target
} from 'lucide-react';
import { NewsArticle, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useAds } from '../context/AdContext';
import { ArticleReaderAd } from './ArticleReaderAd';
import { CommentService } from '../services/commentService';
import { ReaderAlgorithm } from '../services/readerAlgorithm';
import { formatRelativeTime, getCategoryBadgeColor, getCategoryLabel } from '../utils/formatters';

interface ArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenShare: (article: NewsArticle) => void;
  onSelectArticle?: (article: NewsArticle) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  onOpenShare
}) => {
  const { user, profile, isAdmin, openLoginModal } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { getContextualAdsForArticle, getAdsByPlacement } = useAds();
  
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!article || !isOpen) return;

    // 1. Record reader interest in the Reader Algorithm
    ReaderAlgorithm.recordArticleRead(article);

    // 2. Real-time listener for comments on this article
    const unsubscribe = CommentService.subscribeToArticleComments(article.id, (loadedComments) => {
      setComments(loadedComments);
    });

    return () => unsubscribe();
  }, [article, isOpen]);

  if (!isOpen || !article) return null;

  const bookmarked = isBookmarked(article.id);

  // Contextual Ad matched with article contents & category
  const contextualAdList = getContextualAdsForArticle('article_interstitial', article);
  const fallbackAdList = getAdsByPlacement('article_interstitial');
  const activeAd = contextualAdList.length > 0 ? contextualAdList[0] : (fallbackAdList.length > 0 ? { ad: fallbackAdList[0], isContextual: false, matchReason: 'Sponsor Pembaca' } : null);

  const handleBookmarkClick = async () => {
    await toggleBookmark(article);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }

    if (!newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await CommentService.addComment({
        articleId: article.id,
        userId: user.uid,
        userName: profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Pembaca',
        userEmail: user.email || '',
        content: newCommentText.trim()
      });
      setNewCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (likedComments.has(commentId)) return;
    setLikedComments(prev => new Set(prev).add(commentId));
    try {
      await CommentService.likeComment(commentId);
    } catch (err) {
      console.warn('Like comment error:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Hapus komentar ini?')) {
      try {
        await CommentService.deleteComment(commentId);
      } catch (err) {
        console.warn('Delete comment error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Modal Topbar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {article.isDetikHeadline && (
              <span className="flex items-center gap-1 text-xs font-black text-white bg-[#002f6c] px-2.5 py-0.5 rounded-lg shadow-xs">
                detikcom Headline
              </span>
            )}
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getCategoryBadgeColor(article.category)}`}>
              {getCategoryLabel(article.category)}
            </span>
            {article.isTrending && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-md">
                <Flame className="w-3.5 h-3.5" />
                Trending #{article.trendingScore}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button
              onClick={() => onOpenShare(article)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bagikan artikel"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-xl transition-all ${
                bookmarked 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={bookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article & Discussion Content */}
        <div className="overflow-y-auto px-5 sm:px-8 py-6 space-y-8 divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Article Header & Main Content */}
          <article className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
              {article.title}
            </h1>

            {/* Author & Timestamp Bar */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800/60 py-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  article.isDetikHeadline ? 'bg-[#002f6c] text-white' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {article.isDetikHeadline ? 'D' : article.source.charAt(0)}
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {article.detikChannel || article.source}
                </span>
                {article.isDetikHeadline && (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold">
                    detik.com
                  </span>
                )}
              </div>

              {article.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Oleh {article.author}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatRelativeTime(article.publishedAt)} • {article.readingTime} mnt baca</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 shadow-md">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white/90">
                Sumber: {article.source}
              </div>
            </div>

            {/* Summary Highlight */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-sm font-medium text-indigo-950 dark:text-indigo-200 leading-relaxed italic">
              "{article.description}"
            </div>

            {/* Full Body Content */}
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-base space-y-4 font-normal whitespace-pre-line">
              {article.content}
            </div>

            {/* In-Article Contextual Ad (Matched via Reader & Content Algorithm) */}
            {activeAd && (
              <ArticleReaderAd 
                ad={activeAd.ad} 
                isContextual={activeAd.isContextual}
                matchReason={activeAd.matchReason}
              />
            )}

            {/* External source CTA */}
            <div className="pt-3">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                Kunjungi Situs Resmi Penerbit ({article.source})
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </article>

          {/* Social Share Callout */}
          <div className="pt-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Menemukan berita ini menarik?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bagikan kepada rekan atau komunitas Anda dengan 1 klik.</p>
              </div>
              <button
                onClick={() => onOpenShare(article)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                Bagikan ke Media Sosial
              </button>
            </div>
          </div>

          {/* Interactive Comments & Discussions Section */}
          <section className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Diskusi Pembaca
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {comments.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sampaikan opini, analisis, atau sudut pandang Anda secara terbuka dan santun.
                  </p>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={newCommentText}
                  maxLength={1000}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    user 
                      ? 'Tulis pendapat atau tanggapan Anda mengenai berita ini...' 
                      : 'Masuk dengan akun Anda untuk mulai menulis komentar...'
                  }
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {newCommentText.length}/1000 karakter
                </span>
                <div className="flex items-center gap-2">
                  {!user && (
                    <button
                      type="button"
                      onClick={openLoginModal}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Masuk untuk Berkomentar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingComment || (!newCommentText.trim() && !!user)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {user ? (isSubmittingComment ? 'Mengirim...' : 'Kirim Komentar') : 'Masuk & Komentar'}
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {comments.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada diskusi untuk berita ini</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Jadilah yang pertama menyampaikan opini Anda!</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isOwner = user && user.uid === comment.userId;
                  const canDelete = isOwner || isAdmin;
                  const isLiked = likedComments.has(comment.id);

                  return (
                    <div 
                      key={comment.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-slate-900 dark:text-white">
                                {comment.userName}
                              </span>
                              {comment.userEmail?.toLowerCase() === 'benisius.rb@gmail.com' && (
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Hapus komentar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-10">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-4 pl-10 pt-1 text-xs">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1.5 font-medium transition-colors ${
                            isLiked
                              ? 'text-rose-500 font-bold'
                              : 'text-slate-500 hover:text-rose-500 dark:text-slate-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
