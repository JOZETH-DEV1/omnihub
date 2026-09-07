"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch or create user profile in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || "Usuario Nuevo",
            username: `user_${currentUser.uid.substring(0, 6)}`,
            photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
            bio: "Explorando las profundidades de Omnihub.",
            isVerified: false,
            followersCount: 0,
            followingCount: 0
          };
          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp()
          });
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
