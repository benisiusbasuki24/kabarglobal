import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { NotificationProvider } from './context/NotificationContext';
import { AdProvider, useAds } from './context/AdContext';
import { NewsService } from './services/newsService';
import { ReaderAlgorithm } from './services/readerAlgorithm';
import { NewsArticle } from './types';
import { Navbar } from './components/Navbar';
import { BreakingTicker } from './components/BreakingTicker';
import { CategoryBar, CategoryFilterType } from './components/CategoryBar';
import { TopAdBanner } from './components/TopAdBanner';
import { FeaturedHero } from './components/FeaturedHero';
import { NewsCard } from './components/NewsCard';
import { InFeedAd } from './components/InFeedAd';
import { SpotlightBillboardAd } from './components/SpotlightBillboardAd';
import { StickyBottomAd } from './components/StickyBottomAd';
import { ArticleModal } from './components/ArticleModal';
import { ShareModal } from './components/ShareModal';
import { BookmarksModal } from './components/BookmarksModal';
import { AdminAdPanel } from './components/AdminAdPanel';
import { WriteArticleModal } from './components/WriteArticleModal';
import { AdvertiserDashboardModal } from './components/AdvertiserDashboardModal';
import { LocalAdminLoginModal } from './components/LocalAdminLoginModal';
import { AuthModal } from './components/AuthModal';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';
import { Newspaper, SearchX, RefreshCw, Sparkles, Target, Zap, CheckCircle2 } from 'lucide-react';

function NewsPortalMain() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('infocepat_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [activeCategory, setActiveCategory] = useState<CategoryFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'discussed'>('latest');
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [sharingArticle, setSharingArticle] = useState<NewsArticle | null>(null);
  const [bookmarksModalOpen, setBookmarksModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [writeArticleModalOpen, setWriteArticleModalOpen] = useState(false);
  const [advertiserDashboardOpen, setAdvertiserDashboardOpen] = useState(false);

  const { getContextualAdsForReader, getAdsByPlacement } = useAds();

  // Contextually matched ads for in-feed & billboard
  const contextualInFeedAds = getContextualAdsForReader('in_feed');
  const contextualBillboardAds = getContextualAdsForReader('popup_billboard');

  // Reader affinity summary
  const readerTopCategories = ReaderAlgorithm.getTopCategories();
  const readerProfile = ReaderAlgorithm.getProfile();

  // Synchronize HTML element dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('infocepat_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('infocepat_theme', 'light');
    }
  }, [darkMode]);

  // Load articles
  const loadArticles = async (cat: CategoryFilterType = activeCategory, query: string = searchQuery) => {
    setLoading(true);
    const data = await NewsService.getArticles(cat, query);
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles(activeCategory, searchQuery);
  }, [activeCategory, searchQuery]);

  // Handle URL deep link to article (e.g., from share link: ?article=xyz)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const artId = urlParams.get('article');
    if (artId) {
      const found = NewsService.getArticleById(artId);
      if (found) {
        setSelectedArticle(found);
      }
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await NewsService.fetchLiveFeed(activeCategory);
      setArticles(refreshed);
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sort articles based on user preference: Contributor news and Detik headlines air at the top chronologically
  const sortedArticles = useMemo(() => {
    const list = [...articles];
    if (sortBy === 'trending') {
      return list.sort((a, b) => {
        const isPriorityA = a.isDetikHeadline || a.isContributor;
        const isPriorityB = b.isDetikHeadline || b.isContributor;
        if (isPriorityA && !isPriorityB) return -1;
        if (!isPriorityA && isPriorityB) return 1;
        return (b.trendingScore || 0) - (a.trendingScore || 0);
      });
    }
    if (sortBy === 'discussed') {
      return list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    }
    // 'latest': Berita kontributor dan berita headline tayang di bagian atas sesuai urutan waktu (jam tayang berbagai sumber)
    return list.sort((a, b) => {
      const isPriorityA = a.isDetikHeadline || a.isContributor;
      const isPriorityB = b.isDetikHeadline || b.isContributor;
      if (isPriorityA && !isPriorityB) return -1;
      if (!isPriorityA && isPriorityB) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [articles, sortBy]);

  // Lead article for hero view
  const showHero = (activeCategory === 'all' || activeCategory === 'detikcom') && !searchQuery.trim() && sortedArticles.length > 0;
  const heroArticle = showHero ? sortedArticles[0] : null;
  const gridArticles = showHero ? sortedArticles.slice(1) : sortedArticles;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenBookmarks={() => setBookmarksModalOpen(true)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onOpenWriteArticle={() => setWriteArticleModalOpen(true)}
        onOpenAdvertiserDashboard={() => setAdvertiserDashboardOpen(true)}
        onSelectArticleById={(id) => {
          const found = NewsService.getArticleById(id);
          if (found) setSelectedArticle(found);
        }}
      />

      {/* Breaking News Ticker (Prioritizing Detik.com headlines) */}
      <BreakingTicker
        articles={sortedArticles}
        onSelectArticle={setSelectedArticle}
      />

      {/* Category Navigation Bar */}
      <CategoryBar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Leaderboard Ad Banner (Only shown if approved by admin) */}
        <TopAdBanner onOpenAdminPanel={() => setAdminPanelOpen(true)} />

        {/* Algorithm & Detik Priority Badge Strip */}
        <div className="mb-5 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#002f6c] text-white border border-blue-400/40 flex-shrink-0 shadow-xs">
              <Zap className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-wide">
                  Prioritas Berita Utama detik.com & Algoritma Pembaca
                </span>
                <span className="bg-cyan-400 text-slate-950 font-black text-[9px] px-2 py-0.2 rounded-full uppercase">
                  Aktif
                </span>
              </div>
              <p className="text-blue-200/90 text-[11px] mt-0.5 leading-snug">
                Portal ini memprioritaskan headline terkini dari detik.com (detikNews, detikFinance, detikInet) serta menyesuaikan isi berita dan iklan secara kontekstual dengan preferensi Anda.
              </p>
            </div>
          </div>

          {/* Reader Profile Affinity pill */}
          {readerProfile.totalArticlesRead > 0 && readerTopCategories.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-cyan-200 border border-white/10 flex-shrink-0">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Minat Baca: <strong>{readerTopCategories[0].category.toUpperCase()}</strong> ({readerTopCategories[0].percentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Search status header */}
        {searchQuery.trim() && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
              Menampilkan hasil pencarian untuk: <strong className="font-bold">"{searchQuery}"</strong> ({sortedArticles.length} artikel ditemukan)
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Hapus Filter
            </button>
          </div>
        )}

        {/* Featured Editorial Hero (Prioritizing Detik.com headlines) */}
        {heroArticle && (
          <FeaturedHero
            article={heroArticle}
            onSelectArticle={setSelectedArticle}
            onOpenShare={setSharingArticle}
          />
        )}

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : gridArticles.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
            <SearchX className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Tidak ada berita yang ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
              Coba gunakan kata kunci lain atau pilih kategori umum seperti Headline detik.com atau Semua Berita.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {activeCategory === 'detikcom' 
                  ? 'Kumpulan Berita Utama detik.com' 
                  : activeCategory === 'all' 
                  ? 'Berita Terkini & Rekomendasi Algoritma' 
                  : `Kanal ${activeCategory.toUpperCase()}`}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="hidden sm:inline bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {sortedArticles.filter(a => a.isDetikHeadline).length} Berita detik.com
                </span>
                <span>{gridArticles.length} artikel</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map((article, index) => {
                // Insert approved in-feed contextual sponsored ad seamlessly at index 2 if available
                const shouldShowInFeedAd = index === 2 && contextualInFeedAds.length > 0;
                const activeInFeedAd = contextualInFeedAds.length > 0 ? contextualInFeedAds[0] : null;

                return (
                  <React.Fragment key={article.id}>
                    <NewsCard
                      article={article}
                      onSelectArticle={setSelectedArticle}
                      onOpenShare={setSharingArticle}
                    />
                    {shouldShowInFeedAd && activeInFeedAd && (
                      <InFeedAd 
                        ad={activeInFeedAd.ad} 
                        isContextual={activeInFeedAd.isContextual}
                        contextLabel={activeInFeedAd.matchReason}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Spotlight Billboard Sponsor Slot if approved */}
            {contextualBillboardAds.length > 0 && (
              <SpotlightBillboardAd ad={contextualBillboardAds[0].ad} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer 
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onOpenAdvertiserDashboard={() => setAdvertiserDashboardOpen(true)}
      />

      {/* Modals & Dialogs */}
      <ArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onOpenShare={setSharingArticle}
        onSelectArticle={(art) => setSelectedArticle(art)}
      />

      <ShareModal
        article={sharingArticle}
        isOpen={!!sharingArticle}
        onClose={() => setSharingArticle(null)}
      />

      <BookmarksModal
        isOpen={bookmarksModalOpen}
        onClose={() => setBookmarksModalOpen(false)}
        onSelectArticle={setSelectedArticle}
      />

      <AdminAdPanel
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
      />

      {/* Write Article for Contributors & Admins */}
      <WriteArticleModal
        isOpen={writeArticleModalOpen}
        onClose={() => setWriteArticleModalOpen(false)}
        onArticlePublished={(newArticle) => {
          setSelectedArticle(newArticle);
          loadArticles(activeCategory, searchQuery);
        }}
      />

      {/* Advertiser Order & Impression Dashboard (30% Reduced Quotas) */}
      <AdvertiserDashboardModal
        isOpen={advertiserDashboardOpen}
        onClose={() => setAdvertiserDashboardOpen(false)}
      />

      <LocalAdminLoginModal
        onSuccessOpenPanel={() => setAdminPanelOpen(true)}
      />

      <AuthModal />

      {/* Floating Sticky Bottom Banner Sponsor */}
      <StickyBottomAd />

      {/* Real-time World Trending Toast Alert */}
      <NotificationToast
        onSelectArticleById={(id) => {
          const found = NewsService.getArticleById(id);
          if (found) setSelectedArticle(found);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <NotificationProvider>
          <AdProvider>
            <NewsPortalMain />
          </AdProvider>
        </NotificationProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
}
