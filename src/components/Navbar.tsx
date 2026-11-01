import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Bookmark, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  Volume2, 
  VolumeX, 
  X, 
  Flame, 
  Menu, 
  PenTool,
  Megaphone,
  Check, 
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime } from '../utils/formatters';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenBookmarks: () => void;
  onOpenAdminPanel: () => void;
  onOpenWriteArticle: () => void;
  onOpenAdvertiserDashboard: () => void;
  onSelectArticleById: (articleId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onOpenBookmarks,
  onOpenAdminPanel,
  onOpenWriteArticle,
  onOpenAdvertiserDashboard,
  onSelectArticleById
}) => {
  const { 
    user, 
    profile, 
    isAdmin, 
    isContributor,
    isAdvertiser,
    canManageAds,
    isLocalServer, 
    isLocalAdminLoggedIn, 
    openLoginModal, 
    openAdminLoginModal, 
    logout 
  } = useAuth();
  const { bookmarks } = useBookmarks();
  const { 
    alerts, 
    unreadCount, 
    soundEnabled, 
    toggleSound, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Live Tag */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                I
              </div>
              <div className="hidden min-[380px]:block">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                  INFO<span className="text-indigo-600 dark:text-indigo-400">CEPAT</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-none">
                  Portal Berita Real-Time Terkini & Cepat
                </span>
              </div>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari topik, negara, tokoh, atau berita..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner dark:shadow-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* CONTRIBUTOR: Tulis Berita button */}
            {(isContributor || isAdmin) && (
              <button
                onClick={onOpenWriteArticle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Tulis Berita Kontributor (Langsung Tayang)"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tulis Berita</span>
              </button>
            )}

            {/* ADVERTISER: Dashboard & Pasang Iklan button (Strictly visible only to advertiser role) */}
            {isAdvertiser && !isAdmin && (
              <button
                onClick={onOpenAdvertiserDashboard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs active:scale-95"
                title="Dashboard Pemasang Iklan & Kuota"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Pasang Iklan</span>
              </button>
            )}

            {/* ADMIN: Dedicated Local Admin Login button (STRICTLY rendered ONLY if on local server) */}
            {isLocalServer && (
              isLocalAdminLoggedIn ? (
                <button
                  onClick={onOpenAdminPanel}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all hover:bg-emerald-500/25"
                  title="Admin Terautentikasi (Local)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden lg:inline">Admin:</span> bencreative
                </button>
              ) : (
                <button
                  onClick={openAdminLoginModal}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition-all shadow-xs active:scale-95"
                  title="Login Admin Server Lokal (bencreative)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Login Admin [Local]</span>
                </button>
              )
            )}

            {/* ADMIN ONLY: Admin Panel Moderasi & Iklan Button (Hidden for readers and contributors) */}
            {isAdmin && (
              <button
                onClick={onOpenAdminPanel}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                title="Pusat Moderasi & Iklan Admin"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* Real-time Notifications Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifikasi Berita Populer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500 fill-current" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Tren Populer Dunia
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleSound}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={soundEnabled ? 'Matikan nada notifikasi' : 'Aktifkan nada notifikasi'}
                      >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {!user && (
                      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] text-indigo-800 dark:text-indigo-300 text-center">
                        Masuk untuk menerima peringatan push berita populer secara instan.
                      </div>
                    )}
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            markAsRead(alert.id);
                            setNotificationOpen(false);
                            onSelectArticleById(alert.articleId);
                          }}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex gap-3 ${
                            !alert.isRead ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                {alert.source}
                              </span>
                              <span>{formatRelativeTime(alert.createdAt)}</span>
                            </div>
                            <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                              {alert.title}
                            </h5>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bookmarks Button */}
            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Artikel Tersimpan"
            >
              <Bookmark className="w-5 h-5" />
              {bookmarks.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* User Profile / Auth Button */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {(profile?.displayName || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {profile?.displayName || user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Masuk</span>
                </button>
              )}

              {/* User Dropdown */}
              {user && userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {profile?.displayName || user.displayName || 'Pengguna'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    
                    {/* Role badge */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isAdmin 
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' 
                          : profile?.role === 'contributor'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : profile?.role === 'advertiser'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        Role: {isAdmin ? 'Administrator' : profile?.role === 'contributor' ? 'Kontributor' : profile?.role === 'advertiser' ? 'Pemasang Iklan' : 'Pembaca'}
                      </span>
                      {profile?.role === 'contributor' && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          profile.contributorStatus === 'approved' 
                            ? 'bg-emerald-500/20 text-emerald-600' 
                            : 'bg-amber-500/20 text-amber-600'
                        }`}>
                          {profile.contributorStatus === 'approved' ? 'Terverifikasi' : 'Menunggu Approval'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for contributor */}
                  {(isContributor || isAdmin) && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenWriteArticle();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Tulis Berita Kontributor</span>
                    </button>
                  )}

                  {/* Actions for advertiser */}
                  {(isAdvertiser || isAdmin) && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenAdvertiserDashboard();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Dashboard & Pasang Iklan</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenBookmarks();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    <span>Artikel Tersimpan ({bookmarks.length})</span>
                  </button>

                  {/* Admin panel option (Admin only) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenAdminPanel();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Panel Moderasi Admin</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isLocalServer && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isLocalAdminLoggedIn) {
                    onOpenAdminPanel();
                  } else {
                    openAdminLoginModal();
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLocalAdminLoggedIn ? 'Admin: bencreative (Panel)' : 'Login Admin Local (bencreative)'}</span>
                </div>
                <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full font-extrabold">
                  Local Server
                </span>
              </button>
            )}

            {(isContributor || isAdmin) && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWriteArticle();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
              >
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  <span>Tulis Berita Kontributor</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                  Langsung Tayang
                </span>
              </button>
            )}

            {/* Only shown to admin and advertiser */}
            {canManageAds && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAdmin) {
                    onOpenAdminPanel();
                  } else {
                    onOpenAdvertiserDashboard();
                  }
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <span>{isAdmin ? 'Panel Moderasi Admin' : 'Dashboard Pasang Iklan'}</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  {isAdmin ? 'Admin' : 'Pengiklan'}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookmarks();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Artikel Tersimpan</span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                {bookmarks.length}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
