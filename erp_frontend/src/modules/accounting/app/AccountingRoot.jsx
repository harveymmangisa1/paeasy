import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import EntryModal from './components/EntryModal';
import Overview from './pages/Overview';
import Accounts from './pages/Accounts';
import Journal from './pages/Journal';
import Ledger from './pages/Ledger';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Receivables from './pages/Receivables';
import InvoiceDetail from './pages/InvoiceDetail';
import ReceiptAllocation from './pages/ReceiptAllocation';
import CustomerStatement from './pages/CustomerStatement';
import Bills from './pages/Bills';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import {
    accountsData,
    assetsData,
    billsData,
    customersData,
    entriesData,
    invoiceLinesData,
    invoicesData,
    receiptsData,
    customerStatementsData,
    vendorsData,
} from './data';
import api from '@/services/api';

const AccountingRoot = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [accounts, setAccounts] = useState(accountsData);
    const [vendors] = useState(vendorsData);
    const [bills] = useState(billsData);
    const [assets] = useState(assetsData);
    const [customers] = useState(customersData);
    const [invoices] = useState(invoicesData);
    const [receipts] = useState(receiptsData);
    const [entries, setEntries] = useState(entriesData);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingCore, setLoadingCore] = useState(true);
    const [entryForm, setEntryForm] = useState({
        date: '',
        reference: '',
        description: '',
        lines: [
            { accountId: '', debit: '', credit: '', memo: '' },
            { accountId: '', debit: '', credit: '', memo: '' },
        ],
    });

    const filteredAccounts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return accounts;
        return accounts.filter((account) =>
            account.name.toLowerCase().includes(query) ||
            account.code.toLowerCase().includes(query) ||
            account.type.toLowerCase().includes(query)
        );
    }, [accounts, search]);

    const filteredEntries = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return entries;
        return entries.filter((entry) =>
            entry.description.toLowerCase().includes(query) ||
            entry.reference.toLowerCase().includes(query)
        );
    }, [entries, search]);

    const ledgerLines = useMemo(() => {
        if (transactions.length) {
            return transactions;
        }
        const lines = [];
        entries.forEach((entry) => {
            entry.lines.forEach((line) => {
                lines.push({
                    ...line,
                    entryId: entry.id,
                    date: entry.date,
                    reference: entry.reference,
                    description: entry.description,
                });
            });
        });
        return lines;
    }, [entries, transactions]);

    const fetchCore = useCallback(async () => {
        setLoadingCore(true);
        try {
            const [accountsRes, entriesRes, transactionsRes, statsRes] = await Promise.all([
                api.get('/accounting/accounts/'),
                api.get('/accounting/journal-entries/'),
                api.get('/accounting/transactions/'),
                api.get('/accounting/stats/summary/'),
            ]);
            if (Array.isArray(accountsRes.data)) setAccounts(accountsRes.data);
            if (Array.isArray(entriesRes.data)) setEntries(entriesRes.data);
            if (Array.isArray(transactionsRes.data)) setTransactions(transactionsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            // Keep placeholder data on failure for now
            console.error('Failed to load accounting core:', error);
        } finally {
            setLoadingCore(false);
        }
    }, []);

    useEffect(() => {
        fetchCore();
    }, [fetchCore]);

    const handleEntryChange = (field, value) => {
        setEntryForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEntryLineChange = (index, field, value) => {
        setEntryForm((prev) => {
            const nextLines = prev.lines.map((line, lineIndex) => {
                if (lineIndex !== index) return line;
                return { ...line, [field]: value };
            });
            return { ...prev, lines: nextLines };
        });
    };

    const addEntryLine = () => {
        setEntryForm((prev) => ({
            ...prev,
            lines: [...prev.lines, { accountId: '', debit: '', credit: '', memo: '' }],
        }));
    };

    const removeEntryLine = (index) => {
        setEntryForm((prev) => ({
            ...prev,
            lines: prev.lines.filter((_, lineIndex) => lineIndex !== index),
        }));
    };

    const submitEntry = (event) => {
        event.preventDefault();
        const debit = entryForm.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
        const credit = entryForm.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
        if (debit === 0 || debit !== credit) return;

        const payload = {
            date: entryForm.date || '2026-02-09',
            reference: entryForm.reference || 'MANUAL',
            description: entryForm.description || 'Manual entry',
            lines: entryForm.lines.map((line) => ({
                account_id: line.accountId,
                debit: Number(line.debit) || 0,
                credit: Number(line.credit) || 0,
                description: line.memo || '',
            })),
        };

        api.post('/accounting/journal-entries/', payload)
            .then((response) => {
                if (response.data) {
                    setEntries((prev) => [response.data, ...prev]);
                    fetchCore();
                }
            })
            .catch((error) => {
                console.error('Failed to create journal entry:', error);
            })
            .finally(() => {
                setEntryForm({
                    date: '',
                    reference: '',
                    description: '',
                    lines: [
                        { accountId: '', debit: '', credit: '', memo: '' },
                        { accountId: '', debit: '', credit: '', memo: '' },
                    ],
                });
                setShowEntryModal(false);
                navigate('/accounting/journal');
            });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="flex">
                <Sidebar activePath={location.pathname} onNavigate={navigate} />
                <main className="flex-1 px-8 py-8 bg-[radial-gradient(circle_at_top,_#1f2937,_#0f172a_65%)]">
                    <Topbar search={search} onSearch={setSearch} onNewEntry={() => setShowEntryModal(true)} />

                    <Routes>
                        <Route index element={<Overview stats={stats} loading={loadingCore} />} />
                        <Route path="accounts" element={<Accounts accounts={filteredAccounts} />} />
                        <Route
                            path="journal"
                            element={<Journal entries={filteredEntries} accounts={accounts} onAddEntry={() => setShowEntryModal(true)} />}
                        />
                        <Route path="ledger" element={<Ledger lines={ledgerLines} accounts={accounts} />} />
                        <Route path="assets" element={<Assets assets={assets} onOpenAsset={(id) => navigate(`/accounting/assets/${id}`)} />} />
                        <Route path="assets/:assetId" element={<AssetDetail assets={assets} />} />
                        <Route
                            path="receivables"
                            element={
                                <Receivables
                                    customers={customers}
                                    invoices={invoices}
                                    receipts={receipts}
                                    onViewInvoice={(id) => navigate(`/accounting/receivables/invoices/${id}`)}
                                    onViewStatement={(id) => navigate(`/accounting/receivables/statements/${id}`)}
                                    onRecordReceipt={() => navigate('/accounting/receivables/receipts/new')}
                                />
                            }
                        />
                        <Route
                            path="receivables/invoices/:invoiceId"
                            element={<InvoiceDetail invoices={invoices} invoiceLines={invoiceLinesData} onAllocateReceipt={(id) => navigate(`/accounting/receivables/receipts/${id}`)} />}
                        />
                        <Route path="receivables/receipts/new" element={<ReceiptAllocation invoices={invoices} />} />
                        <Route path="receivables/receipts/:invoiceId" element={<ReceiptAllocation invoices={invoices} />} />
                        <Route path="receivables/statements/:customerId" element={<CustomerStatement customers={customers} statements={customerStatementsData} />} />
                        <Route path="bills" element={<Bills bills={bills} vendors={vendors} />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/accounting" replace />} />
                    </Routes>
                </main>
            </div>

            <EntryModal
                open={showEntryModal}
                accounts={accounts}
                entryForm={entryForm}
                onChange={handleEntryChange}
                onLineChange={handleEntryLineChange}
                onAddLine={addEntryLine}
                onRemoveLine={removeEntryLine}
                onClose={() => setShowEntryModal(false)}
                onSubmit={submitEntry}
            />
        </div>
    );
};

export default AccountingRoot;
