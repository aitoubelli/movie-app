"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  userRole: 'user' | 'admin' | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error registering with email:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const refreshUserRole = async () => {
    if (!user) {
      setUserRole(null);
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setUserRole(profileData.role);
      } else {
        console.error('Failed to fetch user role');
        setUserRole('user'); // Default to user role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to user role
    }
  };

  // Fetch user role when user changes
  useEffect(() => {
    if (user) {
      refreshUserRole();
    } else {
      setUserRole(null);
    }
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
