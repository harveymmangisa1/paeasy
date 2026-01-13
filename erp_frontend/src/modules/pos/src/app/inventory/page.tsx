'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  X,
  ClipboardCheck
} from 'lucide-react';
import { db, Product } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { ProductForm } from '@/components/forms/ProductForm';
import QuickStockEdit from '@/components/QuickStockEdit';
import StockTransferForm from '@/components/StockTransferForm';
import LocationManager from '@/components/LocationManager';
import { hasPermission } from '@/lib/permissions';
import { toast } from 'sonner';
import { StockLocation } from '@/lib/db/database';
import StockTakeForm from '@/components/StockTakeForm';

type SortField = 'name' | 'stockQuantity' | 'sellingPrice' | 'category';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';
type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function InventoryPage() {
  const { user } = useAuth();
  const { tenantId: rawTenantId } = useCurrentTenant();
  const tenantId = rawTenantId ?? undefined;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [loading, setLoading] = useState(true);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showStockTakeForm, setShowStockTakeForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [locations, setLocations] = useState<StockLocation[]>([]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch from database (API-first) and update cache
      const [allProducts, allLocations] = await Promise.all([
        api.fetchProducts(tenantId),
        api.fetchStockLocations(tenantId)
      ]);

      setProducts(allProducts);
      setLocations(allLocations);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load inventory');

      // Fallback to cached data if API fails
      const cachedProducts = await db.products.toArray();
      if (cachedProducts.length > 0) {
        setProducts(cachedProducts.filter((p: Product) => !tenantId || p.tenantId === tenantId));
        toast.warning('Using cached data - offline mode');
      }
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadProducts();

    // Start real-time sync
    realtimeSync.setTenantId(tenantId);
    realtimeSync.startProductSync(() => {
      console.log('🔄 Inventory updated from another device');
      loadProducts();
    });
    realtimeSync.startLocationsSync(() => {
      console.log('🔄 Locations updated from another device');
      loadProducts();
    });
    realtimeSync.startStockSync(() => {
      console.log('🔄 Stock records updated from another device');
      loadProducts();
    });
    realtimeSync.startStockTakeSync(() => {
      console.log('🔄 Stock takes updated from another device');
      loadProducts();
    });

    // Cleanup on unmount
    return () => {
      realtimeSync.stopAll();
    };
  }, [loadProducts, tenantId]);

  // Optimized Filtering and Sorting using useMemo
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        p.sku.toLowerCase().includes(lowerSearch) ||
        p.category.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (stockFilter !== 'all') {
      result = result.filter(p => {
        if (stockFilter === 'out_of_stock') return p.stockQuantity === 0;
        if (stockFilter === 'low_stock') return p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel;
        if (stockFilter === 'in_stock') return p.stockQuantity > p.reorderLevel;
        return true;
      });
    }

    return result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, selectedCategory, stockFilter, sortField, sortOrder]);

  // Derived Stats
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.stockQuantity > p.reorderLevel).length,
    lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel).length,
    outOfStock: products.filter(p => p.stockQuantity === 0).length,
    inventoryValue: products.reduce((sum, p) => sum + (p.stockQuantity * p.sellingPrice), 0),
    costValue: products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0),
    categories: Array.from(new Set(products.map(p => p.category))).sort()
  }), [products]);

  const handleAddProduct = async (data: any) => {
    try {
      // API-first: write to database immediately
      await api.createProduct({
        ...data,
        tenantId,
        barcodes: data.barcodes || [],
        unitOfMeasure: data.unitOfMeasure || 'unit',
        taxable: data.taxable || false,
      });

      toast.success('Product added successfully');
      await loadProducts(); // Refresh from cache
    } catch (error: any) {
      if (error.message.includes('Offline')) {
        toast.warning('Product queued - will sync when online');
        await loadProducts(); // Still refresh to show optimistic update
      } else {
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
      }
    }
  };

  const handleEditProduct = async (data: any, productId: number) => {
    try {
      // API-first: update database immediately
      await api.updateProduct(productId, data);

      toast.success('Product updated');
      await loadProducts();
    } catch (error: any) {
      if (error.message.includes('Offline')) {
        toast.warning('Update queued - will sync when online');
        await loadProducts();
      } else {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
      }
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      // API-first: delete from database immediately
      await api.deleteProduct(productId);

      toast.success('Product deleted');
      await loadProducts();
    } catch (error: any) {
      if (error.message.includes('Offline')) {
        toast.warning('Delete queued - will sync when online');
        await loadProducts();
      } else {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (product.stockQuantity <= product.reorderLevel) {
      return { label: 'Low Stock', variant: 'outline' as const, color: 'text-orange-600', bgColor: 'bg-orange-50' };
    }
    return { label: 'In Stock', variant: 'default' as const, color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const formatCurrency = (amount: number) => `K ${amount.toLocaleString()}`;

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Cost Price', 'Selling Price', 'Stock Quantity', 'Reorder Level'];
    const rows = filteredProducts.map(p => [
      `"${p.name}"`, p.sku, `"${p.category}"`, p.costPrice, p.sellingPrice, p.stockQuantity, p.reorderLevel
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  if (loading && products.length === 0) {
    return (
      <ModernLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-muted-foreground animate-pulse">Synchronizing inventory...</p>
        </div>
      </ModernLayout>
    );
  }

  if (!hasPermission(user, 'inventory', 'view')) {
    return (
      <ModernLayout>
        <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="bg-red-50 p-6 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-gray-600 max-w-sm mt-2">
            Your account does not have the required permissions to view the inventory management module.
          </p>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Inventory</h1>
            <p className="text-muted-foreground">Manage products, stock levels, and pricing.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadProducts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ProductForm onSubmit={handleAddProduct}>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </ProductForm>
            <Button
              variant="outline"
              onClick={() => setShowTransferForm(true)}
              className="shadow-sm"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Transfer Stock
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLocationManager(true)}
              className="shadow-sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Locations
            </Button>
            {hasPermission(user, 'inventory', 'edit') && (
              <Button
                className="bg-orange-600 hover:bg-orange-700 shadow-sm text-white"
                onClick={() => setShowStockTakeForm(true)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Stock Take
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Items', value: stats.total, icon: Package, color: 'blue', action: () => setStockFilter('all') },
            { label: 'Healthy Stock', value: stats.inStock, icon: TrendingUp, color: 'green', action: () => setStockFilter('in_stock') },
            { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'orange', action: () => setStockFilter('low_stock') },
            { label: 'Out of Stock', value: stats.outOfStock, icon: TrendingDown, color: 'red', action: () => setStockFilter('out_of_stock') },
            { label: 'Total Value', value: formatCurrency(stats.inventoryValue), icon: DollarSign, color: 'purple', sub: `Cost: ${formatCurrency(stats.costValue)}` },
          ].map((stat, i) => (
            <Card key={i} className={`hover:border-${stat.color}-400 transition-all cursor-pointer shadow-sm`} onClick={stat.action}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-gray-400 font-medium">{stat.sub}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Bar */}
        <Card className="border-none shadow-sm bg-gray-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-200"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {stats.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                  className="h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Status: All</option>
                  <option value="in_stock">Status: In Stock</option>
                  <option value="low_stock">Status: Low Stock</option>
                  <option value="out_of_stock">Status: Out of Stock</option>
                </select>

                <div className="flex bg-white border border-gray-200 rounded-md p-1">
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8"
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <Button variant="link" onClick={() => { setSearchTerm(''); setStockFilter('all'); setSelectedCategory('all'); }}>
              Clear all filters
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <Card className="shadow-sm overflow-hidden border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">Product <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('sellingPrice')}>
                      <div className="flex items-center justify-end gap-2">Price <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stockQuantity')}>
                      <div className="flex items-center justify-end gap-2">Stock <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    const margin = product.sellingPrice > 0
                      ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1)
                      : '0';

                    return (
                      <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">{product.description || 'No description'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="font-normal">{product.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(product.costPrice)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-bold text-gray-900">{formatCurrency(product.sellingPrice)}</div>
                          <div className="text-[10px] text-green-600 font-medium">Margin: {margin}%</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={`text-base font-bold ${status.color}`}>{product.stockQuantity}</div>
                          <div className="text-[10px] text-gray-400">Min: {product.reorderLevel}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setQuickEditProduct(product)}>
                              <Package className="h-4 w-4" />
                            </Button>
                            <ProductForm product={product} onSubmit={(data) => handleEditProduct(data, product.id!)}>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </ProductForm>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteProduct(product.id!)}
                              disabled={user?.role === 'cashier'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <Card key={product.id} className="group hover:shadow-md transition-all border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-xs font-mono text-gray-400 mb-4">{product.sku}</p>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 mb-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Price</p>
                        <p className="font-bold text-blue-600">{formatCurrency(product.sellingPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase">Stock</p>
                        <p className={`font-bold ${status.color}`}>{product.stockQuantity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <ProductForm product={product} onSubmit={(data) => handleEditProduct(data, product.id!)}>
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Edit</Button>
                      </ProductForm>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setQuickEditProduct(product)}
                      >
                        <Package className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteProduct(product.id!)}
                        disabled={user?.role === 'cashier'}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <StockTakeForm
        open={showStockTakeForm}
        onClose={() => setShowStockTakeForm(false)}
        onUpdate={loadProducts}
      />

      {quickEditProduct && (
        <QuickStockEdit
          product={quickEditProduct}
          open={!!quickEditProduct}
          onClose={() => setQuickEditProduct(null)}
          onUpdate={loadProducts}
        />
      )}

      {/* Stock Transfer Modal */}
      <StockTransferForm
        open={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        onUpdate={loadProducts}
        product={selectedProduct}
      />

      {/* Location Manager Modal */}
      <LocationManager
        open={showLocationManager}
        onClose={() => setShowLocationManager(false)}
      />
    </ModernLayout>
  );
}
