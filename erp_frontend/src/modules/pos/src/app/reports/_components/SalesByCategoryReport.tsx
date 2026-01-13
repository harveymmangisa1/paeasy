'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale, Product } from '@/lib/db/database';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategorySale {
  category: string;
  totalSales: number;
  itemsSold: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

export default function SalesByCategoryReport() {
  const [reportData, setReportData] = useState<CategorySale[]>([]);
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
      
      const products = await db.products.toArray();
      const productMap = new Map(products.map(p => [p.id, p]));

      const salesByCategory = new Map<string, { totalSales: number; itemsSold: number }>();
      sales.forEach((sale: Sale) => {
        sale.items.forEach((item: any) => {
          const product = productMap.get(item.productId);
          if (product) {
            const category = product.category;
            const current = salesByCategory.get(category) || { totalSales: 0, itemsSold: 0 };
            salesByCategory.set(category, {
              totalSales: current.totalSales + item.totalPrice,
              itemsSold: current.itemsSold + item.quantity
            });
          }
        });
      });

      const categorySales = Array.from(salesByCategory.entries()).map(([category, data]) => ({
        category,
        totalSales: data.totalSales,
        itemsSold: data.itemsSold
      }));

      setReportData(categorySales.sort((a, b) => b.totalSales - a.totalSales));
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `K ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales by Category</CardTitle>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Sales Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalSales"
                    nameKey="category"
                    label={(entry) => `${entry.category} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-right p-3 font-medium">Total Sales</th>
                      <th className="text-right p-3 font-medium">Items Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item) => (
                      <tr key={item.category} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.category}</td>
                        <td className="p-3 text-right">{formatCurrency(item.totalSales)}</td>
                        <td className="p-3 text-right">{item.itemsSold}</td>
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
