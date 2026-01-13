import React from 'react';
import { User, FileText, FileCheck, Plus, Phone, Mail } from 'lucide-react';
import { useCustomers, useQuotations } from '../../hooks/useApi';

const CRM = () => {
    const { customers, loading: customersLoading, error: customersError } = useCustomers();
    const { quotations, loading: quotationsLoading } = useQuotations();

    if (customersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (customersError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-bold">Error loading CRM data</p>
                <p className="text-sm">{customersError}</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            'active': 'bg-emerald-100 text-emerald-700',
            'lead': 'bg-blue-100 text-blue-700',
            'inactive': 'bg-slate-100 text-slate-700',
            'blocked': 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const pendingQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'draft');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">CRM & Quotations</h1>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Plus size={18} />
                        <span>New Quotation</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <User size={18} />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-bold flex items-center space-x-2">
                            <User size={18} className="text-primary-500" />
                            <span>Customer Directory</span>
                        </h2>
                    </div>
                    {customers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <User size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No customers yet</p>
                            <p className="text-sm">Add your first customer to get started</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{c.name}</p>
                                            {c.tags && <p className="text-xs text-slate-400">{c.tags}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {c.email && (
                                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                        <Mail size={12} />
                                                        <span>{c.email}</span>
                                                    </div>
                                                )}
                                                {c.phone && (
                                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                        <Phone size={12} />
                                                        <span>{c.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary-600 font-bold text-sm hover:underline">View Timeline</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
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
                                            <button className="text-xs bg-primary-600 text-white px-2 py-1 rounded">Convert</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="font-bold mb-4 flex items-center space-x-2 text-emerald-500">
                            <FileCheck size={18} />
                            <span>Recent Invoices</span>
                        </h2>
                        <p className="text-sm text-slate-400 text-center py-4">No recent invoices</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRM;
