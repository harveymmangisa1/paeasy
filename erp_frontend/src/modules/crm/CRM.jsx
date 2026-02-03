import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Users, Building, MapPin, Phone, FileText, FileCheck } from 'lucide-react';
import { useCustomers, useQuotations, useCustomerActions } from '../../hooks/useApi';

const CRM = ({ industry = 'retail' }) => {
    const { customers, loading, error, stats } = useCustomers();
    const { quotations, loading: quotationsLoading } = useQuotations();
    const { createCustomer, updateCustomer, deleteCustomer } = useCustomerActions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        country: '',
        customer_type: 'individual',
        status: 'active'
    });

    const industryConfig = {
        retail: {
            customerTypes: ['individual', 'business', 'wholesale'],
            statuses: ['active', 'inactive', 'vip', 'blacklisted'],
            fields: ['loyalty_points', 'purchase_history', 'preferred_store']
        },
        pharmacy: {
            customerTypes: ['individual', 'insurance', 'wholesale'],
            statuses: ['active', 'inactive', 'insurance_verified', 'blacklisted'],
            fields: ['insurance_id', 'prescription_history', 'allergies']
        },
        restaurant: {
            customerTypes: ['individual', 'business', 'delivery'],
            statuses: ['active', 'inactive', 'vip', 'blacklisted'],
            fields: ['favorite_dishes', 'delivery_address', 'dietary_restrictions']
        },
        service: {
            customerTypes: ['individual', 'business', 'corporate'],
            statuses: ['active', 'inactive', 'vip', 'blacklisted'],
            fields: ['service_history', 'contract_details', 'preferred_contact']
        }
    };

    const config = industryConfig[industry] || industryConfig.retail;

    const filteredCustomers = customers?.filter(customer =>
        customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const pendingQuotations = quotations?.filter(q => q.status === 'sent' || q.status === 'draft') || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData);
            } else {
                await createCustomer(formData);
            }
            
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                company: '',
                address: '',
                city: '',
                country: '',
                customer_type: 'individual',
                status: 'active'
            });
            setShowAddForm(false);
            setEditingCustomer(null);
        } catch (err) {
            console.error('Error saving customer:', err);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            first_name: customer.first_name || customer.name?.split(' ')[0] || '',
            last_name: customer.last_name || customer.name?.split(' ').slice(1).join(' ') || '',
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            address: customer.address || '',
            city: customer.city || '',
            country: customer.country || '',
            customer_type: customer.customer_type || 'individual',
            status: customer.status || 'active'
        });
        setShowAddForm(true);
    };

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteCustomer(customerId);
            } catch (err) {
                console.error('Error deleting customer:', err);
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-700',
            'lead': 'bg-blue-100 text-blue-700',
            'inactive': 'bg-slate-100 text-slate-700',
            'blocked': 'bg-red-100 text-red-700',
            'vip': 'bg-purple-100 text-purple-800',
            'blacklisted': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
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
                <h1 className="text-3xl font-bold text-slate-900">Customer Relationship Management</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Customers</h3>
                            <p className="text-2xl font-bold text-slate-900">{stats?.total_customers || customers?.length || 0}</p>
                        </div>
                        <Users className="text-blue-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Active Customers</h3>
                            <p className="text-2xl font-bold text-green-600">{stats?.active_customers || 0}</p>
                        </div>
                        <Building className="text-green-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">VIP Customers</h3>
                            <p className="text-2xl font-bold text-purple-600">{stats?.vip_customers || 0}</p>
                        </div>
                        <MapPin className="text-purple-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Pending Quotations</h3>
                            <p className="text-2xl font-bold text-orange-600">{pendingQuotations.length}</p>
                        </div>
                        <FileText className="text-orange-600" size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Search and Filters */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">All Types</option>
                            {config.customerTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">All Status</option>
                            {config.statuses.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {(customer.first_name || customer.name || '').charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {customer.first_name ? `${customer.first_name} ${customer.last_name || ''}` : customer.name}
                                                    </div>
                                                    {customer.tags && <div className="text-xs text-slate-500">{customer.tags}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{customer.email}</div>
                                            <div className="text-sm text-slate-500">{customer.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {customer.company || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                                                {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(customer)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                        <h2 className="font-bold mb-4 flex items-center space-x-2 text-orange-500">
                            <FileText size={18} />
                            <span>Pending Quotations</span>
                        </h2>
                        {quotationsLoading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                            </div>
                        ) : pendingQuotations.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No pending quotations</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingQuotations.slice(0, 3).map(q => (
                                    <div key={q.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400">{q.quotation_number}</p>
                                        <p className="font-bold text-slate-800">{q.customer_name}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-bold text-slate-900">${parseFloat(q.total_amount).toFixed(2)}</span>
                                            <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Convert</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-slate-200">
                        <h2 className="font-bold mb-4 flex items-center space-x-2 text-emerald-500">
                            <FileCheck size={18} />
                            <span>Recent Invoices</span>
                        </h2>
                        <p className="text-sm text-slate-400 text-center py-4">No recent invoices</p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Customer Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
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
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Type</label>
                                    <select
                                        value={formData.customer_type}
                                        onChange={(e) => setFormData({...formData, customer_type: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {config.customerTypes.map(type => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {config.statuses.map(status => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingCustomer(null);
                                        setFormData({
                                            first_name: '',
                                            last_name: '',
                                            email: '',
                                            phone: '',
                                            company: '',
                                            address: '',
                                            city: '',
                                            country: '',
                                            customer_type: 'individual',
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
                                    {editingCustomer ? 'Update' : 'Add'} Customer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRM;
