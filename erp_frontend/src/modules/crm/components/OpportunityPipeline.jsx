import React from 'react';
import { Target, DollarSign, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';

const OpportunityPipeline = ({ opportunities, expanded = false }) => {
    const stages = [
        { id: 'prospecting', label: 'Prospecting', color: 'blue' },
        { id: 'qualification', label: 'Qualification', color: 'yellow' },
        { id: 'needs_analysis', label: 'Needs Analysis', color: 'orange' },
        { id: 'value_proposition', label: 'Value Proposition', color: 'purple' },
        { id: 'proposal', label: 'Proposal', color: 'pink' },
        { id: 'negotiation', label: 'Negotiation', color: 'indigo' },
        { id: 'closed_won', label: 'Closed Won', color: 'green' },
        { id: 'closed_lost', label: 'Closed Lost', color: 'red' }
    ];

    const getStageColor = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            pink: 'bg-pink-100 text-pink-700 border-pink-200',
            indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            red: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[color] || colors.blue;
    };

    const opportunitiesByStage = stages.reduce((acc, stage) => {
        acc[stage.id] = opportunities?.filter(opp => opp.stage === stage.id) || [];
        return acc;
    }, {});

    const totalValue = opportunities?.reduce((sum, opp) => {
        if (!opp.stage.includes('closed_lost')) {
            return sum + (parseFloat(opp.amount) || 0);
        }
        return sum;
    }, 0) || 0;

    const displayStages = expanded ? stages : stages.filter(stage => !stage.id.includes('closed'));

    return (
        <div className="space-y-4">
            {/* Pipeline Summary */}
            {!expanded && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Target className="text-slate-600" size={20} />
                            <span className="text-sm text-slate-600">Total Pipeline Value</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                            ${totalValue.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users size={16} />
                        <span>{opportunities?.length || 0} Opportunities</span>
                    </div>
                </div>
            )}

            {/* Pipeline Stages */}
            <div className={`${expanded ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4'}`}>
                {displayStages.map((stage) => {
                    const stageOpportunities = opportunitiesByStage[stage.id];
                    const stageValue = stageOpportunities.reduce((sum, opp) => sum + (parseFloat(opp.amount) || 0), 0);

                    return (
                        <div key={stage.id} className="space-y-3">
                            {/* Stage Header */}
                            <div className={`p-3 rounded-lg border ${getStageColor(stage.color)}`}>
                                <div className="font-semibold text-sm">{stage.label}</div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs opacity-75">{stageOpportunities.length} deals</span>
                                    {stageValue > 0 && (
                                        <span className="text-xs font-medium">
                                            ${stageValue.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Opportunities */}
                            <div className="space-y-2">
                                {stageOpportunities.slice(0, expanded ? undefined : 3).map((opp) => (
                                    <GlassCard key={opp.id} className="p-3 hover:shadow-premium-lg transition-all cursor-pointer">
                                        <div className="space-y-2">
                                            <div className="font-medium text-sm text-slate-900 line-clamp-2">
                                                {opp.name}
                                            </div>
                                            {opp.account_name && (
                                                <div className="text-xs text-slate-600">{opp.account_name}</div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900">
                                                    ${parseFloat(opp.amount || 0).toLocaleString()}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock size={12} />
                                                    <span>{opp.probability}%</span>
                                                </div>
                                            </div>
                                            {opp.expected_close_date && (
                                                <div className="text-xs text-slate-500">
                                                    Close: {new Date(opp.expected_close_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                ))}
                                
                                {stageOpportunities.length > (expanded ? 0 : 3) && !expanded && (
                                    <div className="text-center py-2">
                                        <span className="text-xs text-slate-500">
                                            +{stageOpportunities.length - 3} more
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Expanded View Stats */}
            {expanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <GlassCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Target className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Total Opportunities</div>
                                <div className="text-xl font-bold text-slate-900">
                                    {opportunities?.length || 0}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <DollarSign className="text-green-600" size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Pipeline Value</div>
                                <div className="text-xl font-bold text-slate-900">
                                    ${totalValue.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <TrendingUp className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Win Rate</div>
                                <div className="text-xl font-bold text-slate-900">32%</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default OpportunityPipeline;