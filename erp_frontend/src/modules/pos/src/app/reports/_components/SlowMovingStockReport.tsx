'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Product, Sale } from '@/lib/db/database';
import { format } from 'date-fns';

interface SlowMovingProduct {
  product: Product;
  lastSoldDate: Date | null;
}

export default function SlowMovingStockReport() {
  const [reportData, setReportData] = useState<SlowMovingProduct[]>([]);
  const [dateRange, setDateRange] = useState('30'); // Days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - parseInt(dateRange));

      const allProducts = await db.products.toArray();
      const recentSales = await db.sales.where('createdAt').above(thresholdDate).toArray();

      const soldProductIds = new Set<number>();
      recentSales.forEach((sale: Sale) => {
        sale.items.forEach((item: any) => {
          soldProductIds.add(item.productId);
        });
      });

      const slowMovingProducts = allProducts.filter(p => !soldProductIds.has(p.id!));

      // For the slow moving products, find their last sale date ever
      const slowMovingData: SlowMovingProduct[] = [];
      for (const product of slowMovingProducts) {
        const lastSale = await db.sales
          .filter(sale => sale.items.some(item => item.productId === product.id))
          .reverse()
          .first();
        
        slowMovingData.push({
          product,
          lastSoldDate: lastSale ? lastSale.createdAt : null
        });
      }

      setReportData(slowMovingData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Slow Moving / Dead Stock</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm">Not sold in the last:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="365">1 Year</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading report...</p>
        ) : reportData.length === 0 ? (
          <p>No slow-moving stock found for the selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-right p-3 font-medium">Current Stock</th>
                  <th className="text-left p-3 font-medium">Last Sold Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr key={item.product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>{item.product.name}</div>
                      <div className="text-xs text-gray-500">{item.product.sku}</div>
                    </td>
                    <td className="p-3 text-right font-medium">{item.product.stockQuantity}</td>
                    <td className="p-3">
                      {item.lastSoldDate ? format(new Date(item.lastSoldDate), 'PPP') : 'Never'}
                    </td>
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
