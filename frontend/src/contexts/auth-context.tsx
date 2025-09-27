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
  authLoading: boolean;
  userRole: UserRole;
  changeUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("customer");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    setAuthLoading(true);

    const userData = JSON.parse(localStorage.getItem('user') || 'null')

    if(!userData) return;

    setUser({
      user_id: Number(userData.user_id),
      name: userData.name,
      email: userData.email,
      cpf: userData.cpf,
      phone: userData.phone,
      address: userData.address_id ? {
        address_id: userData.address_id,
        street: userData.street,
        num: userData.num,
        zip_code: userData.zip_code,
        city: userData.city,
        state: userData.state,
      } : undefined,
    } as AuthUser)
    
    setAuthLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    
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

      // console.log('Login response data:', data);

      // Atualiza estado com usuário autenticado
      const userData = {
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
      };

      setUser(userData as AuthUser);

      // Salva no localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const changeUserRole = (role: UserRole) => {
    setUserRole(role);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading, userRole, changeUserRole }}>
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