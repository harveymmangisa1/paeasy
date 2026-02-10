import React from 'react';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Award, AlertCircle, Clock, Briefcase } from 'lucide-react';

const Overview = ({ employees, payroll, leaveRequests }) => {
    const stats = [
        {
            label: 'Total Employees',
            value: employees.length,
            icon: Users,
            change: '+12%',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: 'Active Today',
            value: employees.filter(e => e.status === 'active').length,
            icon: UserCheck,
            change: '+5%',
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
        },
        {
            label: 'Pending Leave',
            value: leaveRequests.filter(l => l.status === 'pending').length,
            icon: Calendar,
            change: '-2%',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
        },
        {
            label: 'Monthly Payroll',
            value: `$${(payroll.reduce((sum, p) => sum + p.netPay, 0) / 1000).toFixed(1)}k`,
            icon: DollarSign,
            change: '+8%',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
    ];

    const recentActivities = [
        { id: 1, type: 'hire', employee: 'Sarah Johnson', action: 'Started as Senior Developer', time: '2 hours ago', icon: Users },
        { id: 2, type: 'leave', employee: 'Mike Chen', action: 'Annual leave approved', time: '4 hours ago', icon: Calendar },
        { id: 3, type: 'payroll', employee: 'All Staff', action: 'January payroll processed', time: '1 day ago', icon: DollarSign },
        { id: 4, type: 'review', employee: 'Emily Davis', action: 'Performance review completed', time: '2 days ago', icon: Award },
    ];

    const upcomingEvents = [
        { id: 1, type: 'review', title: 'Q1 Performance Reviews', date: '2026-02-15', participants: 24, icon: Award },
        { id: 2, type: 'training', title: 'Leadership Training', date: '2026-02-18', participants: 12, icon: Briefcase },
        { id: 3, type: 'payroll', title: 'February Payroll', date: '2026-02-25', participants: employees.length, icon: DollarSign },
    ];

    const departmentStats = [
        { name: 'Engineering', employees: 45, avgSalary: 95000, openPositions: 3 },
        { name: 'Marketing', employees: 12, avgSalary: 75000, openPositions: 1 },
        { name: 'Sales', employees: 28, avgSalary: 72000, openPositions: 2 },
        { name: 'HR', employees: 8, avgSalary: 78000, openPositions: 0 },
        { name: 'Finance', employees: 15, avgSalary: 85000, openPositions: 1 },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">{stat.label}</p>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="mt-4 text-2xl font-semibold text-slate-900">{stat.value}</p>
                            <p className="mt-2 text-xs text-slate-500">{stat.change} from last month</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2 glass-card">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-primary-500" />
                            <span>Recent Activities</span>
                        </h2>
                        <button className="text-sm text-primary-600 hover:underline">View All</button>
                    </div>
                    <div className="p-4 space-y-4">
                        {recentActivities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${
                                            activity.type === 'hire' ? 'bg-green-100' :
                                            activity.type === 'leave' ? 'bg-yellow-100' :
                                            activity.type === 'payroll' ? 'bg-blue-100' :
                                            'bg-purple-100'
                                        }`}>
                                            <Icon className={`h-4 w-4 ${
                                                activity.type === 'hire' ? 'text-green-600' :
                                                activity.type === 'leave' ? 'text-yellow-600' :
                                                activity.type === 'payroll' ? 'text-blue-600' :
                                                'text-purple-600'
                                            }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{activity.employee}</p>
                                            <p className="text-sm text-slate-500">{activity.action}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="glass-card">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            <span>Upcoming Events</span>
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {upcomingEvents.map((event) => {
                            const Icon = event.icon;
                            return (
                                <div key={event.id} className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Icon className="h-4 w-4 text-slate-400" />
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                event.type === 'review' ? 'bg-purple-100 text-purple-700' :
                                                event.type === 'training' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {event.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">{event.date}</p>
                                    </div>
                                    <p className="font-medium text-slate-800">{event.title}</p>
                                    <p className="text-sm text-slate-500">{event.participants} participants</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Department Overview */}
            <div className="glass-card">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold flex items-center space-x-2">
                        <Briefcase className="h-5 w-5 text-indigo-500" />
                        <span>Department Overview</span>
                    </h2>
                    <button className="text-sm text-primary-600 hover:underline">View Details</button>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {departmentStats.map((dept) => (
                            <div key={dept.name} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Employees</span>
                                        <span className="font-medium text-slate-700">{dept.employees}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Avg Salary</span>
                                        <span className="font-medium text-slate-700">${(dept.avgSalary / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Open Roles</span>
                                        <span className="font-medium text-orange-600">{dept.openPositions}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Required */}
            <div className="glass-card">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span>Action Required</span>
                    </h2>
                </div>
                <div className="p-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                            <div>
                                <p className="font-medium text-red-800">{leaveRequests.filter(l => l.status === 'pending').length} Pending Leave Requests</p>
                                <p className="text-sm text-red-600">Requires approval by end of week</p>
                            </div>
                            <button className="text-sm font-bold text-red-600 hover:underline">Review</button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                            <div>
                                <p className="font-medium text-yellow-800">Contract Renewals</p>
                                <p className="text-sm text-yellow-600">5 contracts expiring this month</p>
                            </div>
                            <button className="text-sm font-bold text-yellow-600 hover:underline">View</button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div>
                                <p className="font-medium text-blue-800">Onboarding Tasks</p>
                                <p className="text-sm text-blue-600">3 new employees need onboarding completion</p>
                            </div>
                            <button className="text-sm font-bold text-blue-600 hover:underline">Complete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;