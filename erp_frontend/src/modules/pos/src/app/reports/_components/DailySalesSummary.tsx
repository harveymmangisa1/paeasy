'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer } from 'lucide-react';
import { db } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { useCurrentTenant } from '@/lib/tenant-context';
import { ReportGenerator, reportUtils } from '@/lib/report-generator';
import { startOfDay, endOfDay, format } from 'date-fns';

interface DailySummary {
  totalSales: number;
  transactionCount: number;
  averageTransactionValue: number;
  salesByPaymentMethod: {
    cash: number;
    mobile_money: number;
    bank_card: number;
    credit: number;
  };
  totalTax: number;
}

export default function DailySalesSummary() {
  const { tenantId, isLoading: tenantLoading } = useCurrentTenant();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [fullData, setFullData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (tenantLoading) return;

      try {
        setIsLoading(true);
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Ensure data is synced from server if online
        await api.fetchSales(tenantId);

        let sales = await db.sales
          .where('createdAt').between(todayStart, todayEnd)
          .toArray();

        // Filter by tenant if tenantId is available
        if (tenantId) {
          sales = sales.filter(sale => sale.tenantId === tenantId);
        }

        if (sales.length === 0) {
          const summaryData = {
            totalSales: 0,
            transactionCount: 0,
            averageTransactionValue: 0,
            salesByPaymentMethod: { cash: 0, mobile_money: 0, bank_card: 0, credit: 0 },
            totalTax: 0,
          };

          setSummary(summaryData);
          setFullData({ ...summaryData, sales: [] });
          return;
        }

        const totalSales = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const transactionCount = sales.length;
        const averageTransactionValue = totalSales / transactionCount;
        const totalTax = sales.reduce((acc, sale) => acc + sale.taxAmount, 0);

        const salesByPaymentMethod = sales.reduce((acc, sale) => {
          acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.totalAmount;
          return acc;
        }, { cash: 0, mobile_money: 0, bank_card: 0, credit: 0 });

        const summaryData = {
          totalSales,
          transactionCount,
          averageTransactionValue,
          salesByPaymentMethod,
          totalTax,
        };

        setSummary(summaryData);
        setFullData({ ...summaryData, sales });

      } catch (err) {
        console.error(err);
        setError('Failed to fetch sales data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [tenantId, tenantLoading]);

  if (isLoading || tenantLoading) {
    return <div>Loading report...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!summary) {
    return <div>No sales data for today.</div>;
  }

  const handleExportPDF = () => {
    if (!fullData) return;
    const filename = reportUtils.getFileName('Daily_Sales_Report', 'pdf');
    ReportGenerator.exportToPDF(fullData, 'Daily Sales Report', filename);
  };

  const handleExportCSV = () => {
    if (!fullData?.sales) return;

    const csvData = fullData.sales.map((sale: any) => ({
      'Receipt Number': sale.receiptNumber,
      'Date': format(sale.createdAt, 'PPP'),
      'Staff': sale.staffName,
      'Total': sale.totalAmount,
      'Tax': sale.taxAmount,
      'Discount': sale.discountAmount,
      'Payment Method': sale.paymentMethod,
      'Items Count': sale.items.length
    }));

    const headers = ['Receipt Number', 'Date', 'Staff', 'Total', 'Tax', 'Discount', 'Payment Method', 'Items Count'];
    const filename = reportUtils.getFileName('Daily_Sales_Report', 'csv');
    ReportGenerator.exportToCSV(csvData, headers, filename);
  };

  const handlePrint = () => {
    if (!fullData) return;

    let content = `
      <div class="summary">
        <div class="summary-item"><strong>Total Sales:</strong> ${reportUtils.formatCurrency(fullData.totalSales)}</div>
        <div class="summary-item"><strong>Transactions:</strong> ${fullData.transactionCount}</div>
        <div class="summary-item"><strong>Average Transaction:</strong> ${reportUtils.formatCurrency(fullData.averageTransactionValue)}</div>
        <div class="summary-item"><strong>Total Tax:</strong> ${reportUtils.formatCurrency(fullData.totalTax)}</div>
      </div>
      
      <h3>Sales by Payment Method</h3>
      <table>
        <tr><th>Payment Method</th><th>Amount</th></tr>
        <tr><td>Cash</td><td>${reportUtils.formatCurrency(fullData.salesByPaymentMethod.cash)}</td></tr>
        <tr><td>Mobile Money</td><td>${reportUtils.formatCurrency(fullData.salesByPaymentMethod.mobile_money)}</td></tr>
        <tr><td>Bank Card</td><td>${reportUtils.formatCurrency(fullData.salesByPaymentMethod.bank_card)}</td></tr>
        <tr><td>Credit</td><td>${reportUtils.formatCurrency(fullData.salesByPaymentMethod.credit)}</td></tr>
      </table>
      
      <h3>Sales Details</h3>
      <table>
        <tr><th>Receipt</th><th>Date</th><th>Staff</th><th>Total</th><th>Payment</th></tr>
    `;

    fullData.sales.forEach((sale: any) => {
      content += `
        <tr>
          <td>${sale.receiptNumber}</td>
          <td>${format(sale.createdAt, 'PPP')}</td>
          <td>${sale.staffName}</td>
          <td>${reportUtils.formatCurrency(sale.totalAmount)}</td>
          <td>${sale.paymentMethod}</td>
        </tr>
      `;
    });

    content += '</table>';

    ReportGenerator.printReport('Daily Sales Report', content);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Sales Summary for {format(new Date(), 'PPP')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!fullData}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!fullData}>
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!fullData}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold">K {summary.totalSales.toLocaleString()}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-2xl font-bold">{summary.transactionCount}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Avg. Transaction</p>
            <p className="text-2xl font-bold">K {summary.averageTransactionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-500">Tax Collected</p>
            <p className="text-2xl font-bold">K {summary.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-center"><span>Cash:</span> <strong>K {summary.salesByPaymentMethod.cash.toLocaleString()}</strong></li>
              <li className="flex justify-between items-center"><span>Mobile Money:</span> <strong>K {summary.salesByPaymentMethod.mobile_money.toLocaleString()}</strong></li>
              <li className="flex justify-between items-center"><span>Bank Card:</span> <strong>K {summary.salesByPaymentMethod.bank_card.toLocaleString()}</strong></li>
              <li className="flex justify-between items-center"><span>Credit:</span> <strong>K {summary.salesByPaymentMethod.credit.toLocaleString()}</strong></li>
            </ul>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}
