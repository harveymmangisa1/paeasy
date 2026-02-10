import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, DollarSign, FileText, PieChart, Activity } from 'lucide-react';

const Reports = ({ employees, payroll, attendance }) => {
    const [selectedReport, setSelectedReport] = useState('overview');
    const [selectedPeriod, setSelectedPeriod] = useState('2026-01');

    const reportTypes = [
        { id: 'overview', name: 'HR Overview', icon: BarChart3 },
        { id: 'headcount', name: 'Headcount Analysis', icon: Users },
        { id: 'payroll', name: 'Payroll Summary', icon: DollarSign },
        { id: 'attendance', name: 'Attendance Report', icon: Activity },
        { id: 'turnover', name: 'Turnover Analysis', icon: TrendingUp },
        { id: 'benefits', name: 'Benefits Utilization', icon: PieChart },
    ];

    const generateReport = () => {
        // In a real app, this would generate and download a report
        alert(`Generating ${selectedReport} report for ${selectedPeriod}...`);
    };

    const headcountData = {
        total: employees.length,
        byDepartment: employees.reduce((acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
            return acc;
        }, {}),
        byStatus: employees.reduce((acc, emp) => {
            acc[emp.status] = (acc[emp.status] || 0) + 1;
            return acc;
        }, {}),
        byEmploymentType: employees.reduce((acc, emp) => {
            acc[emp.employmentType] = (acc[emp.employmentType] || 0) + 1;
            return acc;
        }, {}),
    };

    const payrollData = {
        totalPayroll: payroll.reduce((sum, p) => sum + p.netPay, 0),
        averageSalary: payroll.reduce((sum, p) => sum + p.baseSalary, 0) / payroll.length || 0,
        totalDeductions: payroll.reduce((sum, p) => sum + (p.federalTax + p.stateTax + p.socialSecurity + p.medicare + p.otherDeductions), 0),
        totalOvertime: payroll.reduce((sum, p) => sum + p.overtime, 0),
        totalBonuses: payroll.reduce((sum, p) => sum + p.bonuses, 0),
    };

    const attendanceData = {
        totalRecords: attendance.length,
        averageAttendance: attendance.filter(a => a.status === 'present').length / attendance.length * 100 || 0,
        averageHours: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0) / attendance.length || 0,
        totalOvertime: attendance.reduce((sum, a) => sum + (a.overtime || 0), 0),
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">HR Reports</h1>
                    <p className="text-sm text-slate-500">Generate comprehensive HR reports and analytics</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Calendar size={18} />
                        <span>Schedule Report</span>
                    </button>
                    <button 
                        onClick={generateReport}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Download size={18} />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Report Selection */}
            <div className="glass-card p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {reportTypes.map((report) => {
                        const Icon = report.icon;
                        return (
                            <button
                                key={report.id}
                                onClick={() => setSelectedReport(report.id)}
                                className={`p-4 rounded-xl border transition-all ${
                                    selectedReport === report.id
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                            >
                                <Icon className="h-6 w-6 mx-auto mb-2" />
                                <p className="text-sm font-medium">{report.name}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Period Selection */}
            <div className="glass-card p-4">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-slate-600">Report Period:</label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="2026-01">January 2026</option>
                        <option value="2025-12">December 2025</option>
                        <option value="2025-Q4">Q4 2025</option>
                        <option value="2025">2025 Full Year</option>
                    </select>
                </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
                {selectedReport === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="glass-card p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">Total Employees</p>
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <p className="mt-4 text-2xl font-semibold text-slate-900">{headcountData.total}</p>
                            </div>
                            <div className="glass-card p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">Total Payroll</p>
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                </div>
                                <p className="mt-4 text-2xl font-semibold text-slate-900">${(payrollData.totalPayroll / 1000).toFixed(1)}k</p>
                            </div>
                            <div className="glass-card p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">Attendance Rate</p>
                                    <Activity className="h-5 w-5 text-purple-500" />
                                </div>
                                <p className="mt-4 text-2xl font-semibold text-slate-900">{attendanceData.averageAttendance.toFixed(1)}%</p>
                            </div>
                            <div className="glass-card p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">Avg Salary</p>
                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                </div>
                                <p className="mt-4 text-2xl font-semibold text-slate-900">${(payrollData.averageSalary / 1000).toFixed(1)}k</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-card p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Headcount by Department</h3>
                                <div className="space-y-3">
                                    {Object.entries(headcountData.byDepartment).map(([dept, count]) => (
                                        <div key={dept} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600">{dept}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full" 
                                                        style={{ width: `${(count / headcountData.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 w-8">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Employment Status</h3>
                                <div className="space-y-3">
                                    {Object.entries(headcountData.byStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600 capitalize">{status}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 h-2 rounded-full" 
                                                        style={{ width: `${(count / headcountData.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 w-8">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {selectedReport === 'headcount' && (
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Headcount Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-3">By Department</h4>
                                <div className="space-y-2">
                                    {Object.entries(headcountData.byDepartment).map(([dept, count]) => (
                                        <div key={dept} className="flex justify-between p-2 bg-slate-50 rounded">
                                            <span className="text-sm">{dept}</span>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-3">By Status</h4>
                                <div className="space-y-2">
                                    {Object.entries(headcountData.byStatus).map(([status, count]) => (
                                        <div key={status} className="flex justify-between p-2 bg-slate-50 rounded">
                                            <span className="text-sm capitalize">{status}</span>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-3">By Employment Type</h4>
                                <div className="space-y-2">
                                    {Object.entries(headcountData.byEmploymentType).map(([type, count]) => (
                                        <div key={type} className="flex justify-between p-2 bg-slate-50 rounded">
                                            <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'payroll' && (
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Payroll Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Total Payroll</h4>
                                <p className="text-2xl font-bold text-slate-900">${(payrollData.totalPayroll / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Average Salary</h4>
                                <p className="text-2xl font-bold text-slate-900">${(payrollData.averageSalary / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Total Deductions</h4>
                                <p className="text-2xl font-bold text-red-600">${(payrollData.totalDeductions / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Total Overtime</h4>
                                <p className="text-2xl font-bold text-blue-600">${(payrollData.totalOvertime / 1000).toFixed(1)}k</p>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'attendance' && (
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Attendance Report</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Average Attendance</h4>
                                <p className="text-2xl font-bold text-slate-900">{attendanceData.averageAttendance.toFixed(1)}%</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Average Hours/Day</h4>
                                <p className="text-2xl font-bold text-slate-900">{attendanceData.averageHours.toFixed(1)}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Total Overtime</h4>
                                <p className="text-2xl font-bold text-blue-600">{attendanceData.totalOvertime.toFixed(1)} hrs</p>
                            </div>
                        </div>
                    </div>
                )}

                {selectedReport === 'turnover' && (
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Turnover Analysis</h3>
                        <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-500">Turnover analysis data would be displayed here</p>
                        </div>
                    </div>
                )}

                {selectedReport === 'benefits' && (
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Benefits Utilization</h3>
                        <div className="text-center py-8">
                            <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-500">Benefits utilization data would be displayed here</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Options */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <FileText className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">PDF Report</p>
                    </button>
                    <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <BarChart3 className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Excel Data</p>
                    </button>
                    <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <PieChart className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">PowerPoint</p>
                    </button>
                    <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Download className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">CSV Export</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;