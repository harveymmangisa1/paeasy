'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer, ArrowUpDown } from 'lucide-react';
import { db, Product } from '@/lib/db/database';
import { useCurrentTenant } from '@/lib/tenant-context';
import { ReportGenerator, reportUtils } from '@/lib/report-generator';

type SortField = 'name' | 'stockQuantity' | 'stockValue';
type SortOrder = 'asc' | 'desc';

export default function StockLevelReport() {
  const { tenantId } = useCurrentTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductData();
  }, [tenantId]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortField, sortOrder]);

  const loadProductData = async () => {
    setLoading(true);
    try {
      let allProducts = await db.products.toArray();
      
      // Filter by tenant if tenantId is available
      if (tenantId) {
        allProducts = allProducts.filter(p => p.tenantId === tenantId);
      }
      
      setProducts(allProducts);
      const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'stockValue') {
        aVal = a.stockQuantity * a.costPrice;
        bVal = b.stockQuantity * b.costPrice;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return `K ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalStockQuantity = filteredProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalStockValue = filteredProducts.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);

  const handleExportPDF = () => {
    const reportData = {
      totalItems: totalStockQuantity,
      totalValue: totalStockValue,
      lowStockItems: filteredProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.reorderLevel),
      outOfStockItems: filteredProducts.filter(p => p.stockQuantity === 0),
      allProducts: filteredProducts
    };
    
    const filename = reportUtils.getFileName('Stock_Level_Report', 'pdf');
    ReportGenerator.exportToPDF(reportData, 'Stock Level Report', filename);
  };

  const handleExportCSV = () => {
    const csvData = filteredProducts.map(product => ({
      'Product Name': product.name,
      'SKU': product.sku,
      'Category': product.category,
      'Stock Quantity': product.stockQuantity,
      'Cost Price': product.costPrice,
      'Selling Price': product.sellingPrice,
      'Stock Value': product.stockQuantity * product.costPrice,
      'Reorder Level': product.reorderLevel,
      'Status': product.stockQuantity === 0 ? 'Out of Stock' : 
               product.stockQuantity <= product.reorderLevel ? 'Low Stock' : 'In Stock'
    }));
    
    const headers = ['Product Name', 'SKU', 'Category', 'Stock Quantity', 'Cost Price', 'Selling Price', 'Stock Value', 'Reorder Level', 'Status'];
    const filename = reportUtils.getFileName('Stock_Level_Report', 'csv');
    ReportGenerator.exportToCSV(csvData, headers, filename);
  };

  const handlePrint = () => {
    let content = `
      <div class="summary">
        <div class="summary-item"><strong>Total Items in Stock:</strong> ${totalStockQuantity.toLocaleString()}</div>
        <div class="summary-item"><strong>Total Stock Value:</strong> ${reportUtils.formatCurrency(totalStockValue)}</div>
      </div>
      
      <h3>Stock Details</h3>
      <table>
        <tr><th>Product</th><th>SKU</th><th>Category</th><th>Quantity</th><th>Stock Value</th><th>Status</th></tr>
    `;
    
    filteredProducts.forEach(product => {
      const status = product.stockQuantity === 0 ? 'Out of Stock' : 
                    product.stockQuantity <= product.reorderLevel ? 'Low Stock' : 'In Stock';
      content += `
        <tr>
          <td>${product.name}</td>
          <td>${product.sku}</td>
          <td>${product.category}</td>
          <td>${product.stockQuantity}</td>
          <td>${reportUtils.formatCurrency(product.stockQuantity * product.costPrice)}</td>
          <td>${status}</td>
        </tr>
      `;
    });
    
    content += '</table>';
    
    ReportGenerator.printReport('Stock Level Report', content);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Stock Level Report</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                <p className="text-sm text-gray-500">Total Items in Stock</p>
                <p className="text-2xl font-bold">{totalStockQuantity.toLocaleString()}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Total Stock Value (Cost)</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStockValue)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1">
                        Product <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium">
                      <button onClick={() => handleSort('stockQuantity')} className="flex items-center gap-1">
                        Stock Quantity <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium">
                      <button onClick={() => handleSort('stockValue')} className="flex items-center gap-1">
                        Stock Value (Cost) <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>{product.name}</div>
                        <div className="text-xs text-gray-500">{product.sku}</div>
                      </td>
                      <td className="p-3 text-right font-medium">{product.stockQuantity}</td>
                      <td className="p-3 text-right">{formatCurrency(product.stockQuantity * product.costPrice)}</td>
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
