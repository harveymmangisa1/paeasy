import React, { useState } from 'react';
import { Heart, Users, DollarSign, Filter, Search, Download, Shield, Activity } from 'lucide-react';

const Benefits = ({ benefits, employees }) => {
    const [selectedType, setSelectedType] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState('all');

    const filteredBenefits = benefits.filter(benefit => {
        const typeMatch = selectedType === 'all' || benefit.type === selectedType;
        return typeMatch;
    });

    const getTypeColor = (type) => {
        switch (type) {
            case 'health':
                return 'bg-red-100 text-red-700';
            case 'retirement':
                return 'bg-blue-100 text-blue-700';
            case 'time_off':
                return 'bg-green-100 text-green-700';
            case 'wellness':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const benefitsStats = {
        totalBenefits: benefits.length,
        activeBenefits: benefits.filter(b => b.status === 'active').length,
        totalEnrollment: employees.length,
        averageEmployerContribution: benefits.reduce((sum, b) => sum + (b.employerContribution || 0), 0) / benefits.length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Benefits Management</h1>
                    <p className="text-sm text-slate-500">Manage employee benefits and enrollment</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <Heart size={18} />
                        <span>Add Benefit</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Benefits</p>
                        <Heart className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-slate-900">{benefitsStats.totalBenefits}</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Active Benefits</p>
                        <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-green-600">{benefitsStats.activeBenefits}</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Enrollment</p>
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-blue-600">{benefitsStats.totalEnrollment}</p>
                </div>
                
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Avg Employer Contribution</p>
                        <DollarSign className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-purple-600">{benefitsStats.averageEmployerContribution.toFixed(0)}%</p>
                </div>
            </div>

            {/* Benefits Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBenefits.map((benefit) => (
                    <div key={benefit.id} className="glass-card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-2">{benefit.name}</h3>
                                <p className="text-sm text-slate-500">{benefit.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(benefit.type)}`}>
                                {benefit.type}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Employer Contribution</p>
                                    <p className="font-semibold text-slate-800">{benefit.employerContribution}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Employee Contribution</p>
                                    <p className="font-semibold text-slate-800">{benefit.employeeContribution}%</p>
                                </div>
                            </div>

                            {benefit.enrollmentDeadline && (
                                <div>
                                    <p className="text-sm text-slate-500">Enrollment Deadline</p>
                                    <p className="font-semibold text-slate-800">{benefit.enrollmentDeadline}</p>
                                </div>
                            )}

                            {benefit.plans && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-2">Available Plans</p>
                                    <div className="space-y-2">
                                        {benefit.plans.map((plan, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                                                <span className="text-sm font-medium text-slate-700">{plan.name}</span>
                                                <span className="text-sm text-slate-600">${plan.monthlyCost}/mo</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {benefit.vacationDays && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Vacation</p>
                                        <p className="font-semibold text-slate-800">{benefit.vacationDays} days</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Sick</p>
                                        <p className="font-semibold text-slate-800">{benefit.sickDays} days</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Personal</p>
                                        <p className="font-semibold text-slate-800">{benefit.personalDays} days</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 mt-6 pt-4 border-t border-slate-100">
                            <button className="flex-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
                                View Details
                            </button>
                            <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                                Enroll
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Employee Benefits Summary */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Employee Benefits Summary</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Health</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Retirement</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Time Off</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.slice(0, 5).map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-sm font-medium text-slate-900">
                                        {emp.firstName} {emp.lastName}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Enrolled
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Enrolled
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            20/10/5
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Benefits;