'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale } from '@/lib/db/database';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PaymentMethodData {
  paymentMethod: string;
  totalSales: number;
  transactionCount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function PaymentMethodAnalysisReport() {
  const [reportData, setReportData] = useState<PaymentMethodData[]>([]);
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

      const salesByPaymentMethod = new Map<string, { totalSales: number; transactionCount: number }>();
      sales.forEach((sale: Sale) => {
        const current = salesByPaymentMethod.get(sale.paymentMethod) || { totalSales: 0, transactionCount: 0 };
        salesByPaymentMethod.set(sale.paymentMethod, {
          totalSales: current.totalSales + sale.totalAmount,
          transactionCount: current.transactionCount + 1
        });
      });

      const paymentMethodData = Array.from(salesByPaymentMethod.entries()).map(([paymentMethod, data]) => ({
        paymentMethod: paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        totalSales: data.totalSales,
        transactionCount: data.transactionCount
      }));

      setReportData(paymentMethodData.sort((a, b) => b.totalSales - a.totalSales));
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
          <CardTitle>Payment Method Analysis</CardTitle>
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
                    nameKey="paymentMethod"
                    label={(entry) => `${entry.name} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
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
                      <th className="text-left p-3 font-medium">Payment Method</th>
                      <th className="text-right p-3 font-medium">Total Sales</th>
                      <th className="text-right p-3 font-medium">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item) => (
                      <tr key={item.paymentMethod} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.paymentMethod}</td>
                        <td className="p-3 text-right">{formatCurrency(item.totalSales)}</td>
                        <td className="p-3 text-right">{item.transactionCount}</td>
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
