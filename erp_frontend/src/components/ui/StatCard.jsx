import React from 'react';
import { LucideIcon } from 'lucide-react';

const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    color = 'blue',
    subtitle,
    trend 
}) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600'
    };

    const changeColorClasses = {
        increase: 'text-green-600',
        decrease: 'text-red-600',
        neutral: 'text-slate-600'
    };

    return (
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-premium p-6 hover:shadow-premium-lg transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                    )}
                    {change !== undefined && (
                        <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${changeColorClasses[changeType] || changeColorClasses.neutral}`}>
                                {changeType === 'increase' && '+'}{change}
                            </span>
                            {trend && <span className="text-xs text-slate-500 ml-1">{trend}</span>}
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;