import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  FirebaseUser,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserRole, ContributorStatus } from '../types';

async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '_kabarglobal_salt_2026');
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

function generateUserId(): string {
  return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isContributor: boolean;
  isApprovedContributor: boolean;
  isAdvertiser: boolean;
  canManageAds: boolean; // only admin and advertiser
  isLocalAdminLoggedIn: boolean;
  isLocalServer: boolean;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  adminLoginModalOpen: boolean;
  pendingContributors: UserProfile[];
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  openAdminLoginModal: () => void;
  closeAdminLoginModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (params: {
    name: string;
    email: string;
    pass: string;
    role: UserRole;
    contributorBio?: string;
    organization?: string;
  }) => Promise<void>;
  approveContributor: (userId: string) => Promise<void>;
  rejectContributor: (userId: string) => Promise<void>;
  loginLocalAdmin: (user: string, pass: string) => boolean;
  logoutLocalAdmin: () => void;
  logout: () => Promise<void>;
  toggleAdminRoleForDev: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary bootstrap admin email from metadata
const ADMIN_BOOTSTRAP_EMAIL = 'benisius.rb@gmail.com';

// Local Server Detection
export function checkIsLocalServer(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const port = window.location.port;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    port === '3000' ||
    hostname.includes('ais-dev-')
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [devAdminOverride, setDevAdminOverride] = useState<boolean>(false);
  const [pendingContributors, setPendingContributors] = useState<UserProfile[]>([]);

  // Persistent Local Admin Session
  const [isLocalAdminLoggedIn, setIsLocalAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kabarglobal_local_admin_session') === 'true';
    } catch {
      return false;
    }
  });

  const isLocalServer = checkIsLocalServer();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // Create user profile if first time
            const isEmailAdmin = currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Pembaca',
              role: isEmailAdmin ? 'admin' : 'reader',
              contributorStatus: 'none',
              photoURL: currentUser.photoURL || undefined,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not load or create user profile in Firestore:', err);
          setProfile({
            userId: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Pembaca',
            role: currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ? 'admin' : 'reader',
            contributorStatus: 'none'
          });
        }
      } else {
        try {
          const savedSession = localStorage.getItem('kabarglobal_user_session');
          if (savedSession) {
            const parsed = JSON.parse(savedSession) as UserProfile;
            if (parsed && parsed.userId) {
              setProfile(parsed);
              setUser({
                uid: parsed.userId,
                email: parsed.email,
                displayName: parsed.displayName,
                emailVerified: true
              } as any);

              // Background sync latest profile from Firestore (e.g. if admin approved contributor!)
              getDoc(doc(db, 'users', parsed.userId)).then(freshSnap => {
                if (freshSnap.exists()) {
                  const freshProfile = freshSnap.data() as UserProfile;
                  setProfile(freshProfile);
                  localStorage.setItem('kabarglobal_user_session', JSON.stringify(freshProfile));
                }
              }).catch(() => {});
            }
          } else if (!isLocalAdminLoggedIn) {
            setProfile(null);
          }
        } catch {
          if (!isLocalAdminLoggedIn) {
            setProfile(null);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLocalAdminLoggedIn]);

  // Handle local admin profile setup
  useEffect(() => {
    if (isLocalAdminLoggedIn && !user) {
      setProfile({
        userId: 'admin-bencreative-local',
        email: 'bencreative@local.internal',
        displayName: 'bencreative (Super Admin)',
        role: 'admin',
        contributorStatus: 'approved',
        createdAt: new Date().toISOString()
      });
    }
  }, [isLocalAdminLoggedIn, user]);

  const isAdmin = 
    isLocalAdminLoggedIn ||
    devAdminOverride ||
    user?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() || 
    profile?.role === 'admin';

  // Listen to pending contributors if admin
  useEffect(() => {
    if (!isAdmin) {
      setPendingContributors([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'contributor')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as UserProfile);
        });
        setPendingContributors(list);
      }, (err) => {
        console.warn('Pending contributors listener notice:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Contributors query catch', e);
    }
  }, [isAdmin]);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openAdminLoginModal = () => {
    setAdminLoginModalOpen(true);
  };

  const closeAdminLoginModal = () => {
    setAdminLoginModalOpen(false);
  };

  const loginLocalAdmin = (usernameInput: string, passwordInput: string): boolean => {
    if (usernameInput.trim() === 'bencreative' && passwordInput === 'BangsaT220483') {
      setIsLocalAdminLoggedIn(true);
      try {
        localStorage.setItem('kabarglobal_local_admin_session', 'true');
      } catch (e) {
        console.warn('Storage error', e);
      }
      setProfile({
        userId: 'admin-bencreative-local',
        email: 'bencreative@local.internal',
        displayName: 'bencreative (Super Admin)',
        role: 'admin',
        contributorStatus: 'approved',
        createdAt: new Date().toISOString()
      });
      closeAdminLoginModal();
      return true;
    }
    return false;
  };

  const logoutLocalAdmin = () => {
    setIsLocalAdminLoggedIn(false);
    try {
      localStorage.removeItem('kabarglobal_local_admin_session');
    } catch (e) {
      console.warn('Storage error', e);
    }
    if (!user) {
      setProfile(null);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isEmailAdmin = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
      
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProf: UserProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Pengguna Google',
          role: isEmailAdmin ? 'admin' : 'reader',
          contributorStatus: 'none',
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, {
          ...newProf,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setProfile(newProf);
      }
      closeAuthModal();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try standard Firebase Auth first
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      closeAuthModal();
      return;
    } catch (authErr: any) {
      console.warn('Firebase Auth signIn fallback triggered:', authErr?.code || authErr?.message);

      // Check Firestore accounts for registered users
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const existingDocs = await getDocs(q);

      if (existingDocs.empty) {
        const err: any = new Error('Akun dengan email ini belum terdaftar.');
        err.code = 'auth/user-not-found';
        throw err;
      }

      const userDoc = existingDocs.docs[0];
      const userData = userDoc.data() as UserProfile;

      // Verify password hash
      const hashed = await hashPassword(pass);
      if (userData.passwordHash && userData.passwordHash !== hashed) {
        const err: any = new Error('Email atau kata sandi tidak cocok.');
        err.code = 'auth/wrong-password';
        throw err;
      }

      // Successfully authenticated!
      try {
        localStorage.setItem('kabarglobal_user_session', JSON.stringify(userData));
      } catch (e) {
        console.warn('Storage error:', e);
      }

      setProfile(userData);
      setUser({
        uid: userData.userId,
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: true
      } as any);
      closeAuthModal();
    }
  };

  const registerWithEmail = async (params: {
    name: string;
    email: string;
    pass: string;
    role: UserRole;
    contributorBio?: string;
    organization?: string;
  }) => {
    const cleanEmail = params.email.trim().toLowerCase();
    const isEmailAdmin = cleanEmail === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
    
    const finalRole: UserRole = isEmailAdmin ? 'admin' : params.role;
    const contributorStatus: ContributorStatus = 
      finalRole === 'contributor' 
        ? 'pending' // Must be moderated by admin!
        : finalRole === 'admin' 
        ? 'approved' 
        : 'none';

    let uid: string;
    let registeredWithAuthSdk = false;

    // Check if email already registered in Firestore
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const existingDocs = await getDocs(q);
      if (!existingDocs.empty) {
        const err: any = new Error('Email ini sudah terdaftar. Silakan langsung masuk.');
        err.code = 'auth/email-already-in-use';
        throw err;
      }
    } catch (e: any) {
      if (e?.code === 'auth/email-already-in-use') throw e;
      console.warn('Uniqueness check notice:', e);
    }

    // Attempt Firebase Auth SDK creation first
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, params.pass);
      uid = res.user.uid;
      registeredWithAuthSdk = true;
    } catch (authErr: any) {
      console.warn('Firebase Auth createUser fallback triggered:', authErr?.code || authErr?.message);
      
      // If operation is not allowed, admin restricted, or provider disabled in Firebase console, fallback to secure Firestore account record
      if (
        authErr?.code === 'auth/operation-not-allowed' || 
        authErr?.code === 'auth/admin-restricted-operation' ||
        authErr?.code === 'auth/network-request-failed' ||
        String(authErr?.message).includes('operation-not-allowed')
      ) {
        uid = generateUserId();
      } else {
        throw authErr;
      }
    }

    const hashed = await hashPassword(params.pass);

    const newProf: UserProfile = {
      userId: uid,
      email: cleanEmail,
      displayName: params.name || cleanEmail.split('@')[0],
      role: finalRole,
      contributorStatus,
      contributorBio: params.contributorBio || '',
      organization: params.organization || '',
      passwordHash: hashed,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', uid), {
        ...newProf,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving user profile to Firestore:', err);
    }

    // Persist session to localStorage
    try {
      localStorage.setItem('kabarglobal_user_session', JSON.stringify(newProf));
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    setProfile(newProf);
    if (!registeredWithAuthSdk) {
      setUser({
        uid,
        email: cleanEmail,
        displayName: newProf.displayName,
        emailVerified: true
      } as any);
    }
    closeAuthModal();
  };

  const approveContributor = async (targetUserId: string) => {
    try {
      const ref = doc(db, 'users', targetUserId);
      await updateDoc(ref, {
        contributorStatus: 'approved',
        updatedAt: serverTimestamp()
      });
      setPendingContributors(prev => 
        prev.map(p => p.userId === targetUserId ? { ...p, contributorStatus: 'approved' } : p)
      );
      if (profile && profile.userId === targetUserId) {
        setProfile(prev => prev ? { ...prev, contributorStatus: 'approved' } : prev);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  const rejectContributor = async (targetUserId: string) => {
    try {
      const ref = doc(db, 'users', targetUserId);
      await updateDoc(ref, {
        contributorStatus: 'rejected',
        updatedAt: serverTimestamp()
      });
      setPendingContributors(prev => 
        prev.map(p => p.userId === targetUserId ? { ...p, contributorStatus: 'rejected' } : p)
      );
      if (profile && profile.userId === targetUserId) {
        setProfile(prev => prev ? { ...prev, contributorStatus: 'rejected' } : prev);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  const logout = async () => {
    logoutLocalAdmin();
    try {
      localStorage.removeItem('kabarglobal_user_session');
    } catch (e) {
      console.warn('Storage error:', e);
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    setProfile(null);
  };

  const toggleAdminRoleForDev = () => {
    setDevAdminOverride(prev => !prev);
  };

  const isContributor = profile?.role === 'contributor';
  const isApprovedContributor = isAdmin || (profile?.role === 'contributor' && profile?.contributorStatus === 'approved');
  const isAdvertiser = profile?.role === 'advertiser';
  const canManageAds = isAdmin || isAdvertiser;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin,
      isContributor,
      isApprovedContributor,
      isAdvertiser,
      canManageAds,
      isLocalAdminLoggedIn,
      isLocalServer,
      loading,
      authModalOpen,
      authModalMode,
      adminLoginModalOpen,
      pendingContributors,
      openLoginModal,
      openRegisterModal,
      closeAuthModal,
      openAdminLoginModal,
      closeAdminLoginModal,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      approveContributor,
      rejectContributor,
      loginLocalAdmin,
      logoutLocalAdmin,
      logout,
      toggleAdminRoleForDev
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
