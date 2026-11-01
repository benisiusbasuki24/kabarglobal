export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay < 7) return `${diffDay} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Baru saja';
  }
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    all: 'Semua',
    world: 'Dunia',
    business: 'Bisnis',
    technology: 'Teknologi',
    sports: 'Olahraga',
    entertainment: 'Hiburan',
    science: 'Sains',
    politics: 'Politik',
    contributor: 'Kontributor'
  };
  return map[category] || category;
}

export function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case 'contributor':
      return 'bg-purple-600/15 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300 border-purple-500/40';
    case 'technology':
      return 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30';
    case 'business':
      return 'bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30';
    case 'world':
      return 'bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/30';
    case 'sports':
      return 'bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30';
    case 'entertainment':
      return 'bg-pink-600/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border-pink-500/30';
    case 'science':
      return 'bg-teal-600/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/30';
    case 'politics':
      return 'bg-rose-600/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-600/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-slate-500/30';
  }
}
