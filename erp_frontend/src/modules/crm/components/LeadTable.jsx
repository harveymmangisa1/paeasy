import React, { useState } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Phone, Mail, Building, Eye, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';

const LeadTable = ({ leads, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const getStatusColor = (status) => {
        const colors = {
            'new': 'bg-blue-100 text-blue-700',
            'contacted': 'bg-yellow-100 text-yellow-700',
            'qualified': 'bg-green-100 text-green-700',
            'converted': 'bg-purple-100 text-purple-700',
            'lost': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'converted': return <CheckCircle size={16} />;
            case 'lost': return <XCircle size={16} />;
            default: return null;
        }
    };

    const filteredLeads = leads?.filter(lead => {
        const matchesSearch = searchTerm === '' || 
            lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = selectedStatus === '' || lead.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
    }) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                </select>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
                    <Plus size={20} />
                    Add Lead
                </button>
            </div>

            {/* Leads Table */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lead</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">
                                                {lead.first_name} {lead.last_name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail size={14} className="text-slate-400" />
                                                <span className="text-xs text-slate-500">{lead.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone size={14} className="text-slate-400" />
                                                <span className="text-xs text-slate-500">{lead.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building size={14} className="text-slate-400" />
                                            <span className="text-sm text-slate-900">{lead.company || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                                            {getStatusIcon(lead.status)}
                                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-900">
                                            {lead.source?.replace('_', ' ').charAt(0).toUpperCase() + lead.source?.replace('_', ' ').slice(1) || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900">
                                            {lead.assigned_to_name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredLeads.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-2">No leads found</div>
                        <div className="text-sm text-slate-500">Try adjusting your search or filters</div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default LeadTable;