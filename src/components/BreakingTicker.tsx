import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap, Sparkles, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';
import { useAds } from '../context/AdContext';

interface BreakingTickerProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ articles, onSelectArticle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getAdsByPlacement } = useAds();
  const tickerAds = getAdsByPlacement('breaking_ticker');
  const sponsorAd = tickerAds.length > 0 ? tickerAds[0] : null;

  // Prioritize detik.com headlines in breaking ticker
  const detikArticles = articles.filter(a => a.isDetikHeadline);
  const otherArticles = articles.filter(a => !a.isDetikHeadline);
  const trendingList = [...detikArticles, ...otherArticles].slice(0, 8);

  useEffect(() => {
    if (trendingList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [trendingList.length]);

  if (trendingList.length === 0) return null;
  const current = trendingList[currentIndex];

  return (
    <div className="w-full bg-slate-900 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Breaking headline ticker */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-600 font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-xs">
              <Zap className="w-3 h-3 fill-current" />
              Breaking
            </span>
            {current.isDetikHeadline && (
              <span className="px-1.5 py-0.2 rounded bg-[#002f6c] text-cyan-300 font-black text-[10px] border border-blue-400/40">
                detikcom
              </span>
            )}
          </div>

          <div 
            className="flex-1 truncate cursor-pointer hover:text-indigo-300 transition-colors flex items-center gap-2 group min-w-0"
            onClick={() => onSelectArticle(current)}
          >
            <span className="text-slate-400 font-medium hidden md:inline flex-shrink-0">
              [{current.detikChannel || current.source}]
            </span>
            <span className="font-semibold text-slate-100 group-hover:underline truncate text-xs">
              {current.title}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </div>
        </div>

        {/* Right: Sponsor Ticker strip (if approved breaking_ticker ad exists) */}
        {sponsorAd && (
          <div className="flex items-center gap-2 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-1.5 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Iklan
              </span>
              <a
                href={sponsorAd.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-white font-medium truncate max-w-[200px] hover:underline flex items-center gap-1"
              >
                <span>{sponsorAd.title}</span>
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
