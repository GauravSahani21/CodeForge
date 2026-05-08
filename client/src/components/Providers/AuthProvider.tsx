'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadFromStorage, user, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    // If we're on a protected path and user is not logged in after loading
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!isPublic && !user && !isLoading) {
      // Check storage again just in case (hydration check)
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('cf_token') : null;
      if (!token) {
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
