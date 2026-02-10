import React from 'react';
import { Search, Bell, Plus, User } from 'lucide-react';

const Topbar = ({ search, onSearch, onAddEmployee }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employees, departments, or positions..."
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-4 ml-8">
                    <button
                        onClick={onAddEmployee}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Employee</span>
                    </button>
                    
                    <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-100">HR Admin</p>
                            <p className="text-xs text-slate-400">System Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;