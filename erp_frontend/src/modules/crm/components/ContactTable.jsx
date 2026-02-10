import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, Mail, Building, Eye, Star, MapPin } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';

const ContactTable = ({ contacts, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContacts = contacts?.filter(contact => {
        return searchTerm === '' || 
            contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.account_name?.toLowerCase().includes(searchTerm.toLowerCase());
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
            {/* Search and Actions */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-colors">
                    <Plus size={20} />
                    Add Contact
                </button>
            </div>

            {/* Contacts Table */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Account</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {(contact.first_name || '').charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                    {contact.first_name} {contact.last_name}
                                                    {contact.is_primary && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                                    {contact.is_decision_maker && <div className="w-2 h-2 bg-green-500 rounded-full" title="Decision Maker"></div>}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Mail size={12} className="text-slate-400" />
                                                        <span className="text-xs text-slate-500">{contact.email}</span>
                                                    </div>
                                                    {contact.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone size={12} className="text-slate-400" />
                                                            <span className="text-xs text-slate-500">{contact.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {contact.account_name ? (
                                            <div className="flex items-center gap-2">
                                                <Building size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-900">{contact.account_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">No Account</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm text-slate-900">{contact.position || '-'}</div>
                                            {contact.department && (
                                                <div className="text-xs text-slate-500">{contact.department}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.is_primary && (
                                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                                                    Primary
                                                </span>
                                            )}
                                            {contact.is_decision_maker && (
                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                    Decision Maker
                                                </span>
                                            )}
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
                
                {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-2">No contacts found</div>
                        <div className="text-sm text-slate-500">Try adjusting your search</div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default ContactTable;