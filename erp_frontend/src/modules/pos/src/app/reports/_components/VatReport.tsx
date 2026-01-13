'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale } from '@/lib/db/database';
import { format } from 'date-fns';

export default function VatReport() {
  const [sales, setSales] = useState<Sale[]>([]);
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

      const salesData = await db.sales
        .where('createdAt')
        .above(startDate)
        .toArray();

      setSales(salesData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `K ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalVat = sales.reduce((sum, sale) => sum + sale.taxAmount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>VAT/Tax Report</CardTitle>
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
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total Sales (incl. VAT)</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total VAT Collected</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalVat)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Receipt No.</th>
                    <th className="text-right p-3 font-medium">Total Sale</th>
                    <th className="text-right p-3 font-medium">VAT Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{format(sale.createdAt, 'PPP p')}</td>
                      <td className="p-3 font-medium">{sale.receiptNumber}</td>
                      <td className="p-3 text-right">{formatCurrency(sale.totalAmount)}</td>
                      <td className="p-3 text-right">{formatCurrency(sale.taxAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
