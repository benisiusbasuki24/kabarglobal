import React from 'react';
import { 
  Globe, 
  Briefcase, 
  Cpu, 
  Trophy, 
  Film, 
  Atom, 
  Landmark, 
  Flame, 
  RefreshCw,
  Sparkles,
  PenTool
} from 'lucide-react';
import { NewsCategory } from '../types';

export type CategoryFilterType = NewsCategory | 'detikcom';

interface CategoryBarProps {
  activeCategory: CategoryFilterType;
  onSelectCategory: (cat: CategoryFilterType) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  sortBy: 'latest' | 'trending' | 'discussed';
  onSortChange: (sort: 'latest' | 'trending' | 'discussed') => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  onRefresh,
  isRefreshing,
  sortBy,
  onSortChange
}) => {
  const categories: { id: CategoryFilterType; label: string; icon: React.ReactNode; isSpecial?: boolean; isContributorBadge?: boolean }[] = [
    { 
      id: 'all', 
      label: 'Semua Berita', 
      icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> 
    },
    { 
      id: 'detikcom', 
      label: 'Headline detik.com', 
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
      isSpecial: true
    },
    { 
      id: 'contributor', 
      label: 'Kanal Kontributor', 
      icon: <PenTool className="w-3.5 h-3.5 text-purple-500" />,
      isContributorBadge: true
    },
    { id: 'politics', label: 'Politik (detikNews)', icon: <Landmark className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'business', label: 'Bisnis (detikFinance)', icon: <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'technology', label: 'Teknologi (detikInet)', icon: <Cpu className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'sports', label: 'Olahraga (detikSport)', icon: <Trophy className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'entertainment', label: 'Hiburan (detikHot)', icon: <Film className="w-3.5 h-3.5 text-pink-500" /> },
    { id: 'science', label: 'Sains & Medis', icon: <Atom className="w-3.5 h-3.5 text-teal-500" /> },
    { id: 'world', label: 'Dunia', icon: <Globe className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2.5 overflow-x-auto no-scrollbar">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-nowrap">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;

              if (cat.isSpecial) {
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                      isActive
                        ? 'bg-[#002f6c] text-white border-blue-400 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-[#002f6c] dark:text-blue-300 border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-bold uppercase tracking-wider">
                      Prioritas
                    </span>
                  </button>
                );
              }

              if (cat.isContributorBadge) {
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                      isActive
                        ? 'bg-purple-700 text-white border-purple-500 shadow-md ring-2 ring-purple-500/30'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200 font-bold uppercase tracking-wider">
                      Komunitas
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right controls: Sort & Refresh */}
          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => onSortChange('latest')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  sortBy === 'latest'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Terbaru
              </button>
              <button
                onClick={() => onSortChange('trending')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  sortBy === 'trending'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Populer
              </button>
              <button
                onClick={() => onSortChange('discussed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  sortBy === 'discussed'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Diskusi
              </button>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center disabled:opacity-50"
              title="Perbarui Berita Terkini & Detik Headlines"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
