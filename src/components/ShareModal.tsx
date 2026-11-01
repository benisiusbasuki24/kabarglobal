import React, { useState } from 'react';
import { X, Copy, CheckCircle, Share2 } from 'lucide-react';
import { NewsArticle } from '../types';

interface ShareModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ article, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !article) return null;

  const shareUrl = window.location.origin + '?article=' + article.id;
  const shareTitle = article.title;
  const shareText = `Baca berita terbaru: "${shareTitle}" via KabarGlobal`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // User cancelled
      }
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      bgColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      bgColor: 'bg-black hover:bg-zinc-800 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      bgColor: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: 'f',
      bgColor: 'bg-blue-600 hover:bg-blue-700 text-white font-bold',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      bgColor: 'bg-blue-700 hover:bg-blue-800 text-white font-bold',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Bagikan Artikel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sebarkan informasi akurat ke jejaring Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Preview */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex gap-3">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
            />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {article.source}
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5">
                {article.title}
              </p>
            </div>
          </div>

          {/* Social Share Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Bagikan Langsung:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-transform active:scale-95 ${s.bgColor}`}
                  title={`Bagikan ke ${s.name}`}
                >
                  <span className="text-lg leading-none mb-1">{s.icon}</span>
                  <span className="text-[10px] font-medium truncate max-w-full">{s.name.split(' ')[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Native Web Share button if available */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Gunakan Opsi Berbagi Sistem HP
            </button>
          )}

          {/* Copy Link Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Atau Salin Tautan:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
