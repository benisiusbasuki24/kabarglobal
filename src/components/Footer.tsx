import React from 'react';
import { Globe, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { NewsCategory } from '../types';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onSelectCategory: (cat: NewsCategory) => void;
  onOpenAdminPanel: () => void;
  onOpenAdvertiserDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectCategory, 
  onOpenAdminPanel,
  onOpenAdvertiserDashboard 
}) => {
  const { isLocalServer, openAdminLoginModal, canManageAds, isAdmin } = useAuth();
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors mt-16 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                K
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                Kabar<span className="text-indigo-600 dark:text-indigo-400">Global</span>
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Platform berita digital independen dengan agregasi real-time dari kantor berita terkemuka di dunia. Dilengkapi verifikasi moderasi iklan oleh admin, ruang diskusi pembaca interaktif, dan notifikasi pintar breaking news.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Network & Firestore Connected
              </span>
            </div>
          </div>

          {/* Quick Category Nav */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Kanal Berita
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectCategory('world')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Dunia & Hubungan Internasional
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('business')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Bisnis, Keuangan & Pasar Modal
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('technology')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Teknologi, AI & Inovasi
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('science')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Sains, Kesehatan & Antariksa
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('sports')} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Olahraga & Kompetisi
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Ads */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Layanan & Kebijakan
            </h4>
            <ul className="space-y-2">
              {isAdmin && (
                <li>
                  <button 
                    onClick={onOpenAdminPanel}
                    className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Persetujuan Iklan & Kontributor
                  </button>
                </li>
              )}
              {canManageAds && (
                <li>
                  <button 
                    onClick={onOpenAdvertiserDashboard || onOpenAdminPanel}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                  >
                    Dashboard Pemasang Iklan & Kuota
                  </button>
                </li>
              )}
              {isLocalServer && (
                <li>
                  <button 
                    onClick={openAdminLoginModal}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Login Admin (Local Server)</span>
                  </button>
                </li>
              )}
              <li>
                <span className="text-slate-400">Kode Etik Jurnalistik</span>
              </li>
              <li>
                <span className="text-slate-400">Privasi & Keamanan Data</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} KabarGlobal. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Dibuat untuk jurnalisme cepat, akurat, dan berimbang
          </p>
        </div>
      </div>
    </footer>
  );
};
