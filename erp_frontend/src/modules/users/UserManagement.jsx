import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Shield, Mail, Users } from 'lucide-react';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'accountant', branches: 'All' });
    const [users, setUsers] = useState([]);
    const [invitations, setInvitations] = useState([]);

    const formatDate = (date) => date.toISOString().slice(0, 10);

    useEffect(() => {
        const storedUsers = localStorage.getItem('users_list');
        const storedInvites = localStorage.getItem('invites_list');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            const profile = localStorage.getItem('tenant_profile');
            const tenant = profile ? JSON.parse(profile) : null;
            const seedUsers = [
                {
                    id: 'user-1',
                    name: tenant?.company_name || 'Tenant Admin',
                    email: tenant?.admin_email || 'admin@company.test',
                    role: 'tenant_super_admin',
                    status: 'active',
                    branches: 'All',
                },
                { id: 'user-2', name: 'Jane Manager', email: 'jane@acme.com', role: 'branch_manager', status: 'active', branches: 'HQ' },
                { id: 'user-3', name: 'Bob Cashier', email: 'bob@acme.com', role: 'cashier', status: 'active', branches: 'Main Store' },
            ];
            setUsers(seedUsers);
            localStorage.setItem('users_list', JSON.stringify(seedUsers));
        }

        if (storedInvites) {
            setInvitations(JSON.parse(storedInvites));
        } else {
            const seedInvites = [
                {
                    id: 'inv-1',
                    email: 'newuser@acme.com',
                    role: 'sales_rep',
                    status: 'pending',
                    expires: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                    lastSent: formatDate(new Date()),
                },
            ];
            setInvitations(seedInvites);
            localStorage.setItem('invites_list', JSON.stringify(seedInvites));
        }
    }, []);

    useEffect(() => {
        if (users.length) {
            localStorage.setItem('users_list', JSON.stringify(users));
        }
    }, [users]);

    useEffect(() => {
        if (invitations.length) {
            localStorage.setItem('invites_list', JSON.stringify(invitations));
        }
    }, [invitations]);

    const roles = [
        { id: 'tenant_admin', name: 'Tenant Super Admin', description: 'Owner-level access across modules and billing' },
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

    const roleLookup = useMemo(() => {
        return roles.reduce((acc, role) => {
            acc[role.id] = role.name;
            return acc;
        }, {});
    }, [roles]);

    const handleInviteSubmit = () => {
        if (!inviteForm.email) return;
        const newInvite = {
            id: `inv-${Date.now()}`,
            email: inviteForm.email,
            role: inviteForm.role,
            status: 'pending',
            expires: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            lastSent: formatDate(new Date()),
            branches: inviteForm.branches || 'All',
        };
        setInvitations((prev) => [newInvite, ...prev]);
        setInviteForm({ email: '', role: 'accountant', branches: 'All' });
        setShowInviteModal(false);
        setActiveTab('invitations');
    };

    const handleCancelInvite = (inviteId) => {
        setInvitations((prev) => prev.filter((invite) => invite.id !== inviteId));
    };

    const handleResendInvite = (inviteId) => {
        setInvitations((prev) =>
            prev.map((invite) =>
                invite.id === inviteId ? { ...invite, status: 'resent', lastSent: formatDate(new Date()) } : invite
            )
        );
    };

    const handleAcceptInvite = (inviteId) => {
        const invite = invitations.find((item) => item.id === inviteId);
        if (!invite) return;
        const newUser = {
            id: `user-${Date.now()}`,
            name: invite.email.split('@')[0],
            email: invite.email,
            role: invite.role,
            status: 'active',
            branches: invite.branches || 'All',
        };
        setUsers((prev) => [newUser, ...prev]);
        setInvitations((prev) => prev.filter((item) => item.id !== inviteId));
        setActiveTab('users');
    };

    const handleDeactivateUser = (userId) => {
        setUsers((prev) =>
            prev.map((user) => (user.id === userId ? { ...user, status: 'inactive' } : user))
        );
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
                                                {roleLookup[user.role] || user.role.replace('_', ' ')}
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
                                            <button
                                                onClick={() => handleDeactivateUser(user.id)}
                                                className="text-red-600 font-bold text-sm hover:underline"
                                            >
                                                Deactivate
                                            </button>
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
                                        <p className="text-sm text-slate-500">
                                            Role: {roleLookup[inv.role] || inv.role.replace('_', ' ')} • Expires: {inv.expires}
                                        </p>
                                        <p className="text-xs text-slate-400">Last sent: {inv.lastSent}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                                            {inv.status}
                                        </span>
                                        <button onClick={() => handleResendInvite(inv.id)} className="text-slate-600 text-sm hover:underline">
                                            Resend
                                        </button>
                                        <button onClick={() => handleAcceptInvite(inv.id)} className="text-primary-600 text-sm hover:underline">
                                            Accept
                                        </button>
                                        <button onClick={() => handleCancelInvite(inv.id)} className="text-red-600 text-sm hover:underline">
                                            Cancel
                                        </button>
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
                                <input
                                    type="email"
                                    value={inviteForm.email}
                                    onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={inviteForm.role}
                                    onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Branches</label>
                                <input
                                    type="text"
                                    value={inviteForm.branches}
                                    onChange={(event) => setInviteForm((prev) => ({ ...prev, branches: event.target.value }))}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    placeholder="All"
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button onClick={() => setShowInviteModal(false)} className="flex-1 border border-slate-300 rounded-lg py-2 font-medium">Cancel</button>
                                <button onClick={handleInviteSubmit} className="flex-1 bg-primary-600 text-white rounded-lg py-2 font-medium">Send Invitation</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
