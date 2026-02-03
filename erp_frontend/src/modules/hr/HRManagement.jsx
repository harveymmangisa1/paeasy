import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Users, Building, Calendar, Mail } from 'lucide-react';
import { useEmployees, useEmployeeActions } from '../../hooks/useApi';

const HRManagement = ({ industry = 'retail' }) => {
    const { employees, departments, loading, error, stats } = useEmployees();
    const { createEmployee, updateEmployee, deleteEmployee } = useEmployeeActions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: 0,
        hire_date: '',
        status: 'active'
    });

    const industryConfig = {
        retail: {
            departments: ['Sales', 'Inventory', 'Management', 'Customer Service', 'Security'],
            positions: {
                'Sales': ['Sales Associate', 'Sales Manager', 'Cashier'],
                'Inventory': ['Stock Manager', 'Inventory Clerk', 'Warehouse Staff'],
                'Management': ['Store Manager', 'Assistant Manager', 'Department Head'],
                'Customer Service': ['Customer Service Rep', 'Support Specialist'],
                'Security': ['Security Guard', 'Security Supervisor']
            }
        },
        pharmacy: {
            departments: ['Pharmacy', 'Management', 'Administration', 'Sales'],
            positions: {
                'Pharmacy': ['Pharmacist', 'Pharmacy Technician', 'Dispenser'],
                'Management': ['Pharmacy Manager', 'Operations Manager'],
                'Administration': ['Receptionist', 'Administrator'],
                'Sales': ['Sales Associate', 'Cashier']
            }
        },
        restaurant: {
            departments: ['Kitchen', 'Service', 'Management', 'Bar', 'Cleaning'],
            positions: {
                'Kitchen': ['Head Chef', 'Sous Chef', 'Line Cook', 'Dishwasher'],
                'Service': ['Waiter/Waitress', 'Host', 'Busser'],
                'Management': ['Restaurant Manager', 'Assistant Manager'],
                'Bar': ['Bartender', 'Barback'],
                'Cleaning': ['Cleaning Staff', 'Janitor']
            }
        },
        service: {
            departments: ['Technical', 'Sales', 'Administration', 'Management', 'Support'],
            positions: {
                'Technical': ['Technician', 'Engineer', 'Technical Lead'],
                'Sales': ['Sales Representative', 'Account Manager'],
                'Administration': ['Office Manager', 'Administrator', 'Receptionist'],
                'Management': ['General Manager', 'Department Manager'],
                'Support': ['Customer Support', 'Help Desk']
            }
        }
    };

    const config = industryConfig[industry] || industryConfig.retail;

    const filteredEmployees = employees?.filter(employee =>
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, formData);
            } else {
                await createEmployee(formData);
            }
            
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                department: '',
                position: '',
                salary: 0,
                hire_date: '',
                status: 'active'
            });
            setShowAddForm(false);
            setEditingEmployee(null);
        } catch (err) {
            console.error('Error saving employee:', err);
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            position: employee.position,
            salary: employee.salary,
            hire_date: employee.hire_date,
            status: employee.status
        });
        setShowAddForm(true);
    };

    const handleDelete = async (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await deleteEmployee(employeeId);
            } catch (err) {
                console.error('Error deleting employee:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Human Resources</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Employee
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Employees</h3>
                            <p className="text-2xl font-bold text-slate-900">{stats?.total_employees || 0}</p>
                        </div>
                        <Users className="text-blue-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Active Employees</h3>
                            <p className="text-2xl font-bold text-green-600">{stats?.active_employees || 0}</p>
                        </div>
                        <Building className="text-green-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Departments</h3>
                            <p className="text-2xl font-bold text-slate-900">{config.departments.length}</p>
                        </div>
                        <Calendar className="text-indigo-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Avg Salary</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                ${stats?.average_salary?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <Mail className="text-orange-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Departments</option>
                    {config.departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                </select>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">
                                                {employee.first_name} {employee.last_name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                ID: {employee.employee_id}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{employee.email}</div>
                                    <div className="text-sm text-slate-500">{employee.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {employee.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {employee.position}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    ${employee.salary?.toLocaleString() || '0'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                        employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(employee)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee.id)}
                                        className="text-red-600 hover:text-red-900 mr-3"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button className="text-slate-600 hover:text-slate-900">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Employee Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value, position: ''})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select department</option>
                                        {config.departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                                    <select
                                        required
                                        value={formData.position}
                                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        disabled={!formData.department}
                                    >
                                        <option value="">Select position</option>
                                        {formData.department && config.positions[formData.department]?.map(pos => (
                                            <option key={pos} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({...formData, salary: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hire Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingEmployee(null);
                                        setFormData({
                                            first_name: '',
                                            last_name: '',
                                            email: '',
                                            phone: '',
                                            department: '',
                                            position: '',
                                            salary: 0,
                                            hire_date: '',
                                            status: 'active'
                                        });
                                    }}
                                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingEmployee ? 'Update' : 'Add'} Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRManagement;