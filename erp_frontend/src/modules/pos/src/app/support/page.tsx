'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { useCurrentTenant } from '@/lib/tenant-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    Send,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    CreditCard,
    Wrench,
    HelpCircle,
    Phone
} from 'lucide-react';
import { db, ProblemReport } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { hasPermission } from '@/lib/permissions';

export default function SupportPage() {
    const { user } = useAuth();
    const { tenantId } = useCurrentTenant();
    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: 'technical' as ProblemReport['category'],
        description: '',
        priority: 'medium' as ProblemReport['priority'],
    });

    useEffect(() => {
        loadReports();
        if (tenantId) realtimeSync.setTenantId(tenantId);
        realtimeSync.startProblemReportsSync(() => loadReports());
        return () => realtimeSync.stopAll();
    }, [tenantId]);

    const loadReports = async () => {
        try {
            const allReports = await api.fetchProblemReports(tenantId || undefined);

            // Cashiers only see their own reports
            if (user?.role === 'cashier') {
                setReports(allReports.filter((r: ProblemReport) => r.staffId === user.id));
            } else {
                setReports(allReports);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        try {
            await api.createProblemReport({
                staffId: user.id!,
                staffName: user.name,
                category: formData.category,
                description: formData.description,
                priority: formData.priority,
                status: 'open',
                createdAt: new Date(),
                tenantId: tenantId || undefined
            });

            setFormData({
                category: 'technical',
                description: '',
                priority: 'medium',
            });
            setShowForm(false);
            loadReports();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Error submitting report');
        }
    };

    const handleResolve = async (reportId: number) => {
        if (!user) return;

        try {
            await api.updateProblemReport(reportId, {
                status: 'resolved',
                resolvedAt: new Date(),
                resolvedBy: user.id,
            });
            loadReports();
        } catch (error) {
            console.error('Error resolving report:', error);
        }
    };

    const getCategoryIcon = (category: ProblemReport['category']) => {
        switch (category) {
            case 'technical': return Wrench;
            case 'inventory': return Package;
            case 'payment': return CreditCard;
            default: return HelpCircle;
        }
    };

    const getStatusBadge = (status: ProblemReport['status']) => {
        switch (status) {
            case 'open':
                return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" /> Open</Badge>;
            case 'in_progress':
                return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" /> In Progress</Badge>;
            case 'resolved':
                return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Resolved</Badge>;
        }
    };

    const getPriorityBadge = (priority: ProblemReport['priority']) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive">High</Badge>;
            case 'medium':
                return <Badge variant="secondary">Medium</Badge>;
            case 'low':
                return <Badge variant="outline">Low</Badge>;
        }
    };

    return (
        <ModernLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
                        <p className="text-gray-600 mt-1">Report issues and get help</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {showForm ? 'Cancel' : 'Report Problem'}
                    </Button>
                </div>

                {/* Helpline Contact */}
                <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold mb-2">Need Immediate Help?</h3>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    <a href="tel:+265999771155" className="text-2xl font-bold hover:underline">
                                        +265 999 771 155
                                    </a>
                                </div>
                                <p className="text-sm text-blue-100 mt-1">Available 24/7 for urgent support</p>
                            </div>
                            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                                <HelpCircle className="h-8 w-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Form */}
                {showForm && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle>Report a Problem</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Category *</Label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProblemReport['category'] })}
                                            className="w-full h-10 px-3 py-2 border border-input bg-white rounded-md text-sm"
                                        >
                                            <option value="technical">Technical Issue</option>
                                            <option value="inventory">Inventory Problem</option>
                                            <option value="payment">Payment Issue</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Priority *</Label>
                                        <select
                                            required
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProblemReport['priority'] })}
                                            className="w-full h-10 px-3 py-2 border border-input bg-white rounded-md text-sm"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High - Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Description *</Label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Please describe the problem in detail..."
                                        className="w-full min-h-[120px] px-3 py-2 border border-input bg-white rounded-md text-sm"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Report
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Open Issues</p>
                                    <h3 className="text-2xl font-bold mt-2 text-red-600">
                                        {reports.filter(r => r.status === 'open').length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                    <h3 className="text-2xl font-bold mt-2 text-orange-600">
                                        {reports.filter(r => r.status === 'in_progress').length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Resolved</p>
                                    <h3 className="text-2xl font-bold mt-2 text-green-600">
                                        {reports.filter(r => r.status === 'resolved').length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Reports ({reports.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reports.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg">No reports yet</p>
                                <p className="text-sm mt-2">Click "Report Problem" to submit an issue</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report) => {
                                    const CategoryIcon = getCategoryIcon(report.category);

                                    return (
                                        <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {getStatusBadge(report.status)}
                                                            {getPriorityBadge(report.priority)}
                                                            <Badge variant="outline" className="text-xs">
                                                                {report.category}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-gray-900 mb-2">{report.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <span>Reported by: {report.staffName}</span>
                                                            <span>•</span>
                                                            <span>{new Date(report.createdAt).toLocaleString()}</span>
                                                            {report.resolvedAt && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-green-600">
                                                                        Resolved: {new Date(report.resolvedAt).toLocaleString()}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {report.status !== 'resolved' && hasPermission(user, 'users', 'edit') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleResolve(report.id!)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Mark Resolved
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Common Issues Help */}
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Common Issues & Quick Fixes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Barcode Scanner Not Working</h4>
                                <p className="text-xs text-gray-600">
                                    1. Check USB connection<br />
                                    2. Test in notepad<br />
                                    3. Restart the application
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Receipt Printer Issues</h4>
                                <p className="text-xs text-gray-600">
                                    1. Check power and paper<br />
                                    2. Verify printer connection<br />
                                    3. Check printer queue
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Product Not Found</h4>
                                <p className="text-xs text-gray-600">
                                    1. Search by name instead<br />
                                    2. Check if product exists<br />
                                    3. Contact manager to add
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Payment Processing Error</h4>
                                <p className="text-xs text-gray-600">
                                    1. Verify amount entered<br />
                                    2. Check payment method<br />
                                    3. Try alternative method
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ModernLayout>
    );
}
