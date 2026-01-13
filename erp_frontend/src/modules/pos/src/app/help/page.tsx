'use client';

import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    ShoppingCart,
    Package,
    Users,
    Settings,
    BarChart3,
    Phone,
    Mail,
    HelpCircle,
    CheckCircle,
    AlertCircle,
    Keyboard,
    Zap
} from 'lucide-react';

export default function HelpPage() {
    return (
        <ModernLayout>
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Help & User Guide</h1>
                    <p className="text-gray-600">Complete walkthrough for PaeasyShop POS System</p>
                </div>

                {/* Contact Support */}
                <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Need Help? Contact Support</h3>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        <a href="tel:+265999771155" className="text-lg font-semibold hover:underline">
                                            +265 999 771 155
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        <span className="text-sm">Available 24/7</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                                <HelpCircle className="h-8 w-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Start Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Quick Start Guide
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-blue-600">1</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Login</h4>
                                    <p className="text-sm text-gray-600">Enter your email and password, or use your 4-digit PIN for quick access</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-blue-600">2</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Navigate to Sales</h4>
                                    <p className="text-sm text-gray-600">Click "Sales" in the sidebar or press <kbd className="bg-gray-100 px-2 py-1 rounded">Alt+S</kbd></p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-blue-600">3</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Scan or Search Products</h4>
                                    <p className="text-sm text-gray-600">Use barcode scanner (F1) or search manually (F2)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-blue-600">4</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Complete Checkout</h4>
                                    <p className="text-sm text-gray-600">Press F4 or click "Checkout", select payment method, and complete sale</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Keyboard Shortcuts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Keyboard className="h-5 w-5" />
                            Keyboard Shortcuts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Focus Barcode Scanner</span>
                                <Badge variant="secondary" className="font-mono">F1</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Focus Search</span>
                                <Badge variant="secondary" className="font-mono">F2</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Clear Cart</span>
                                <Badge variant="secondary" className="font-mono">F3</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Open Checkout</span>
                                <Badge variant="secondary" className="font-mono">F4</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Complete Payment</span>
                                <Badge variant="secondary" className="font-mono">Enter</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Cancel/Close</span>
                                <Badge variant="secondary" className="font-mono">Esc</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Module Guides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales Module */}
                    <Card>
                        <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-green-600" />
                                Sales / Cashier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Scan Items:</strong> Use barcode scanner or search by name/SKU</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Adjust Quantity:</strong> Click +/- buttons on cart items</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Payment Methods:</strong> Cash, Mobile Money, Bank Card, Credit</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Quick Amounts:</strong> Use suggested amount buttons for fast cash payments</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Inventory Module */}
                    <Card>
                        <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-600" />
                                Inventory Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Add Products:</strong> Click "Add Product" and fill in details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Low Stock Alerts:</strong> Automatic warnings when stock is low</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Filter & Search:</strong> Find products by name, category, or stock level</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Export Data:</strong> Download inventory as CSV for backup</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Users Module */}
                    <Card>
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Create Users:</strong> Admin can add cashiers, managers, and admins</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Set Permissions:</strong> Control what each role can access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>PIN Access:</strong> Each user gets a 4-digit PIN for quick login</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Activity Tracking:</strong> View last login times and user status</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Reports Module */}
                    <Card>
                        <CardHeader className="bg-gradient-to-br from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-orange-600" />
                                Reports & Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Sales Reports:</strong> Daily, weekly, monthly revenue summaries</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Z-Reports:</strong> End-of-day cashier reports automatically generated</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Product Performance:</strong> See best-selling items and trends</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <span><strong>Export Options:</strong> Download reports as PDF or CSV</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Common Issues */}
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-900">
                            <AlertCircle className="h-5 w-5" />
                            Troubleshooting Common Issues
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Cannot Login</h4>
                                <p className="text-sm text-gray-700">
                                    • Check your email and password are correct<br />
                                    • Try using your PIN instead<br />
                                    • Contact admin to reset your password
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Barcode Scanner Not Working</h4>
                                <p className="text-sm text-gray-700">
                                    • Ensure scanner is plugged in via USB<br />
                                    • Test scanner in Notepad to verify it works<br />
                                    • Press F1 to focus the barcode input field
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Product Not Found</h4>
                                <p className="text-sm text-gray-700">
                                    • Try searching by product name instead of barcode<br />
                                    • Check if product exists in Inventory<br />
                                    • Ask manager to add the product
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Data Not Syncing</h4>
                                <p className="text-sm text-gray-700">
                                    • Check internet connection<br />
                                    • Data syncs automatically every 60 seconds<br />
                                    • Contact support if issue persists
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Best Practices */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900">
                            <CheckCircle className="h-5 w-5" />
                            Best Practices for Cashiers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Always verify the total amount before completing a sale</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Count cash carefully and announce change to customer</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Use keyboard shortcuts (F1-F4) for faster checkout</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Report any issues immediately via Support page</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>Log out when leaving the POS terminal unattended</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 pt-6 border-t">
                    <p>PaeasyShop POS System v1.0 • For technical support, call <strong>+265 999 771 155</strong></p>
                </div>
            </div>
        </ModernLayout>
    );
}
