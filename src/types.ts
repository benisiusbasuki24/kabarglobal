export type NewsCategory = 
  | 'all'
  | 'world'
  | 'business'
  | 'technology'
  | 'sports'
  | 'entertainment'
  | 'science'
  | 'politics'
  | 'contributor';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string;
  source: string;
  category: NewsCategory;
  publishedAt: string;
  author?: string;
  authorId?: string;
  isContributor?: boolean; // Flagged when article is authored by citizen contributor
  readingTime: number; // in minutes
  isTrending?: boolean;
  trendingScore?: number;
  commentsCount?: number;
  isDetikHeadline?: boolean; // Prioritized Detik.com headline flag
  detikChannel?: string; // e.g. detikNews, detikFinance, detikInet, detikHot, detikSport
  keywords?: string[]; // Content keywords for contextual reader & ad matching
}

export interface BookmarkItem {
  id: string;
  userId: string;
  articleId: string;
  title: string;
  url: string;
  imageUrl: string;
  source: string;
  category: string;
  publishedAt: string;
  createdAt?: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  content: string;
  likes: number;
  likedBy?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type AdPlacement = 
  | 'top_banner' 
  | 'sidebar' 
  | 'in_feed' 
  | 'breaking_ticker' 
  | 'article_interstitial' 
  | 'footer_banner' 
  | 'popup_billboard';

export type AdStatus = 'pending' | 'approved' | 'rejected';

export interface AdvertisementItem {
  id: string;
  title: string;
  sponsorName: string;
  imageUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  targetCategory?: NewsCategory | 'all'; // Category targeting for contextual matching
  keywords?: string[]; // Target keywords for contextual matching with article contents
  durationDays?: number;
  impressionsTotal?: number;
  impressionsUsed?: number;
  remainingQuota?: number;
  price?: number; // Total order price in IDR
  submittedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdPackageTier {
  id: string;
  durationDays: number;
  label: string;
  impressionsQuota: number;
  ratePerImpression: number; // in IDR
  discountPercent?: number;
}

export interface TrendingAlert {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  trendingScore: number;
  createdAt: string;
  isRead?: boolean;
}

export type UserRole = 'admin' | 'reader' | 'contributor' | 'advertiser';
export type ContributorStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  contributorStatus?: ContributorStatus;
  contributorBio?: string;
  organization?: string;
  passwordHash?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}
