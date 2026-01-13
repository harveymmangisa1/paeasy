'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building,
  Store,
  Package,
  Phone,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { db, StockLocation } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { useCurrentTenant } from '@/lib/tenant-context';

interface LocationManagerProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect?: (location: StockLocation) => void;
}

export default function LocationManager({ open, onClose, onLocationSelect }: LocationManagerProps) {
  const { tenantId } = useCurrentTenant();
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StockLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'main_shop' as 'main_shop' | 'warehouse' | 'branch' | 'store',
    address: '',
    phone: '',
    contactPerson: '',
    isActive: true
  });

  useEffect(() => {
    if (open) {
      loadLocations();
    }
  }, [open]);

  const loadLocations = async () => {
    try {
      const allLocations = await api.fetchStockLocations(tenantId ?? undefined);
      setLocations(allLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'main_shop',
      address: '',
      phone: '',
      contactPerson: '',
      isActive: true
    });
    setEditingLocation(null);
  };

  const handleEdit = (location: StockLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      code: location.code,
      type: location.type,
      address: location.address,
      phone: location.phone || '',
      contactPerson: location.contactPerson || '',
      isActive: location.isActive
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingLocation) {
        // Update existing location
        await db.stockLocations.update(editingLocation.id!, {
          ...formData,
          updatedAt: new Date(),
          syncStatus: 'pending'
        });
        // We really should have api.updateStockLocation here.
      } else {
        // Add new location
        await api.createStockLocation({
          ...formData,
          tenantId: tenantId ?? undefined
        });
      }

      await loadLocations();
      resetForm();

    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (location: StockLocation) => {
    if (!confirm(`Are you sure you want to delete ${location.name}?`)) {
      return;
    }

    try {
      await db.stockLocations.delete(location.id!);
      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    }
  };

  const toggleStatus = async (location: StockLocation) => {
    try {
      await db.stockLocations.update(location.id!, {
        isActive: !location.isActive,
        updatedAt: new Date(),
        syncStatus: 'pending'
      });
      await loadLocations();
    } catch (error) {
      console.error('Error updating location status:', error);
    }
  };

  const getLocationType = (type: string) => {
    switch (type) {
      case 'main_shop': return { icon: Store, label: 'Main Shop', color: 'text-blue-600 bg-blue-100' };
      case 'warehouse': return { icon: Building, label: 'Warehouse', color: 'text-gray-600 bg-gray-100' };
      case 'branch': return { icon: Store, label: 'Branch', color: 'text-purple-600 bg-purple-100' };
      default: return { icon: Package, label: 'Store', color: 'text-green-600 bg-green-100' };
    }
  };

  const initializeDefaultLocations = async () => {
    try {
      const defaultLocations: Partial<StockLocation>[] = [
        {
          name: 'Main Shop',
          code: 'MAIN',
          type: 'main_shop',
          address: 'Primary Business Location',
          isActive: true
        },
        {
          name: 'Warehouse',
          code: 'WH',
          type: 'warehouse',
          address: 'Main Storage Facility',
          isActive: true
        },
        {
          name: 'Branch Store',
          code: 'BRANCH1',
          type: 'branch',
          address: 'Secondary Business Location',
          isActive: true
        }
      ];

      for (const location of defaultLocations) {
        await api.createStockLocation({
          name: location.name || '',
          code: location.code || '',
          type: (location.type as any) || 'store',
          address: location.address || '',
          phone: location.phone,
          contactPerson: location.contactPerson,
          isActive: location.isActive ?? true,
          tenantId: tenantId ?? undefined
        });
      }

      await loadLocations();
    } catch (error) {
      console.error('Error initializing default locations:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Management
          </DialogTitle>
        </DialogHeader>

        {locations.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations Yet</h3>
            <p className="text-gray-600 mb-6">
              Add your business locations to start managing stock transfers between them.
            </p>
            <Button onClick={initializeDefaultLocations} className="mr-2">
              Initialize Default Locations
            </Button>
            <Button variant="outline" onClick={() => resetForm()}>
              Add Custom Location
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Location Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Location Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Main Shop, Warehouse"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Location Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g., MAIN, WH, B1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type">Location Type *</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="main_shop">Main Shop</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="branch">Branch</option>
                      <option value="store">Store</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Physical address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Contact number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Manager/Contact name"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Location is Active</Label>
                  </div>

                  <DialogFooter>
                    {editingLocation && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="mr-2"
                      >
                        Cancel Edit
                      </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : (editingLocation ? 'Update Location' : 'Add Location')}
                    </Button>
                  </DialogFooter>
                </form>
              </CardContent>
            </Card>

            {/* Locations List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Active Locations ({locations.filter(l => l.isActive).length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={initializeDefaultLocations}
                >
                  Add Defaults
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {locations.map((location) => {
                  const { icon: Icon, label, color } = getLocationType(location.type);
                  return (
                    <Card key={location.id} className={`p-4 ${!location.isActive ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 ${color.split(' ')[0]}`} />
                            <span className="font-semibold">{location.name}</span>
                            <Badge variant="outline" className={color}>
                              {label}
                            </Badge>
                            {!location.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Code:</span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{location.address}</span>
                            </div>
                            {location.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{location.phone}</span>
                              </div>
                            )}
                            {location.contactPerson && (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span>{location.contactPerson}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(location)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(location)}
                            className={location.isActive ? 'text-orange-600' : 'text-green-600'}
                          >
                            {location.isActive ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(location)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {onLocationSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => {
                            onLocationSelect(location);
                            onClose();
                          }}
                        >
                          Select This Location
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}