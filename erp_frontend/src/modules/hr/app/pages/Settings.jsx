import React, { useState } from 'react';
import { Settings, Bell, Shield, Database, Palette, Globe, Users, Clock, DollarSign, FileText, HelpCircle, Save, RotateCcw } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        general: {
            companyName: 'Acme Corporation',
            companyEmail: 'hr@acme.com',
            companyPhone: '+1 (555) 123-4567',
            timezone: 'America/New_York',
            dateFormat: 'MM/DD/YYYY',
            language: 'en',
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: true,
            leaveRequests: true,
            payrollAlerts: true,
            performanceReviews: true,
            attendanceAlerts: false,
        },
        security: {
            twoFactorAuth: true,
            sessionTimeout: 30,
            passwordPolicy: 'strong',
            ipRestrictions: false,
            auditLogging: true,
        },
        payroll: {
            payFrequency: 'biweekly',
            payDay: 'Friday',
            taxYear: 'calendar',
            overtimeRate: 1.5,
            autoApproveOvertime: false,
        },
        attendance: {
            workSchedule: '9-5',
            breakDuration: 60,
            gracePeriod: 15,
            autoClockOut: false,
            weekendWork: false,
        },
        documents: {
            maxFileSize: 10,
            allowedFormats: ['PDF', 'DOC', 'DOCX', 'JPG', 'PNG'],
            retentionPeriod: 7,
            autoArchive: true,
        },
    });

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    const handleSettingChange = (category, field, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }));
    };

    const saveSettings = () => {
        // In a real app, this would save to backend
        alert('Settings saved successfully!');
    };

    const resetSettings = () => {
        // In a real app, this would reset to defaults
        alert('Settings reset to defaults!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">HR Settings</h1>
                    <p className="text-sm text-slate-500">Configure your HR system preferences</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={resetSettings}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors"
                    >
                        <RotateCcw size={18} />
                        <span>Reset</span>
                    </button>
                    <button 
                        onClick={saveSettings}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium"
                    >
                        <Save size={18} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-4">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                                            activeTab === tab.id
                                                ? 'bg-primary-100 text-primary-700'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="glass-card p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-6">General Settings</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            value={settings.general.companyName}
                                            onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Company Email</label>
                                            <input
                                                type="email"
                                                value={settings.general.companyEmail}
                                                onChange={(e) => handleSettingChange('general', 'companyEmail', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Company Phone</label>
                                            <input
                                                type="tel"
                                                value={settings.general.companyPhone}
                                                onChange={(e) => handleSettingChange('general', 'companyPhone', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                                            <select
                                                value={settings.general.timezone}
                                                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="America/New_York">Eastern Time</option>
                                                <option value="America/Chicago">Central Time</option>
                                                <option value="America/Denver">Mountain Time</option>
                                                <option value="America/Los_Angeles">Pacific Time</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                                            <select
                                                value={settings.general.dateFormat}
                                                onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                                            <select
                                                value={settings.general.language}
                                                onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-6">Notification Settings</h2>
                                <div className="space-y-4">
                                    {Object.entries(settings.notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {key === 'emailNotifications' && 'Receive email notifications'} 
                                                    {key === 'pushNotifications' && 'Receive push notifications'} 
                                                    {key === 'leaveRequests' && 'Get notified for leave requests'} 
                                                    {key === 'payrollAlerts' && 'Receive payroll processing alerts'} 
                                                    {key === 'performanceReviews' && 'Get notified for performance reviews'} 
                                                    {key === 'attendanceAlerts' && 'Receive attendance alerts'} 
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleSettingChange('notifications', key, !value)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    value ? 'bg-primary-600' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        value ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-6">Security Settings</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500">Require 2FA for all admin accounts</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                settings.security.twoFactorAuth ? 'bg-primary-600' : 'bg-slate-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            value={settings.security.sessionTimeout}
                                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Password Policy</label>
                                        <select
                                            value={settings.security.passwordPolicy}
                                            onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="basic">Basic</option>
                                            <option value="strong">Strong</option>
                                            <option value="complex">Complex</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payroll Settings */}
                        {activeTab === 'payroll' && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-6">Payroll Settings</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Pay Frequency</label>
                                            <select
                                                value={settings.payroll.payFrequency}
                                                onChange={(e) => handleSettingChange('payroll', 'payFrequency', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="weekly">Weekly</option>
                                                <option value="biweekly">Bi-weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="semimonthly">Semi-monthly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Pay Day</label>
                                            <select
                                                value={settings.payroll.payDay}
                                                onChange={(e) => handleSettingChange('payroll', 'payDay', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Overtime Rate</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={settings.payroll.overtimeRate}
                                            onChange={(e) => handleSettingChange('payroll', 'overtimeRate', parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Settings */}
                        {activeTab === 'attendance' && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-6">Attendance Settings</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Work Schedule</label>
                                            <select
                                                value={settings.attendance.workSchedule}
                                                onChange={(e) => handleSettingChange('attendance', 'workSchedule', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="9-5">9 AM - 5 PM</option>
                                                <option value="8-4">8 AM - 4 PM</option>
                                                <option value="flexible">Flexible</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Break Duration (minutes)</label>
                                            <input
                                                type="number"
                                                value={settings.attendance.breakDuration}
                                                onChange={(e) => handleSettingChange('attendance', 'breakDuration', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Grace Period (minutes)</label>
                                        <input
                                            type="number"
                                            value={settings.attendance.gracePeriod}
                                            onChange={(e) => handleSettingChange('attendance', 'gracePeriod', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents Settings */}
                        {activeTab === 'documents' && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-6">Document Settings</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Max File Size (MB)</label>
                                            <input
                                                type="number"
                                                value={settings.documents.maxFileSize}
                                                onChange={(e) => handleSettingChange('documents', 'maxFileSize', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Retention Period (years)</label>
                                            <input
                                                type="number"
                                                value={settings.documents.retentionPeriod}
                                                onChange={(e) => handleSettingChange('documents', 'retentionPeriod', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Allowed Formats</label>
                                        <div className="space-y-2">
                                            {settings.documents.allowedFormats.map((format, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={format}
                                                        onChange={(e) => {
                                                            const newFormats = [...settings.documents.allowedFormats];
                                                            newFormats[index] = e.target.value;
                                                            handleSettingChange('documents', 'allowedFormats', newFormats);
                                                        }}
                                                        className="flex-1 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newFormats = settings.documents.allowedFormats.filter((_, i) => i !== index);
                                                            handleSettingChange('documents', 'allowedFormats', newFormats);
                                                        }}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newFormats = [...settings.documents.allowedFormats, ''];
                                                    handleSettingChange('documents', 'allowedFormats', newFormats);
                                                }}
                                                className="text-primary-600 hover:text-primary-700 text-sm"
                                            >
                                                Add Format
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;