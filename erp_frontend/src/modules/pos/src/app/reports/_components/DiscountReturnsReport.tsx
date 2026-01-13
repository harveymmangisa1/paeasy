'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale } from '@/lib/db/database';
import { format } from 'date-fns';

export default function DiscountReturnsReport() {
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

  const discountedSales = sales.filter(sale => sale.discountAmount > 0);
  const returnedSales = sales.filter(sale => sale.status === 'returned' || sale.status === 'partial_return');

  const totalDiscount = discountedSales.reduce((sum, sale) => sum + sale.discountAmount, 0);
  const totalReturnedValue = returnedSales.reduce((sum, sale) => sum + sale.totalAmount, 0); // This might need more complex logic for partial returns

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discount & Returns Report</CardTitle>
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
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total Discount Given</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalDiscount)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total Returned Value</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalReturnedValue)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Discounted Sales</h3>
              {discountedSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Receipt No.</th>
                        <th className="text-right p-3 font-medium">Total Sale</th>
                        <th className="text-right p-3 font-medium">Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discountedSales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{format(sale.createdAt, 'PPP p')}</td>
                          <td className="p-3 font-medium">{sale.receiptNumber}</td>
                          <td className="p-3 text-right">{formatCurrency(sale.totalAmount)}</td>
                          <td className="p-3 text-right text-orange-600">{formatCurrency(sale.discountAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No discounted sales in this period.</p>}
            </div>

            <div>
              <h3 className="font-semibold mb-4">Returned Sales</h3>
              {returnedSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Receipt No.</th>
                        <th className="text-right p-3 font-medium">Returned Value</th>
                        <th className="text-left p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnedSales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{format(sale.createdAt, 'PPP p')}</td>
                          <td className="p-3 font-medium">{sale.receiptNumber}</td>
                          <td className="p-3 text-right text-red-600">{formatCurrency(sale.totalAmount)}</td>
                          <td className="p-3 capitalize">{sale.status.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No returned sales in this period.</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
