'use client';

import React, { createContext, useContext } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';

export interface AppUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  user_metadata?: {
    username?: string;
  };
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  user: null,
  loading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthConsumer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  const user: AppUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        user_metadata: {
          username: session.user.name || session.user.email?.split('@')[0],
        },
      }
    : null;

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session?.user),
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthConsumer>{children}</AuthConsumer>
    </SessionProvider>
  );
}
