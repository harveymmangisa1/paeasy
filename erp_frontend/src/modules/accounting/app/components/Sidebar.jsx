import React from 'react';
import {
    BarChart3,
    BookOpen,
    BriefcaseBusiness,
    ClipboardList,
    Landmark,
    LayoutDashboard,
    Settings,
    Wallet,
} from 'lucide-react';

const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/accounting' },
    { id: 'accounts', label: 'Chart of Accounts', icon: BookOpen, path: '/accounting/accounts' },
    { id: 'journal', label: 'Journal Entries', icon: ClipboardList, path: '/accounting/journal' },
    { id: 'ledger', label: 'General Ledger', icon: BriefcaseBusiness, path: '/accounting/ledger' },
    { id: 'assets', label: 'Asset Registry', icon: BriefcaseBusiness, path: '/accounting/assets' },
    { id: 'receivables', label: 'Accounts Receivable', icon: BriefcaseBusiness, path: '/accounting/receivables' },
    { id: 'bills', label: 'Bills & Vendors', icon: Wallet, path: '/accounting/bills' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/accounting/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/accounting/settings' },
];

const Sidebar = ({ activePath, onNavigate }) => {
    return (
        <aside className="w-72 min-h-screen border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            <div className="px-6 py-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center">
                        <Landmark className="h-5 w-5 text-slate-950" />
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Ledger</p>
                        <h1 className="text-lg font-semibold">Accounting Suite</h1>
                    </div>
                </div>
            </div>
            <nav className="px-4 space-y-1">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePath === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                                isActive
                                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-950/50'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="px-6 py-6 mt-10">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">Status</p>
                    <p className="mt-2">All ledgers balanced. Last sync: 2 hours ago.</p>
                    <button className="mt-3 inline-flex items-center gap-2 text-amber-300">
                        Export statements
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
