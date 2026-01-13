'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db/database';

interface DailyReport {
    id?: number;
    date: Date;
    staffId: number;
    staffName: string;
    reportType: 'issue' | 'observation' | 'suggestion' | 'incident';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'reviewed';
    createdAt: Date;
}

export default function DailyReportPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        reportType: 'issue' as 'issue' | 'observation' | 'suggestion' | 'incident',
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
    });

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        // For now, load from localStorage (can be moved to IndexedDB later)
        const stored = localStorage.getItem('daily_reports');
        if (stored) {
            setReports(JSON.parse(stored));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        const newReport: DailyReport = {
            id: Date.now(),
            date: new Date(),
            staffId: user.id!,
            staffName: user.name,
            reportType: formData.reportType,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            status: 'pending',
            createdAt: new Date(),
        };

        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);
        localStorage.setItem('daily_reports', JSON.stringify(updatedReports));

        // Reset form
        setFormData({
            reportType: 'issue',
            title: '',
            description: '',
            priority: 'medium',
        });
        setShowForm(false);

        alert('Report submitted successfully!');
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-300';
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'issue': return 'bg-red-50 text-red-700';
            case 'incident': return 'bg-purple-50 text-purple-700';
            case 'observation': return 'bg-blue-50 text-blue-700';
            case 'suggestion': return 'bg-green-50 text-green-700';
            default: return 'bg-gray-50 text-gray-700';
        }
    };

    return (
        <ModernLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
                        <p className="text-gray-600 mt-1">Submit issues, observations, and suggestions</p>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        New Report
                    </Button>
                </div>

                {/* Report Form */}
                {showForm && (
                    <Card className="border-blue-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                            <CardTitle>Submit Daily Report</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Report Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.reportType}
                                            onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                                            className="w-full h-11 px-3 border border-input bg-background rounded-md text-sm"
                                            required
                                        >
                                            <option value="issue">Issue/Problem</option>
                                            <option value="incident">Incident</option>
                                            <option value="observation">Observation</option>
                                            <option value="suggestion">Suggestion</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Priority <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                            className="w-full h-11 px-3 border border-input bg-background rounded-md text-sm"
                                            required
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Brief summary of the report..."
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detailed description of the issue, observation, or suggestion..."
                                        required
                                        rows={6}
                                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Report
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Reports List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Your Reports</h2>

                    {reports.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No reports submitted yet</p>
                                <p className="text-sm text-gray-400 mt-1">Click "New Report" to submit your first report</p>
                            </CardContent>
                        </Card>
                    ) : (
                        reports.map((report) => (
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={getTypeColor(report.reportType)}>
                                                    {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                                                </Badge>
                                                <Badge variant="outline" className={getPriorityColor(report.priority)}>
                                                    {report.priority.toUpperCase()} Priority
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {report.status === 'pending' ? (
                                                        <>
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Pending Review
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Reviewed
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>

                                            <h3 className="font-semibold text-lg text-gray-900 mb-2">{report.title}</h3>
                                            <p className="text-gray-600 text-sm mb-3">{report.description}</p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>By: {report.staffName}</span>
                                                <span>•</span>
                                                <span>{new Date(report.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </ModernLayout>
    );
}
