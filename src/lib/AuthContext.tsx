import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  divisionId?: string;
  nik?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ADMIN_EMAIL = 'fajrikunmakalalag@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef).catch((error) => {
            return handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          });

          if (docSnap && docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create user profile
            const isDefaultAdmin = firebaseUser.email === ADMIN_EMAIL;
            const newProfile: UserProfile = {
              userId: firebaseUser.uid,
              name: firebaseUser.displayName || 'Unknown User',
              email: firebaseUser.email || '',
              role: isDefaultAdmin ? 'admin' : 'staff',
            };
            
            await setDoc(docRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }).catch((error) => {
              return handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
            });
            
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
