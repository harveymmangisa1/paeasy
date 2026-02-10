import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, AlertCircle, CheckCircle, XCircle, Filter, Search, Plus, Download } from 'lucide-react';

const LeaveManagement = ({ leaveRequests, employees }) => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [showRequestModal, setShowRequestModal] = useState(false);

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    };

    const getEmployeeDepartment = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.department : 'Unknown';
    };

    const filteredLeaveRequests = leaveRequests.filter(request => {
        const statusMatch = selectedStatus === 'all' || request.status === selectedStatus;
        const typeMatch = selectedType === 'all' || request.type === selectedType;
        const employeeMatch = selectedEmployee === 'all' || request.employeeId === selectedEmployee;
        return statusMatch && typeMatch && employeeMatch;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getLeaveTypeColor = (type) => {
        switch (type) {
            case 'annual':
                return 'bg-blue-100 text-blue-700';
            case 'sick':
                return 'bg-red-100 text-red-700';
            case 'personal':
                return 'bg-purple-100 text-purple-700';
            case 'maternity':
                return 'bg-pink-100 text-pink-700';
            case 'paternity':
                return 'bg-indigo-100 text-indigo-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const leaveStats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.status === 'pending').length,
        approved: leaveRequests.filter(r => r.status === 'approved').length,
        rejected: leaveRequests.filter(r => r.status === 'rejected').length,
        totalDays: leaveRequests.reduce((sum, r) => sum + r.daysRequested, 0),
        approvedDays: leaveRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.daysRequested, 0),
    };

    const leaveBalanceData = employees.map(emp => ({
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        annual: 20,
        sick: 10,
        personal: 5,
        used: leaveRequests.filter(r => r.employeeId === emp.id && r.status === 'approved').reduce((sum, r) => sum + r.daysRequested, 0),
        remaining: 20 - leaveRequests.filter(r => r.employeeId === emp.id && r.status === 'approved').reduce((sum, r) => sum + r.daysRequested, 0),
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Leave Management</h1>
                    <p className="text-sm text-slate-500">Manage employee leave requests and balances</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button 
                        onClick={() => setShowRequestModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>Request Leave</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Requests</p>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{leaveStats.total}</p>
                    <p className="text-xs text-slate-500">{leaveStats.totalDays} total days</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Pending</p>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-yellow-600">{leaveStats.pending}</p>
                    <p className="text-xs text-slate-500">Awaiting approval</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Approved</p>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-green-600">{leaveStats.approved}</p>
                    <p className="text-xs text-slate-500">{leaveStats.approvedDays} days approved</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Rejected</p>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-red-600">{leaveStats.rejected}</p>
                    <p className="text-xs text-slate-500">Not approved</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Approval Rate</p>
                        <UserCheck className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-purple-600">
                        {leaveStats.total > 0 ? ((leaveStats.approved / leaveStats.total) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-slate-500">Of total requests</p>
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
                        <UserCheck className="h-4 w-4 text-slate-400" />
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
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Types</option>
                            <option value="annual">Annual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="personal">Personal Leave</option>
                            <option value="maternity">Maternity Leave</option>
                            <option value="paternity">Paternity Leave</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Leave Requests Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Leave Requests</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {filteredLeaveRequests.length} requests found
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
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Requested
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLeaveRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs">
                                                {getEmployeeName(request.employeeId).split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {getEmployeeName(request.employeeId)}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {getEmployeeDepartment(request.employeeId)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.type)}`}>
                                            {request.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {request.daysRequested} days
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {request.startDate} - {request.endDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {request.requestedDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(request.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900 max-w-xs truncate">
                                            {request.reason}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {request.status === 'pending' && (
                                                <>
                                                    <button className="text-green-600 hover:text-green-900">
                                                        Approve
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button className="text-primary-600 hover:text-primary-900">
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leave Balance Overview */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Leave Balance Overview</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Annual</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Sick</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Personal</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Used</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Remaining</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaveBalanceData.slice(0, 5).map((balance) => (
                                <tr key={balance.employeeId} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-sm font-medium text-slate-900">
                                        {balance.employeeName}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-center text-slate-600">{balance.annual}</td>
                                    <td className="px-4 py-2 text-sm text-center text-slate-600">{balance.sick}</td>
                                    <td className="px-4 py-2 text-sm text-center text-slate-600">{balance.personal}</td>
                                    <td className="px-4 py-2 text-sm text-center text-orange-600">{balance.used}</td>
                                    <td className="px-4 py-2 text-sm text-center font-medium text-green-600">{balance.remaining}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {filteredLeaveRequests.length === 0 && (
                <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No leave requests found</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Try adjusting your filters or submit a new leave request.
                    </p>
                    <button 
                        onClick={() => setShowRequestModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium mx-auto"
                    >
                        <Plus size={18} />
                        <span>Request Leave</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;