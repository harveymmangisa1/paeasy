import React from 'react';
import { Plus, Users, Target, Calendar, Phone, Mail } from 'lucide-react';

const QuickActions = () => {
    const actions = [
        {
            icon: Users,
            label: 'New Lead',
            color: 'bg-blue-600 hover:bg-blue-700',
            description: 'Add a new lead'
        },
        {
            icon: Phone,
            label: 'Log Call',
            color: 'bg-green-600 hover:bg-green-700',
            description: 'Record a phone call'
        },
        {
            icon: Mail,
            label: 'Send Email',
            color: 'bg-purple-600 hover:bg-purple-700',
            description: 'Compose email'
        },
        {
            icon: Target,
            label: 'New Opportunity',
            color: 'bg-orange-600 hover:bg-orange-700',
            description: 'Create opportunity'
        },
        {
            icon: Calendar,
            label: 'Schedule Activity',
            color: 'bg-pink-600 hover:bg-pink-700',
            description: 'Add to calendar'
        },
        {
            icon: Plus,
            label: 'Quick Note',
            color: 'bg-slate-600 hover:bg-slate-700',
            description: 'Add note'
        }
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="group relative">
                {/* Main Button */}
                <button className="bg-blue-600 text-white p-4 rounded-full shadow-premium-lg hover:shadow-premium-xl hover:scale-110 transition-all duration-300">
                    <Plus size={24} />
                </button>

                {/* Quick Actions Menu */}
                <div className="absolute bottom-16 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-premium-xl p-2 min-w-64">
                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 border-b border-slate-100">
                            Quick Actions
                        </div>
                        <div className="space-y-1">
                            {actions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={index}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white ${action.color} transition-colors`}
                                    >
                                        <Icon size={18} />
                                        <div className="text-left">
                                            <div className="text-sm font-medium">{action.label}</div>
                                            <div className="text-xs opacity-75">{action.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;