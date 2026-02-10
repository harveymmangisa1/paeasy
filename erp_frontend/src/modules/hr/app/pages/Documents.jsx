import React, { useState } from 'react';
import { FileText, Download, Search, Filter, Eye, Edit, Trash2, Upload, Calendar, AlertCircle } from 'lucide-react';

const Documents = ({ documents, employees }) => {
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
    };

    const filteredDocuments = documents.filter(doc => {
        const employeeMatch = selectedEmployee === 'all' || doc.employeeId === selectedEmployee;
        const typeMatch = selectedType === 'all' || doc.type === selectedType;
        const searchMatch = searchTerm === '' || 
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase());
        return employeeMatch && typeMatch && searchMatch;
    });

    const getTypeColor = (type) => {
        switch (type) {
            case 'contract':
                return 'bg-blue-100 text-blue-700';
            case 'certification':
                return 'bg-green-100 text-green-700';
            case 'nda':
                return 'bg-purple-100 text-purple-700';
            case 'performance':
                return 'bg-orange-100 text-orange-700';
            case 'training':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'expired':
                return 'bg-red-100 text-red-700';
            case 'expiring':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const documentsStats = {
        totalDocuments: documents.length,
        activeDocuments: documents.filter(d => d.status === 'active').length,
        expiredDocuments: documents.filter(d => d.status === 'expired').length,
        expiringDocuments: documents.filter(d => d.status === 'expiring').length,
        requiredDocuments: documents.filter(d => d.required).length,
        totalSize: documents.reduce((sum, d) => sum + d.size, 0),
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Document Management</h1>
                    <p className="text-sm text-slate-500">Manage employee documents and records</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium">
                        <Upload size={18} />
                        <span>Upload Document</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Documents</p>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{documentsStats.totalDocuments}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Active</p>
                        <Eye className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-green-600">{documentsStats.activeDocuments}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Expired</p>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-red-600">{documentsStats.expiredDocuments}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Expiring Soon</p>
                        <Calendar className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-yellow-600">{documentsStats.expiringDocuments}</p>
                </div>
                
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">Total Size</p>
                        <Download className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="mt-2 text-xl font-semibold text-purple-600">{formatFileSize(documentsStats.totalSize)}</p>
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
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Types</option>
                            <option value="contract">Contract</option>
                            <option value="certification">Certification</option>
                            <option value="nda">NDA</option>
                            <option value="performance">Performance</option>
                            <option value="training">Training</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Documents</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {filteredDocuments.length} documents found
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Document
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Upload Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Expiry Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocuments.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {doc.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {doc.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {getEmployeeName(doc.employeeId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {doc.uploadDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {doc.expiryDate || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">
                                            {formatFileSize(doc.size)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-primary-600 hover:text-primary-900">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="text-slate-600 hover:text-slate-900">
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button className="text-slate-600 hover:text-slate-900">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expiring Documents Alert */}
            {documents.filter(d => isExpiringSoon(d.expiryDate)).length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        Documents Expiring Soon
                    </h3>
                    <div className="space-y-3">
                        {documents.filter(d => isExpiringSoon(d.expiryDate)).map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                                <div>
                                    <p className="font-medium text-yellow-800">{doc.name}</p>
                                    <p className="text-sm text-yellow-600">
                                        {getEmployeeName(doc.employeeId)} • Expires: {doc.expiryDate}
                                    </p>
                                </div>
                                <button className="text-sm font-bold text-yellow-600 hover:underline">
                                    Renew
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Try adjusting your filters or upload a new document.
                    </p>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors font-medium mx-auto">
                        <Upload size={18} />
                        <span>Upload Document</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Documents;