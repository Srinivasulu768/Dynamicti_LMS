import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import usersData from '@/mock/users.json';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoAccounts: Record<Role, string> = {
  super_admin: 'marcus.anderson@test.com',
  training_admin: 'sarah.mitchell@test.com',
  content_manager: 'david.chen@test.com',
  instructor: 'james.rodriguez@test.com',
  org_admin: 'linda.thompson@test.com',
  learner: 'michael.johnson@test.com',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('dti_user');
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!user;

  const login = (email: string, _password: string): boolean => {
    const found = (usersData as User[]).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setUser(found);
      localStorage.setItem('dti_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dti_user');
  };

  const switchRole = (role: Role) => {
    const email = demoAccounts[role];
    const found = (usersData as User[]).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (found) {
      setUser(found);
      localStorage.setItem('dti_user', JSON.stringify(found));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { demoAccounts };
