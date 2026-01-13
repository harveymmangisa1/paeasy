import { useState, useEffect } from 'react';
import api from '../services/api';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/inventory/products/');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/inventory/categories/');
            setCategories(response.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const createProduct = async (data) => {
        await api.post('/inventory/products/', data);
        await fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return { products, categories, loading, error, createProduct, refresh: fetchProducts };
};

export const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await api.get('/sales/customers/');
                setCustomers(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    return { customers, loading, error };
};

export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.get('/hr/employees/');
                setEmployees(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    return { employees, loading, error };
};

export const useDashboardStats = (branchId = null) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params = branchId ? { branch_id: branchId } : {};
                const response = await api.get('/analytics/dashboard/', { params });
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, [branchId]);

    return { stats, loading, error };
};

export const useQuotations = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const response = await api.get('/sales/quotations/');
                setQuotations(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchQuotations();
    }, []);

    return { quotations, loading, error };
};

export const useAttendance = (filters = {}) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/hr/attendance/', { params: filters });
            setAttendance(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [JSON.stringify(filters)]);

    const clockIn = async (employeeId) => {
        await api.post(`/hr/employees/${employeeId}/clock_in/`);
        await fetchAttendance();
    };

    const clockOut = async (employeeId) => {
        await api.post(`/hr/employees/${employeeId}/clock_out/`);
        await fetchAttendance();
    };

    return { attendance, loading, error, clockIn, clockOut, refresh: fetchAttendance };
};

export const usePayroll = (filters = {}) => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayroll = async () => {
        try {
            const response = await api.get('/hr/payroll-slips/', { params: filters });
            setPayrolls(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [JSON.stringify(filters)]);

    const generatePayslip = async (employeeId, data) => {
        await api.post(`/hr/employees/${employeeId}/generate_payslip/`, data);
        await fetchPayroll();
    };

    const markPaid = async (id, method) => {
        await api.post(`/hr/payroll-slips/${id}/mark_paid/`, { payment_method: method });
        await fetchPayroll();
    };

    return { payrolls, loading, error, generatePayslip, markPaid, refresh: fetchPayroll };
};

export const useLeaveRequests = (filters = {}) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/hr/leave-requests/', { params: filters });
            setRequests(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [JSON.stringify(filters)]);

    const updateStatus = async (id, status, reason = '') => {
        if (status === 'approved') {
            await api.post(`/hr/leave-requests/${id}/approve/`);
        } else {
            await api.post(`/hr/leave-requests/${id}/reject/`, { reason });
        }
        await fetchRequests();
    };

    return { requests, loading, error, updateStatus, refresh: fetchRequests };
};

export const useSales = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPOSProducts = async (branchId) => {
        try {
            const params = branchId ? { branch_id: branchId } : {};
            const response = await api.get('/pos/products/', { params });
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const createSale = async (saleData) => {
        const response = await api.post('/pos/create-sale/', saleData);
        return response.data;
    };

    return { products, loading, error, fetchPOSProducts, createSale };
};
