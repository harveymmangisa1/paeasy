'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Product } from '@/lib/db/database';
import { AlertTriangle } from 'lucide-react';

export default function LowStockAlertReport() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  const loadLowStockProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await db.products.toArray();
      const lowStock = allProducts.filter(p => p.stockQuantity <= p.reorderLevel);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Low Stock Alert Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading report...</p>
        ) : lowStockProducts.length === 0 ? (
          <p>No products are currently low on stock.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-right p-3 font-medium">Current Stock</th>
                  <th className="text-right p-3 font-medium">Reorder Level</th>
                  <th className="text-right p-3 font-medium">Difference</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>{product.name}</div>
                      <div className="text-xs text-gray-500">{product.sku}</div>
                    </td>
                    <td className="p-3 text-right font-medium text-red-600">{product.stockQuantity}</td>
                    <td className="p-3 text-right font-medium">{product.reorderLevel}</td>
                    <td className="p-3 text-right font-medium">{product.stockQuantity - product.reorderLevel}</td>
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
