import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random`,
          bio: 'Hey there! I am using Global Messenger.',
          country: 'Unknown',
          status: 'online',
          lastSeen: serverTimestamp(),
          privacy: {
            whoCanMessage: 'everyone',
            showOnlineStatus: true,
          },
        };
        setDoc(doc(db, 'users', user.uid), initialProfile);
      }
      setLoading(false);
    });

    // Update online status
    const updateStatus = async (status: 'online' | 'offline') => {
      await setDoc(doc(db, 'users', user.uid), { 
        status, 
        lastSeen: serverTimestamp() 
      }, { merge: true });
    };

    updateStatus('online');

    const handleVisibilityChange = () => {
      updateStatus(document.visibilityState === 'visible' ? 'online' : 'offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribeProfile();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateStatus('offline');
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
