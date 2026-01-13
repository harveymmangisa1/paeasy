'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db, Sale } from '@/lib/db/database';

interface ProfitLossData {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
}

export default function ProfitLossSummaryReport() {
  const [reportData, setReportData] = useState<ProfitLossData | null>(null);
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

      let totalRevenue = 0;
      let totalCogs = 0;

      sales.forEach((sale: Sale) => {
        totalRevenue += sale.totalAmount;
        sale.items.forEach((item: any) => {
          totalCogs += item.costPrice * item.quantity;
        });
      });

      const grossProfit = totalRevenue - totalCogs;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      setReportData({
        totalRevenue,
        totalCogs,
        grossProfit,
        grossMargin,
      });
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
          <CardTitle>Profit & Loss Summary</CardTitle>
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
        ) : !reportData ? (
          <p>No data available for the selected period.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Cost of Goods Sold (COGS)</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.totalCogs)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-sm text-green-800">Gross Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.grossProfit)}</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-sm text-gray-500">Gross Margin</p>
              <p className="text-3xl font-bold text-blue-600">{reportData.grossMargin.toFixed(2)}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
