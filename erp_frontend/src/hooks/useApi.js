import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

export const useInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/items/');
            setItems(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return { items, loading, error, refresh: fetchItems };
};

export const useInventoryActions = () => {
    const createItem = useCallback(async (data) => {
        try {
            const response = await api.post('/inventory/items/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateItem = useCallback(async (id, data) => {
        try {
            const response = await api.patch(`/inventory/items/${id}/`, data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteItem = useCallback(async (id) => {
        try {
            await api.delete(`/inventory/items/${id}/`);
        } catch (err) {
            throw err;
        }
    }, []);

    return { createItem, updateItem, deleteItem };
};

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

    return { customers, loading, error, refresh: fetchCustomers };
};

export const useCustomerActions = () => {
    const createCustomer = useCallback(async (data) => {
        try {
            const response = await api.post('/sales/customers/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateCustomer = useCallback(async (id, data) => {
        try {
            const response = await api.patch(`/sales/customers/${id}/`, data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteCustomer = useCallback(async (id) => {
        try {
            await api.delete(`/sales/customers/${id}/`);
        } catch (err) {
            throw err;
        }
    }, []);

    return { createCustomer, updateCustomer, deleteCustomer };
};

export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/hr/employees/');
            setEmployees(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/hr/departments/');
            setDepartments(response.data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/hr/stats/');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch HR stats:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchEmployees(),
                    fetchDepartments(),
                    fetchStats()
                ]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return {
        employees,
        departments,
        loading,
        error,
        stats,
        refresh: () => Promise.all([
            fetchEmployees(),
            fetchDepartments(),
            fetchStats()
        ])
    };
};

export const useEmployeeActions = () => {
    const createEmployee = useCallback(async (data) => {
        try {
            const response = await api.post('/hr/employees/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateEmployee = useCallback(async (id, data) => {
        try {
            const response = await api.patch(`/hr/employees/${id}/`, data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteEmployee = useCallback(async (id) => {
        try {
            await api.delete(`/hr/employees/${id}/`);
        } catch (err) {
            throw err;
        }
    }, []);

    return { createEmployee, updateEmployee, deleteEmployee };
};

export const useDashboardStats = (branchId = null) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const params = branchId ? { branch_id: branchId } : {};
            const response = await api.get('/analytics/dashboard/', { params });
            setStats(response.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [branchId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
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
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const fetchSales = async () => {
        try {
            const response = await api.get('/sales/sales/');
            setSales(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/sales/stats/');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch sales stats:', err);
        }
    };

    useEffect(() => {
        fetchSales();
        fetchStats();
    }, []);

    return { sales, loading, error, stats, refresh: fetchSales };
};

export const useSalesActions = () => {
    const createSale = useCallback(async (data) => {
        try {
            const response = await api.post('/sales/sales/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateSale = useCallback(async (id, data) => {
        try {
            const response = await api.patch(`/sales/sales/${id}/`, data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteSale = useCallback(async (id) => {
        try {
            await api.delete(`/sales/sales/${id}/`);
        } catch (err) {
            throw err;
        }
    }, []);

    return { createSale, updateSale, deleteSale };
};

export const useAccounting = () => {
    const [accounts, setAccounts] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/accounting/accounts/');
            setAccounts(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchJournalEntries = async () => {
        try {
            const response = await api.get('/accounting/journal-entries/');
            setJournalEntries(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/accounting/transactions/');
            setTransactions(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/accounting/stats/');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch accounting stats:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchAccounts(),
                    fetchJournalEntries(),
                    fetchTransactions(),
                    fetchStats()
                ]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return {
        accounts,
        journalEntries,
        transactions,
        loading,
        error,
        stats,
        refresh: () => Promise.all([
            fetchAccounts(),
            fetchJournalEntries(),
            fetchTransactions(),
            fetchStats()
        ])
    };
};

export const useAccountingActions = () => {
    const createAccount = useCallback(async (data) => {
        try {
            const response = await api.post('/accounting/accounts/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const createJournalEntry = useCallback(async (data) => {
        try {
            const response = await api.post('/accounting/journal-entries/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    const createTransaction = useCallback(async (data) => {
        try {
            const response = await api.post('/accounting/transactions/', data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }, []);

    return { createAccount, createJournalEntry, createTransaction };
};

export const usePOS = () => {
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
