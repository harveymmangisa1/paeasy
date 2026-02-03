import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, Users, Package, DollarSign, ArrowUpRight, ArrowDownRight,
  Calendar, Settings, Bell, Search, ChevronRight, Download,
  ShoppingCart, CreditCard, UserPlus, AlertTriangle,
  Building, RefreshCw, MoreVertical, FileText, TrendingDown
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useApi';

const KpiCard = ({ title, value, change, icon, color, trend }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <div className={color.replace('bg-', 'text-')}>
            {icon}
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isPositive ?
              <TrendingUp size={12} className="text-emerald-500" /> :
              <TrendingDown size={12} className="text-red-500" />
            }
            <span>{trend}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityButton = ({ title, description, icon, color }) => (
  <button className="group w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all duration-200">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <div className={color.replace('bg-', 'text-')}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 group-hover:text-blue-600">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
    </div>
  </button>
);

const Dashboard = ({ industry = 'retail' }) => {
  const { stats, loading, error, refetch } = useDashboardStats();
  const [timeRange, setTimeRange] = useState('monthly');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold text-red-700 mb-2">Error loading dashboard</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const salesTrend = stats?.sales_trend || [];
  const departmentData = [
    { name: 'Sales', value: 35, color: '#3b82f6' },
    { name: 'Operations', value: 25, color: '#10b981' },
    { name: 'HR', value: 20, color: '#8b5cf6' },
    { name: 'Finance', value: 15, color: '#f59e0b' },
    { name: 'IT', value: 5, color: '#ef4444' },
  ];

  const recentActivities = [
    { id: 1, user: 'Sarah Chen', action: 'approved invoice', time: '10 min ago', type: 'finance' },
    { id: 2, user: 'Mike Rodriguez', action: 'updated inventory', time: '25 min ago', type: 'stock' },
    { id: 3, user: 'Emma Wilson', action: 'processed payroll', time: '1 hour ago', type: 'hr' },
    { id: 4, user: 'David Park', action: 'closed deal', time: '2 hours ago', type: 'sales' },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  System Status: Normal
                </span>
                <span>•</span>
                <span>Last updated: Just now</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reports, metrics..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Branch & Time Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <Building size={16} />
            <span className="font-medium">HQ - New York</span>
            <ChevronRight size={16} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>Jan 1 - Jan 31, 2025</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Download size={14} />
            Export
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['daily', 'weekly', 'monthly', 'quarterly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          change={12.5}
          icon={<DollarSign size={20} />}
          color="bg-emerald-500"
          trend="vs previous month"
        />
        <KpiCard
          title="Total Sales"
          value={(stats?.total_sales || 0).toLocaleString()}
          change={8.2}
          icon={<ShoppingCart size={20} />}
          color="bg-blue-500"
          trend="+142 this month"
        />
        <KpiCard
          title="Active Employees"
          value={(stats?.active_employees || 245).toLocaleString()}
          change={-2.1}
          icon={<Users size={20} />}
          color="bg-purple-500"
          trend="3 new hires pending"
        />
        <KpiCard
          title="Low Stock Items"
          value={(stats?.low_stock_count || 0).toLocaleString()}
          change={15.3}
          icon={<Package size={20} />}
          color="bg-amber-500"
          trend="Needs attention"
        />
      </div>

      {/* Charts & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sales Performance</h2>
              <p className="text-sm text-gray-500">Revenue trends over time</p>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="h-[300px]">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">5 pending</span>
            </div>
            <div className="space-y-3">
              <ActivityButton
                title="Initiate Stock Transfer"
                description="Move items between HQ and Brooklyn"
                icon={<Package size={18} />}
                color="bg-blue-500"
              />
              <ActivityButton
                title="Generate Payroll"
                description="Run calculations for Jan 2025"
                icon={<CreditCard size={18} />}
                color="bg-emerald-500"
              />
              <ActivityButton
                title="POS Health Check"
                description="Review device sync status"
                icon={<ShoppingCart size={18} />}
                color="bg-amber-500"
              />
              <ActivityButton
                title="Onboard New Employee"
                description="Complete HR documentation"
                icon={<UserPlus size={18} />}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Department Distribution</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-gray-600">{dept.name}</span>
                  <span className="ml-auto font-medium">{dept.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & Top Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${activity.type === 'finance' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'stock' ? 'bg-emerald-100 text-emerald-700' :
                      activity.type === 'hr' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                  }`}>
                  {activity.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Invoice Turnaround</p>
                <p className="text-lg font-bold text-gray-900">2.3 days</p>
              </div>
              <div className="text-emerald-600 flex items-center gap-1">
                <ArrowUpRight size={16} />
                <span className="text-sm">18% faster</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Employee Satisfaction</p>
                <p className="text-lg font-bold text-gray-900">89%</p>
              </div>
              <div className="text-emerald-600 flex items-center gap-1">
                <ArrowUpRight size={16} />
                <span className="text-sm">+5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-500">Stock Accuracy</p>
                <p className="text-lg font-bold text-gray-900">97.5%</p>
              </div>
              <div className="text-red-600 flex items-center gap-1">
                <ArrowDownRight size={16} />
                <span className="text-sm">-1.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        <p>Data refreshes automatically every 15 minutes • Last full sync: Today, 09:45 AM</p>
      </div>
    </div>
  );
};

export default Dashboard;