"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, fetchCurrentUser, login as apiLogin, logout as apiLogout, signup as apiSignup, LoginCredentials, SignupCredentials } from '@/lib/api/auth'; // Assuming @ is src path

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  // No need to explicitly call fetchCurrentUser from outside, context handles it.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user on mount:", error);
        setUser(null); // Ensure user is null on error
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loggedInUser = await apiLogin(credentials);
      setUser(loggedInUser);
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      throw error; // Re-throw to be caught by UI
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    try {
      const signedUpUser = await apiSignup(credentials);
      // Typically after signup, you might want to log them in automatically
      // or redirect to login. For now, just set user.
      setUser(signedUpUser); 
      // Or, fetch current user again if signup doesn't return full session info
      // const currentUser = await fetchCurrentUser();
      // setUser(currentUser);
    } catch (error) {
      console.error("Signup failed:", error);
      setUser(null);
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API logout fails, clear user from frontend
      setUser(null); 
      throw error; // Re-throw
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};