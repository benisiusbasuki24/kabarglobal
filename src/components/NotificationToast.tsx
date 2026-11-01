import React from 'react';
import { Flame, X, ArrowRight, BellRing } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NewsArticle } from '../types';

interface NotificationToastProps {
  onSelectArticleById: (articleId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectArticleById }) => {
  const { activeToast, dismissToast } = useNotifications();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-short">
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-indigo-500/40 backdrop-blur-xl flex items-start gap-3 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 via-amber-500 to-indigo-500" />

        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
          <Flame className="w-5 h-5 fill-current" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 px-2 py-0.5 rounded text-white flex items-center gap-1">
              <BellRing className="w-3 h-3" />
              Populer Dunia
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {activeToast.source}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
            {activeToast.title}
          </h4>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => {
                onSelectArticleById(activeToast.articleId);
                dismissToast();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-sm"
            >
              Baca Sekarang
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={dismissToast}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Nanti Saja
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
