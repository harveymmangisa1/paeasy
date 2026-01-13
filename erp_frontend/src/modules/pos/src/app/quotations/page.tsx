'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    ShoppingCart,
    Download,
    Send,
    Calendar,
    User,
    Phone,
    Mail,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { db, Product } from '@/lib/db/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuotationForm } from '@/components/forms/QuotationForm';

interface QuotationItem {
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

interface Quotation {
    id?: number;
    quotationNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    items: QuotationItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    validUntil: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted';
    notes?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function QuotationsPage() {
    const { user } = useAuth();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);

    useEffect(() => {
        loadQuotations();
    }, []);

    useEffect(() => {
        filterQuotations();
    }, [quotations, searchTerm, statusFilter]);

    const loadQuotations = async () => {
        if (!supabase) {
            console.warn('Supabase not available');
            return;
        }

        const { data, error } = await supabase
            .from('quotations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Quotations not available:', error.message || JSON.stringify(error));
            return;
        }

        // Update expired quotations
        const updated = data.map((q) => {
            if (q.status === 'pending' && new Date(q.valid_until) < new Date()) {
                return { ...q, status: 'expired' as const };
            }
            return q;
        });

        // The data from supabase is in snake_case, so we need to map it to camelCase
        const mappedData = updated.map((q: any) => ({
            id: q.id,
            quotationNumber: q.quotation_number,
            customerName: q.customer_name,
            customerEmail: q.customer_email,
            customerPhone: q.customer_phone,
            customerAddress: q.customer_address,
            items: q.items,
            subtotal: q.subtotal,
            discountAmount: q.discount_amount,
            taxAmount: q.tax_amount,
            totalAmount: q.total_amount,
            validUntil: new Date(q.valid_until),
            status: q.status,
            notes: q.notes,
            createdBy: q.created_by,
            createdAt: new Date(q.created_at),
            updatedAt: new Date(q.updated_at),
        }));

        setQuotations(mappedData);

        // Also update the expired status in the database
        const expiredQuotations = updated.filter(q => q.status === 'expired');
        if (expiredQuotations.length > 0 && supabase) {
            const updates = expiredQuotations.map(q =>
                supabase!.from('quotations').update({ status: 'expired' }).eq('id', q.id)
            );
            await Promise.all(updates);
        }
    };

    const filterQuotations = () => {
        let filtered = [...quotations];

        if (searchTerm) {
            filtered = filtered.filter(q =>
                q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.customerPhone?.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(q => q.status === statusFilter);
        }

        setFilteredQuotations(filtered);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this quotation?')) {
            if (!supabase) {
                alert('Supabase not available');
                return;
            }
            const { error } = await supabase!.from('quotations').delete().eq('id', id);
            if (error) {
                console.error('Error deleting quotation:', error);
                alert('Error deleting quotation');
                return;
            }
            await loadQuotations();
        }
    };

    const handleConvertToSale = async (quotation: Quotation) => {
        if (!user) return;

        if (confirm('Convert this quotation to a sale?')) {
            try {
                // Create sale from quotation
                const sale: any = {
                    receiptNumber: `Q-${quotation.quotationNumber}`,
                    items: quotation.items.map(item => ({
                        productId: 0, // Would need to fetch from product
                        productName: item.productName,
                        sku: item.sku,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        costPrice: 0, // Would need to fetch from product
                        discountAmount: item.discount,
                        taxAmount: (item.total * 0.165),
                        totalPrice: item.total
                    })),
                    subtotal: quotation.subtotal,
                    discountAmount: quotation.discountAmount,
                    taxAmount: quotation.taxAmount,
                    totalAmount: quotation.totalAmount,
                    paidAmount: quotation.totalAmount,
                    changeAmount: 0,
                    paymentMethod: 'cash',
                    staffId: user.id!,
                    staffName: user.name,
                    createdAt: new Date(),
                    status: 'completed',
                    uuid: crypto.randomUUID(),
                    syncStatus: 'pending'
                };

                await db.sales.add(sale);

                // Update stock
                for (const item of quotation.items) {
                    const product = await db.products.get(item.productId);
                    if (product) {
                        await db.products.update(item.productId, {
                            stockQuantity: product.stockQuantity - item.quantity,
                            updatedAt: new Date()
                        });
                    }
                }

                // Mark quotation as converted
                if (!supabase) {
                    alert('Supabase not available');
                    return;
                }
                const { error } = await supabase!
                    .from('quotations')
                    .update({ status: 'converted' })
                    .eq('id', quotation.id!);

                if (error) {
                    console.error('Error updating quotation status:', error);
                    alert('Error updating quotation status');
                    // a real app should handle this more gracefully, maybe rollback the sale creation
                    return;
                }

                await loadQuotations();

                alert('Quotation converted to sale successfully!');
                setViewQuotation(null);
            } catch (error) {
                console.error('Error converting quotation:', error);
                alert('Error converting quotation to sale');
            }
        }
    };

    const handleSubmitQuotation = async (data: any) => {
        const quotationData = {
            quotation_number: data.quotationNumber,
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            customer_address: data.customerAddress,
            items: data.items,
            subtotal: data.subtotal,
            discount_amount: data.discountAmount,
            tax_amount: data.taxAmount,
            total_amount: data.totalAmount,
            valid_until: data.validUntil,
            status: data.status,
            notes: data.notes,
            created_by: data.createdBy,
        };

        if (data.id) {
            // Update existing
            if (!supabase) {
                alert('Supabase not available');
                return;
            }
            const { error } = await supabase!
                .from('quotations')
                .update({ ...quotationData, updated_at: new Date() })
                .eq('id', data.id);
            if (error) {
                console.error('Error updating quotation:', error);
                alert('Error updating quotation');
                return;
            }
        } else {
            // Add new
            if (!supabase) {
                alert('Supabase not available');
                return;
            }
            const { error } = await supabase!
                .from('quotations')
                .insert([{ ...quotationData, created_at: new Date(), updated_at: new Date() }]);
            if (error) {
                console.error('Error creating quotation:', error);
                alert('Error creating quotation');
                return;
            }
        }

        await loadQuotations();
        setShowForm(false);
        setSelectedQuotation(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'accepted': return 'bg-green-100 text-green-700 border-green-300';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
            case 'expired': return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'converted': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-3 w-3" />;
            case 'accepted': return <CheckCircle className="h-3 w-3" />;
            case 'rejected': return <XCircle className="h-3 w-3" />;
            case 'expired': return <Calendar className="h-3 w-3" />;
            case 'converted': return <ShoppingCart className="h-3 w-3" />;
            default: return null;
        }
    };

    const handlePrint = (quotation: Quotation) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation ${quotation.quotationNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
          .quotation-title { font-size: 18px; margin-top: 10px; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #1e40af; color: white; }
          .totals { margin-top: 20px; text-align: right; }
          .total-row { display: flex; justify-content: flex-end; margin: 5px 0; }
          .total-label { width: 150px; font-weight: bold; }
          .total-value { width: 150px; text-align: right; }
          .grand-total { font-size: 18px; font-weight: bold; color: #1e40af; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PaeasyShop POS</div>
          <div class="quotation-title">QUOTATION</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div><strong>Quotation #:</strong> ${quotation.quotationNumber}</div>
            <div><strong>Date:</strong> ${new Date(quotation.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="info-row">
            <div><strong>Valid Until:</strong> ${new Date(quotation.validUntil).toLocaleDateString()}</div>
            <div><strong>Status:</strong> ${quotation.status.toUpperCase()}</div>
          </div>
        </div>

        <div class="info-section">
          <h3>Customer Information</h3>
          <div><strong>Name:</strong> ${quotation.customerName}</div>
          ${quotation.customerPhone ? `<div><strong>Phone:</strong> ${quotation.customerPhone}</div>` : ''}
          ${quotation.customerEmail ? `<div><strong>Email:</strong> ${quotation.customerEmail}</div>` : ''}
          ${quotation.customerAddress ? `<div><strong>Address:</strong> ${quotation.customerAddress}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.sku}</td>
                <td>${item.quantity}</td>
                <td>K ${item.unitPrice.toFixed(2)}</td>
                <td>K ${item.discount.toFixed(2)}</td>
                <td>K ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">K ${quotation.subtotal.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">Discount:</div>
            <div class="total-value">K ${quotation.discountAmount.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">Tax (16.5%):</div>
            <div class="total-value">K ${quotation.taxAmount.toFixed(2)}</div>
          </div>
          <div class="total-row grand-total">
            <div class="total-label">TOTAL:</div>
            <div class="total-value">K ${quotation.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        ${quotation.notes ? `
          <div class="info-section">
            <h3>Notes</h3>
            <p>${quotation.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This quotation is valid until ${new Date(quotation.validUntil).toLocaleDateString()}</p>
          <p>For inquiries, please contact: +265 999 771 155</p>
        </div>

        <button onclick="window.print()" style="margin: 20px auto; display: block; padding: 10px 30px; background: #1e40af; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Quotation</button>
      </body>
      </html>
    `);
        printWindow.document.close();
    };

    return (
        <ModernLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
                        <p className="text-gray-600 mt-1">Create and manage customer quotations</p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedQuotation(null);
                            setShowForm(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Quotation
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search quotations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 px-3 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                                <option value="converted">Converted to Sale</option>
                            </select>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FileText className="h-4 w-4" />
                                <span>{filteredQuotations.length} quotation(s)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quotations List */}
                <div className="grid gap-4">
                    {filteredQuotations.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No quotations found</p>
                                <p className="text-sm text-gray-400 mt-1">Create your first quotation to get started</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredQuotations.map((quotation) => (
                            <Card key={quotation.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg">{quotation.quotationNumber}</h3>
                                                <Badge variant="outline" className={getStatusColor(quotation.status)}>
                                                    {getStatusIcon(quotation.status)}
                                                    <span className="ml-1">{quotation.status.toUpperCase()}</span>
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <User className="h-3 w-3" />
                                                        <span>Customer</span>
                                                    </div>
                                                    <p className="font-medium">{quotation.customerName}</p>
                                                </div>

                                                {quotation.customerPhone && (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Phone className="h-3 w-3" />
                                                            <span>Phone</span>
                                                        </div>
                                                        <p className="font-medium">{quotation.customerPhone}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>Total</span>
                                                    </div>
                                                    <p className="font-bold text-green-600">K {quotation.totalAmount.toLocaleString()}</p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Valid Until</span>
                                                    </div>
                                                    <p className="font-medium">{new Date(quotation.validUntil).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{quotation.items.length} item(s)</span>
                                                <span>•</span>
                                                <span>Created {new Date(quotation.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>By {quotation.createdBy}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setViewQuotation(quotation)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePrint(quotation)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            {quotation.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedQuotation(quotation);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete(quotation.id!)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* View Quotation Dialog */}
                {viewQuotation && (
                    <Dialog open={!!viewQuotation} onOpenChange={() => setViewQuotation(null)}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <span>Quotation {viewQuotation.quotationNumber}</span>
                                    <Badge variant="outline" className={getStatusColor(viewQuotation.status)}>
                                        {viewQuotation.status.toUpperCase()}
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Customer Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Customer Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Name:</span>
                                            <p className="font-medium">{viewQuotation.customerName}</p>
                                        </div>
                                        {viewQuotation.customerPhone && (
                                            <div>
                                                <span className="text-gray-500">Phone:</span>
                                                <p className="font-medium">{viewQuotation.customerPhone}</p>
                                            </div>
                                        )}
                                        {viewQuotation.customerEmail && (
                                            <div>
                                                <span className="text-gray-500">Email:</span>
                                                <p className="font-medium">{viewQuotation.customerEmail}</p>
                                            </div>
                                        )}
                                        {viewQuotation.customerAddress && (
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Address:</span>
                                                <p className="font-medium">{viewQuotation.customerAddress}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Items */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Items</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {viewQuotation.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="font-medium">{item.productName}</p>
                                                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">K {item.total.toFixed(2)}</p>
                                                        <p className="text-xs text-gray-500">{item.quantity} × K {item.unitPrice.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal:</span>
                                                <span>K {viewQuotation.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Discount:</span>
                                                <span>K {viewQuotation.discountAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Tax (16.5%):</span>
                                                <span>K {viewQuotation.taxAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                                                <span>Total:</span>
                                                <span>K {viewQuotation.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => handlePrint(viewQuotation)}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    {viewQuotation.status === 'pending' && (
                                        <Button
                                            onClick={() => handleConvertToSale(viewQuotation)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Convert to Sale
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Quotation Form Dialog */}
            <QuotationForm
                open={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelectedQuotation(null);
                }}
                onSubmit={handleSubmitQuotation}
                quotation={selectedQuotation}
                userName={user?.name || 'Unknown'}
            />

        </ModernLayout>
    );
}
