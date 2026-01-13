import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Key, Users, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const users = [
        { id: 1, name: 'John Admin', email: 'john@acme.com', role: 'tenant_admin', status: 'active', branches: 'All' },
        { id: 2, name: 'Jane Manager', email: 'jane@acme.com', role: 'branch_manager', status: 'active', branches: 'NYC HQ' },
        { id: 3, name: 'Bob Cashier', email: 'bob@acme.com', role: 'cashier', status: 'active', branches: 'Brooklyn' },
    ];

    const invitations = [
        { id: 1, email: 'newuser@acme.com', role: 'sales_rep', status: 'pending', expires: '2026-01-20' },
    ];

    const roles = [
        { id: 'tenant_admin', name: 'Tenant Admin', description: 'Full access to all modules and settings' },
        { id: 'branch_manager', name: 'Branch Manager', description: 'Manage branch operations and staff' },
        { id: 'accountant', name: 'Accountant', description: 'Access to accounting and financial reports' },
        { id: 'inventory_manager', name: 'Inventory Manager', description: 'Manage products and stock' },
        { id: 'hr_manager', name: 'HR Manager', description: 'Manage employees and payroll' },
        { id: 'sales_rep', name: 'Sales Rep', description: 'Create sales and manage customers' },
        { id: 'cashier', name: 'Cashier', description: 'POS access and basic sales' },
        { id: 'viewer', name: 'Viewer', description: 'Read-only access' },
    ];

    const permissionMatrix = {
        'tenant_admin': { inventory: '✓✓✓✓', sales: '✓✓✓✓', hr: '✓✓✓✓', accounting: '✓✓✓✓', crm: '✓✓✓✓' },
        'branch_manager': { inventory: '✓✓✓-', sales: '✓✓✓-', hr: '✓---', accounting: '✓---', crm: '✓✓✓-' },
        'accountant': { inventory: '✓---', sales: '✓---', hr: '✓---', accounting: '✓✓✓-', crm: '✓---' },
        'cashier': { inventory: '✓---', sales: '✓✓--', hr: '----', accounting: '----', crm: '----' },
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-sm text-slate-500">Manage users, roles, and permissions</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium"
                >
                    <UserPlus size={18} />
                    <span>Invite User</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="glass-card">
                <div className="border-b border-slate-200">
                    <div className="flex space-x-1 p-2">
                        {[
                            { id: 'users', label: 'Users', icon: <Users size={18} /> },
                            { id: 'invitations', label: 'Invitations', icon: <Mail size={18} /> },
                            { id: 'roles', label: 'Roles & Permissions', icon: <Shield size={18} /> },
                        ].map(tab => (
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
                    {activeTab === 'users' && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Branches</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{user.branches}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary-600 font-bold text-sm hover:underline mr-3">Edit</button>
                                            <button className="text-red-600 font-bold text-sm hover:underline">Deactivate</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'invitations' && (
                        <div className="space-y-4">
                            {invitations.map(inv => (
                                <div key={inv.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-900">{inv.email}</p>
                                        <p className="text-sm text-slate-500">Role: {inv.role.replace('_', ' ')} • Expires: {inv.expires}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">Pending</span>
                                        <button className="text-red-600 text-sm hover:underline">Cancel</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {roles.map(role => (
                                    <div key={role.id} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <Shield className="text-primary-600 mt-1" size={20} />
                                            <div>
                                                <h3 className="font-bold text-slate-900">{role.name}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="font-bold text-lg mb-4">Permission Matrix</h3>
                                <p className="text-xs text-slate-500 mb-4">✓ = View, Create, Edit, Delete</p>
                                <table className="w-full text-sm border border-slate-200">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Role</th>
                                            <th className="px-4 py-2 text-center font-medium">Inventory</th>
                                            <th className="px-4 py-2 text-center font-medium">Sales</th>
                                            <th className="px-4 py-2 text-center font-medium">HR</th>
                                            <th className="px-4 py-2 text-center font-medium">Accounting</th>
                                            <th className="px-4 py-2 text-center font-medium">CRM</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {Object.entries(permissionMatrix).map(([role, perms]) => (
                                            <tr key={role}>
                                                <td className="px-4 py-2 font-medium">{role.replace('_', ' ')}</td>
                                                <td className="px-4 py-2 text-center font-mono text-xs">{perms.inventory}</td>
                                                <td className="px-4 py-2 text-center font-mono text-xs">{perms.sales}</td>
                                                <td className="px-4 py-2 text-center font-mono text-xs">{perms.hr}</td>
                                                <td className="px-4 py-2 text-center font-mono text-xs">{perms.accounting}</td>
                                                <td className="px-4 py-2 text-center font-mono text-xs">{perms.crm}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Invite New User</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="user@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button onClick={() => setShowInviteModal(false)} className="flex-1 border border-slate-300 rounded-lg py-2 font-medium">Cancel</button>
                                <button className="flex-1 bg-primary-600 text-white rounded-lg py-2 font-medium">Send Invitation</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
