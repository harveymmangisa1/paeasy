'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { db, Product } from '@/lib/db/database';
import { Search, Plus, Trash2, X } from 'lucide-react';

interface QuotationItem {
    productId: number;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

interface QuotationFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    quotation?: any;
    userName: string;
}

export function QuotationForm({ open, onClose, onSubmit, quotation, userName }: QuotationFormProps) {
    const [step, setStep] = useState(1);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Form data
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [validityDays, setValidityDays] = useState(30);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<QuotationItem[]>([]);

    useEffect(() => {
        if (open) {
            loadProducts();
            if (quotation) {
                // Edit mode
                setCustomerName(quotation.customerName);
                setCustomerEmail(quotation.customerEmail || '');
                setCustomerPhone(quotation.customerPhone || '');
                setCustomerAddress(quotation.customerAddress || '');
                setNotes(quotation.notes || '');
                setItems(quotation.items);
                const daysUntilExpiry = Math.ceil(
                    (new Date(quotation.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                setValidityDays(daysUntilExpiry > 0 ? daysUntilExpiry : 30);
            }
        }
    }, [open, quotation]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    }, [searchTerm, products]);

    const loadProducts = async () => {
        const allProducts = await db.products.toArray();
        setProducts(allProducts);
    };

    const addProduct = (product: Product) => {
        const existing = items.find(i => i.productId === product.id!);
        if (existing) {
            updateQuantity(product.id!, existing.quantity + 1);
        } else {
            const newItem: QuotationItem = {
                productId: product.id!,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                unitPrice: product.sellingPrice,
                discount: 0,
                total: product.sellingPrice
            };
            setItems([...items, newItem]);
        }
        setSearchTerm('');
    };

    const updateQuantity = (productId: number, quantity: number) => {
        setItems(items.map(item => {
            if (item.productId === productId) {
                const total = (quantity * item.unitPrice) - item.discount;
                return { ...item, quantity, total };
            }
            return item;
        }));
    };

    const updateDiscount = (productId: number, discount: number) => {
        setItems(items.map(item => {
            if (item.productId === productId) {
                const total = (item.quantity * item.unitPrice) - discount;
                return { ...item, discount, total };
            }
            return item;
        }));
    };

    const removeItem = (productId: number) => {
        setItems(items.filter(item => item.productId !== productId));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * 0.165; // 16.5% VAT
        const totalAmount = subtotal + taxAmount;
        const discountAmount = items.reduce((sum, item) => sum + item.discount, 0);

        return { subtotal, taxAmount, totalAmount, discountAmount };
    };

    const handleSubmit = () => {
        if (!customerName || items.length === 0) {
            alert('Please fill in customer name and add at least one item');
            return;
        }

        const { subtotal, taxAmount, totalAmount, discountAmount } = calculateTotals();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + validityDays);

        const quotationData = {
            id: quotation?.id || Date.now(),
            quotationNumber: quotation?.quotationNumber || `QT${Date.now()}`,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount,
            validUntil,
            status: quotation?.status || 'pending',
            notes,
            createdBy: userName,
            createdAt: quotation?.createdAt || new Date(),
            updatedAt: new Date(),
        };

        onSubmit(quotationData);
        resetForm();
    };

    const resetForm = () => {
        setStep(1);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setCustomerAddress('');
        setValidityDays(30);
        setNotes('');
        setItems([]);
        setSearchTerm('');
    };

    const { subtotal, taxAmount, totalAmount, discountAmount } = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {quotation ? 'Edit Quotation' : 'Create New Quotation'}
                    </DialogTitle>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            1
                        </div>
                        <span className="text-sm font-medium">Customer</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            2
                        </div>
                        <span className="text-sm font-medium">Items</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            3
                        </div>
                        <span className="text-sm font-medium">Review</span>
                    </div>
                </div>

                {/* Step 1: Customer Information */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Customer Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                                className="h-11"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                                <Input
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="+265 999 123 456"
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                                <Input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="customer@example.com"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Address</label>
                            <Input
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                placeholder="Customer address"
                                className="h-11"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">
                                Valid For (Days)
                            </label>
                            <Input
                                type="number"
                                value={validityDays}
                                onChange={(e) => setValidityDays(parseInt(e.target.value))}
                                placeholder="30"
                                className="h-11"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Quotation will be valid until {new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={() => setStep(2)} disabled={!customerName}>
                                Next: Add Items
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Add Items */}
                {step === 2 && (
                    <div className="space-y-4">
                        {/* Product Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products by name or SKU..."
                                className="pl-10 h-11"
                            />

                            {/* Search Results */}
                            {filteredProducts.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => addProduct(product)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600">K {product.sellingPrice.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">{product.stockQuantity} in stock</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Items */}
                        <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No items added yet</p>
                                    <p className="text-sm mt-1">Search and select products above</p>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                        </div>

                                        <div className="w-24">
                                            <label className="text-xs text-gray-500">Qty</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="w-28">
                                            <label className="text-xs text-gray-500">Unit Price</label>
                                            <p className="font-medium">K {item.unitPrice.toFixed(2)}</p>
                                        </div>

                                        <div className="w-24">
                                            <label className="text-xs text-gray-500">Discount</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.discount}
                                                onChange={(e) => updateDiscount(item.productId, parseFloat(e.target.value) || 0)}
                                                className="h-9"
                                            />
                                        </div>

                                        <div className="w-28 text-right">
                                            <label className="text-xs text-gray-500">Total</label>
                                            <p className="font-bold text-blue-600">K {item.total.toFixed(2)}</p>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeItem(item.productId)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals Preview */}
                        {items.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">K {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount:</span>
                                        <span className="font-medium">K {discountAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (16.5%):</span>
                                        <span className="font-medium">K {taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                                        <span>Total:</span>
                                        <span>K {totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between gap-2 pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={() => setStep(3)} disabled={items.length === 0}>
                                Next: Review
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <div className="space-y-4">
                        {/* Customer Info Summary */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Customer Information</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Name:</span>
                                    <p className="font-medium">{customerName}</p>
                                </div>
                                {customerPhone && (
                                    <div>
                                        <span className="text-gray-500">Phone:</span>
                                        <p className="font-medium">{customerPhone}</p>
                                    </div>
                                )}
                                {customerEmail && (
                                    <div>
                                        <span className="text-gray-500">Email:</span>
                                        <p className="font-medium">{customerEmail}</p>
                                    </div>
                                )}
                                {customerAddress && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Address:</span>
                                        <p className="font-medium">{customerAddress}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">Valid Until:</span>
                                    <p className="font-medium">
                                        {new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Summary */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Items ({items.length})</h3>
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.productId} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} × K {item.unitPrice.toFixed(2)}
                                                {item.discount > 0 && ` - K ${item.discount.toFixed(2)} discount`}
                                            </p>
                                        </div>
                                        <p className="font-bold">K {item.total.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>K {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Discount:</span>
                                    <span>K {discountAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax (16.5%):</span>
                                    <span>K {taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t">
                                    <span>TOTAL:</span>
                                    <span>K {totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes or terms..."
                                rows={3}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                            />
                        </div>

                        <div className="flex justify-between gap-2 pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                                {quotation ? 'Update Quotation' : 'Create Quotation'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
