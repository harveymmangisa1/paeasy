'use client';

import { useAuth } from '@/lib/auth';
import { ModernSidebar } from './ModernSidebar';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getHomeRoute } from '@/lib/permissions';

interface ModernLayoutProps {
    children: React.ReactNode;
    fullWidth?: boolean; // For POS mode
}

export function ModernLayout({ children, fullWidth = false }: ModernLayoutProps) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, isLoading, pathname, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't show sidebar on login page
    if (pathname === '/login' || !user) {
        return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{children}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            <ModernSidebar />
            <main className={cn("flex-1 min-w-0", fullWidth ? 'ml-0' : '')}>
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
