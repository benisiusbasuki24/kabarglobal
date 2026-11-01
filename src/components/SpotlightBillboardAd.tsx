import React from 'react';
import { ExternalLink, Sparkles, Award } from 'lucide-react';
import { AdvertisementItem } from '../types';

interface SpotlightBillboardAdProps {
  ad: AdvertisementItem;
}

export const SpotlightBillboardAd: React.FC<SpotlightBillboardAdProps> = ({ ad }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl border border-indigo-500/30 my-6">
      {/* Visual embellishments */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
              <Award className="w-3.5 h-3.5" />
              Spotlight Billboard • Iklan Terverifikasi
            </span>
            <span className="text-xs text-indigo-300 font-semibold">{ad.sponsorName}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {ad.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Prakarsa dan produk unggulan dari mitra resmi {ad.sponsorName}. Dapatkan akses penawaran khusus bagi pembaca setia KabarGlobal.
          </p>

          <div className="pt-2">
            <a
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
            >
              Kunjungi Situs Mitra
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="w-full md:w-64 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10 shadow-md">
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};
