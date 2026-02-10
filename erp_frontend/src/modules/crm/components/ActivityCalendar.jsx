import React from 'react';
import { Calendar, Phone, Mail, Users, MapPin, Clock, CheckCircle } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';

const ActivityCalendar = ({ activities }) => {
    const getActivityIcon = (type) => {
        const icons = {
            'call': Phone,
            'email': Mail,
            'meeting': Users,
            'task': CheckCircle,
            'note': Clock,
            'demo': Users,
            'followup': Clock
        };
        return icons[type] || Calendar;
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

    const getStatusColor = (status) => {
        const colors = {
            'planned': 'bg-blue-100 text-blue-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || colors.planned;
    };

    // Group activities by date
    const activitiesByDate = activities?.reduce((acc, activity) => {
        const date = new Date(activity.start_date).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
    }, {}) || {};

    // Sort dates
    const sortedDates = Object.keys(activitiesByDate).sort((a, b) => 
        new Date(a) - new Date(b)
    );

    // Get today's activities
    const today = new Date().toDateString();
    const todayActivities = activitiesByDate[today] || [];
    const upcomingActivities = sortedDates
        .filter(date => new Date(date) > new Date(today))
        .slice(0, 7);

    return (
        <div className="space-y-6">
            {/* Today's Activities */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar size={20} />
                    Today's Activities
                </h3>
                
                {todayActivities.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <Calendar className="mx-auto text-slate-400 mb-3" size={48} />
                        <p className="text-slate-600">No activities scheduled for today</p>
                    </GlassCard>
                ) : (
                    <div className="space-y-3">
                        {todayActivities.map((activity) => {
                            const Icon = getActivityIcon(activity.activity_type);
                            return (
                                <GlassCard key={activity.id} className="p-4 hover:shadow-premium-lg transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-slate-900">{activity.title}</h4>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                            {activity.description && (
                                                <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span>
                                                        {new Date(activity.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {activity.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        <span>{activity.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} />
                                                    <span>{activity.assigned_to_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upcoming Activities */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Activities</h3>
                
                {upcomingActivities.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <Calendar className="mx-auto text-slate-400 mb-3" size={48} />
                        <p className="text-slate-600">No upcoming activities</p>
                    </GlassCard>
                ) : (
                    <div className="space-y-4">
                        {upcomingActivities.map((date) => (
                            <div key={date} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-slate-100 px-3 py-1 rounded-lg">
                                        <span className="text-sm font-semibold text-slate-700">
                                            {new Date(date).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {activitiesByDate[date].length} activities
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    {activitiesByDate[date].slice(0, 3).map((activity) => {
                                        const Icon = getActivityIcon(activity.activity_type);
                                        return (
                                            <GlassCard key={activity.id} className="p-3 hover:shadow-premium-lg transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm text-slate-900">
                                                            {activity.title}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                            <span>
                                                                {new Date(activity.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span>{activity.assigned_to_name}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                                                        {activity.status}
                                                    </span>
                                                </div>
                                            </GlassCard>
                                        );
                                    })}
                                    
                                    {activitiesByDate[date].length > 3 && (
                                        <div className="text-center py-2">
                                            <span className="text-xs text-slate-500">
                                                +{activitiesByDate[date].length - 3} more activities
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityCalendar;