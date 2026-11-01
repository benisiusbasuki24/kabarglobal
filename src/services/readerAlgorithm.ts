import { NewsArticle, NewsCategory, AdvertisementItem } from '../types';

export interface ReaderProfile {
  totalArticlesRead: number;
  categoryVisits: Record<string, number>;
  recentArticleIds: string[];
  interestKeywords: Record<string, number>;
  lastUpdated: string;
}

const STORAGE_KEY = 'infocepat_reader_algorithm_profile';

export class ReaderAlgorithm {
  /**
   * Retrieves the current reader profile from localStorage
   */
  public static getProfile(): ReaderProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse reader profile:', e);
    }

    return {
      totalArticlesRead: 0,
      categoryVisits: {
        all: 0,
        world: 0,
        business: 0,
        technology: 0,
        sports: 0,
        entertainment: 0,
        science: 0,
        politics: 0,
      },
      recentArticleIds: [],
      interestKeywords: {},
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Records that the reader read an article, adjusting category affinities and keyword weights
   */
  public static recordArticleRead(article: NewsArticle): ReaderProfile {
    const profile = this.getProfile();
    profile.totalArticlesRead += 1;

    // Increment category visit counter
    const cat = article.category || 'world';
    profile.categoryVisits[cat] = (profile.categoryVisits[cat] || 0) + 1;

    // Track recently read articles (last 20)
    if (!profile.recentArticleIds.includes(article.id)) {
      profile.recentArticleIds.unshift(article.id);
      if (profile.recentArticleIds.length > 20) {
        profile.recentArticleIds.pop();
      }
    }

    // Extract significant keywords from title & description
    const textToAnalyze = `${article.title} ${article.description || ''} ${article.category}`.toLowerCase();
    const words = textToAnalyze
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['yang', 'untuk', 'dengan', 'dalam', 'pada', 'dari', 'akan', 'atau', 'ini', 'itu', 'oleh', 'juga'].includes(w));

    words.forEach(word => {
      profile.interestKeywords[word] = (profile.interestKeywords[word] || 0) + 1;
    });

    profile.lastUpdated = new Date().toISOString();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save reader profile:', e);
    }

    return profile;
  }

  /**
   * Returns top interested categories of the reader ordered by frequency
   */
  public static getTopCategories(): { category: NewsCategory; count: number; percentage: number }[] {
    const profile = this.getProfile();
    const entries = Object.entries(profile.categoryVisits).filter(([k]) => k !== 'all');
    const total = entries.reduce((acc, [, count]) => acc + count, 0);

    return entries
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => ({
        category: cat as NewsCategory,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));
  }

  /**
   * Ranks articles dynamically based on reader profile, prioritizing Detik.com headlines
   * Detik.com headlines are boosted by default to ensure priority in the portal.
   */
  public static rankArticles(articles: NewsArticle[]): NewsArticle[] {
    const profile = this.getProfile();
    const topCats = this.getTopCategories();
    const topCategoryNames = new Set(topCats.slice(0, 3).map(c => c.category));

    return [...articles].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. Detik.com headlines & Contributor news priority bonus (+100 points)
      // Contributor news and Detik headlines air together with highest priority
      if (a.isDetikHeadline || a.source.toLowerCase().includes('detik') || a.isContributor || a.category === 'contributor') scoreA += 100;
      if (b.isDetikHeadline || b.source.toLowerCase().includes('detik') || b.isContributor || b.category === 'contributor') scoreB += 100;

      // 2. Reader category affinity bonus
      const aVisits = profile.categoryVisits[a.category] || 0;
      const bVisits = profile.categoryVisits[b.category] || 0;
      scoreA += aVisits * 15;
      scoreB += bVisits * 15;

      if (topCategoryNames.has(a.category)) scoreA += 25;
      if (topCategoryNames.has(b.category)) scoreB += 25;

      // 3. Trending score weight
      scoreA += (a.trendingScore || 50) * 0.3;
      scoreB += (b.trendingScore || 50) * 0.3;

      // 4. Recency decay
      const now = Date.now();
      const ageHoursA = Math.max(0.1, (now - new Date(a.publishedAt).getTime()) / (1000 * 3600));
      const ageHoursB = Math.max(0.1, (now - new Date(b.publishedAt).getTime()) / (1000 * 3600));
      scoreA -= Math.min(40, ageHoursA * 2);
      scoreB -= Math.min(40, ageHoursB * 2);

      return scoreB - scoreA;
    });
  }

  /**
   * Contextual Ad Matching Algorithm:
   * Selects and orders advertisements that match either:
   * 1. The specific article being read (category and keyword match)
   * 2. The user's active reading profile & interests
   */
  public static matchAdsForArticle(
    ads: AdvertisementItem[], 
    currentArticle: NewsArticle
  ): { ad: AdvertisementItem; matchReason: string; isContextualMatch: boolean }[] {
    const artCat = currentArticle.category;
    const artText = `${currentArticle.title} ${currentArticle.description} ${currentArticle.category}`.toLowerCase();

    const scored = ads.map(ad => {
      let score = 0;
      let matchReason = 'Iklan Sponsor Resmi';
      let isContextualMatch = false;

      // Direct Category Match
      if (ad.targetCategory && ad.targetCategory === artCat) {
        score += 50;
        matchReason = `Sesuai kanal ${artCat}`;
        isContextualMatch = true;
      }

      // Keyword match between ad content and article content
      const adKeywords = [
        ad.title, 
        ad.sponsorName, 
        ...(ad.keywords || [])
      ].join(' ').toLowerCase();

      // Check tech keywords
      if (artCat === 'technology' && /cloud|data|ai|chip|teknologi|server|cyber/i.test(adKeywords)) {
        score += 40;
        matchReason = 'Terkait Komputasi & Teknologi';
        isContextualMatch = true;
      }
      // Check business/finance keywords
      if (artCat === 'business' && /investasi|reksadana|pasar|saham|trader|finansial|ekonomi/i.test(adKeywords)) {
        score += 40;
        matchReason = 'Terkait Keuangan & Bisnis';
        isContextualMatch = true;
      }
      // Check science/medical
      if (artCat === 'science' && /medis|kesehatan|ilmiah|biomed|lab/i.test(adKeywords)) {
        score += 40;
        matchReason = 'Terkait Sains & Kesehatan';
        isContextualMatch = true;
      }

      return { ad, score, matchReason, isContextualMatch };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.map(s => ({
      ad: s.ad,
      matchReason: s.matchReason,
      isContextualMatch: s.isContextualMatch
    }));
  }

  /**
   * Contextual Ad Matching for Feed / Banner:
   * Matches ads with reader's dominant reading history
   */
  public static matchAdsForReaderFeed(
    ads: AdvertisementItem[]
  ): { ad: AdvertisementItem; isContextual: boolean; contextLabel?: string }[] {
    const topCats = this.getTopCategories();
    const dominantCat = topCats.length > 0 ? topCats[0].category : null;

    return ads.map(ad => {
      if (dominantCat && (ad.targetCategory === dominantCat || ad.targetCategory === 'all')) {
        return {
          ad,
          isContextual: true,
          contextLabel: `Disesuaikan dengan minat baca: ${dominantCat}`
        };
      }
      return { ad, isContextual: false };
    });
  }

  /**
   * Calculate 30% reduced quota for advertising packages
   */
  public static calculateReducedQuota(originalQuota: number): {
    original: number;
    reduced: number;
    reductionPercent: number;
    savedImpressionDiff: number;
  } {
    const reductionPercent = 30;
    const reduced = Math.round(originalQuota * (1 - reductionPercent / 100));
    return {
      original: originalQuota,
      reduced,
      reductionPercent,
      savedImpressionDiff: originalQuota - reduced
    };
  }
}
