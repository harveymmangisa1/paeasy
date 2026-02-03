import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, FileText, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { useAccounting, useAccountingActions } from '../../hooks/useApi';

const AccountingManagement = ({ industry = 'retail' }) => {
    const { accounts, journalEntries, transactions, loading, error, stats } = useAccounting();
    const { createAccount, createJournalEntry, createTransaction } = useAccountingActions();
    const [activeTab, setActiveTab] = useState('accounts');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const industryConfig = {
        retail: {
            accountTypes: [
                { value: 'asset', label: 'Assets', subcategories: ['Cash', 'Accounts Receivable', 'Inventory', 'Equipment'] },
                { value: 'liability', label: 'Liabilities', subcategories: ['Accounts Payable', 'Loans', 'Taxes Payable'] },
                { value: 'equity', label: 'Equity', subcategories: ['Owner Equity', 'Retained Earnings'] },
                { value: 'revenue', label: 'Revenue', subcategories: ['Sales', 'Service Revenue', 'Other Income'] },
                { value: 'expense', label: 'Expenses', subcategories: ['Cost of Goods Sold', 'Rent', 'Salaries', 'Utilities'] }
            ]
        },
        pharmacy: {
            accountTypes: [
                { value: 'asset', label: 'Assets', subcategories: ['Cash', 'Accounts Receivable', 'Inventory - Drugs', 'Equipment'] },
                { value: 'liability', label: 'Liabilities', subcategories: ['Accounts Payable', 'Insurance Claims', 'Taxes'] },
                { value: 'equity', label: 'Equity', subcategories: ['Owner Equity', 'Retained Earnings'] },
                { value: 'revenue', label: 'Revenue', subcategories: ['Prescription Sales', 'OTC Sales', 'Consultation Fees'] },
                { value: 'expense', label: 'Expenses', subcategories: ['Drug Cost', 'Staff Salaries', 'Rent', 'License Fees'] }
            ]
        },
        restaurant: {
            accountTypes: [
                { value: 'asset', label: 'Assets', subcategories: ['Cash', 'Inventory', 'Equipment', 'Furniture'] },
                { value: 'liability', label: 'Liabilities', subcategories: ['Accounts Payable', 'Payroll Tax', 'Loans'] },
                { value: 'equity', label: 'Equity', subcategories: ['Owner Equity', 'Retained Earnings'] },
                { value: 'revenue', label: 'Revenue', subcategories: ['Food Sales', 'Beverage Sales', 'Service Charges'] },
                { value: 'expense', label: 'Expenses', subcategories: ['Food Cost', 'Labor', 'Rent', 'Utilities', 'Marketing'] }
            ]
        },
        service: {
            accountTypes: [
                { value: 'asset', label: 'Assets', subcategories: ['Cash', 'Accounts Receivable', 'Equipment', 'Software'] },
                { value: 'liability', label: 'Liabilities', subcategories: ['Accounts Payable', 'Deferred Revenue', 'Taxes'] },
                { value: 'equity', label: 'Equity', subcategories: ['Owner Equity', 'Retained Earnings'] },
                { value: 'revenue', label: 'Revenue', subcategories: ['Service Fees', 'Consulting', 'Maintenance'] },
                { value: 'expense', label: 'Expenses', subcategories: ['Labor', 'Software', 'Marketing', 'Office Rent'] }
            ]
        }
    };

    const config = industryConfig[industry] || industryConfig.retail;

    const filteredAccounts = accounts?.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredJournalEntries = journalEntries?.filter(entry =>
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredTransactions = transactions?.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                <h1 className="text-3xl font-bold text-slate-900">Accounting Management</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Transaction
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Assets</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                ${stats?.total_assets?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Total Liabilities</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                ${stats?.total_liabilities?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <Calculator className="text-red-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Revenue (MTD)</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                ${stats?.monthly_revenue?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <TrendingUp className="text-blue-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500">Expenses (MTD)</h3>
                            <p className="text-2xl font-bold text-slate-900">
                                ${stats?.monthly_expenses?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <FileText className="text-orange-600" size={24} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    {['accounts', 'journal', 'transactions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'accounts' && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredAccounts.map((account) => (
                                <tr key={account.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {account.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {account.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <span className="capitalize">{account.account_type}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        ${account.balance?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {account.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'journal' && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredJournalEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {entry.reference || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div className="max-w-xs">
                                            {entry.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        ${entry.total_amount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            entry.is_posted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {entry.is_posted ? 'Posted' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                                            <Eye size={16} />
                                        </button>
                                        <button className="text-slate-600 hover:text-slate-900">
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Debit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Credit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {transaction.account_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        <div className="max-w-xs">
                                            {transaction.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {transaction.debit > 0 ? `$${transaction.debit.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {transaction.credit > 0 ? `$${transaction.credit.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Transaction Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">New Journal Entry</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        placeholder="Invoice #, Receipt #, etc."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Description of this transaction..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Entry Lines</label>
                                <div className="space-y-2 border border-slate-200 rounded-lg p-4">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-700">
                                        <div className="col-span-4">Account</div>
                                        <div className="col-span-3">Description</div>
                                        <div className="col-span-2">Debit</div>
                                        <div className="col-span-2">Credit</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    {/* Sample line */}
                                    <div className="grid grid-cols-12 gap-2">
                                        <select className="col-span-4 px-2 py-1 border border-slate-300 rounded text-sm">
                                            <option>Select Account</option>
                                            {config.accountTypes.map(type => (
                                                <optgroup key={type.value} label={type.label}>
                                                    {type.subcategories.map(sub => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <input type="text" className="col-span-3 px-2 py-1 border border-slate-300 rounded text-sm" placeholder="Description" />
                                        <input type="number" step="0.01" className="col-span-2 px-2 py-1 border border-slate-300 rounded text-sm" placeholder="0.00" />
                                        <input type="number" step="0.01" className="col-span-2 px-2 py-1 border border-slate-300 rounded text-sm" placeholder="0.00" />
                                        <button type="button" className="col-span-1 text-red-600 text-sm">Remove</button>
                                    </div>
                                    <button type="button" className="text-blue-600 text-sm">+ Add Line</button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountingManagement;