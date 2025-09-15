import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '@/types';

interface AuthUser extends User {
  role: UserRole;
  bike_rack_id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated auth check - replace with real API call
    const savedUser = localStorage.getItem('bikerack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulated login - replace with real API call
    try {
      // Mock user data for demo
      const mockUser: AuthUser = {
        user_id: 1,
        name: 'João Silva',
        email: email,
        cpf: '12345678901',
        phone: '11999999999',
        address_id: 1,
        role: 'owner', // You can change this to test different roles
        bike_rack_id: 1,
      };
      
      setUser(mockUser);
      localStorage.setItem('bikerack_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bikerack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}