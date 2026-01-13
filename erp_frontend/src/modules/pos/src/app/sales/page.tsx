'use client';

import { useState, useEffect, useRef } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, CreditCard,
  Smartphone, DollarSign, Barcode, X, CheckCircle, List,
  Grid, Printer, ArrowDown, ArrowUp
} from 'lucide-react';
import { db, Product, Sale, ShopSettings, Customer } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ReceiptPrinter } from '@/lib/receipt-printer';
import { useCustomerDisplay } from '@/hooks/use-customer-display';

export default function SalesPage() {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalDiscount, tax, total } = useCart();

  const { broadcastCart, broadcastClear, broadcastSuccess, openDisplay } = useCustomerDisplay();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank_card' | 'credit'>('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<string>('');
  const [lastSaleData, setLastSaleData] = useState<Sale | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState('');

  // UX Enhancements States
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Refs
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const paidAmountRef = useRef<HTMLInputElement>(null);
  const cartEndRef = useRef<HTMLDivElement>(null);

  // Auto-focus and Load data
  useEffect(() => {
    barcodeRef.current?.focus();
    loadProducts();
    loadShopSettings();
    loadCustomers();

    // Start real-time sync
    realtimeSync.setTenantId(tenantId);
    realtimeSync.startProductSync(() => {
      console.log('🔄 Products updated from another device');
      loadProducts();
    });
    realtimeSync.startCustomersSync(() => {
      console.log('🔄 Customers updated from another device');
      loadCustomers();
    });

    // Cleanup on unmount
    return () => {
      realtimeSync.stopAll();
    };
  }, [tenantId]);

  // Reset keyboard selection on search
  useEffect(() => { setSelectedIndex(0); }, [searchTerm]);

  // Auto-scroll cart
  useEffect(() => {
    cartEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Broadcast to Customer Display
    broadcastCart(items, subtotal, tax, total);
  }, [items, subtotal, tax, total, broadcastCart]);

  const loadShopSettings = async () => {
    const settings = await db.shopSettings.toCollection().first();
    setShopSettings(settings || null);
  };

  const loadProducts = async () => {
    try {
      // Fetch from database and update cache
      const allProducts = await api.fetchProducts(tenantId);
      setProducts(allProducts);
    } catch (error) {
      // Fallback to cached data if offline
      console.warn('Using cached products:', error);
      let allProducts = await db.products.orderBy('name').toArray();
      if (tenantId) allProducts = allProducts.filter(p => p.tenantId === tenantId);
      setProducts(allProducts);
    }
  };

  const loadCustomers = async () => {
    try {
      const allCustomers = await api.fetchCustomers(tenantId);
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50);

  // Feedback wrapper for adding items
  const handleAddItem = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    setIsScanning(true);
    addItem(product);
    setTimeout(() => setIsScanning(false), 300);
  };

  const handleBarcodeScan = async (barcode: string) => {
    const product = await db.products.where('barcodes').equals(barcode).first();
    if (product) {
      handleAddItem(product);
      setBarcodeInput('');
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isCheckoutOpen) {
        if (e.key === 'Enter') handleCheckout();
        if (e.key === 'Escape') setIsCheckoutOpen(false);
        return;
      }

      if (searchTerm && filteredProducts.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredProducts.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
        } else if (e.key === 'Enter') {
          handleAddItem(filteredProducts[selectedIndex]);
          setSearchTerm('');
        }
      }

      if (e.key === 'F1') { e.preventDefault(); barcodeRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F3') { e.preventDefault(); clearCart(); }
      if (e.key === 'F4') { e.preventDefault(); if (items.length > 0) setIsCheckoutOpen(true); }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [items, filteredProducts, selectedIndex, searchTerm, isCheckoutOpen]);

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    if (paymentMethod === 'cash' && (!paidAmount || parseFloat(paidAmount) < total)) {
      paidAmountRef.current?.focus();
      return;
    }

    setIsProcessing(true);
    try {
      const receiptNumber = `RCP${Date.now()}`;
      const changeAmount = paymentMethod === 'cash' ? parseFloat(paidAmount) - total : 0;

      const saleData: Omit<Sale, 'id' | 'uuid' | 'syncStatus'> = {
        receiptNumber,
        items: items.map(item => ({
          productId: item.product.id!,
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          costPrice: item.product.costPrice,
          discountAmount: item.discountAmount,
          taxAmount: item.product.taxable ? (item.product.sellingPrice * item.quantity - item.discountAmount) * 0.165 : 0,
          totalPrice: item.product.sellingPrice * item.quantity - item.discountAmount
        })),
        subtotal,
        discountAmount: totalDiscount,
        taxAmount: tax,
        totalAmount: total,
        paidAmount: paymentMethod === 'cash' ? parseFloat(paidAmount) : total,
        changeAmount,
        paymentMethod,
        staffId: user!.id!,
        staffName: user!.name,
        customerId: selectedCustomer?.id,
        notes: notes,
        createdAt: new Date(),
        status: 'completed',
        ...(tenantId && { tenantId })
      };

      // DATABASE-FIRST: Write to Supabase immediately
      const sale = await api.createSale(saleData);

      // Auto-print receipt
      ReceiptPrinter.printSaleReceipt(sale, shopSettings || undefined);

      // Update stock quantities (database-first)
      for (const item of items) {
        await api.updateProduct(item.product.id!, {
          stockQuantity: item.product.stockQuantity - item.quantity,
        });
      }

      setLastReceipt(receiptNumber);
      setLastSaleData(sale);
      setShowSuccess(true);
      broadcastSuccess(changeAmount, receiptNumber);
      setIsCheckoutOpen(false);
      clearCart();
      setPaidAmount('');
      setTimeout(() => setShowSuccess(false), 3000);
      await loadProducts(); // Refresh from database
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.message?.includes('Offline')) {
        alert('Sale queued - will sync when online');
      } else {
        alert('Error processing sale: ' + error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Smart Denominations Logic
  const getQuickCash = () => {
    const t = total;
    return [
      t,
      Math.ceil(t / 500) * 500,
      Math.ceil(t / 1000) * 1000,
      Math.ceil(t / 5000) * 5000
    ].filter((v, i, a) => a.indexOf(v) === i); // unique values
  };

  return (
    <ModernLayout>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan-flash {
          0% { background-color: transparent; }
          50% { background-color: rgba(59, 130, 246, 0.15); }
          100% { background-color: transparent; }
        }
        .animate-scan { animation: scan-flash 0.3s ease-out; }
      `}} />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle className="h-6 w-6" />
          <div>
            <p className="font-bold">Transaction Complete</p>
            <p className="text-xs opacity-90">Receipt: {lastReceipt}</p>
          </div>
        </div>
      )}

      <div className="h-screen flex flex-col p-4 gap-4 bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg"><ShoppingCart className="text-white h-5 w-5" /></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">POS Terminal</h1>
              <p className="text-[10px] text-gray-500 font-mono mt-1">OPERATOR: {user?.name?.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-gray-100 rounded-lg p-1 border">
              <Button size="sm" variant={viewMode === 'list' ? 'secondary' : 'ghost'} className="h-8 w-8 p-0" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
              <Button size="sm" variant={viewMode === 'grid' ? 'secondary' : 'ghost'} className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
            </div>
            <div className="text-[11px] font-bold text-gray-400 flex gap-4 uppercase tracking-tighter">
              <span><kbd className="bg-white border px-1.5 py-0.5 rounded shadow-sm mr-1 text-gray-600">F1</kbd>Scan</span>
              <span><kbd className="bg-white border px-1.5 py-0.5 rounded shadow-sm mr-1 text-gray-600">F2</kbd>Search</span>
              <span><kbd className="bg-white border px-1.5 py-0.5 rounded shadow-sm mr-1 text-gray-600">F4</kbd>Pay</span>
              <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={openDisplay}>
                Open Display
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Left: Products */}
          <div className="col-span-7 flex flex-col gap-4 min-h-0">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Barcode className="absolute left-3 top-3 h-5 w-5 text-blue-500 group-focus-within:scale-110 transition-transform" />
                <Input
                  ref={barcodeRef}
                  placeholder="Scan item..."
                  value={barcodeInput}
                  onChange={(e) => { setBarcodeInput(e.target.value); handleBarcodeScan(e.target.value); }}
                  className="pl-10 h-12 font-mono text-lg border-2 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="relative flex-[2]">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchRef}
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2"
                />
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 border-b bg-gray-50/50 text-[10px] font-bold text-gray-400 tracking-widest flex justify-between">
                <span>CATALOGUE</span>
                <span>{filteredProducts.length} ITEMS FOUND</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div className={viewMode === 'grid' ? "grid grid-cols-3 gap-3" : "flex flex-col gap-2"}>
                  {filteredProducts.map((product, idx) => {
                    const isLowStock = product.stockQuantity <= product.reorderLevel;
                    const stockPercentage = Math.min((product.stockQuantity / 50) * 100, 100);

                    return (
                      <button
                        key={product.id}
                        onClick={() => handleAddItem(product)}
                        disabled={product.stockQuantity <= 0}
                        className={`
                          text-left p-3 rounded-xl border-2 transition-all relative overflow-hidden
                          ${selectedIndex === idx && searchTerm ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}
                          ${product.stockQuantity <= 0 ? 'opacity-50 grayscale' : 'bg-white shadow-sm'}
                          ${viewMode === 'list' ? 'flex items-center justify-between' : 'flex flex-col gap-2'}
                        `}
                      >
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                          <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight truncate">{product.name}</h3>
                          <p className="text-[10px] font-mono text-gray-400">{product.sku}</p>
                        </div>

                        <div className={viewMode === 'grid' ? 'mt-1' : 'w-48 text-right flex items-center gap-4 justify-end'}>
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span className={isLowStock ? "text-orange-600" : "text-gray-400"}>Stock</span>
                              <span>{product.stockQuantity}</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${isLowStock ? 'bg-orange-500' : 'bg-green-500'}`}
                                style={{ width: `${stockPercentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-lg font-black text-blue-600 font-mono tracking-tighter">
                            K{product.sellingPrice.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Receipt Sidebar */}
          <div className="col-span-5 flex flex-col min-h-0">
            <Card className={`flex-1 flex flex-col border-2 shadow-xl rounded-xl transition-all ${isScanning ? 'animate-scan ring-2 ring-blue-400' : 'border-gray-200'}`}>
              <CardHeader className="p-4 border-b-2 border-dashed bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-900 p-1.5 rounded-md"><ShoppingCart className="h-4 w-4 text-white" /></div>
                    <span className="font-black text-sm uppercase tracking-widest">Active Sale</span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-600 border-none font-mono">{items.length} ITEMS</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#fafafa]">
                {items.map((item, idx) => (
                  <div key={item.product.id} className="flex flex-col gap-1 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-mono block">#00{idx + 1}</span>
                        <h4 className="font-bold text-xs uppercase truncate pr-4">{item.product.name}</h4>
                      </div>
                      <button onClick={() => removeItem(item.product.id!)} className="text-gray-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg border p-1">
                        <button onClick={() => updateQuantity(item.product.id!, item.quantity - 1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center font-black text-xs font-mono">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id!, item.quantity + 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-mono block">K{item.product.sellingPrice.toLocaleString()} ea</span>
                        <span className="font-black text-sm font-mono tracking-tighter">K{(item.product.sellingPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={cartEndRef} />
              </CardContent>

              <div className="p-4 bg-white border-t-2 border-dashed">
                <div className="space-y-1 text-xs font-mono mb-4">
                  <div className="flex justify-between text-gray-500"><span>SUBTOTAL</span><span>K{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-500"><span>TAX (16.5%)</span><span>K{tax.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t-2 mt-2">
                    <span>TOTAL</span>
                    <span className="text-blue-600">K{total.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-14 text-xl font-black rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                  disabled={items.length === 0}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Charge (F4)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Improved Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Amount Due</p>
              <h2 className="text-4xl font-black font-mono">K{total.toLocaleString()}</h2>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Scanned Items Summary */}
            <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Items ({items.length})</p>
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0 border-gray-100">
                  <span className="truncate flex-1 pr-2">{item.product.name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span className="font-mono font-bold">K{(item.product.sellingPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['cash', 'mobile_money', 'bank_card', 'credit'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-600 scale-105 shadow-md' : 'border-gray-100 text-gray-400'}`}
                >
                  {method === 'cash' && <DollarSign className="h-5 w-5" />}
                  {method === 'mobile_money' && <Smartphone className="h-5 w-5" />}
                  {method === 'bank_card' && <CreditCard className="h-5 w-5" />}
                  {method === 'credit' && <List className="h-5 w-5" />}
                  <span className="text-[10px] font-bold uppercase">{method.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                  <Input
                    ref={paidAmountRef}
                    type="text"
                    value={paidAmount}
                    onChange={async (e) => {
                      const val = e.target.value;
                      // Try to find if this is a barcode scan
                      if (val.length > 3) {
                        const product = await db.products.where('barcodes').equals(val).first();
                        if (product) {
                          handleAddItem(product);
                          setPaidAmount(''); // Clear the scan from the amount field
                          return;
                        }
                      }
                      setPaidAmount(val);
                    }}
                    className="h-20 text-4xl font-black text-center font-mono border-2 border-blue-100 focus:border-blue-500 rounded-2xl"
                    placeholder="0.00"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300 font-bold">K</div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {getQuickCash().map(amt => (
                    <Button key={amt} variant="outline" className="h-12 font-bold rounded-xl" onClick={() => setPaidAmount(amt.toString())}>
                      K{amt.toLocaleString()}
                    </Button>
                  ))}
                </div>

                {parseFloat(paidAmount) >= total && (
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-100 flex justify-between items-center">
                    <span className="text-green-700 font-bold uppercase text-xs">Change Return</span>
                    <span className="text-2xl font-black text-green-700 font-mono">K{(parseFloat(paidAmount) - total).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Customer</label>
                <select
                  className="w-full h-10 px-3 py-2 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:border-blue-500 outline-none"
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id?.toString() === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Sale Notes</label>
                <textarea
                  className="w-full h-20 px-3 py-2 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:border-blue-500 outline-none resize-none"
                  placeholder="Add any special instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50 flex gap-2">
            <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)} className="h-14 font-bold text-gray-400 uppercase">Cancel (Esc)</Button>
            <Button
              className="flex-1 h-14 text-xl font-black uppercase tracking-widest rounded-xl shadow-lg"
              onClick={handleCheckout}
              disabled={isProcessing || (paymentMethod === 'cash' && (!paidAmount || parseFloat(paidAmount) < total))}
            >
              {isProcessing ? 'Processing...' : 'Finish Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModernLayout>
  );
}
