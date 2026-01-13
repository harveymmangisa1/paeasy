import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Calculator,
    Users,
    User, // Added import
    Smartphone,
    BarChart3,
    LogOut,
    Building2
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Inventory', icon: <Package size={20} />, path: '/inventory' },
        { name: 'Sales & POS', icon: <ShoppingCart size={20} />, path: '/sales' },
        { name: 'Accounting', icon: <Calculator size={20} />, path: '/accounting' },
        { name: 'CRM & B2B', icon: <User size={20} />, path: '/crm' },
        { name: 'HR Management', icon: <Users size={20} />, path: '/hr' },
        { name: 'POS Sync', icon: <Smartphone size={20} />, path: '/pos' },
        { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
    ];

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="w-64 bg-slate-900 h-screen text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white mb-1">
                    <div className="bg-blue-600 p-1 rounded-md">
                        <Building2 size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Paeasy</span>
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-8">
                    {user?.tenant_id ? 'Tenant Portal' : 'ERP System'}
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 mt-2">
                    Main Menu
                </div>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className={isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{user?.username || 'User'}</div>
                        <div className="text-xs text-slate-500 truncate">{user?.role || 'Staff'}</div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/20"
                >
                    <LogOut size={16} />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
