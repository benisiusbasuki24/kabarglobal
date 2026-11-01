import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { AdvertisementItem, AdPlacement, AdStatus, NewsArticle } from '../types';
import { ReaderAlgorithm } from '../services/readerAlgorithm';

interface AdContextType {
  ads: AdvertisementItem[];
  approvedAds: AdvertisementItem[];
  pendingAds: AdvertisementItem[];
  getAdsByPlacement: (placement: AdPlacement) => AdvertisementItem[];
  getContextualAdsForArticle: (placement: AdPlacement, article: NewsArticle) => { ad: AdvertisementItem; isContextual: boolean; matchReason?: string }[];
  getContextualAdsForReader: (placement: AdPlacement) => { ad: AdvertisementItem; isContextual: boolean; matchReason?: string }[];
  submitNewAd: (data: Omit<AdvertisementItem, 'id' | 'status' | 'submittedBy' | 'createdAt'>) => Promise<void>;
  approveAd: (adId: string) => Promise<void>;
  rejectAd: (adId: string) => Promise<void>;
  deleteAd: (adId: string) => Promise<void>;
  loading: boolean;
}

const DEFAULT_SAMPLE_ADS: AdvertisementItem[] = [
  {
    id: 'ad-leaderboard-01',
    title: 'Cloud Infrastructure Masa Depan: Skalabilitas Tanpa Batas',
    sponsorName: 'AeroCloud Enterprise',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://cloud.google.com',
    placement: 'top_banner',
    status: 'approved',
    targetCategory: 'technology',
    keywords: ['cloud', 'ai', 'data center', 'server', 'it'],
    durationDays: 7,
    impressionsTotal: 10500, // Reduced 30% from 15,000
    impressionsUsed: 1240,
    remainingQuota: 9260,
    price: 350000,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-ticker-01',
    title: 'Promo Diskon 50% Domain & Hosting Super Cepat',
    sponsorName: 'NusantaraWeb Host',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://google.com',
    placement: 'breaking_ticker',
    status: 'approved',
    targetCategory: 'technology',
    keywords: ['hosting', 'domain', 'web', 'internet'],
    durationDays: 7,
    impressionsTotal: 10500, // Reduced 30% from 15,000
    impressionsUsed: 890,
    remainingQuota: 9610,
    price: 350000,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-sidebar-01',
    title: 'Kursus Eksekutif AI & Analisis Data Bisnis 2026',
    sponsorName: 'TechAcademy Global',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://coursera.org',
    placement: 'sidebar',
    status: 'approved',
    targetCategory: 'technology',
    keywords: ['kursus', 'ai', 'data', 'bisnis', 'belajar'],
    durationDays: 7,
    impressionsTotal: 10500,
    impressionsUsed: 1420,
    remainingQuota: 9080,
    price: 315000,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-infeed-01',
    title: 'Investasi Hijau: Reksadana ESG Unggulan dengan Imbal Hasil Optimal',
    sponsorName: 'EcoWealth Asset Management',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://investing.com',
    placement: 'in_feed',
    status: 'approved',
    targetCategory: 'business',
    keywords: ['investasi', 'reksadana', 'saham', 'ihsg', 'finansial', 'bank'],
    durationDays: 7,
    impressionsTotal: 10500,
    impressionsUsed: 2100,
    remainingQuota: 8400,
    price: 385000,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-article-01',
    title: 'Perlindungan Privasi Digital & Enkripsi Data Perusahaan',
    sponsorName: 'CyberGuard Shield',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://cybersecurity.com',
    placement: 'article_interstitial',
    status: 'approved',
    targetCategory: 'technology',
    keywords: ['cyber', 'keamanan', 'privasi', 'siber', 'enkripsi', 'hukum'],
    durationDays: 7,
    impressionsTotal: 10500,
    impressionsUsed: 1780,
    remainingQuota: 8720,
    price: 402500,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-footer-01',
    title: 'Bergabung dengan Komunitas Trader Cerdas: Bebas Biaya Transaksi Bulan Pertama',
    sponsorName: 'AlphaTrade Global',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    targetUrl: 'https://trading.com',
    placement: 'footer_banner',
    status: 'approved',
    targetCategory: 'business',
    keywords: ['trading', 'saham', 'pasar', 'uang', 'keuangan'],
    durationDays: 7,
    impressionsTotal: 10500,
    impressionsUsed: 1350,
    remainingQuota: 9150,
    price: 350000,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-billboard-01',
    title: 'Kamera Sinematik Ultra HD untuk Kreator Konten Profesional',
    sponsorName: 'OptiVision Cinema',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://sony.com',
    placement: 'popup_billboard',
    status: 'approved',
    targetCategory: 'entertainment',
    keywords: ['kamera', 'film', 'kreator', 'video', 'sinema'],
    durationDays: 7,
    impressionsTotal: 10500,
    impressionsUsed: 1620,
    remainingQuota: 8880,
    price: 490000,
    submittedBy: 'system',
    createdAt: new Date().toISOString()
  }
];

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [ads, setAds] = useState<AdvertisementItem[]>(DEFAULT_SAMPLE_ADS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const adsRef = collection(db, 'ads');
      const unsubscribe = onSnapshot(adsRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetched: AdvertisementItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              title: data.title,
              sponsorName: data.sponsorName,
              imageUrl: data.imageUrl,
              targetUrl: data.targetUrl,
              placement: data.placement,
              status: data.status,
              targetCategory: data.targetCategory,
              keywords: data.keywords,
              durationDays: data.durationDays,
              impressionsTotal: data.impressionsTotal || 10500,
              impressionsUsed: data.impressionsUsed || 0,
              remainingQuota: data.remainingQuota !== undefined ? data.remainingQuota : (data.impressionsTotal || 10500),
              price: data.price,
              submittedBy: data.submittedBy,
              approvedBy: data.approvedBy,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
            });
          });
          setAds(fetched);
        } else {
          setAds(DEFAULT_SAMPLE_ADS);
        }
        setLoading(false);
      }, (error) => {
        console.warn('Ad listener notice:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Ad provider catch', e);
      setLoading(false);
    }
  }, []);

  const approvedAds = ads.filter(a => a.status === 'approved');
  const pendingAds = ads.filter(a => a.status === 'pending');

  const getAdsByPlacement = (placement: AdPlacement): AdvertisementItem[] => {
    return approvedAds.filter(a => a.placement === placement);
  };

  /**
   * Returns ads matched contextually with the specific article being read
   */
  const getContextualAdsForArticle = (placement: AdPlacement, article: NewsArticle) => {
    const pool = approvedAds.filter(a => a.placement === placement);
    if (pool.length === 0) return [];
    
    const matched = ReaderAlgorithm.matchAdsForArticle(pool, article);
    return matched.map(m => ({
      ad: m.ad,
      isContextual: m.isContextualMatch,
      matchReason: m.matchReason
    }));
  };

  /**
   * Returns ads matched contextually with reader's profile & browsing interests
   */
  const getContextualAdsForReader = (placement: AdPlacement) => {
    const pool = approvedAds.filter(a => a.placement === placement);
    if (pool.length === 0) return [];

    const topCats = ReaderAlgorithm.getTopCategories();
    const dominantCat = topCats.length > 0 ? topCats[0].category : null;

    return pool.map(ad => {
      const isContextual = !!dominantCat && (ad.targetCategory === dominantCat || ad.targetCategory === 'all');
      return {
        ad,
        isContextual,
        matchReason: isContextual ? `Relevan dengan minat: ${dominantCat}` : undefined
      };
    }).sort((a, b) => (b.isContextual ? 1 : 0) - (a.isContextual ? 1 : 0));
  };

  const submitNewAd = async (data: Omit<AdvertisementItem, 'id' | 'status' | 'submittedBy' | 'createdAt'>) => {
    const newId = `ad-${Date.now()}`;
    const initialStatus: AdStatus = isAdmin ? 'approved' : 'pending';
    
    // Ensure -30% quota rule is applied
    const impressionsTotal = data.impressionsTotal || 10500;
    const remainingQuota = data.remainingQuota !== undefined ? data.remainingQuota : impressionsTotal;

    const newAd: AdvertisementItem = {
      ...data,
      id: newId,
      status: initialStatus,
      impressionsTotal,
      remainingQuota,
      submittedBy: user ? user.uid : 'advertiser',
      approvedBy: isAdmin ? (user?.uid || 'admin') : undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'ads', newId), {
        ...newAd,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setAds(prev => [newAd, ...prev.filter(a => a.id !== newId)]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `ads/${newId}`);
    }
  };

  const approveAd = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), {
        status: 'approved',
        approvedBy: user?.uid || 'admin',
        updatedAt: serverTimestamp()
      });
      setAds(prev => prev.map(a => a.id === adId ? { ...a, status: 'approved', approvedBy: user?.uid } : a));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ads/${adId}`);
    }
  };

  const rejectAd = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), {
        status: 'rejected',
        approvedBy: user?.uid || 'admin',
        updatedAt: serverTimestamp()
      });
      setAds(prev => prev.map(a => a.id === adId ? { ...a, status: 'rejected' } : a));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ads/${adId}`);
    }
  };

  const deleteAd = async (adId: string) => {
    try {
      await deleteDoc(doc(db, 'ads', adId));
      setAds(prev => prev.filter(a => a.id !== adId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ads/${adId}`);
    }
  };

  return (
    <AdContext.Provider value={{
      ads,
      approvedAds,
      pendingAds,
      getAdsByPlacement,
      getContextualAdsForArticle,
      getContextualAdsForReader,
      submitNewAd,
      approveAd,
      rejectAd,
      deleteAd,
      loading
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
