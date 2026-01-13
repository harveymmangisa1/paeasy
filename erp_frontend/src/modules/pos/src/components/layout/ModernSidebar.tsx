'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { canAccessRoute } from '@/lib/permissions';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    BarChart3,
    Users,
    Settings,
    AlertCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    HelpCircle,
    FileText,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db/database';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'super_admin', 'manager'] },
    { name: 'Sales', href: '/sales', icon: ShoppingCart, roles: ['admin', 'super_admin', 'manager', 'cashier'] },
    { name: 'Quotations', href: '/quotations', icon: FileText, roles: ['admin', 'super_admin', 'manager', 'cashier'] },
    { name: 'Inventory', href: '/inventory', icon: Package, roles: ['admin', 'super_admin', 'manager'] },
    { name: 'Returns', href: '/returns', icon: RotateCcw, roles: ['admin', 'super_admin', 'manager', 'cashier'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'super_admin', 'manager'] },
    { name: 'Daily Report', href: '/daily-report', icon: FileText, roles: ['admin', 'super_admin', 'manager', 'cashier'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin', 'super_admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'super_admin'] },
    { name: 'Support', href: '/support', icon: AlertCircle, roles: ['admin', 'super_admin', 'manager', 'cashier'] },
    { name: 'Help', href: '/help', icon: HelpCircle, roles: ['admin', 'super_admin', 'manager', 'cashier'] },
];

export function ModernSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [shopName, setShopName] = useState('PaeasyShop');
    const pathname = usePathname();
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchShopInfo = async () => {
            const settings = await db.shopSettings.toCollection().first();
            if (settings) {
                setLogoUrl(settings.logo || null);
                setShopName(settings.shopName);
            }
        };
        fetchShopInfo();
    }, []);

    if (!user) return null;

    const visibleNav = navigation.filter(item =>
        !item.roles || item.roles.includes(user.role)
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out z-40 flex flex-col',
                    collapsed ? 'w-16' : 'w-64',
                    'shadow-2xl'
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        {!collapsed && (
                            <div>
                                {logoUrl ? (
                                    <img src={logoUrl} alt={shopName} className="h-10 w-auto" />
                                ) : (
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        {shopName}
                                    </h1>
                                )}
                                <p className="text-xs text-slate-400 mt-0.5">{user.role.replace('_', ' ').toUpperCase()}</p>
                            </div>
                        )}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors hidden lg:block"
                        >
                            {collapsed ? (
                                <ChevronRight className="h-5 w-5" />
                            ) : (
                                <ChevronLeft className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* User Info */}
                {!collapsed && (
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user.username}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {visibleNav.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                                    collapsed && 'justify-center'
                                )}
                                title={collapsed ? item.name : undefined}
                            >
                                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'animate-pulse')} />
                                {!collapsed && (
                                    <span className="text-sm font-medium">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer - Logout */}
                <div className="p-3 border-t border-slate-700">
                    <button
                        onClick={logout}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200',
                            collapsed && 'justify-center'
                        )}
                        title={collapsed ? 'Logout' : undefined}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Spacer for content */}
            <div className={cn('transition-all duration-300 flex-shrink-0', collapsed ? 'w-16' : 'w-64')} />
        </>
    );
}
