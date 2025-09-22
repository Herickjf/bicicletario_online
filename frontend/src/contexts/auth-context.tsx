import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '@/types';
import { set } from 'date-fns';
import { Accessibility } from 'lucide-react';

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
    
    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });


      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
 
      localStorage.setItem("token", data.access_token);

      console.log('Login response data:', data);

      // Atualiza estado com usuário autenticado
      setUser({
        user_id: data.user.user_id,
        name: data.user.name,
        email: data.user.email,
        cpf: data.user.cpf,
        phone: data.user.phone,
        address: data.user.address_id ? {
          address_id: data.user.address_id,
          street: data.user.street,
          num: data.user.num,
          zip_code: data.user.zip_code,
          city: data.user.city,
          state: data.user.state,
        } : undefined,
      } as AuthUser);

      // Salva no localStorage
      localStorage.setItem('user', JSON.stringify(user));

      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    } finally {
      setIsLoading(false);
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