'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db, Sale, SaleItem, Product, Transaction } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { ArrowUpDown, Search, RefreshCw, Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ReturnItem {
  id?: number;
  saleId: number;
  saleItem: SaleItem;
  product: Product;
  returnQuantity: number;
  returnReason: string;
  refundAmount: number;
  refundMethod: 'cash' | 'store_credit' | 'original_payment';
}

interface ReturnRecord {
  id: number;
  saleId: number;
  receiptNumber: string;
  totalAmount: number;
  itemsCount: number;
  processedBy: string;
  processedAt: Date;
  items: ReturnItem[];
}

export default function ReturnsManagementPage() {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [processingReturns, setProcessingReturns] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  useEffect(() => {
    loadSales();
    realtimeSync.setTenantId(tenantId);
    realtimeSync.startSalesSync(() => loadSales());
    return () => realtimeSync.stopAll();
  }, [tenantId]);

  const loadSales = async () => {
    try {
      const allSales = await api.fetchSales(tenantId);
      setSales(allSales.filter(sale => sale.status === 'completed' || sale.status === 'partial_return'));
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    const initialReturnItems: ReturnItem[] = sale.items.map(item => ({
      saleId: sale.id!,
      saleItem: item,
      product: {} as Product, // Will be loaded
      returnQuantity: 0,
      returnReason: '',
      refundAmount: 0,
      refundMethod: 'cash'
    }));

    // Load product details for each item
    Promise.all(
      sale.items.map(async (item, index) => {
        const product = await db.products.get(item.productId);
        if (product) {
          initialReturnItems[index].product = product;
        }
      })
    ).then(() => {
      setReturnItems(initialReturnItems);
      setShowReturnDialog(true);
    });
  };

  const handleReturnQuantityChange = (index: number, quantity: number) => {
    const newItems = [...returnItems];
    const maxQuantity = newItems[index].saleItem.quantity;
    newItems[index].returnQuantity = Math.min(Math.max(0, quantity), maxQuantity);

    // Auto-calculate refund amount based on quantity
    const item = newItems[index];
    const refundAmount = (item.returnQuantity / maxQuantity) *
      (item.saleItem.totalPrice - item.saleItem.discountAmount);

    newItems[index].refundAmount = Math.round(refundAmount * 100) / 100;
    setReturnItems(newItems);
  };

  const processReturns = async () => {
    if (!selectedSale || !user) return;

    setProcessingReturns(true);
    try {
      const totalRefundAmount = returnItems.reduce((sum, item) => sum + item.refundAmount, 0);

      // Create a new "return" transaction
      const returnTransaction = {
        receiptNumber: `RET${Date.now()}`,
        items: returnItems.map(item => ({
          productId: item.saleItem.productId,
          productName: item.saleItem.productName,
          sku: item.saleItem.sku,
          quantity: -item.returnQuantity, // Negative for returns
          unitPrice: item.saleItem.unitPrice,
          costPrice: item.saleItem.costPrice,
          discountAmount: item.saleItem.discountAmount,
          taxAmount: -(item.saleItem.taxAmount * (item.returnQuantity / item.saleItem.quantity)),
          totalPrice: -item.refundAmount
        })),
        subtotal: -totalRefundAmount,
        discountAmount: 0,
        taxAmount: returnItems.reduce((sum, item) =>
          sum - (item.saleItem.taxAmount * (item.returnQuantity / item.saleItem.quantity)), 0),
        totalAmount: -totalRefundAmount,
        paidAmount: 0,
        changeAmount: 0,
        paymentMethod: 'cash' as const,
        staffId: user.id!,
        staffName: user.name,
        createdAt: new Date(),
        status: 'completed' as const,
        uuid: crypto.randomUUID(),
        syncStatus: 'pending' as const,
        ...(tenantId && { tenantId })
      };

      // DATABASE-FIRST approach using ApiClient
      await api.createSale(returnTransaction);

      // Update product stock (restock returned items)
      for (const returnItem of returnItems) {
        if (returnItem.returnQuantity > 0) {
          await api.updateProduct(returnItem.saleItem.productId, {
            stockQuantity: returnItem.product.stockQuantity + returnItem.returnQuantity,
            updatedAt: new Date()
          });
        }
      }

      // Mark original sale as partially returned
      await api.updateSale(selectedSale.id!, {
        status: 'partial_return' as const,
        updatedAt: new Date()
      });

      // Store return record for audit
      await api.createTransaction({
        type: 'return',
        referenceId: selectedSale.id!,
        referenceType: 'sale',
        description: `Return of ${returnItems.length} items from sale ${selectedSale.receiptNumber}`,
        amount: -totalRefundAmount,
        staffId: user.id!,
        createdAt: new Date(),
        ...(tenantId && { tenantId })
      });

      const returnRecord = {
        id: Date.now(),
        saleId: selectedSale.id!,
        receiptNumber: selectedSale.receiptNumber,
        totalAmount: totalRefundAmount,
        itemsCount: returnItems.filter(item => item.returnQuantity > 0).length,
        processedBy: user.name,
        processedAt: new Date(),
        items: returnItems
      };

      setReturns([returnRecord, ...returns]);

      setShowReturnDialog(false);
      setSelectedSale(null);
      setReturnItems([]);
      alert('Return processed successfully!');

    } catch (error) {
      console.error('Error processing return:', error);
      alert('Failed to process return. Please try again.');
    } finally {
      setProcessingReturns(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `K ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ModernLayout>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              Total Returns: K {returns.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
            </div>
            <Button variant="outline" size="sm" onClick={loadSales}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Sales Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Sale for Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by receipt number or staff name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Sales List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSales.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No sales found
                    </p>
                  ) : (
                    filteredSales.slice(0, 20).map((sale) => (
                      <div
                        key={sale.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectSale(sale)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{sale.receiptNumber}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(sale.createdAt), 'PPP p')}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {formatCurrency(sale.totalAmount)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{sale.staffName}</span>
                          <span>{sale.items.length} items</span>
                          <span className={
                            sale.status === 'completed' ? 'text-green-600' :
                              sale.status === 'partial_return' ? 'text-orange-600' :
                                'text-gray-600'
                          }>
                            {sale.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Return History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {returns.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No returns processed yet
                    </p>
                  ) : (
                    returns.map((returnRecord) => (
                      <div
                        key={returnRecord.id}
                        className="border rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{returnRecord.receiptNumber}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(returnRecord.processedAt), 'PPP p')}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            {formatCurrency(returnRecord.totalAmount)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{returnRecord.itemsCount} items returned</span>
                          <span className="ml-4">By {returnRecord.processedBy}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Return Processing Dialog */}
        <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Process Return - {selectedSale?.receiptNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Sale Summary */}
              {selectedSale && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sale Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date:</p>
                        <p className="font-medium">{format(new Date(selectedSale.createdAt), 'PPP p')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Staff:</p>
                        <p className="font-medium">{selectedSale.staffName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Method:</p>
                        <p className="font-medium">{selectedSale.paymentMethod.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Sale:</p>
                        <p className="font-medium">{formatCurrency(selectedSale.totalAmount)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Return Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items to Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {returnItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <p className="font-medium text-sm">{item.product.name}</p>
                            <p className="text-sm text-gray-500">{item.product.sku}</p>
                            <p className="text-sm text-gray-600">
                              Original: {item.saleItem.quantity} units @ K {item.saleItem.unitPrice}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Max: {item.saleItem.quantity}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <Label htmlFor={`return-qty-${index}`}>Return Quantity</Label>
                            <Input
                              id={`return-qty-${index}`}
                              type="number"
                              min="0"
                              max={item.saleItem.quantity}
                              value={item.returnQuantity}
                              onChange={(e) => handleReturnQuantityChange(index, parseInt(e.target.value) || 0)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`reason-${index}`}>Return Reason</Label>
                            <Input
                              id={`reason-${index}`}
                              value={item.returnReason}
                              onChange={(e) => {
                                const newItems = [...returnItems];
                                newItems[index].returnReason = e.target.value;
                                setReturnItems(newItems);
                              }}
                              placeholder="e.g., Defective, Wrong size, Customer changed mind"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`refund-${index}`}>Refund Amount</Label>
                            <div className="text-lg font-medium">
                              {formatCurrency(item.refundAmount)}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`method-${index}`}>Refund Method</Label>
                            <Select
                              value={item.refundMethod}
                              onValueChange={(value: "cash" | "store_credit" | "original_payment") => {
                                const newItems = [...returnItems];
                                newItems[index].refundMethod = value;
                                setReturnItems(newItems);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="store_credit">Store Credit</SelectItem>
                                <SelectItem value="original_payment">Original Payment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Return Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Refund Amount:</span>
                      <span className="text-xl font-bold text-red-600">
                        {formatCurrency(returnItems.reduce((sum, item) => sum + item.refundAmount, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReturnDialog(false);
                  setSelectedSale(null);
                  setReturnItems([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={processReturns}
                disabled={processingReturns || returnItems.every(item => item.returnQuantity === 0)}
              >
                {processingReturns ? 'Processing...' : 'Process Return'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModernLayout>
  );
}
