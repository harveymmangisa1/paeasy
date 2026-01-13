'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale } from '@/lib/db/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StaffSale {
  staffName: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
}

export default function SalesByStaffReport() {
  const [reportData, setReportData] = useState<StaffSale[]>([]);
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

      const salesByStaff = new Map<string, { totalSales: number; transactionCount: number }>();
      sales.forEach((sale: Sale) => {
        const current = salesByStaff.get(sale.staffName) || { totalSales: 0, transactionCount: 0 };
        salesByStaff.set(sale.staffName, {
          totalSales: current.totalSales + sale.totalAmount,
          transactionCount: current.transactionCount + 1
        });
      });

      const staffSales = Array.from(salesByStaff.entries()).map(([staffName, data]) => ({
        staffName,
        totalSales: data.totalSales,
        transactionCount: data.transactionCount,
        averageTransaction: data.totalSales / data.transactionCount
      }));

      setReportData(staffSales.sort((a, b) => b.totalSales - a.totalSales));
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
          <CardTitle>Sales by Staff Member</CardTitle>
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
              <h3 className="font-semibold mb-4">Total Sales by Staff</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="staffName" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#8884d8" name="Total Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Staff Member</th>
                      <th className="text-right p-3 font-medium">Total Sales</th>
                      <th className="text-right p-3 font-medium">Transactions</th>
                      <th className="text-right p-3 font-medium">Avg. Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((staff) => (
                      <tr key={staff.staffName} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{staff.staffName}</td>
                        <td className="p-3 text-right">{formatCurrency(staff.totalSales)}</td>
                        <td className="p-3 text-right">{staff.transactionCount}</td>
                        <td className="p-3 text-right">{formatCurrency(staff.averageTransaction)}</td>
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
