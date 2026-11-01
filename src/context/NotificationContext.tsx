import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { TrendingAlert, NewsArticle } from '../types';
import { NewsService } from '../services/newsService';

interface NotificationContextType {
  alerts: TrendingAlert[];
  unreadCount: number;
  activeToast: TrendingAlert | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  dismissToast: () => void;
  triggerManualAlert: (article: NewsArticle) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API chime generator (no external audio files needed)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm dual-tone chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.2); // D6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Ignore autoplay restriction before user gesture
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<TrendingAlert[]>([]);
  const [activeToast, setActiveToast] = useState<TrendingAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize initial trending alerts from the top trending news
  useEffect(() => {
    const trending = NewsService.getTrendingArticles();
    const initialAlerts: TrendingAlert[] = trending.slice(0, 4).map(item => ({
      id: `alert-${item.id}`,
      articleId: item.id,
      title: item.title,
      summary: item.description,
      category: item.category,
      source: item.source,
      trendingScore: item.trendingScore || 90,
      createdAt: item.publishedAt,
      isRead: false
    }));
    setAlerts(initialAlerts);
  }, []);

  // Listen to Firestore real-time collection if registered
  useEffect(() => {
    if (!user) return;

    try {
      const collRef = collection(db, 'trending_notifications');
      const q = query(collRef, limit(10));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const newAlert: TrendingAlert = {
              id: change.doc.id,
              articleId: data.articleId || change.doc.id,
              title: data.title || 'Breaking News Populer',
              summary: data.summary || '',
              category: data.category || 'world',
              source: data.source || 'KabarGlobal',
              trendingScore: data.trendingScore || 95,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              isRead: false
            };

            setAlerts(prev => {
              if (prev.some(a => a.id === newAlert.id)) return prev;
              return [newAlert, ...prev];
            });

            // Show real-time push toast & play chime for registered users
            setActiveToast(newAlert);
            if (soundEnabled) playNotificationChime();
          }
        });
      }, (err) => {
        console.warn('Notification listener fallback:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore notification setup error', e);
    }
  }, [user, soundEnabled]);

  // Periodic simulation of real-time global breaking news alerts for registered users
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const trending = NewsService.getTrendingArticles();
      if (trending.length > 0) {
        // Pick one at random
        const chosen = trending[Math.floor(Math.random() * trending.length)];
        const simulatedAlert: TrendingAlert = {
          id: `alert-auto-${Date.now()}`,
          articleId: chosen.id,
          title: `[TRENDING DUNIA] ${chosen.title}`,
          summary: chosen.description,
          category: chosen.category,
          source: chosen.source,
          trendingScore: chosen.trendingScore || 98,
          createdAt: new Date().toISOString(),
          isRead: false
        };

        setAlerts(prev => [simulatedAlert, ...prev.slice(0, 19)]);
        setActiveToast(simulatedAlert);
        if (soundEnabled) playNotificationChime();
      }
    }, 90000); // every 90 seconds in background for registered users

    return () => clearInterval(interval);
  }, [user, soundEnabled]);

  const toggleSound = () => setSoundEnabled(prev => !prev);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const dismissToast = () => setActiveToast(null);

  const triggerManualAlert = useCallback((article: NewsArticle) => {
    const alert: TrendingAlert = {
      id: `manual-${Date.now()}`,
      articleId: article.id,
      title: `[BREAKING] ${article.title}`,
      summary: article.description,
      category: article.category,
      source: article.source,
      trendingScore: article.trendingScore || 99,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setAlerts(prev => [alert, ...prev]);
    setActiveToast(alert);
    if (soundEnabled) playNotificationChime();
  }, [soundEnabled]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <NotificationContext.Provider value={{
      alerts,
      unreadCount,
      activeToast,
      soundEnabled,
      toggleSound,
      markAsRead,
      markAllAsRead,
      dismissToast,
      triggerManualAlert
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
