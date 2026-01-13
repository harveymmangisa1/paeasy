'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { db, Product } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Plus, Minus, Package, TrendingUp, AlertTriangle } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return `K ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface QuickStockEditProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function QuickStockEdit({ product, open, onClose, onUpdate }: QuickStockEditProps) {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const [newStock, setNewStock] = useState(product?.stockQuantity?.toString() || '0');
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'remove'>('set');
  const [adjustmentAmount, setAdjustmentAmount] = useState('1');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStockStatus = () => {
    const current = parseInt(newStock) || 0;
    if (current === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    if (current <= (product?.reorderLevel || 0)) return { status: 'Low Stock', color: 'text-orange-600 bg-orange-100', icon: TrendingUp };
    return { status: 'In Stock', color: 'text-green-600 bg-green-100', icon: Package };
  };

  const calculateNewStock = () => {
    const current = parseInt(newStock) || 0;
    const adjustment = parseInt(adjustmentAmount) || 0;

    switch (adjustmentType) {
      case 'add':
        return current + adjustment;
      case 'remove':
        return Math.max(0, current - adjustment);
      case 'set':
      default:
        return parseInt(newStock) || 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const finalStock = calculateNewStock();

      await api.updateProduct(product.id!, {
        stockQuantity: finalStock,
        updatedAt: new Date()
      });

      // Add transaction record
      await api.createTransaction({
        type: adjustmentType === 'add' ? 'stock_in' : adjustmentType === 'remove' ? 'stock_out' : 'adjustment',
        referenceId: product.id!,
        referenceType: 'product',
        description: `Stock ${adjustmentType === 'add' ? 'increase' : adjustmentType === 'remove' ? 'decrease' : 'adjusted'} for ${product?.name || 'Unknown Product'}${reason ? `: ${reason}` : ''}`,
        amount: finalStock - (product?.stockQuantity || 0),
        staffId: user?.id || 0,
        createdAt: new Date(),
        tenantId: tenantId || undefined
      });

      onUpdate();
      onClose();

      // Reset form
      setAdjustmentType('set');
      setAdjustmentAmount('1');
      setReason('');

    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Stock Edit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{product?.name || 'Unknown Product'}</p>
                <p className="text-sm text-gray-500">SKU: {product?.sku || 'N/A'}</p>
                <p className="text-sm text-gray-500">Category: {product?.category || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-lg font-bold">{product?.stockQuantity || 0}</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-2">
            <Badge className={stockStatus.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {stockStatus.status}
            </Badge>
            <span className="text-sm text-gray-500">
              Reorder at: {product?.reorderLevel || 0} units
            </span>
          </div>

          {/* Adjustment Type */}
          <div>
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                type="button"
                variant={adjustmentType === 'set' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAdjustmentType('set')}
              >
                Set Exact
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'add' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAdjustmentType('add')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Stock
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'remove' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAdjustmentType('remove')}
              >
                <Minus className="h-3 w-3 mr-1" />
                Remove Stock
              </Button>
            </div>
          </div>

          {/* Stock Input */}
          {adjustmentType === 'set' ? (
            <div>
              <Label htmlFor="newStock">New Stock Quantity</Label>
              <Input
                id="newStock"
                type="number"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter new stock quantity"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="adjustmentAmount">
                {adjustmentType === 'add' ? 'Stock to Add' : 'Stock to Remove'}
              </Label>
              <Input
                id="adjustmentAmount"
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder={`Enter quantity to ${adjustmentType === 'add' ? 'add' : 'remove'}`}
              />
              <div className="text-sm text-gray-500 mt-1">
                {adjustmentType === 'add' && `New total: ${(product?.stockQuantity || 0) + (parseInt(adjustmentAmount) || 0)}`}
                {adjustmentType === 'remove' && `New total: ${Math.max(0, (product?.stockQuantity || 0) - (parseInt(adjustmentAmount) || 0))}`}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason for Change (Optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., New stock delivery, Damaged items, Correction"
            />
          </div>

          {/* Summary */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              <strong>Summary:</strong>
              {adjustmentType === 'set' && ` Setting stock from ${product?.stockQuantity || 0} to ${parseInt(newStock) || 0}`}
              {adjustmentType === 'add' && ` Adding ${parseInt(adjustmentAmount) || 0} units (from ${product?.stockQuantity || 0} to ${(product?.stockQuantity || 0) + (parseInt(adjustmentAmount) || 0)})`}
              {adjustmentType === 'remove' && ` Removing ${parseInt(adjustmentAmount) || 0} units (from ${product?.stockQuantity || 0} to ${Math.max(0, (product?.stockQuantity || 0) - (parseInt(adjustmentAmount) || 0))})`}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Stock Value: {formatCurrency(calculateNewStock() * (product?.costPrice || 0))}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : `Update Stock`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}