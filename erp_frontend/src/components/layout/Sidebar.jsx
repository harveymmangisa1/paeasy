import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Calculator,
    Users,
    User,
    LogOut,
    Building2,
    Briefcase,
    Settings,
    Plus,
    ChevronRight,
    Search,
    Receipt,
    FileText,
    Wallet,
    PieChart,
    Calendar,
    Shield
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [activeModule, setActiveModule] = useState('home');

    // Define Modules
    const modules = [
        { id: 'home', icon: <LayoutDashboard size={22} />, label: 'Home', path: '/dashboard' },
        { id: 'sales', icon: <ShoppingCart size={22} />, label: 'Sales', path: '/sales' },
        { id: 'inventory', icon: <Package size={22} />, label: 'Inventory', path: '/inventory' },
        { id: 'accounting', icon: <Calculator size={22} />, label: 'Accounting', path: '/accounting' },
        { id: 'hr', icon: <Briefcase size={22} />, label: 'Team', path: '/hr' },
        { id: 'crm', icon: <Users size={22} />, label: 'CRM', path: '/crm' },
        { id: 'admin', icon: <Shield size={22} />, label: 'Admin', path: '/users' },
    ];

    // Sub-menus for each module
    const moduleMenus = {
        home: [
            { name: 'Overview', path: '/dashboard', icon: <PieChart size={18} /> },
            { name: 'Reports', path: '/reports', icon: <FileText size={18} /> },
        ],
        sales: [
            { name: 'POS Terminal', path: '/sales', icon: <ShoppingCart size={18} /> },
            { name: 'Sales Manager', path: '/sales-management', icon: <Receipt size={18} /> },
            { name: 'Invoices', path: '/invoices', icon: <FileText size={18} /> },
            { name: 'Customers', path: '/crm', icon: <Users size={18} /> },
        ],
        inventory: [
            { name: 'Overview', path: '/inventory', icon: <Package size={18} /> },
            { name: 'Products', path: '/inventory-management', icon: <Plus size={18} /> },
            { name: 'Transfers', path: '/transfers', icon: <ChevronRight size={18} /> },
        ],
        accounting: [
            { name: 'Dashboard', path: '/accounting', icon: <PieChart size={18} /> },
            { name: 'Chart of Accounts', path: '/accounting-management', icon: <Wallet size={18} /> },
            { name: 'Journal Entries', path: '/journals', icon: <FileText size={18} /> },
            { name: 'Vendors', path: '/vendors', icon: <Briefcase size={18} /> },
            { name: 'Bills', path: '/bills', icon: <Receipt size={18} /> },
        ],
        hr: [
            { name: 'Dashboard', path: '/hr', icon: <Briefcase size={18} /> },
            { name: 'Employees', path: '/hr-management', icon: <Users size={18} /> },
            { name: 'Attendance', path: '/attendance', icon: <Calendar size={18} /> },
        ],
        crm: [
            { name: 'Dashboard', path: '/crm', icon: <PieChart size={18} /> },
            { name: 'CRM Management', path: '/crm-management', icon: <Briefcase size={18} /> },
            { name: 'Activity Log', path: '/logs', icon: <FileText size={18} /> },
        ],
        admin: [
            { name: 'User Management', path: '/users', icon: <Shield size={18} /> },
            { name: 'Enterprise Settings', path: '/settings', icon: <Settings size={18} /> },
        ]
    };

    // Update active module based on route
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/sales')) setActiveModule('sales');
        else if (path.startsWith('/inventory')) setActiveModule('inventory');
        else if (path.startsWith('/accounting')) setActiveModule('accounting');
        else if (path.startsWith('/hr')) setActiveModule('hr');
        else if (path.startsWith('/crm')) setActiveModule('crm');
        else if (path.startsWith('/users')) setActiveModule('admin');
        else setActiveModule('home');
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen fixed left-0 top-0 z-50">
            {/* Module Switcher Rail (Slim) */}
            <div className="w-20 bg-slate-950 flex flex-col items-center py-6 border-r border-slate-800 space-y-4 shadow-2xl">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                    <Building2 size={24} />
                </div>

                {modules.map((mod) => (
                    <Link
                        key={mod.id}
                        to={mod.path}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative group ${activeModule === mod.id
                                ? 'bg-slate-800 text-white shadow-inner'
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
                            }`}
                        title={mod.label}
                    >
                        {mod.icon}
                        {activeModule === mod.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                        )}
                        {/* Tooltip */}
                        <div className="absolute left-16 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {mod.label}
                        </div>
                    </Link>
                ))}

                <div className="mt-auto space-y-4 pb-2">
                    <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white rounded-xl hover:bg-slate-900 transition-all">
                        <Settings size={22} />
                    </button>
                    <button
                        onClick={logout}
                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-red-400 rounded-xl hover:bg-slate-900 transition-all"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </div>

            {/* Content Rail (Module Navigation) */}
            <div className="w-56 bg-white flex flex-col border-r border-slate-100 shadow-sm animate-in slide-in-from-left-2 duration-300">
                <div className="p-6 border-b border-slate-50">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {activeModule}
                    </h2>
                    <div className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                        {modules.find(m => m.id === activeModule)?.label}
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                </div>

                <div className="p-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 mb-6">
                        <Plus size={18} />
                        <span>Quick New</span>
                    </button>

                    <div className="space-y-1">
                        {moduleMenus[activeModule]?.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <span className={isActive(item.path) ? 'text-blue-500' : 'text-slate-400'}>
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold text-slate-900 truncate">{user?.username || 'User'}</div>
                            <div className="text-xs text-slate-500 truncate">{user?.role || 'Staff'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

