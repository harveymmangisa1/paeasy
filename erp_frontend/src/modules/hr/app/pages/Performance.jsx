import React, { useState } from 'react';
import { TrendingUp, Award, Star, Target, Filter, Search, Download, Calendar, User, BarChart3 } from 'lucide-react';

const Performance = ({ performance, employees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('2025-Q4');
    const [selectedRating, setSelectedRating] = useState('all');

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    };

    const getEmployeeDepartment = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.department : 'Unknown';
    };

    const filteredPerformance = performance.filter(record => {
        const employeeMatch = selectedEmployee === 'all' || record.employeeId === selectedEmployee;
        const periodMatch = selectedPeriod === 'all' || record.reviewPeriod === selectedPeriod;
        return employeeMatch && periodMatch;
    });

    const getRatingStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'bg-green-100 text-green-700';
        if (rating >= 3.5) return 'bg-blue-100 text-blue-700';
        if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const performanceStats = {
        totalReviews: filteredPerformance.length,
        averageRating: filteredPerformance.reduce((sum, p) => sum + p.overallRating, 0) / filteredPerformance.length || 0,
        topPerformers: filteredPerformance.filter(p => p.overallRating >= 4.5).length,
        needsImprovement: filteredPerformance.filter(p => p.overallRating < 3.0).length,
    };

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: filteredPerformance.filter(p => Math.floor(p.overallRating) === rating).length,
        percentage: (filteredPerformance.filter(p => Math.floor(p.overallRating) === rating).length / filteredPerformance.length * 100) || 0,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Performance Management</h1>
                    <p className="text-sm text-slate-500">Track and manage employee performance reviews</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <Award size={18} />
                        <span>New Review</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Reviews</p>
                        <Award className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">{performanceStats.totalReviews}</p>
                    <p className="mt-2 text-xs text-slate-500">This period</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Average Rating</p>
                        <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">{performanceStats.averageRating.toFixed(1)}</p>
                    <div className="mt-2 flex">{getRatingStars(Math.round(performanceStats.averageRating))}</div>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Top Performers</p>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-green-600">{performanceStats.topPerformers}</p>
                    <p className="mt-2 text-xs text-slate-500">4.5+ rating</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Needs Improvement</p>
                        <Target className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-red-600">{performanceStats.needsImprovement}</p>
                    <p className="mt-2 text-xs text-slate-500">Below 3.0 rating</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Filters:</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Periods</option>
                            <option value="2025-Q4">Q4 2025</option>
                            <option value="2025-Q3">Q3 2025</option>
                            <option value="2025-Q2">Q2 2025</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Reviews */}
                <div className="lg:col-span-2 glass-card">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">Performance Reviews</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {filteredPerformance.map((review) => (
                            <div key={review.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{getEmployeeName(review.employeeId)}</h3>
                                        <p className="text-sm text-slate-500">{getEmployeeDepartment(review.employeeId)} • {review.reviewPeriod}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.overallRating)}`}>
                                        {review.overallRating.toFixed(1)}
                                    </span>
                                </div>
                                
                                <div className="mb-3">
                                    <div className="flex items-center space-x-1">
                                        {getRatingStars(Math.round(review.overallRating))}
                                        <span className="ml-2 text-sm text-slate-600">{review.overallRating.toFixed(1)} out of 5</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Technical Skills</span>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-blue-500 h-1.5 rounded-full" 
                                                    style={{ width: `${(review.technicalSkills / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-600">{review.technicalSkills.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Communication</span>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-green-500 h-1.5 rounded-full" 
                                                    style={{ width: `${(review.communication / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-600">{review.communication.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Teamwork</span>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-purple-500 h-1.5 rounded-full" 
                                                    style={{ width: `${(review.teamwork / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-600">{review.teamwork.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Leadership</span>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-orange-500 h-1.5 rounded-full" 
                                                    style={{ width: `${(review.leadership / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-600">{review.leadership.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-slate-600 italic">"{review.comments}"</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <span className="text-xs text-slate-400">Reviewed by: {review.reviewer}</span>
                                        <span className="text-xs text-slate-400">• {review.reviewDate}</span>
                                    </div>
                                    <button className="text-sm text-primary-600 hover:underline">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="glass-card">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">Rating Distribution</h2>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            {ratingDistribution.map((item) => (
                                <div key={item.rating} className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1 w-12">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm font-medium text-slate-700">{item.rating}</span>
                                    </div>
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                        <div 
                                            className="bg-yellow-400 h-2 rounded-full" 
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-slate-600 w-12 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Overview */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Goals Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPerformance.slice(0, 3).map((review) => (
                        <div key={review.id} className="p-4 rounded-xl border border-slate-100">
                            <h4 className="font-medium text-slate-800 mb-3">{getEmployeeName(review.employeeId)}</h4>
                            <div className="space-y-2">
                                {review.goals.map((goal, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 truncate">{goal.goal}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            goal.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {goal.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Performance;