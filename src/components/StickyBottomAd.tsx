import React, { useState } from 'react';
import { ExternalLink, X, Sparkles, ChevronUp } from 'lucide-react';
import { useAds } from '../context/AdContext';

export const StickyBottomAd: React.FC = () => {
  const { getAdsByPlacement } = useAds();
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const footerAds = getAdsByPlacement('footer_banner');
  if (footerAds.length === 0 || dismissed) return null;

  const ad = footerAds[0];

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold shadow-xl border border-white/20 backdrop-blur-md transition-all hover:scale-105"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Sponsor Pilihan</span>
          <ChevronUp className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-3 pointer-events-none animate-fadeIn">
      <div className="max-w-4xl mx-auto bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-500/30 p-3 sm:p-4 pointer-events-auto flex items-center justify-between gap-3 sm:gap-4">
        
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10 hidden sm:block"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                Sponsor Eksklusif
              </span>
              <span className="text-xs text-indigo-300 font-medium truncate">
                {ad.sponsorName}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              {ad.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            Kunjungi
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Sembunyikan sementara"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
