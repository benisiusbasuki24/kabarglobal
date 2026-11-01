import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { BookmarkItem, NewsArticle } from '../types';

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (article: NewsArticle) => Promise<void>;
  deleteBookmark: (bookmarkId: string) => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'kabarglobal_guest_bookmarks';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openLoginModal } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with Firestore when logged in, or with localStorage when guest
  useEffect(() => {
    if (!user) {
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          setBookmarks(JSON.parse(local));
        } else {
          setBookmarks([]);
        }
      } catch (e) {
        setBookmarks([]);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(bookmarksRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: BookmarkItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          articleId: data.articleId,
          title: data.title,
          url: data.url,
          imageUrl: data.imageUrl,
          source: data.source,
          category: data.category,
          publishedAt: data.publishedAt,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        });
      });
      setBookmarks(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookmarks');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const isBookmarked = (articleId: string): boolean => {
    return bookmarks.some(b => b.articleId === articleId);
  };

  const toggleBookmark = async (article: NewsArticle) => {
    const existing = bookmarks.find(b => b.articleId === article.id);

    if (existing) {
      await deleteBookmark(existing.id);
    } else {
      const newId = `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newBookmark: BookmarkItem = {
        id: newId,
        userId: user ? user.uid : 'guest',
        articleId: article.id,
        title: article.title.slice(0, 300),
        url: article.url.slice(0, 1000),
        imageUrl: article.imageUrl.slice(0, 1000),
        source: article.source.slice(0, 100),
        category: article.category.slice(0, 50),
        publishedAt: article.publishedAt,
        createdAt: new Date().toISOString()
      };

      if (user) {
        try {
          await setDoc(doc(db, 'bookmarks', newId), {
            ...newBookmark,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `bookmarks/${newId}`);
        }
      } else {
        const updated = [newBookmark, ...bookmarks];
        setBookmarks(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bookmarks/${bookmarkId}`);
      }
    } else {
      const updated = bookmarks.filter(b => b.id !== bookmarkId);
      setBookmarks(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarks,
      isBookmarked,
      toggleBookmark,
      deleteBookmark,
      loading
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
