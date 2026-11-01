import React from 'react';
import { ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { useAds } from '../context/AdContext';
import { useAuth } from '../context/AuthContext';

interface TopAdBannerProps {
  onOpenAdminPanel?: () => void;
}

export const TopAdBanner: React.FC<TopAdBannerProps> = ({ onOpenAdminPanel }) => {
  const { getAdsByPlacement } = useAds();
  const { isAdmin } = useAuth();
  const bannerAds = getAdsByPlacement('top_banner');

  if (bannerAds.length === 0) return null;
  const ad = bannerAds[0];

  return (
    <div className="w-full my-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 shadow-lg border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Decorative background pattern */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 w-full md:w-auto">
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Sponsor Pilihan • Disetujui Redaksi
              </span>
              <span className="text-xs text-indigo-200 font-medium truncate">
                {ad.sponsorName}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2">
              {ad.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-shrink-0">
          {isAdmin && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Kelola Iklan Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Kelola
            </button>
          )}

          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-md active:scale-95 text-center"
          >
            Kunjungi Sponsor
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
