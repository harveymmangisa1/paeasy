'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import LandingPage from './landing/page';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect logged-in users to dashboard
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // If user is logged in, show loading screen while redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PaeasyShop...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show landing page
  return <LandingPage />;
}