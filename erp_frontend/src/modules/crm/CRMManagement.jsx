import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Building, Target, Calendar, Phone, Mail, MapPin, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useLeads, useContacts, useAccounts, useOpportunities, useActivities } from '../../hooks/useCrm';
import GlassCard from '../../components/ui/GlassCard';
import StatCard from '../../components/ui/StatCard';
import LeadTable from './components/LeadTable';
import ContactTable from './components/ContactTable';
import OpportunityPipeline from './components/OpportunityPipeline';
import ActivityCalendar from './components/ActivityCalendar';
import QuickActions from './components/QuickActions';
import RecentActivities from './components/RecentActivities';

const CRM = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    
    const { 
        leads, 
        leadsLoading, 
        leadStats 
    } = useLeads();
    
    const { 
        contacts, 
        contactsLoading, 
        contactStats 
    } = useContacts();
    
    const { 
        accounts, 
        accountsLoading, 
        accountStats 
    } = useAccounts();
    
    const { 
        opportunities, 
        opportunitiesLoading, 
        opportunityStats 
    } = useOpportunities();
    
    const { 
        activities, 
        activitiesLoading 
    } = useActivities();

    const dashboardStats = {
        totalLeads: leadStats?.total || 0,
        newLeads: leadStats?.new || 0,
        totalContacts: contactStats?.total || 0,
        totalAccounts: accountStats?.total || 0,
        openOpportunities: opportunityStats?.open || 0,
        pipelineValue: opportunityStats?.value || 0,
        todayActivities: activities?.filter(a => {
            const today = new Date().toDateString();
            return new Date(a.start_date).toDateString() === today;
        }).length || 0,
        conversionRate: leadStats ? ((leadStats.converted / leadStats.total) * 100).toFixed(1) : 0
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'leads', label: 'Leads', icon: Users },
        { id: 'contacts', label: 'Contacts', icon: Phone },
        { id: 'accounts', label: 'Accounts', icon: Building },
        { id: 'opportunities', label: 'Opportunities', icon: Target },
        { id: 'activities', label: 'Activities', icon: Calendar }
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Leads"
                                value={dashboardStats.totalLeads}
                                change={dashboardStats.newLeads}
                                changeType="increase"
                                icon={Users}
                                color="blue"
                            />
                            <StatCard
                                title="Open Opportunities"
                                value={dashboardStats.openOpportunities}
                                subtitle={`$${dashboardStats.pipelineValue.toLocaleString()}`}
                                icon={Target}
                                color="green"
                            />
                            <StatCard
                                title="Total Contacts"
                                value={dashboardStats.totalContacts}
                                icon={Phone}
                                color="purple"
                            />
                            <StatCard
                                title="Today's Activities"
                                value={dashboardStats.todayActivities}
                                icon={Calendar}
                                color="orange"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Opportunity Pipeline */}
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Opportunity Pipeline</h3>
                                <OpportunityPipeline opportunities={opportunities} />
                            </GlassCard>

                            {/* Recent Activities */}
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activities</h3>
                                <RecentActivities activities={activities} />
                            </GlassCard>
                        </div>

                        {/* Conversion Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Lead Conversion Rate</p>
                                        <p className="text-2xl font-bold text-slate-900">{dashboardStats.conversionRate}%</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <TrendingUp className="text-blue-600" size={24} />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Average Deal Size</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            ${opportunityStats?.averageDealSize?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <DollarSign className="text-green-600" size={24} />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Sales Cycle (days)</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {opportunityStats?.averageCycle || 0}
                                        </p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Clock className="text-purple-600" size={24} />
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                );

            case 'leads':
                return <LeadTable leads={leads} loading={leadsLoading} />;

            case 'contacts':
                return <ContactTable contacts={contacts} loading={contactsLoading} />;

            case 'accounts':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900">Accounts</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Plus size={20} />
                                Add Account
                            </button>
                        </div>
                        <p className="text-slate-600">Account management component will be implemented here</p>
                    </div>
                );

            case 'opportunities':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900">Opportunities</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Plus size={20} />
                                Add Opportunity
                            </button>
                        </div>
                        <OpportunityPipeline opportunities={opportunities} expanded={true} />
                    </div>
                );

            case 'activities':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900">Activities</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Plus size={20} />
                                Schedule Activity
                            </button>
                        </div>
                        <ActivityCalendar activities={activities} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Customer Relationship Management</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search CRM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            {renderContent()}

            {/* Quick Actions (Floating) */}
            <QuickActions />
        </div>
    );
};

export default CRM;