'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, StockMovement, Product } from '@/lib/db/database';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';

type SortOrder = 'asc' | 'desc';

export default function StockMovementReport() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterAndSortMovements();
  }, [movements, selectedProduct, dateRange, sortOrder]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const allMovements = await db.stockMovements.orderBy('createdAt').reverse().toArray();

      const allProducts = await db.products.toArray();
      setProducts(allProducts);

      const productMap = new Map(allProducts.map(p => [p.id, p.name]));

      const populatedMovements = allMovements.map(t => ({
        ...t,
        productName: (t.productId ? productMap.get(t.productId) : null) || t.productName || 'N/A'
      }));

      setMovements(populatedMovements);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMovements = () => {
    let filtered = [...movements];

    // Date range filter
    const now = new Date();
    let startDate = new Date();
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
    }
    if (dateRange !== 'all') {
      filtered = filtered.filter(m => new Date(m.createdAt) >= startDate);
    }

    // Product filter
    if (selectedProduct !== 'all') {
      filtered = filtered.filter(m => m.productId === parseInt(selectedProduct));
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredMovements(filtered);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Movement Report</CardTitle>
          <div className="flex gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading report...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">
                    <button onClick={handleSort} className="flex items-center gap-1">
                      Date <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Reason</th>
                  <th className="text-right p-3 font-medium">Quantity</th>
                  <th className="text-left p-3 font-medium">Processed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{format(new Date(movement.createdAt), 'PPP p')}</td>
                    <td className="p-3">{movement.productName}</td>
                    <td className="p-3 capitalize">{movement.movementType.replace('_', ' ')}</td>
                    <td className="p-3">{movement.reason}</td>
                    <td className="p-3 text-right font-medium">{movement.quantity}</td>
                    <td className="p-3">{movement.processedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
