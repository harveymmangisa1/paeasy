import React, { useState } from 'react';
import { DollarSign, Download, Search, Filter, Calendar, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Calculator } from 'lucide-react';

const Payroll = ({ payroll, employees }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('2026-01');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showPayrollModal, setShowPayrollModal] = useState(false);

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    };

    const getEmployeeDepartment = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.department : 'Unknown';
    };

    const filteredPayroll = payroll.filter(record => {
        const periodMatch = record.period === selectedPeriod;
        const employeeMatch = selectedEmployee === 'all' || record.employeeId === selectedEmployee;
        const statusMatch = selectedStatus === 'all' || record.status === selectedStatus;
        return periodMatch && employeeMatch && statusMatch;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'processing':
                return <Calculator className="h-4 w-4 text-blue-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'processing':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const payrollStats = {
        totalEmployees: filteredPayroll.length,
        totalGross: filteredPayroll.reduce((sum, p) => sum + p.grossPay, 0),
        totalNet: filteredPayroll.reduce((sum, p) => sum + p.netPay, 0),
        totalDeductions: filteredPayroll.reduce((sum, p) => sum + (p.federalTax + p.stateTax + p.socialSecurity + p.medicare + p.otherDeductions), 0),
        totalOvertime: filteredPayroll.reduce((sum, p) => sum + p.overtime, 0),
        totalBonuses: filteredPayroll.reduce((sum, p) => sum + p.bonuses, 0),
        paidCount: filteredPayroll.filter(p => p.status === 'paid').length,
        pendingCount: filteredPayroll.filter(p => p.status === 'pending').length,
    };

    const periods = [
        { value: '2026-01', label: 'January 2026' },
        { value: '2025-12', label: 'December 2025' },
        { value: '2025-11', label: 'November 2025' },
        { value: '2025-10', label: 'October 2025' },
    ];

    const departmentPayroll = employees.reduce((acc, emp) => {
        const dept = emp.department;
        const empPayroll = filteredPayroll.filter(p => p.employeeId === emp.id);
        const deptTotal = empPayroll.reduce((sum, p) => sum + p.netPay, 0);
        
        if (!acc[dept]) {
            acc[dept] = { department: dept, total: 0, count: 0, average: 0 };
        }
        acc[dept].total += deptTotal;
        acc[dept].count += empPayroll.length;
        acc[dept].average = acc[dept].count > 0 ? acc[dept].total / acc[dept].count : 0;
        
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Payroll Management</h1>
                    <p className="text-sm text-slate-500">Process and manage employee payroll</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button 
                        onClick={() => setShowPayrollModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Calculator size={18} />
                        <span>Run Payroll</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Payroll</p>
                        <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">
                        ${(payrollStats.totalNet / 1000).toFixed(1)}k
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Net pay for {selectedPeriod}</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Gross Payroll</p>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">
                        ${(payrollStats.totalGross / 1000).toFixed(1)}k
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Before deductions</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Deductions</p>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">
                        ${(payrollStats.totalDeductions / 1000).toFixed(1)}k
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Taxes & other deductions</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Payment Status</p>
                        <CheckCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">
                        {payrollStats.paidCount}/{payrollStats.totalEmployees}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{payrollStats.pendingCount} pending</p>
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
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {periods.map(period => (
                                <option key={period.value} value={period.value}>
                                    {period.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-slate-400" />
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
                        <CheckCircle className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Payroll Records</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {selectedPeriod} • {filteredPayroll.length} records
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Base Salary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Overtime
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Bonuses
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Gross Pay
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Deductions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Net Pay
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPayroll.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs">
                                                {getEmployeeName(record.employeeId).split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {getEmployeeName(record.employeeId)}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {getEmployeeDepartment(record.employeeId)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            ${record.baseSalary.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-green-600">
                                            +${record.overtime.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-blue-600">
                                            +${record.bonuses.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">
                                            ${record.grossPay.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-red-600">
                                            -${(record.federalTax + record.stateTax + record.socialSecurity + record.medicare + record.otherDeductions).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-green-600">
                                            ${record.netPay.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(record.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-primary-600 hover:text-primary-900">
                                                View
                                            </button>
                                            <button className="text-slate-600 hover:text-slate-900">
                                                Edit
                                            </button>
                                            {record.status !== 'paid' && (
                                                <button className="text-green-600 hover:text-green-900">
                                                    Process
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Department Payroll Summary */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Department Payroll Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(departmentPayroll).map((dept) => (
                        <div key={dept.department} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                            <h4 className="font-semibold text-slate-800">{dept.department}</h4>
                            <div className="mt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Employees</span>
                                    <span className="font-medium text-slate-700">{dept.count}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total Payroll</span>
                                    <span className="font-medium text-slate-700">${(dept.total / 1000).toFixed(1)}k</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Average Salary</span>
                                    <span className="font-medium text-slate-700">${(dept.average / 1000).toFixed(1)}k</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payroll Summary */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Payroll Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Base Salaries</h4>
                        <p className="text-lg font-semibold text-slate-900">
                            ${(filteredPayroll.reduce((sum, p) => sum + p.baseSalary, 0) / 1000).toFixed(1)}k
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Overtime Pay</h4>
                        <p className="text-lg font-semibold text-green-600">
                            +${(payrollStats.totalOvertime / 1000).toFixed(1)}k
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Bonuses</h4>
                        <p className="text-lg font-semibold text-blue-600">
                            +${(payrollStats.totalBonuses / 1000).toFixed(1)}k
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Total Deductions</h4>
                        <p className="text-lg font-semibold text-red-600">
                            -${(payrollStats.totalDeductions / 1000).toFixed(1)}k
                        </p>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {filteredPayroll.length === 0 && (
                <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No payroll records found</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Try adjusting your filters or run payroll for this period.
                    </p>
                    <button 
                        onClick={() => setShowPayrollModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium mx-auto"
                    >
                        <Calculator size={18} />
                        <span>Run Payroll</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Payroll;