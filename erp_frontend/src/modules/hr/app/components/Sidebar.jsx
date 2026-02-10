import React from 'react';
import {
    Users,
    UserCheck,
    Calendar,
    DollarSign,
    TrendingUp,
    Award,
    BookOpen,
    Heart,
    FileText,
    BarChart3,
    Settings,
    Briefcase,
} from 'lucide-react';

const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: Briefcase, path: '/hr' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/hr/employees' },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, path: '/hr/attendance' },
    { id: 'leave', label: 'Leave Management', icon: Calendar, path: '/hr/leave' },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, path: '/hr/payroll' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, path: '/hr/performance' },
    { id: 'training', label: 'Training & Development', icon: BookOpen, path: '/hr/training' },
    { id: 'benefits', label: 'Benefits', icon: Heart, path: '/hr/benefits' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/hr/documents' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/hr/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/hr/settings' },
];

const Sidebar = ({ activePath, onNavigate }) => {
    return (
        <aside className="w-72 min-h-screen border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
            <div className="px-6 py-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-950" />
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">People</p>
                        <h1 className="text-lg font-semibold">HR Suite</h1>
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
                    <p className="font-semibold text-slate-200">HR Status</p>
                    <p className="mt-2">247 employees • 95% attendance rate</p>
                    <p className="mt-1">3 pending leave requests</p>
                    <button className="mt-3 inline-flex items-center gap-2 text-blue-300">
                        Generate reports
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;