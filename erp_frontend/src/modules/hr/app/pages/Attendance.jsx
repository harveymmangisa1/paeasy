import React, { useState } from 'react';
import { Clock, UserCheck, Calendar, Search, Filter, Download, AlertCircle, CheckCircle, XCircle, Timer, Users } from 'lucide-react';

const Attendance = ({ attendance, employees }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    };

    const getEmployeeDepartment = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.department : 'Unknown';
    };

    const filteredAttendance = attendance.filter(record => {
        const dateMatch = record.date === selectedDate;
        const employeeMatch = selectedEmployee === 'all' || record.employeeId === selectedEmployee;
        const statusMatch = selectedStatus === 'all' || record.status === selectedStatus;
        return dateMatch && employeeMatch && statusMatch;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'absent':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'late':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'half_day':
                return <Timer className="h-4 w-4 text-blue-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-700';
            case 'absent':
                return 'bg-red-100 text-red-700';
            case 'late':
                return 'bg-yellow-100 text-yellow-700';
            case 'half_day':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const attendanceStats = {
        total: employees.length,
        present: filteredAttendance.filter(a => a.status === 'present').length,
        absent: filteredAttendance.filter(a => a.status === 'absent').length,
        late: filteredAttendance.filter(a => a.status === 'late').length,
        halfDay: filteredAttendance.filter(a => a.status === 'half_day').length,
        averageHours: filteredAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0) / filteredAttendance.length || 0,
    };

    const attendanceRate = attendanceStats.total > 0 ? (attendanceStats.present / attendanceStats.total * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Attendance Management</h1>
                    <p className="text-sm text-slate-500">Track and manage employee attendance</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <UserCheck size={18} />
                        <span>Mark Attendance</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Employees</p>
                        <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{attendanceStats.total}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Present</p>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-green-600">{attendanceStats.present}</p>
                    <p className="text-xs text-slate-500">{((attendanceStats.present / attendanceStats.total) * 100).toFixed(1)}%</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Absent</p>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-red-600">{attendanceStats.absent}</p>
                    <p className="text-xs text-slate-500">{((attendanceStats.absent / attendanceStats.total) * 100).toFixed(1)}%</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Late</p>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-yellow-600">{attendanceStats.late}</p>
                    <p className="text-xs text-slate-500">{((attendanceStats.late / attendanceStats.total) * 100).toFixed(1)}%</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Half Day</p>
                        <Timer className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-blue-600">{attendanceStats.halfDay}</p>
                    <p className="text-xs text-slate-500">{((attendanceStats.halfDay / attendanceStats.total) * 100).toFixed(1)}%</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Avg Hours</p>
                        <Clock className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-purple-600">{attendanceStats.averageHours.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">hours/day</p>
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
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
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
                        <Clock className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="half_day">Half Day</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Attendance Records</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {selectedDate} • {filteredAttendance.length} records
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
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Clock In
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Clock Out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Break Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Hours Worked
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Overtime
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
                            {filteredAttendance.map((record) => (
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
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{getEmployeeDepartment(record.employeeId)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {record.breakTime ? `${record.breakTime} min` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">
                                            {record.hoursWorked ? `${record.hoursWorked} hrs` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {record.overtime ? `${record.overtime} hrs` : '-'}
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
                                                Edit
                                            </button>
                                            <button className="text-slate-600 hover:text-slate-900">
                                                Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty State */}
            {filteredAttendance.length === 0 && (
                <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No attendance records found</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Try adjusting your filters or select a different date.
                    </p>
                </div>
            )}

            {/* Summary Card */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Attendance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Attendance Rate</h4>
                        <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${attendanceRate}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{attendanceRate}%</span>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Total Hours Today</h4>
                        <p className="text-lg font-semibold text-slate-900">
                            {filteredAttendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0).toFixed(1)} hrs
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Overtime Hours</h4>
                        <p className="text-lg font-semibold text-orange-600">
                            {filteredAttendance.reduce((sum, record) => sum + (record.overtime || 0), 0).toFixed(1)} hrs
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;