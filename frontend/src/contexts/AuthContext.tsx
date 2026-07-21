import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { loadUsers } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoAccounts: Record<string, string> = {
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
    const found = loadUsers().find(
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

  const switchRole = (role: string) => {
    // Try to find a demo user for this role
    const email = demoAccounts[role];
    if (email) {
      const found = loadUsers().find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (found) {
        setUser(found);
        localStorage.setItem('dti_user', JSON.stringify(found));
        return;
      }
    }

    // For custom roles without a demo user — create a virtual session
    const virtualUser: User = {
      id: `VIRTUAL_${role}`,
      firstName: 'Test',
      lastName: 'User',
      email: `${role}@test.com`,
      role: role as Role,
      status: 'active',
      organization: 'DynamicTI',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUser(virtualUser);
    localStorage.setItem('dti_user', JSON.stringify(virtualUser));
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
