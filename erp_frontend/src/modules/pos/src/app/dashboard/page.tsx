'use client';

import { useState, useEffect, useMemo } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  ArrowRight,
  FileText,
  Plus,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { db, Sale, Product } from '@/lib/db/database';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// --- Sub-components for better organization ---

const StatCard = ({ title, value, subtext, icon: Icon, gradient, loading }: any) => (
  <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group">
    <CardContent className="p-0">
      <div className="flex items-stretch h-32">
        <div className={`w-2 ${gradient}`} />
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">{subtext}</p>
        </div>
        <div className="p-5 flex items-center">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${gradient.replace('w-2', '')} bg-opacity-10 text-white shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: any;
    recentSales: Sale[];
    lowStock: Product[];
    recentQuots: any[];
  }>({
    stats: {},
    recentSales: [],
    lowStock: [],
    recentQuots: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [allSales, allProducts, allStaff] = await Promise.all([
        db.sales.toArray(),
        db.products.toArray(),
        db.staff.toArray()
      ]);

      const todaySales = allSales.filter(s => new Date(s.createdAt) >= today);
      const lowStock = allProducts.filter(p => p.stockQuantity <= p.reorderLevel);

      let recentQuots: any[] = [];
      let pendingQuotsCount = 0;

      if (supabase) {
        const { data: quots } = await supabase
          .from('quotations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        const { count } = await supabase
          .from('quotations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (quots) recentQuots = quots;
        pendingQuotsCount = count || 0;
      }

      setData({
        recentSales: allSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
        lowStock: lowStock.slice(0, 5),
        recentQuots,
        stats: {
          todayRevenue: todaySales.reduce((sum, s) => sum + s.totalAmount, 0),
          todayCount: todaySales.length,
          totalRevenue: allSales.reduce((sum, s) => sum + s.totalAmount, 0),
          lowStockCount: lowStock.length,
          outOfStockCount: allProducts.filter(p => p.stockQuantity === 0).length,
          activeUsers: allStaff.filter(s => s.isActive).length,
          pendingQuots: pendingQuotsCount
        }
      });
    } catch (error) {
      console.error('Dashboard Load Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurr = (val: number) => `K${val?.toLocaleString() || '0'}`;

  return (
    <ModernLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Overview</h1>
            <p className="text-slate-500 font-medium">Hello, {user?.name}. Here is what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={loadDashboardData}>
              <ArrowUpRight className="h-4 w-4 mr-2" /> Export Report
            </Button>
            <Button size="sm" className="bg-blue-600 shadow-lg shadow-blue-200" asChild>
              <Link href="/sales">
                <Plus className="h-4 w-4 mr-2" /> New Sale
              </Link>
            </Button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Today's Sales" 
            value={formatCurr(data.stats.todayRevenue)}
            subtext={`${data.stats.todayCount} transactions today`}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            loading={loading}
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurr(data.stats.totalRevenue)}
            subtext="Lifetime earnings"
            icon={DollarSign}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            loading={loading}
          />
          <StatCard 
            title="Active Staff" 
            value={data.stats.activeUsers}
            subtext="Currently on shift"
            icon={Users}
            gradient="bg-gradient-to-br from-orange-500 to-amber-600"
            loading={loading}
          />
          <StatCard 
            title="Quotations" 
            value={data.stats.pendingQuots}
            subtext="Awaiting conversion"
            icon={FileText}
            gradient="bg-gradient-to-br from-purple-500 to-violet-600"
            loading={loading}
          />
        </div>

        {/* ALERTS SECTION */}
        {(data.stats.lowStockCount > 0) && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-xl text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-red-900 font-bold text-sm">Inventory Attention Required</h4>
                <p className="text-red-700 text-xs">You have {data.stats.lowStockCount} items that are critically low or out of stock.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-100 font-bold" asChild>
              <Link href="/inventory">Restock Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        )}

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* RECENT SALES - Larger side */}
          <Card className="lg:col-span-2 border-slate-200/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
              <div>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <CardDescription>Latest sales across all registers</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 font-bold" asChild>
                <Link href="/reports">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {data.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{sale.receiptNumber}</p>
                        <p className="text-xs text-slate-500">{new Date(sale.createdAt).toLocaleTimeString()} • {sale.staffName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurr(sale.totalAmount)}</p>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">{sale.paymentMethod}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LOW STOCK - Sidebar side */}
          <div className="space-y-6">
             <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" /> Stock Watch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.lowStock.length === 0 ? (
                  <p className="text-sm text-center text-slate-400 py-4 italic">Inventory is healthy ✨</p>
                ) : (
                  data.lowStock.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="max-w-[150px]">
                        <p className="text-sm font-bold truncate text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500">Min Level: {item.reorderLevel}</p>
                      </div>
                      <Badge variant="destructive" className="rounded-md">
                        {item.stockQuantity} Left
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* QUICK LAUNCH PAD */}
            <Card className="bg-slate-900 text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg font-black tracking-tight">Launch Pad</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 pb-6">
                <Button variant="secondary" className="h-20 flex flex-col gap-2 bg-slate-800 border-none hover:bg-slate-700 text-white" asChild>
                  <Link href="/sales"><ShoppingCart className="h-5 w-5 text-blue-400" /> <span className="text-xs">Sale</span></Link>
                </Button>
                <Button variant="secondary" className="h-20 flex flex-col gap-2 bg-slate-800 border-none hover:bg-slate-700 text-white" asChild>
                  <Link href="/inventory"><Plus className="h-5 w-5 text-emerald-400" /> <span className="text-xs">Product</span></Link>
                </Button>
                <Button variant="secondary" className="h-20 flex flex-col gap-2 bg-slate-800 border-none hover:bg-slate-700 text-white" asChild>
                  <Link href="/quotations"><FileText className="h-5 w-5 text-purple-400" /> <span className="text-xs">Quote</span></Link>
                </Button>
                <Button variant="secondary" className="h-20 flex flex-col gap-2 bg-slate-800 border-none hover:bg-slate-700 text-white" asChild>
                  <Link href="/users"><Users className="h-5 w-5 text-orange-400" /> <span className="text-xs">Staff</span></Link>
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </ModernLayout>
  );
}
