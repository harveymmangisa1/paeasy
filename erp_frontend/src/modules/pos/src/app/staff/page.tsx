'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { db, Staff } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { StaffForm } from '@/components/forms/StaffForm';
import { hasPermission } from '@/lib/permissions';

export default function StaffPage() {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
    if (tenantId) realtimeSync.setTenantId(tenantId);
    realtimeSync.startStaffSync(() => loadStaff());
    return () => realtimeSync.stopAll();
  }, [tenantId]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm]);

  const loadStaff = async () => {
    try {
      const allStaff = await api.fetchStaff(tenantId || undefined);
      setStaff(allStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = async (data: any) => {
    try {
      // For staff, we should ideally go through the create-user API
      // But if the user used this form, let's assume they want local/manual management
      // (Though it's better to use the user management page)
      // Since StaffPage seems to be a simpler version of UsersPage, let's keep it consistent
      alert('Please use the User Management page to create staff accounts with login access.');
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleEditStaff = async (data: any, staffId: number) => {
    try {
      await api.updateStaff(staffId, {
        ...data,
        updatedAt: new Date(),
      });
      loadStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Error updating staff');
    }
  };


  const handleDeleteStaff = async (staffId: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.deleteStaff(staffId);
        loadStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Error deleting staff member');
      }
    }
  };

  const handleToggleStatus = async (staffId: number, isActive: boolean) => {
    try {
      await api.updateStaff(staffId, {
        isActive: !isActive as boolean,
        updatedAt: new Date()
      });
      loadStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
      alert('Error updating staff status');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'cashier': return 'outline';
      default: return 'outline';
    }
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Check permissions
  if (!hasPermission(user, 'users', 'view')) {
    return (
      <ModernLayout>
        <div className="p-6">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access staff management.</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (loading) {
    return (
      <ModernLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <StaffForm onSubmit={handleAddStaff} currentTenantId={tenantId || ''}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </StaffForm>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {staff.filter(s => s.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {staff.filter(s => !s.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {staff.filter(s => s.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStaff.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No staff members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Staff Member</th>
                      <th className="text-left p-3 font-medium">Username</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Last Login</th>
                      <th className="text-center p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">PIN: {member.pin}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{member.username}</td>
                        <td className="p-3">
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={member.isActive ? 'default' : 'destructive'}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatLastLogin(member.lastLogin)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <StaffForm staff={member} onSubmit={(data) => handleEditStaff(data, member.id!)} currentTenantId={tenantId || ''}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </StaffForm>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleStatus(member.id!, member.isActive)}
                            >
                              {member.isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteStaff(member.id!)}
                              disabled={member.id === user?.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}