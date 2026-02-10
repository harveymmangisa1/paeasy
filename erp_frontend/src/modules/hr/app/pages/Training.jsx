import React, { useState } from 'react';
import { BookOpen, Users, Calendar, Clock, DollarSign, Filter, Search, Download, Award, Play } from 'lucide-react';

const Training = ({ training, employees }) => {
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const filteredTraining = training.filter(program => {
        const typeMatch = selectedType === 'all' || program.type === selectedType;
        const statusMatch = selectedStatus === 'all' || program.status === selectedStatus;
        return typeMatch && statusMatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'upcoming':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-gray-100 text-gray-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'leadership':
                return 'bg-purple-100 text-purple-700';
            case 'technical':
                return 'bg-blue-100 text-blue-700';
            case 'soft_skills':
                return 'bg-green-100 text-green-700';
            case 'compliance':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const trainingStats = {
        totalPrograms: training.length,
        activePrograms: training.filter(t => t.status === 'active').length,
        upcomingPrograms: training.filter(t => t.status === 'upcoming').length,
        totalParticipants: training.reduce((sum, t) => sum + t.currentParticipants, 0),
        totalCost: training.reduce((sum, t) => sum + t.cost, 0),
        completionRate: training.filter(t => t.status === 'completed').length / training.length * 100,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Training & Development</h1>
                    <p className="text-sm text-slate-500">Manage employee training programs and development</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <BookOpen size={18} />
                        <span>Create Program</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Programs</p>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{trainingStats.totalPrograms}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Active</p>
                        <Play className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-green-600">{trainingStats.activePrograms}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Upcoming</p>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-blue-600">{trainingStats.upcomingPrograms}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Participants</p>
                        <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-purple-600">{trainingStats.totalParticipants}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Cost</p>
                        <DollarSign className="h-4 w-4 text-orange-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-orange-600">${(trainingStats.totalCost / 1000).toFixed(1)}k</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Filters:</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Types</option>
                            <option value="leadership">Leadership</option>
                            <option value="technical">Technical</option>
                            <option value="soft_skills">Soft Skills</option>
                            <option value="compliance">Compliance</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Training Programs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTraining.map((program) => (
                    <div key={program.id} className="glass-card p-5 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 mb-2">{program.title}</h3>
                                <p className="text-sm text-slate-500 mb-3">{program.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(program.type)}`}>
                                    {program.type}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                                    {program.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium text-slate-700">{program.duration} hours</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Dates</span>
                                <span className="font-medium text-slate-700">{program.startDate} - {program.endDate}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Instructor</span>
                                <span className="font-medium text-slate-700">{program.instructor}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Location</span>
                                <span className="font-medium text-slate-700">{program.location}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Cost</span>
                                <span className="font-medium text-slate-700">${program.cost.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-500">Enrollment</span>
                                <span className="text-sm font-medium text-slate-700">
                                    {program.currentParticipants}/{program.maxParticipants}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${(program.currentParticipants / program.maxParticipants) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                            <button className="flex-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
                                View Details
                            </button>
                            <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                                Enroll
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Training Calendar */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Training Calendar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {training.filter(t => t.status === 'upcoming' || t.status === 'active').map((program) => (
                        <div key={program.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(program.type)}`}>
                                    {program.type}
                                </span>
                                <span className="text-xs text-slate-400">{program.startDate}</span>
                            </div>
                            <h4 className="font-medium text-slate-800 mb-1">{program.title}</h4>
                            <p className="text-sm text-slate-500 mb-2">{program.location}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">{program.currentParticipants} enrolled</span>
                                <button className="text-xs text-primary-600 hover:underline">View</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {filteredTraining.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No training programs found</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Try adjusting your filters or create a new training program.
                    </p>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium mx-auto">
                        <BookOpen size={18} />
                        <span>Create Program</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Training;