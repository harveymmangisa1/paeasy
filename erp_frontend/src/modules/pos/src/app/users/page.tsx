'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { hasPermission, DEFAULT_PERMISSIONS } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    UserPlus,
    Shield,
    Mail,
    Phone,
    Key,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { db, Staff } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<Staff[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Staff | null>(null);

    useEffect(() => {
        if (user) {
            loadUsers();
            if (user.tenantId) realtimeSync.setTenantId(user.tenantId);
            realtimeSync.startStaffSync(() => loadUsers());
            return () => realtimeSync.stopAll();
        }
    }, [user]);

    const loadUsers = async () => {
        if (!user || !user.tenantId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const allUsers = await api.fetchStaff(user.tenantId);
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || !hasPermission(user, 'users', 'view')) {
        return (
            <ModernLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                        <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">Manage staff accounts and permissions</p>
                    </div>
                    {hasPermission(user, 'users', 'create') && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setEditingUser(null)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingUser ? 'Edit User' : 'Create New User'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingUser ? 'Update the details for this staff member.' : 'Add a new staff member with login access to the system.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <UserForm
                                    currentUser={user}
                                    user={editingUser}
                                    onSave={() => {
                                        loadUsers();
                                        setDialogOpen(false);
                                        setEditingUser(null);
                                    }}
                                    onCancel={() => {
                                        setDialogOpen(false);
                                        setEditingUser(null);
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <h3 className="text-2xl font-bold mt-1">{users.length}</h3>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">
                                        {users.filter(u => u.isActive).length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Inactive</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">
                                        {users.filter(u => !u.isActive).length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Cashiers</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {users.filter(u => u.role === 'cashier').length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <UserPlus className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search by name, username, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left p-3 font-medium">User</th>
                                        <th className="text-left p-3 font-medium">Role</th>
                                        <th className="text-left p-3 font-medium">Contact</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Last Login</th>
                                        <th className="text-center p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{u.name}</p>
                                                        <p className="text-sm text-gray-500">@{u.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={
                                                    u.role === 'admin' || u.role === 'super_admin' ? 'default' :
                                                        u.role === 'manager' ? 'secondary' : 'outline'
                                                }>
                                                    {u.role.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    {u.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="h-3 w-3" />
                                                            {u.email}
                                                        </div>
                                                    )}
                                                    {u.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="h-3 w-3" />
                                                            {u.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={u.isActive ? 'default' : 'destructive'}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    {hasPermission(user, 'users', 'edit') && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingUser(u);
                                                                setDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    {hasPermission(user, 'users', 'delete') && u.id !== user.id && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDeleteUser(u.id!)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ModernLayout>
    );

    async function handleDeleteUser(userId: number) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await api.deleteStaff(userId);
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            }
        }
    }
}

function UserForm({ currentUser, user, onSave, onCancel }: {
    currentUser: Staff;
    user: Staff | null;
    onSave: () => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        pin: user?.pin || '',
        role: user?.role || 'cashier' as Staff['role'],
        isActive: user?.isActive ?? true,
        tenantId: user?.tenantId || currentUser.tenantId, // Add tenantId here
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (user) {
                // Update existing user
                const userData = {
                    ...formData,
                    permissions: DEFAULT_PERMISSIONS[formData.role],
                    updatedAt: new Date(),
                };
                await api.updateStaff(user.id!, userData);
            } else {
                // Create new user via Supabase Admin API
                const tenantIdToUse = currentUser.tenantId || user?.tenantId;

                if (!tenantIdToUse) {
                    alert('Error: Current user does not have a tenant ID assigned. Cannot create user.');
                    return;
                }

                const response = await fetch('/api/admin/create-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email || formData.username,
                        password: formData.password,
                        name: formData.name,
                        username: formData.username,
                        phone: formData.phone,
                        pin: formData.pin,
                        role: formData.role,
                        tenant_id: tenantIdToUse,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to create user');
                }

                // Also add to local DB via api.fetchStaff later, or just use staff.put
                // but since it's a new user, let's just refresh the list
                await api.fetchStaff(currentUser.tenantId);

                alert('User created successfully! They can now log in with their email.');
            }

            onSave();
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(error.message || 'Error saving user');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Full Name *</Label>
                    <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <Label>Username *</Label>
                    <Input
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="johndoe"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Email *</Label>
                    <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <Label>Phone</Label>
                    <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+265 999 123 456"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Password {!user && '*'}</Label>
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            required={!user}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={user ? 'Leave blank to keep current' : 'Enter password'}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div>
                    <Label>PIN (4 digits) *</Label>
                    <Input
                        required
                        maxLength={4}
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                        placeholder="1234"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Role *</Label>
                    <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Staff['role'] })}
                        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>
                <div>
                    <Label>Status *</Label>
                    <select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {user ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
}
