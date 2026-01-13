'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            // Not logged in - redirect to login
            if (!user) {
                router.push(redirectTo);
                return;
            }

            // Logged in but wrong role - redirect to dashboard
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.push('/dashboard');
                return;
            }
        }
    }, [user, isLoading, router, allowedRoles, redirectTo]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authorized
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return null;
    }

    // Authorized - render children
    return <>{children}</>;
}
