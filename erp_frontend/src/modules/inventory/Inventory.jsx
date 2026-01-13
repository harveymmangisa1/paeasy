import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Clock, X, Save } from 'lucide-react';
import { useProducts } from '../../hooks/useApi';

const Inventory = ({ industry = 'retail' }) => {
    const { products, categories, loading, error, createProduct } = useProducts();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        cost_price: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // For category, if it's an ID, send it. If empty, maybe null.
            const payload = { ...formData };
            if (!payload.category) delete payload.category;

            await createProduct(payload);
            setShowModal(false);
            setFormData({ name: '', sku: '', category: '', price: '', cost_price: '', description: '' });
            alert('Product created!');
        } catch (e) {
            alert('Error creating product');
            console.error(e);
        }
        setSubmitting(false);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-bold">Error loading inventory</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                    <p className="text-sm text-slate-500 capitalize">{industry} Industry Profile</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Add {industry === 'service' ? 'Service' : 'Product'}</span>
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search catalog..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No products found</p>
                        <p className="text-sm">Add your first product to get started</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">Item</th>
                                <th className="px-6 py-4 font-medium">SKU</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Cost</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{p.sku}</td>
                                    <td className="px-6 py-4 text-slate-500">{p.category?.name || 'Uncategorized'}</td>
                                    <td className="px-6 py-4 text-slate-500">${parseFloat(p.cost_price).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-slate-900 font-bold">${parseFloat(p.price).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Product</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.cost_price}
                                        onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                                >
                                    {submitting ? <span>Saving...</span> : <>
                                        <Save size={18} />
                                        <span>Save Product</span>
                                    </>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
