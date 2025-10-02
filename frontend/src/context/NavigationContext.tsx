'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationContextState {
  allowedPaths: Record<string, boolean>;
  allowNavigation: (path: string) => void;
  isNavigationAllowed: (path: string) => boolean;
  clearAllowedPaths: () => void;
}

const NavigationContext = createContext<NavigationContextState | undefined>(undefined);

function NavigationProviderContent({ children }: { children: ReactNode }): React.ReactElement {
  const [allowedPaths, setAllowedPaths] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === '/reset-password') {
      const email = searchParams.get('email');
      const code = searchParams.get('code');
      
      if (email && code) {
        setAllowedPaths((prev) => ({
          ...prev,
          [`/reset-password?email=${encodeURIComponent(email)}&code=${code}`]: true,
        }));
      }
    }
  }, [pathname, searchParams]);

  const allowNavigation = (path: string): void => {
    setAllowedPaths((prev) => ({
      ...prev,
      [path]: true,
    }));
  };

  const isNavigationAllowed = (path: string): boolean => {
    if (path.startsWith('/reset-password?')) {
      const url = new URL(path, 'http://localhost');
      const email = url.searchParams.get('email');
      const code = url.searchParams.get('code');
      
      if (email && code) return true;
    }
    
    return !!allowedPaths[path];
  };

  const clearAllowedPaths = (): void => {
    setAllowedPaths({});
  };

  const value: NavigationContextState = {
    allowedPaths,
    allowNavigation,
    isNavigationAllowed,
    clearAllowedPaths,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function NavigationProvider({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <NavigationProviderContent>{children}</NavigationProviderContent>
    </Suspense>
  );
}

export function useNavigation(): NavigationContextState {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
} 