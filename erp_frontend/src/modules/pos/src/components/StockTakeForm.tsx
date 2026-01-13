'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    ClipboardCheck,
    AlertTriangle,
    ArrowRight,
    Package,
    Trash2,
    X,
    History,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Product, StockLocation, StockTake, StockTakeItem } from '@/lib/db/database';
import { toast } from 'sonner';

interface StockTakeFormProps {
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function StockTakeForm({ open, onClose, onUpdate }: StockTakeFormProps) {
    const { user } = useAuth();
    const { tenantId } = useCurrentTenant();

    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<StockLocation[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<StockTakeItem[]>([]);
    const [notes, setNotes] = useState('');

    // Load locations and products
    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const loadData = async () => {
        try {
            const [allLocations, allProducts] = await Promise.all([
                api.fetchStockLocations(tenantId ?? undefined),
                api.fetchProducts(tenantId ?? undefined)
            ]);
            setLocations(allLocations.filter(l => l.isActive));
            setProducts(allProducts);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load locations or products');
        }
    };

    // Initialize items when location changes
    const handleLocationChange = (locationId: string) => {
        setSelectedLocation(locationId);
        if (!locationId) {
            setItems([]);
            return;
        }

        // Pre-populate with all products for this location
        // Note: In this system, all products are currently shared across locations, 
        // but we can filter by those that have stock records if needed.
        // For now, let's allow taking stock of any product.
        // We'll calculate current stock based on global or location-specific stock.
        const initialItems = products.map(p => {
            const locStock = p.locationStock?.find(ls => ls.locationId === parseInt(locationId));
            const currentCount = locStock ? locStock.quantity : p.stockQuantity;

            return {
                productId: p.id!,
                productName: p.name,
                sku: p.sku,
                currentStock: currentCount,
                physicalStock: currentCount, // Default to system stock
                difference: 0,
                unitCost: p.costPrice,
                adjustmentValue: 0
            };
        });
        setItems(initialItems);
    };

    const updatePhysicalCount = (index: number, count: number) => {
        const newItems = [...items];
        const item = { ...newItems[index] };
        item.physicalStock = isNaN(count) ? 0 : count;
        item.difference = item.physicalStock - item.currentStock;
        item.adjustmentValue = item.difference * item.unitCost;
        newItems[index] = item;
        setItems(newItems);
    };

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter(i =>
            i.productName.toLowerCase().includes(lower) ||
            i.sku.toLowerCase().includes(lower)
        );
    }, [items, searchTerm]);

    const stats = useMemo(() => {
        const totalDiff = items.reduce((sum, i) => sum + i.difference, 0);
        const totalValue = items.reduce((sum, i) => sum + i.adjustmentValue, 0);
        const changedCount = items.filter(i => i.difference !== 0).length;
        return { totalDiff, totalValue, changedCount };
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation || items.length === 0) return;

        setLoading(true);
        try {
            const location = locations.find(l => l.id === parseInt(selectedLocation));

            // 1. Create Stock Take record
            const stockTake: Omit<StockTake, 'id' | 'uuid' | 'syncStatus'> = {
                tenantId: tenantId ?? undefined,
                locationId: parseInt(selectedLocation),
                locationName: location?.name || 'Unknown',
                status: 'completed',
                items: items,
                notes,
                conductedBy: user?.name || 'Unknown Staff',
                conductedById: user?.id || 0,
                startedAt: new Date(),
                completedAt: new Date()
            };

            await api.createStockTake(stockTake);

            // 2. Create Adjustment Movements for changed items
            const adjustmentItems = items.filter(i => i.difference !== 0);

            for (const item of adjustmentItems) {
                await api.createStockMovement({
                    tenantId: tenantId ?? undefined,
                    movementNumber: `ADJ-${Date.now()}-${item.productId}`,
                    movementType: item.difference > 0 ? 'stock_in' : 'stock_out',
                    fromLocationId: item.difference < 0 ? parseInt(selectedLocation) : undefined,
                    toLocationId: item.difference > 0 ? parseInt(selectedLocation) : undefined,
                    productId: item.productId,
                    productName: item.productName,
                    sku: item.sku,
                    quantity: Math.abs(item.difference),
                    unitCost: item.unitCost,
                    totalValue: Math.abs(item.adjustmentValue),
                    reason: `Stock Take Adjustment: ${notes || 'Regular stock check'}`,
                    status: 'completed',
                    processedBy: user?.name || 'Unknown Staff',
                    processedById: user?.id || 0,
                    notes: `System stock was ${item.currentStock}, counted ${item.physicalStock}`
                });

                // 3. Update Product Stock
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const updatedLocationStock = product.locationStock?.map(ls =>
                        ls.locationId === parseInt(selectedLocation)
                            ? { ...ls, quantity: item.physicalStock }
                            : ls
                    );

                    await api.updateProduct(item.productId, {
                        stockQuantity: product.stockQuantity + item.difference,
                        locationStock: updatedLocationStock,
                        updatedAt: new Date()
                    });
                }
            }

            toast.success('Stock take completed successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error completing stock take:', error);
            toast.error('Failed to complete stock take');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <ClipboardCheck className="h-6 w-6 text-blue-600" />
                        Stock Take (Physical Inventory)
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Compare physical stock with system records and adjust discrepancies.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Location Selection */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Inventory Location</Label>
                                <select
                                    id="location"
                                    value={selectedLocation}
                                    onChange={(e) => handleLocationChange(e.target.value)}
                                    className="w-full h-10 px-3 py-2 bg-white border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">Select a location...</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name} ({loc.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Reference / Notes</Label>
                                <Input
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g., Annual stock take 2024"
                                />
                            </div>
                        </div>

                        {selectedLocation && (
                            <>
                                {/* Search & Stats */}
                                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div className="relative flex-1 w-full">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search items by name or SKU..."
                                            className="pl-10 h-10 w-full md:max-w-xs"
                                        />
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-semibold">Changed Items</div>
                                            <div className={`text-lg font-bold ${stats.changedCount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {stats.changedCount}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-semibold">Net Difference</div>
                                            <div className={`text-lg font-bold ${stats.totalDiff < 0 ? 'text-red-600' : stats.totalDiff > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                {stats.totalDiff > 0 ? '+' : ''}{stats.totalDiff}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-semibold">Value Adj.</div>
                                            <div className={`text-lg font-bold ${stats.totalValue < 0 ? 'text-red-600' : stats.totalValue > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                K {stats.totalValue.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-4">Product / SKU</div>
                                        <div className="col-span-2 text-center">System</div>
                                        <div className="col-span-3 text-center">Physical Count</div>
                                        <div className="col-span-3 text-right">Adjustment</div>
                                    </div>

                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <X className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">No items found matching your search</p>
                                        </div>
                                    ) : (
                                        filteredItems.map((item, index) => {
                                            const actualIndex = items.findIndex(i => i.productId === item.productId);
                                            return (
                                                <Card key={item.productId} className={`transition-all ${item.difference !== 0 ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                                                    <CardContent className="p-4 grid grid-cols-12 gap-4 items-center">
                                                        <div className="col-span-4">
                                                            <div className="font-semibold text-gray-900 truncate">{item.productName}</div>
                                                            <div className="text-xs text-gray-500 font-mono">{item.sku}</div>
                                                        </div>

                                                        <div className="col-span-2 text-center font-medium text-gray-600">
                                                            {item.currentStock}
                                                        </div>

                                                        <div className="col-span-3 flex justify-center">
                                                            <div className="flex items-center gap-2 group">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => updatePhysicalCount(actualIndex, item.physicalStock - 1)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    value={item.physicalStock}
                                                                    onChange={(e) => updatePhysicalCount(actualIndex, parseInt(e.target.value))}
                                                                    className={`w-20 text-center h-9 font-bold ${item.difference !== 0 ? 'border-orange-500 ring-orange-500' : ''}`}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => updatePhysicalCount(actualIndex, item.physicalStock + 1)}
                                                                >
                                                                    <ClipboardCheck className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="col-span-3 text-right">
                                                            {item.difference !== 0 ? (
                                                                <div className="space-y-0.5">
                                                                    <div className={`text-sm font-bold ${item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {item.difference > 0 ? '+' : ''}{item.difference} units
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        K {item.adjustmentValue.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">Match</span>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}

                        {!selectedLocation && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600">Start a Stock Take</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    Select an inventory location above to begin counting physical stock.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 border-t bg-gray-50">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedLocation || items.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 h-10 px-8"
                        >
                            {loading ? 'Processing...' : 'Complete Stock Take'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
