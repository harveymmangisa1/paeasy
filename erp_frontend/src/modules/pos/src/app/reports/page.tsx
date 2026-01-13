'use client';

import { useState, useMemo } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Search, 
  FileText, 
  TrendingUp, 
  Package, 
  Users, 
  CreditCard, 
  History 
} from 'lucide-react';

// Report Components
import DailySalesSummary from './_components/DailySalesSummary';
import ZReport from './_components/ZReport';
import CashRegisterReport from './_components/CashRegisterReport';
import SalesByStaffReport from './_components/SalesByStaffReport';
import StockLevelReport from './_components/StockLevelReport';
import LowStockAlertReport from './_components/LowStockAlertReport';
import TopSellingProductsReport from './_components/TopSellingProductsReport';
import SlowMovingStockReport from './_components/SlowMovingStockReport';
import StockMovementReport from './_components/StockMovementReport';
import SalesByCategoryReport from './_components/SalesByCategoryReport';
import ProfitLossSummaryReport from './_components/ProfitLossSummaryReport';
import PaymentMethodAnalysisReport from './_components/PaymentMethodAnalysisReport';
import DiscountReturnsReport from './_components/DiscountReturnsReport';
import VatReport from './_components/VatReport';
import TransactionHistoryReport from './_components/TransactionHistoryReport';

const reportCategories = {
  SALES: { label: 'Sales & Revenue', icon: TrendingUp, color: 'text-blue-600' },
  STOCK: { label: 'Inventory & Stock', icon: Package, color: 'text-orange-600' },
  STAFF: { label: 'Staff & Operations', icon: Users, color: 'text-green-600' },
  FINANCE: { label: 'Financial & Tax', icon: CreditCard, color: 'text-purple-600' },
  HISTORY: { label: 'Logs', icon: History, color: 'text-gray-600' },
};

const reports = [
  { id: 'daily-sales', name: 'Daily Sales Summary', category: 'SALES' },
  { id: 'z-report', name: 'Z-Report (End of Day)', category: 'FINANCE' },
  { id: 'cash-register', name: 'Cash Register Report', category: 'STAFF' },
  { id: 'sales-by-staff', name: 'Sales by Staff Member', category: 'STAFF' },
  { id: 'stock-level', name: 'Stock Level Report', category: 'STOCK' },
  { id: 'low-stock-alert', name: 'Low Stock Alert', category: 'STOCK' },
  { id: 'top-selling', name: 'Top Selling Products', category: 'SALES' },
  { id: 'slow-moving', name: 'Slow Moving/Dead Stock', category: 'STOCK' },
  { id: 'stock-movement', name: 'Stock Movement Report', category: 'STOCK' },
  { id: 'sales-by-category', name: 'Sales by Category', category: 'SALES' },
  { id: 'profit-loss', name: 'Profit & Loss Summary', category: 'FINANCE' },
  { id: 'payment-methods', name: 'Payment Method Analysis', category: 'SALES' },
  { id: 'discounts-returns', name: 'Discount & Returns Report', category: 'SALES' },
  { id: 'vat-report', name: 'VAT/Tax Report', category: 'FINANCE' },
  { id: 'transaction-history', name: 'Transaction History', category: 'HISTORY' },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('daily-sales');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeReportData = useMemo(() => 
    reports.find(r => r.id === activeReport), 
  [activeReport]);

  const renderReport = () => {
    const reportMap: Record<string, JSX.Element> = {
      'daily-sales': <DailySalesSummary />,
      'z-report': <ZReport />,
      'cash-register': <CashRegisterReport />,
      'sales-by-staff': <SalesByStaffReport />,
      'stock-level': <StockLevelReport />,
      'low-stock-alert': <LowStockAlertReport />,
      'top-selling': <TopSellingProductsReport />,
      'slow-moving': <SlowMovingStockReport />,
      'stock-movement': <StockMovementReport />,
      'sales-by-category': <SalesByCategoryReport />,
      'profit-loss': <ProfitLossSummaryReport />,
      'payment-methods': <PaymentMethodAnalysisReport />,
      'discounts-returns': <DiscountReturnsReport />,
      'vat-report': <VatReport />,
      'transaction-history': <TransactionHistoryReport />,
    };

    return reportMap[activeReport] || <div className="p-8 text-center text-gray-500">Report not found</div>;
  };

  return (
    <ModernLayout>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Reports & Analytics</h1>
            </div>
            <p className="text-muted-foreground">Monitor performance, stock levels, and financial health.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <span className="text-sm font-medium text-gray-500">Active View:</span>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              {activeReportData?.name}
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Directory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="p-2 space-y-1">
                    {Object.entries(reportCategories).map(([key, cat]) => {
                      const categoryReports = filteredReports.filter(r => r.category === key);
                      if (categoryReports.length === 0) return null;

                      return (
                        <div key={key} className="mb-4">
                          <h3 className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${cat.color}`}>
                            {cat.label}
                          </h3>
                          {categoryReports.map((report) => (
                            <button
                              key={report.id}
                              onClick={() => setActiveReport(report.id)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all group flex items-center justify-between ${
                                activeReport === report.id
                                  ? 'bg-blue-600 text-white font-medium shadow-md'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <span className="truncate">{report.name}</span>
                              {activeReport === report.id && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              )}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                    {filteredReports.length === 0 && (
                      <p className="p-4 text-xs text-center text-gray-400">No reports matching "{searchQuery}"</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Report View */}
          <div className="md:col-span-3 min-h-[70vh]">
            <Card className="border-none shadow-md overflow-hidden bg-white h-full">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardContent className="p-0">
                {renderReport()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}