import React from 'react';
import { ExternalLink, Sparkles, Target } from 'lucide-react';
import { AdvertisementItem } from '../types';

interface ArticleReaderAdProps {
  ad: AdvertisementItem;
  isContextual?: boolean;
  matchReason?: string;
}

export const ArticleReaderAd: React.FC<ArticleReaderAdProps> = ({ 
  ad, 
  isContextual = true,
  matchReason = 'Disesuaikan dengan konteks isi artikel' 
}) => {
  return (
    <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/90 dark:from-slate-800 dark:via-indigo-950/40 dark:to-slate-800 border-2 border-indigo-200/90 dark:border-indigo-800/80 overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full sm:w-36 h-24 object-cover rounded-xl shadow-xs flex-shrink-0 bg-slate-200 dark:bg-slate-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              Sponsor Pembaca
            </span>

            {isContextual && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Target className="w-2.5 h-2.5" />
                {matchReason}
              </span>
            )}

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {ad.sponsorName}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {ad.title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Algoritma portal mencocokkan penawaran ini berdasarkan minat bacaan dan tema berita.
          </p>
        </div>
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0 active:scale-95"
        >
          Lihat Penawaran
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
