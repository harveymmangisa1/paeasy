import React, { useState, useEffect } from 'react';
import { Users, Clock, UserPlus, Calendar, Award, DollarSign, TrendingUp, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEmployees, useAttendance, usePayroll, useLeaveRequests } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

const HR = () => {
    const { user } = useAuth();
    const { employees, loading: empLoading, error: empError } = useEmployees();
    const { attendance, loading: attLoading, clockIn, clockOut, refresh: refreshAttendance } = useAttendance();
    const { payrolls, loading: payLoading, generatePayslip, markPaid, refresh: refreshPayroll } = usePayroll();
    const { requests, loading: leaveLoading, updateStatus, refresh: refreshLeaves } = useLeaveRequests();

    const [activeTab, setActiveTab] = useState('employees');
    const [actionLoading, setActionLoading] = useState(false);

    // Find current employee profile
    const currentEmployee = employees.find(e => e.user === user?.id);

    // Filter attendance for current employee or viewing all if admin?
    // For now, let's show all for admin, or filtered. 
    // The API returns what logic.py allows.

    const loading = empLoading || (activeTab === 'attendance' && attLoading) || (activeTab === 'payroll' && payLoading) || (activeTab === 'leave' && leaveLoading);

    if (loading && !employees.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const handleClockIn = async () => {
        if (!currentEmployee) return alert("Employee profile not found for your user.");
        setActionLoading(true);
        try {
            await clockIn(currentEmployee.id);
        } catch (e) {
            console.error(e);
            alert("Error clocking in");
        }
        setActionLoading(false);
    };

    const handleClockOut = async () => {
        if (!currentEmployee) return alert("Employee profile not found for your user.");
        setActionLoading(true);
        try {
            await clockOut(currentEmployee.id);
        } catch (e) {
            console.error(e);
            alert("Error clocking out");
        }
        setActionLoading(false);
    };

    const handleGeneratePayroll = async () => {
        // Generate for all employees for this month? Or specific?
        // For demo, let's generate for the first employee found or current
        if (!currentEmployee) return;
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        setActionLoading(true);
        try {
            await generatePayslip(currentEmployee.id, {
                period_start: start,
                period_end: end,
                bonuses: 0,
                allowances: 0
            });
            alert("Payslip generated!");
        } catch (e) {
            console.error(e);
            alert("Error generating payslip");
        }
        setActionLoading(false);
    };

    const tabs = [
        { id: 'employees', label: 'Employees', icon: <Users size={18} /> },
        { id: 'attendance', label: 'Attendance', icon: <Clock size={18} /> },
        { id: 'leave', label: 'Leave Requests', icon: <Calendar size={18} /> },
        { id: 'payroll', label: 'Payroll', icon: <DollarSign size={18} /> },
        // { id: 'performance', label: 'Performance', icon: <Award size={18} /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Human Resources</h1>
                    <p className="text-sm text-slate-500">Manage your workforce</p>
                </div>
                <div className="flex space-x-3">
                    {activeTab === 'attendance' && currentEmployee && (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleClockIn}
                                disabled={actionLoading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                            >
                                <Clock size={18} />
                                <span>Clock In</span>
                            </button>
                            <button
                                onClick={handleClockOut}
                                disabled={actionLoading}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                            >
                                <Clock size={18} />
                                <span>Clock Out</span>
                            </button>
                        </div>
                    )}

                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <FileText size={18} />
                        <span>Reports</span>
                    </button>
                    {activeTab === 'employees' && (
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                            <UserPlus size={18} />
                            <span>Add Employee</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="glass-card">
                <div className="border-b border-slate-200">
                    <div className="flex space-x-1 p-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* EMPLOYEES TAB */}
                    {activeTab === 'employees' && (
                        <div>
                            {employees.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">No employees found</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Employee</th>
                                            <th className="px-6 py-4 font-medium">Role</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium">Salary</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {employees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                                            {emp.user_name?.charAt(0).toUpperCase() || 'E'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{emp.user_name || 'Unknown'}</p>
                                                            <p className="text-xs text-slate-400">{emp.employee_id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{emp.position_title || emp.designation}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.employment_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {emp.employment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">${parseFloat(emp.salary).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary-600 font-bold text-sm hover:underline">View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ATTENDANCE TAB */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-4">
                            {attendance.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-600 font-medium">No attendance records found</p>
                                    <p className="text-sm text-slate-400">Use the Clock In button to start</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date</th>
                                            <th className="px-6 py-4 font-medium">Employee</th>
                                            <th className="px-6 py-4 font-medium">Clock In</th>
                                            <th className="px-6 py-4 font-medium">Clock Out</th>
                                            <th className="px-6 py-4 font-medium">Hours</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {attendance.map(att => (
                                            <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">{att.date}</td>
                                                <td className="px-6 py-4 font-medium">{att.employee_name}</td>
                                                <td className="px-6 py-4 text-green-600">{new Date(att.clock_in).toLocaleTimeString()}</td>
                                                <td className="px-6 py-4 text-red-600">
                                                    {att.clock_out ? new Date(att.clock_out).toLocaleTimeString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 font-mono">{att.hours_worked || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize">
                                                        {att.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* LEAVE TAB */}
                    {activeTab === 'leave' && (
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">No leave requests</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-slate-900">{req.employee_name}</p>
                                                    <p className="text-sm text-slate-500 capitalize">{req.leave_type} Leave • {req.days_requested} days</p>
                                                    <p className="text-xs text-slate-400 mt-1">{req.start_date} to {req.end_date}</p>
                                                    <p className="text-sm mt-2 italic">"{req.reason}"</p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <div className={`px-2 py-1 rounded text-xs font-bold capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {req.status}
                                                    </div>
                                                    {req.status === 'pending' && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => updateStatus(req.id, 'approved')}
                                                                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(req.id, 'rejected')}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PAYROLL TAB */}
                    {activeTab === 'payroll' && (
                        <div className="space-y-6">
                            {currentEmployee && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleGeneratePayroll}
                                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
                                    >
                                        Generate My Payslip (Current Month)
                                    </button>
                                </div>
                            )}

                            {payrolls.length === 0 ? (
                                <div className="text-center py-12">
                                    <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="text-slate-600 font-medium">No payroll records</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Period</th>
                                            <th className="px-6 py-4 font-medium">Employee</th>
                                            <th className="px-6 py-4 font-medium">Gross</th>
                                            <th className="px-6 py-4 font-medium">Deductions</th>
                                            <th className="px-6 py-4 font-medium">Net Pay</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {payrolls.map(slip => (
                                            <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm">{slip.period_start} - {slip.period_end}</td>
                                                <td className="px-6 py-4 font-bold">{slip.employee_name}</td>
                                                <td className="px-6 py-4">${slip.gross_salary}</td>
                                                <td className="px-6 py-4 text-red-500">-${(Decimal(slip.tax) + Decimal(slip.insurance) + Decimal(slip.other_deductions)).toFixed(2)}</td>
                                                <td className="px-6 py-4 font-bold text-green-600">${slip.net_salary}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${slip.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                                                        }`}>
                                                        {slip.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {slip.status !== 'paid' && (
                                                        <button
                                                            onClick={() => markPaid(slip.id, 'bank')}
                                                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Helper function to avoid 'Decimal is not defined' error in JS */}
        </div>
    );
};

// Simple helper since we don't have Decimal in JS
const Decimal = (val) => parseFloat(val) || 0;

export default HR;
