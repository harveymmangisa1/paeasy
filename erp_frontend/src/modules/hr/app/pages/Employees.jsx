import React, { useState } from 'react';
import { Users, Search, Filter, Download, Eye, Edit, Trash2, Mail, Phone, Building, Calendar, DollarSign, MoreVertical } from 'lucide-react';

const Employees = ({ employees, departments, onAddEmployee }) => {
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const filteredEmployees = employees.filter(employee => {
        const deptMatch = selectedDepartment === 'all' || employee.department === selectedDepartment;
        const statusMatch = selectedStatus === 'all' || employee.status === selectedStatus;
        return deptMatch && statusMatch;
    });

    const getEmployeeInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'onboarding':
                return 'bg-blue-100 text-blue-700';
            case 'inactive':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getEmploymentTypeColor = (type) => {
        switch (type) {
            case 'full-time':
                return 'bg-purple-100 text-purple-700';
            case 'part-time':
                return 'bg-yellow-100 text-yellow-700';
            case 'contract':
                return 'bg-orange-100 text-orange-700';
            case 'intern':
                return 'bg-pink-100 text-pink-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Employees</h1>
                    <p className="text-sm text-slate-500">Manage your workforce and employee information</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={onAddEmployee}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Users size={18} />
                        <span>Add Employee</span>
                    </button>
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
                        <Building className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="grid grid-cols-2 gap-1">
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="space-y-1">
                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-700">{filteredEmployees.length}</span> of{' '}
                    <span className="font-medium text-slate-700">{employees.length}</span> employees
                </p>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="glass-card p-5 hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                        {getEmployeeInitials(employee.firstName, employee.lastName)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {employee.firstName} {employee.lastName}
                                        </h3>
                                        <p className="text-sm text-slate-500">{employee.position}</p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Building className="h-4 w-4" />
                                    <span>{employee.department}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{employee.email}</span>
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Phone className="h-4 w-4" />
                                    <span>{employee.phone}</span>
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${employee.salary.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                    {employee.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(employee.employmentType)}`}>
                                    {employee.employmentType}
                                </span>
                            </div>

                            <div className="flex space-x-2 mt-4">
                                <button className="flex-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
                                    View
                                </button>
                                <button className="flex-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="glass-card overflow-hidden">
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
                                    Position
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Employment Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Salary
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
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                                {getEmployeeInitials(employee.firstName, employee.lastName)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {employee.firstName} {employee.lastName}
                                                </div>
                                                <div className="text-sm text-slate-500">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{employee.department}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{employee.position}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(employee.employmentType)}`}>
                                            {employee.employmentType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">${employee.salary.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-primary-600 hover:text-primary-900">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="text-slate-600 hover:text-slate-900">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No employees found</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Try adjusting your filters or add a new employee to get started.
                    </p>
                    <button
                        onClick={onAddEmployee}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium mx-auto"
                    >
                        <Users size={18} />
                        <span>Add Employee</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Employees;