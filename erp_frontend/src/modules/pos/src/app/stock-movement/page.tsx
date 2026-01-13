'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Truck,
  ArrowRight,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Package,
  Building,
  Store
} from 'lucide-react';
import { db, StockTransfer, StockMovement, StockLocation } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { format } from 'date-fns';
import { useCurrentTenant } from '@/lib/tenant-context';

export default function StockMovementPage() {
  const { tenantId } = useCurrentTenant();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'transfers' | 'movements'>('transfers');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);

  useEffect(() => {
    loadData();

    // Start real-time sync
    realtimeSync.setTenantId(tenantId);
    realtimeSync.startLocationsSync(() => loadData());
    realtimeSync.startStockSync(() => loadData());

    return () => realtimeSync.stopAll();
  }, [tenantId]);

  const loadData = async () => {
    try {
      const [allTransfers, allMovements, allLocations] = await Promise.all([
        api.fetchStockTransfers(tenantId),
        api.fetchStockMovements(tenantId),
        api.fetchStockLocations(tenantId)
      ]);

      setTransfers(allTransfers);
      setMovements(allMovements);
      setLocations(allLocations);
    } catch (error) {
      console.error('Error loading stock movement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (locationId?: number) => {
    if (!locationId) return 'N/A';
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown';
  };

  const getLocationType = (type: string) => {
    switch (type) {
      case 'main_shop': return { icon: Store, label: 'Main Shop', color: 'text-blue-600' };
      case 'warehouse': return { icon: Building, label: 'Warehouse', color: 'text-gray-600' };
      case 'branch': return { icon: Store, label: 'Branch', color: 'text-purple-600' };
      default: return { icon: Package, label: 'Store', color: 'text-green-600' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft': return { icon: Clock, label: 'Draft', color: 'text-gray-600 bg-gray-100' };
      case 'pending_approval': return { icon: Clock, label: 'Pending Approval', color: 'text-yellow-600 bg-yellow-100' };
      case 'approved': return { icon: CheckCircle, label: 'Approved', color: 'text-green-600 bg-green-100' };
      case 'in_transit': return { icon: Truck, label: 'In Transit', color: 'text-blue-600 bg-blue-100' };
      case 'completed': return { icon: CheckCircle, label: 'Completed', color: 'text-green-600 bg-green-100' };
      case 'cancelled': return { icon: XCircle, label: 'Cancelled', color: 'text-red-600 bg-red-100' };
      default: return { icon: AlertTriangle, label: status, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toLocationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.movementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || movement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateTransferStatus = async (transfer: StockTransfer, newStatus: StockTransfer['status']) => {
    try {
      await api.updateStockTransfer(transfer.id!, {
        status: newStatus,
        ...(newStatus === 'completed' ? { completedAt: new Date() } : {}),
        updatedAt: new Date()
      });

      // Update related movements
      if (newStatus === 'completed') {
        const relatedMovements = movements.filter(m =>
          m.productId === transfer.items[0].productId && // Rough check, should ideally be linked by transferId
          m.movementType === 'transfer' &&
          new Date(m.createdAt) >= new Date(transfer.createdAt)
        );

        for (const movement of relatedMovements) {
          await api.updateStockMovement(movement.id!, {
            status: 'completed',
            completedAt: new Date()
          });
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error updating transfer status:', error);
      alert('Failed to update transfer status');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stock movements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stock Movement</h1>
        <p className="text-gray-600 mt-1">Track transfers and movements between locations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <Button
          variant={activeTab === 'transfers' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('transfers')}
          className="rounded-none border-b-2"
        >
          Stock Transfers
        </Button>
        <Button
          variant={activeTab === 'movements' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('movements')}
          className="rounded-none border-b-2"
        >
          Movement History
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder={activeTab === 'transfers' ? "Search transfers..." : "Search movements..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfers List */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {filteredTransfers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No Matching Transfers' : 'No Stock Transfers Yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first stock transfer to start tracking movements between locations.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTransfers.map((transfer) => {
              const { icon: StatusIcon, label: statusLabel, color: statusColor } = getStatusInfo(transfer.status);
              return (
                <Card key={transfer.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{transfer.transferNumber}</h3>
                          <Badge className={statusColor}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabel}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">From:</span>
                            <span className="font-medium">{transfer.fromLocationName}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">To:</span>
                            <span className="font-medium">{transfer.toLocationName}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Items:</span>
                            <div className="font-medium">{transfer.items.length}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Quantity:</span>
                            <div className="font-medium">
                              {transfer.items.reduce((sum, item) => sum + item.quantity, 0)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Value:</span>
                            <div className="font-medium">K {transfer.totalValue.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <div className="font-medium">
                              {format(new Date(transfer.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>

                        {transfer.reason && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                            <span className="text-gray-500">Reason: </span>
                            <span>{transfer.reason}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransfer(transfer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {transfer.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => updateTransferStatus(transfer, 'in_transit')}
                          >
                            Start Transit
                          </Button>
                        )}

                        {transfer.status === 'in_transit' && (
                          <Button
                            size="sm"
                            onClick={() => updateTransferStatus(transfer, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Movements List */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          {filteredMovements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No Matching Movements' : 'No Stock Movements Yet'}
                </h3>
                <p className="text-gray-600">
                  Stock movements will appear here as transfers are processed and inventory is adjusted.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMovements.map((movement) => {
              const { icon: StatusIcon, label: statusLabel, color: statusColor } = getStatusInfo(movement.status);
              const { icon: MovementIcon, label: movementLabel } = movement.movementType === 'transfer'
                ? { icon: Truck, label: 'Transfer' }
                : { icon: Package, label: movement.movementType };

              return (
                <Card key={movement.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MovementIcon className="h-5 w-5 text-gray-600" />
                          <span className="font-semibold">{movement.movementNumber}</span>
                          <Badge className={statusColor}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabel}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Product</div>
                            <div className="font-medium">{movement.productName}</div>
                            <div className="text-gray-400">SKU: {movement.sku}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Quantity</div>
                            <div className="font-medium">{movement.quantity}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Value</div>
                            <div className="font-medium">K {movement.totalValue.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">
                              {format(new Date(movement.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Transfer Details: {selectedTransfer.transferNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Location</Label>
                  <div className="font-semibold">{selectedTransfer.fromLocationName}</div>
                </div>
                <div>
                  <Label>To Location</Label>
                  <div className="font-semibold">{selectedTransfer.toLocationName}</div>
                </div>
              </div>

              <div>
                <Label>Items</Label>
                <div className="space-y-2 mt-2">
                  {selectedTransfer.items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity} units</div>
                          <div className="text-sm text-gray-500">K {item.totalValue.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Value</Label>
                  <div className="font-semibold text-lg">K {selectedTransfer.totalValue.toLocaleString()}</div>
                </div>
                <div>
                  <Label>Created By</Label>
                  <div className="font-semibold">{selectedTransfer.requestedBy}</div>
                </div>
              </div>

              {selectedTransfer.reason && (
                <div>
                  <Label>Reason</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedTransfer.reason}</div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTransfer(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}