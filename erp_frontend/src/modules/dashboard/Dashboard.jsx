import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useApi';

const KpiCard = ({ title, value, icon, color }) => (
    <div className="glass-card p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
            {icon}
        </div>
        <div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const Dashboard = ({ industry = 'retail' }) => {
    const { stats, loading, error } = useDashboardStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-bold">Error loading dashboard</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    const salesTrend = stats?.sales_trend || [];

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Enterprise Overview</h1>
                <div className="flex space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Branch: HQ - New York</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title="Total Revenue"
                    value={`$${stats?.total_revenue?.toLocaleString() || '0'}`}
                    icon={<DollarSign size={24} />}
                    color="bg-emerald-500"
                />
                <KpiCard
                    title="Total Sales"
                    value={`${stats?.total_sales || 0}`}
                    icon={<Users size={24} />}
                    color="bg-blue-500"
                />
                <KpiCard
                    title="Low Stock Items"
                    value={`${stats?.low_stock_count || 0}`}
                    icon={<Package size={24} />}
                    color="bg-orange-500"
                />
                <KpiCard
                    title="Growth"
                    value="+12.5%"
                    icon={<TrendingUp size={24} />}
                    color="bg-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <h2 className="text-lg font-bold mb-6">Sales Performance</h2>
                    <div className="h-[300px]">
                        {salesTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrend}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                No sales data available
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold mb-4">Quick Activities</h2>
                    <div className="space-y-4">
                        <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                            <p className="font-medium text-slate-900">Initiate Stock Transfer</p>
                            <p className="text-sm text-slate-500">Move items between HQ and Brooklyn</p>
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                            <p className="font-medium text-slate-900">Generate Payroll</p>
                            <p className="text-sm text-slate-500">Run calculations for Jan 2025</p>
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                            <p className="font-medium text-slate-900">POS Health Check</p>
                            <p className="text-sm text-slate-500">Review device sync status</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
