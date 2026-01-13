'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  ArrowRight,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Truck,
  Building,
  Store,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { db, StockTransfer, StockTransferItem, StockLocation, Product, StockMovement } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';

interface StockTransferFormProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  product?: Product;
  initialData?: Partial<StockTransfer>;
}

export default function StockTransferForm({
  open,
  onClose,
  onUpdate,
  product,
  initialData
}: StockTransferFormProps) {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<StockLocation[]>([]);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<StockTransferItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (open) {
      loadLocations();
      if (product) {
        // Add product to items if provided
        setItems([{
          productId: product.id!,
          productName: product.name,
          sku: product.sku,
          quantity: 1,
          unitCost: product.costPrice,
          totalValue: product.costPrice
        }]);
      }
    }
  }, [open, product]);

  const loadLocations = async () => {
    try {
      const [allLocations, allProducts] = await Promise.all([
        api.fetchStockLocations(tenantId ?? undefined),
        api.fetchProducts(tenantId ?? undefined)
      ]);
      setLocations(allLocations);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const addProduct = (product: Product) => {
    const existingIndex = items.findIndex(i => i.productId === product.id!);
    if (existingIndex > -1) {
      updateItemQuantity(existingIndex, items[existingIndex].quantity + 1);
    } else {
      setItems([...items, {
        productId: product.id!,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitCost: product.costPrice,
        totalValue: product.costPrice
      }]);
    }
    setSearchTerm('');
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id?.toString() === locationId);
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

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, quantity);
    newItems[index].totalValue = newItems[index].quantity * newItems[index].unitCost;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + item.totalValue, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromLocation || !toLocation) {
      alert('Please select both source and destination locations');
      return;
    }

    if (fromLocation === toLocation) {
      alert('Source and destination locations cannot be the same');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item to transfer');
      return;
    }

    setLoading(true);

    try {
      const transferNumber = `TRF-${Date.now()}`;
      const fromLocationObj = locations.find(loc => loc.id?.toString() === fromLocation);
      const toLocationObj = locations.find(loc => loc.id?.toString() === toLocation);

      const transfer: Omit<StockTransfer, 'id' | 'uuid' | 'syncStatus'> = {
        transferNumber,
        fromLocationId: parseInt(fromLocation),
        fromLocationName: fromLocationObj?.name || '',
        toLocationId: parseInt(toLocation),
        toLocationName: toLocationObj?.name || '',
        items,
        status: 'draft',
        subtotal: getTotalValue(),
        totalValue: getTotalValue(),
        reason,
        requestedBy: user?.name || '',
        requestedById: user?.id || 0,
        notes,
        createdAt: new Date(),
        ...(tenantId && { tenantId })
      };

      await api.createStockTransfer(transfer);

      // Create stock movements for each item
      for (const item of items) {
        const movement: Omit<StockMovement, 'id' | 'uuid' | 'syncStatus'> = {
          movementNumber: `MOV-${Date.now()}-${item.productId}`,
          movementType: 'transfer' as const,
          fromLocationId: parseInt(fromLocation),
          toLocationId: parseInt(toLocation),
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalValue: item.totalValue,
          reason: `Transfer to ${toLocationObj?.name}: ${reason}`,
          status: 'pending' as const,
          processedBy: user?.name || '',
          processedById: user?.id || 0,
          createdAt: new Date(),
          ...(tenantId && { tenantId })
        };

        await api.createStockMovement(movement);
      }

      onUpdate();
      onClose();
      resetForm();

    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Failed to create stock transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFromLocation('');
    setToLocation('');
    setReason('');
    setNotes('');
    setItems([]);
  };

  if (!locations.length) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Locations Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Please add locations first before creating transfers.</p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Stock Transfer Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fromLocation">From Location</Label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => {
                    const { icon: Icon, label, color } = getLocationType(location.type);
                    return (
                      <SelectItem key={location.id} value={location.id?.toString() || ''}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span>{location.name}</span>
                          <Badge variant="outline" className="text-xs">{label}</Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="toLocation">To Location</Label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => {
                    const { icon: Icon, label, color } = getLocationType(location.type);
                    return (
                      <SelectItem key={location.id} value={location.id?.toString() || ''}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span>{location.name}</span>
                          <Badge variant="outline" className="text-xs">{label}</Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visual Transfer Direction */}
          {fromLocation && toLocation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">From</div>
                  <div className="font-semibold">{getLocationName(fromLocation)}</div>
                </div>
                <ArrowRight className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">To</div>
                  <div className="font-semibold">{getLocationName(toLocation)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Items */}
          <div className="space-y-4">
            <Label>Transfer Items</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or SKU to add..."
                className="pl-10 h-11"
              />

              {/* Search Results */}
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">K {product.sellingPrice.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{product.stockQuantity} in stock</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No items added to transfer</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-20 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">K {item.unitCost.toLocaleString()} each</div>
                          <div className="font-semibold">K {item.totalValue.toLocaleString()}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Transfer Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reason">Reason for Transfer</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Stock replenishment, Seasonal transfer"
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information"
              />
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Transfer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Value:</span>
                  <span className="text-blue-600">K {getTotalValue().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert */}
          {fromLocation === toLocation && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Source and destination locations cannot be the same.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !fromLocation || !toLocation || fromLocation === toLocation || items.length === 0}
            >
              {loading ? 'Creating Transfer...' : 'Create Transfer Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
