import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '@/types';
import { set } from 'date-fns';

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
      const response = await fetch('http://localhost:4000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      console.log('Login response data:', data);

      // Atualiza estado com usuário autenticado
      setUser({
        role: data[0].role,
        bike_rack_id: data[0].bike_rack_id,
        user_id: data[0].user_id,
        name: data[0].name,
        email: data[0].email,
        cpf: data[0].cpf,
        phone: data[0].phone,
        address: data[0].address_id ? {
          address_id: data[0].address_id,
          street: data[0].street,
          num: data[0].num,
          zip_code: data[0].zip_code,
          city: data[0].city,
          state: data[0].state,
        } : undefined,
      } as AuthUser);

      // Salva no localStorage
      localStorage.setItem('bikerack_user', JSON.stringify(user));

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