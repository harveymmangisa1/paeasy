'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db/database';
import { startOfDay, endOfDay, format } from 'date-fns';

interface CashRegisterState {
  openingBalance: number;
  totalCashSales: number;
  totalCashReceived: number;
  cashPaidOut: number;
  expectedInDrawer: number;
  actualCashCounted: string;
  variance: number;
}

export default function CashRegisterReport() {
  const [report, setReport] = useState<CashRegisterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateReport = async () => {
      setIsLoading(true);
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      const cashSales = await db.sales
        .where('createdAt').between(todayStart, todayEnd)
        .filter(sale => sale.paymentMethod === 'cash')
        .toArray();

      const totalCashSales = cashSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      // For now, let's use placeholder values for opening balance and paid out
      const openingBalance = 5000; // Placeholder
      const cashPaidOut = 0; // Placeholder

      const totalCashReceived = cashSales.reduce((sum, sale) => sum + sale.paidAmount, 0);
      const totalChangeGiven = cashSales.reduce((sum, sale) => sum + sale.changeAmount, 0);
      
      const expectedInDrawer = openingBalance + totalCashReceived - totalChangeGiven - cashPaidOut;
      
      setReport({
        openingBalance,
        totalCashSales,
        totalCashReceived: totalCashReceived - totalChangeGiven,
        cashPaidOut,
        expectedInDrawer,
        actualCashCounted: '',
        variance: 0,
      });

      setIsLoading(false);
    };

    calculateReport();
  }, []);

  const handleCountUpdate = (value: string) => {
    if (!report) return;
    const actual = parseFloat(value) || 0;
    setReport({
      ...report,
      actualCashCounted: value,
      variance: actual - report.expectedInDrawer,
    });
  };
  
  if (isLoading) {
    return <div>Loading report...</div>;
  }

  if (!report) {
    return <div>Could not generate the report.</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cash Register Report for {format(new Date(), 'PPP')}</CardTitle>
        <Button size="sm" onClick={() => window.print()}>Print</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-lg"><strong>Opening Balance:</strong> K {report.openingBalance.toLocaleString()}</div>
          <div className="p-4 bg-gray-50 rounded-lg"><strong>Total Cash Sales:</strong> K {report.totalCashSales.toLocaleString()}</div>
          <div className="p-4 bg-gray-50 rounded-lg"><strong>Cash Received:</strong> K {report.totalCashReceived.toLocaleString()}</div>
          <div className="p-4 bg-gray-50 rounded-lg"><strong>Cash Paid Out:</strong> K {report.cashPaidOut.toLocaleString()}</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <span className="font-medium">Expected in Drawer:</span>
                <span className="font-bold text-lg text-blue-600">K {report.expectedInDrawer.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
                <label htmlFor="actual-cash" className="font-medium">Actual Cash Counted:</label>
                <Input 
                    id="actual-cash"
                    type="number"
                    value={report.actualCashCounted}
                    onChange={(e) => handleCountUpdate(e.target.value)}
                    placeholder="Enter counted amount"
                    className="text-lg"
                />
            </div>
            {report.actualCashCounted !== '' && (
                <div className={`flex justify-between items-center p-3 rounded-lg ${
                    report.variance === 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                    <span className="font-medium">Variance (Over/Short):</span>
                    <span className={`font-bold text-lg ${ 
                        report.variance === 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                        K {report.variance.toLocaleString()}
                    </span>
                </div>
            )}
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
