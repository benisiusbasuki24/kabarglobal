import React from 'react';
import { ExternalLink, Sparkles, Target } from 'lucide-react';
import { AdvertisementItem } from '../types';

interface InFeedAdProps {
  ad: AdvertisementItem;
  isContextual?: boolean;
  contextLabel?: string;
}

export const InFeedAd: React.FC<InFeedAdProps> = ({ 
  ad, 
  isContextual = false,
  contextLabel = 'Disesuaikan dengan Minat Baca Anda'
}) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/5 via-indigo-500/5 to-purple-500/5 dark:from-indigo-950/20 dark:to-slate-900 border-2 border-indigo-200/80 dark:border-indigo-800/60 p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-lg">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3" />
              Sponsor Portal
            </span>
            {isContextual && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Target className="w-2.5 h-2.5" />
                {contextLabel}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {ad.sponsorName}
          </span>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-200 dark:bg-slate-800">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
          {ad.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
          Pesan promosi mitra {ad.sponsorName} yang dicocokkan otomatis oleh algoritma rekomendasi berita & minat membaca Anda.
        </p>
      </div>

      <div className="pt-4 mt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Telah Disetujui Admin</span>
        <a
          href={ad.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all shadow-sm"
        >
          Pelajari Lebih Lanjut
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
