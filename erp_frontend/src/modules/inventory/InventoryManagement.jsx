import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useInventory, useInventoryActions } from '../../hooks/useApi';

const InventoryManagement = ({ industry = 'retail' }) => {
    const { items, loading, error, refresh } = useInventory();
    const { createItem, updateItem, deleteItem } = useInventoryActions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        price: 0,
        min_stock_level: 10,
        description: ''
    });

    const industryConfig = {
        retail: {
            categories: ['Electronics', 'Clothing', 'Food', 'Home Goods'],
            lowStockThreshold: 10,
            unitLabel: 'pieces'
        },
        pharmacy: {
            categories: ['Prescription Drugs', 'OTC Medicine', 'Medical Supplies', 'Health Products'],
            lowStockThreshold: 50,
            unitLabel: 'units'
        },
        restaurant: {
            categories: ['Ingredients', 'Beverages', 'Dairy', 'Packaging'],
            lowStockThreshold: 20,
            unitLabel: 'servings'
        },
        service: {
            categories: ['Equipment', 'Supplies', 'Tools', 'Materials'],
            lowStockThreshold: 5,
            unitLabel: 'items'
        }
    };

    const config = industryConfig[industry] || industryConfig.retail;

    const filteredItems = items?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const lowStockItems = filteredItems.filter(item => item.quantity <= config.lowStockThreshold);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateItem(editingItem.id, formData);
            } else {
                await createItem(formData);
            }
            await refresh();
            setFormData({
                name: '',
                sku: '',
                category: '',
                quantity: 0,
                price: 0,
                min_stock_level: config.lowStockThreshold,
                description: ''
            });
            setShowAddForm(false);
            setEditingItem(null);
        } catch (err) {
            console.error('Error saving item:', err);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            price: item.price,
            min_stock_level: item.min_stock_level,
            description: item.description || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem(itemId);
                await refresh();
            } catch (err) {
                console.error('Error deleting item:', err);
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
                <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Total Items</h3>
                    <p className="text-2xl font-bold text-slate-900">{filteredItems.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Low Stock Items</h3>
                    <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Total Value</h3>
                    <p className="text-2xl font-bold text-slate-900">
                        ${filteredItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-medium text-slate-500">Categories</h3>
                    <p className="text-2xl font-bold text-slate-900">{config.categories.length}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Categories</option>
                    {config.categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="text-orange-600" size={20} />
                        <h3 className="font-medium text-orange-800">Low Stock Alert</h3>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                        {lowStockItems.length} items are below the minimum stock level of {config.lowStockThreshold} {config.unitLabel}
                    </p>
                </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{item.name}</div>
                                        <div className="text-sm text-slate-500">{item.description}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{item.quantity} {config.unitLabel}</div>
                                    <div className="text-xs text-slate-500">Min: {item.min_stock_level}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${item.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        item.quantity <= config.lowStockThreshold 
                                            ? 'bg-orange-100 text-orange-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {item.quantity <= config.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select category</option>
                                    {config.categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Min Stock Level ({config.unitLabel})
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.min_stock_level}
                                    onChange={(e) => setFormData({...formData, min_stock_level: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingItem(null);
                                        setFormData({
                                            name: '',
                                            sku: '',
                                            category: '',
                                            quantity: 0,
                                            price: 0,
                                            min_stock_level: config.lowStockThreshold,
                                            description: ''
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
                                    {editingItem ? 'Update' : 'Add'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;