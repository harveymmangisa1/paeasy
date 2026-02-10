import React from 'react';
import { Phone, Mail, Calendar, Users, Target, Clock } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';

const RecentActivities = ({ activities }) => {
    const getActivityIcon = (type) => {
        const icons = {
            'call': Phone,
            'email': Mail,
            'meeting': Users,
            'task': Target,
            'note': Clock,
            'demo': Users,
            'followup': Calendar
        };
        return icons[type] || Clock;
    };

    const getActivityColor = (type) => {
        const colors = {
            'call': 'bg-blue-100 text-blue-600',
            'email': 'bg-purple-100 text-purple-600',
            'meeting': 'bg-green-100 text-green-600',
            'task': 'bg-orange-100 text-orange-600',
            'note': 'bg-slate-100 text-slate-600',
            'demo': 'bg-pink-100 text-pink-600',
            'followup': 'bg-yellow-100 text-yellow-600'
        };
        return colors[type] || colors.task;
    };

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
    };

    // Get recent activities (last 10)
    const recentActivities = activities
        ?.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .slice(0, 10) || [];

    return (
        <div className="space-y-3">
            {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                    <Clock className="mx-auto text-slate-400 mb-3" size={32} />
                    <p className="text-sm text-slate-500">No recent activities</p>
                </div>
            ) : (
                recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.activity_type);
                    return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.activity_type)}`}>
                                <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-slate-900 truncate">
                                        {activity.title}
                                    </h4>
                                    <span className="text-xs text-slate-500 flex-shrink-0">
                                        {formatRelativeTime(activity.start_date)}
                                    </span>
                                </div>
                                
                                {activity.description && (
                                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                        {activity.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    <span className="capitalize">
                                        {activity.activity_type.replace('_', ' ')}
                                    </span>
                                    {activity.assigned_to_name && (
                                        <span>• {activity.assigned_to_name}</span>
                                    )}
                                </div>
                                
                                {/* Related Entity Info */}
                                {(activity.contact || activity.lead || activity.account || activity.opportunity) && (
                                    <div className="mt-2 text-xs text-slate-500">
                                        with{' '}
                                        {activity.lead && `Lead: ${activity.lead}`}
                                        {activity.contact && `Contact: ${activity.contact}`}
                                        {activity.account && `Account: ${activity.account}`}
                                        {activity.opportunity && `Opportunity: ${activity.opportunity}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            
            {activities?.length > 10 && (
                <div className="text-center pt-2">
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View all {activities.length} activities
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentActivities;