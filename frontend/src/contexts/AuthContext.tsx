import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { auth as firebaseAuth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: 'free' | 'pro' | 'teams';
    status: 'active' | 'inactive';
  };
  githubProfile?: {
    username: string;
    url: string;
    connectedAt: string;
  };
  githubConnected: boolean;
  linkedInProfile?: string;
  linkedInLastUpdated?: string;
  transformedResume?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    education: Array<{
      institution: string;
      degree: string;
      startDate: string;
      endDate: string;
      gpa?: string;
      coursework?: string;
    }>;
    experience: Array<{
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      highlights: string[];
    }>;
    projects: Array<{
      name: string;
      date?: string;
      link?: string;
      description: string[];
      technologies?: string;
    }>;
    skills: Array<{
      category: string;
      items: string;
    }>;
    updatedAt: Date;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  loginWithFirebase: () => Promise<void>;
  logoutWithFirebase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    const response = await api.getProfile(localStorage.getItem('token') || '');
    if (response.data?.user) {
      setUser(response.data.user);
    }
  };

  const loginWithFirebase = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser: FirebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      // Send the ID token to the backend to get JWT and user info
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Failed to login with Firebase');
      }
      const data = await response.json();
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (error) {
      console.error('Firebase login error:', error);
      throw error;
    }
  };

  const logoutWithFirebase = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
      logout();
    } catch (error) {
      console.error('Firebase logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, refreshProfile, loginWithFirebase, logoutWithFirebase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 