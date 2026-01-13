'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale, Product } from '@/lib/db/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopProduct {
  product: Product;
  quantity: number;
  revenue: number;
}

export default function TopSellingProductsReport() {
  const [reportData, setReportData] = useState<TopProduct[]>([]);
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
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

      const sales = await db.sales
        .where('createdAt')
        .above(startDate)
        .toArray();

      const productSales = new Map<number, { quantity: number; revenue: number }>();
      sales.forEach((sale: Sale) => {
        sale.items.forEach((item: any) => {
          const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
          productSales.set(item.productId, {
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + item.totalPrice
          });
        });
      });

      const topProductsEntries = Array.from(productSales.entries())
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 10);

      const productIds = topProductsEntries.map(([productId]) => productId);
      const products = await db.products.bulkGet(productIds);

      const topProducts = topProductsEntries.map(([productId, data]) => ({
        product: products.find((p: Product | undefined) => p?.id === productId) as Product,
        quantity: data.quantity,
        revenue: data.revenue
      })).filter(item => item.product);

      setReportData(topProducts);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `K ${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Selling Products</CardTitle>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading report...</p>
        ) : reportData.length === 0 ? (
          <p>No sales data available for the selected period.</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Sales by Quantity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product.name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Top 10 Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-right p-3 font-medium">Quantity Sold</th>
                      <th className="text-right p-3 font-medium">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item) => (
                      <tr key={item.product.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>{item.product.name}</div>
                          <div className="text-xs text-gray-500">{item.product.sku}</div>
                        </td>
                        <td className="p-3 text-right font-medium">{item.quantity}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}