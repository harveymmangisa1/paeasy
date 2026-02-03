import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import { useSales, useSalesActions } from '../../hooks/useApi';

const SalesManagement = ({ industry = 'retail' }) => {
    const { sales, loading, error, stats } = useSales();
    const { createSale, updateSale, deleteSale } = useSalesActions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState('today');
    const [formData, setFormData] = useState({
        customer_name: '',
        items: [],
        total_amount: 0,
        payment_method: 'cash',
        status: 'completed'
    });

    const industryConfig = {
        retail: {
            paymentMethods: ['cash', 'card', 'mobile_money', 'bank_transfer'],
            statuses: ['pending', 'completed', 'cancelled', 'refunded'],
            currency: '$',
            taxRate: 0.08
        },
        pharmacy: {
            paymentMethods: ['cash', 'card', 'insurance', 'mobile_money'],
            statuses: ['pending', 'completed', 'prescription_verified', 'cancelled'],
            currency: '$',
            taxRate: 0.0
        },
        restaurant: {
            paymentMethods: ['cash', 'card', 'mobile_money', 'split'],
            statuses: ['pending', 'completed', 'cancelled', 'refunded'],
            currency: '$',
            taxRate: 0.10
        },
        service: {
            paymentMethods: ['cash', 'card', 'bank_transfer', 'invoice'],
            statuses: ['pending', 'completed', 'cancelled', 'invoiced'],
            currency: '$',
            taxRate: 0.15
        }
    };

    const config = industryConfig[industry] || industryConfig.retail;

    const filteredSales = sales?.filter(sale =>
        sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const calculateTotal = (items) => {
        return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
    };

    const addItemToSale = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, unit_price: 0, description: '' }]
        });
    };

    const updateItemInSale = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = value;
        
        // Calculate total
        const total = calculateTotal(updatedItems);
        setFormData({
            ...formData,
            items: updatedItems,
            total_amount: total
        });
    };

    const removeItemFromSale = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        const total = calculateTotal(updatedItems);
        setFormData({
            ...formData,
            items: updatedItems,
            total_amount: total
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSale) {
                await updateSale(editingSale.id, formData);
            } else {
                await createSale(formData);
            }
            
            setFormData({
                customer_name: '',
                items: [],
                total_amount: 0,
                payment_method: 'cash',
                status: 'completed'
            });
            setShowAddForm(false);
            setEditingSale(null);
        } catch (err) {
            console.error('Error saving sale:', err);
        }
    };

    const handleEdit = (sale) => {
        setEditingSale(sale);
        setFormData({
            customer_name: sale.customer_name,
            items: sale.items || [],
            total_amount: sale.total_amount,
            payment_method: sale.payment_method,
            status: sale.status
        });
        setShowAddForm(true);
    };

    const handleDelete = async (saleId) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await deleteSale(saleId);
            } catch (err) {
                console.error('Error deleting sale:', err);
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
                <h1 className="text-3xl font-bold text-slate-900">Sales Management</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Sale
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                {config.currency}{stats?.total_revenue?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Sales</h3>
                            <p className="text-2xl font-bold text-slate-900">{stats?.total_sales || 0}</p>
                        </div>
                        <ShoppingCart className="text-blue-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Average Sale</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                {config.currency}{stats?.average_sale?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <TrendingUp className="text-indigo-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Growth</h3>
                            <p className="text-2xl font-bold text-green-600">+{stats?.growth || '0.0'}%</p>
                        </div>
                        <TrendingDown className="text-orange-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search sales..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select 
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    {sale.id.slice(-8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {sale.customer_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900">
                                    <div className="max-w-xs">
                                        {sale.items?.map((item, idx) => (
                                            <div key={idx} className="text-xs">
                                                {item.quantity}x {item.name}
                                            </div>
                                        )) || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {config.currency}{sale.total_amount?.toFixed(2) || '0.00'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <span className="capitalize">{sale.payment_method}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(sale.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(sale)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sale.id)}
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

            {/* Add/Edit Sale Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSale ? 'Edit Sale' : 'New Sale'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Items Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Items</label>
                                    <button
                                        type="button"
                                        onClick={addItemToSale}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                
                                {formData.items.map((item, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-3 mb-2">
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Item name"
                                                value={item.name}
                                                onChange={(e) => updateItemInSale(index, 'name', e.target.value)}
                                                className="px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItemInSale(index, 'quantity', parseInt(e.target.value))}
                                                className="px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Unit price"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItemInSale(index, 'unit_price', parseFloat(e.target.value))}
                                                className="px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemFromSale(index)}
                                                className="text-red-600 hover:text-red-800 text-sm mt-2"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                    <select
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {config.paymentMethods.map(method => (
                                            <option key={method} value={method}>
                                                {method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}
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
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount</label>
                                <input
                                    type="number"
                                    value={formData.total_amount}
                                    readOnly
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingSale(null);
                                        setFormData({
                                            customer_name: '',
                                            items: [],
                                            total_amount: 0,
                                            payment_method: 'cash',
                                            status: 'completed'
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
                                    {editingSale ? 'Update' : 'Create'} Sale
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesManagement;