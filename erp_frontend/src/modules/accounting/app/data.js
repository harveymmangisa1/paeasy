export const accountsData = [
    { id: 'acc-1000', code: '1000', name: 'Cash on Hand', type: 'asset' },
    { id: 'acc-1010', code: '1010', name: 'Bank - Operating', type: 'asset' },
    { id: 'acc-1200', code: '1200', name: 'Accounts Receivable', type: 'asset' },
    { id: 'acc-2000', code: '2000', name: 'Accounts Payable', type: 'liability' },
    { id: 'acc-2200', code: '2200', name: 'Sales Tax Payable', type: 'liability' },
    { id: 'acc-3000', code: '3000', name: 'Owner Equity', type: 'equity' },
    { id: 'acc-4000', code: '4000', name: 'Sales Revenue', type: 'revenue' },
    { id: 'acc-5000', code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { id: 'acc-6100', code: '6100', name: 'Rent Expense', type: 'expense' },
];

export const vendorsData = [
    { id: 'ven-1', name: 'Apex Supply Co.', email: 'apex@vendors.test', status: 'active' },
    { id: 'ven-2', name: 'Crescent Utilities', email: 'billing@crescent.test', status: 'active' },
    { id: 'ven-3', name: 'Northwind Logistics', email: 'ar@northwind.test', status: 'paused' },
];

export const billsData = [
    { id: 'bill-1', vendor: 'Apex Supply Co.', amount: 2180, due: '2026-02-15', status: 'open' },
    { id: 'bill-2', vendor: 'Crescent Utilities', amount: 640, due: '2026-02-12', status: 'open' },
    { id: 'bill-3', vendor: 'Northwind Logistics', amount: 1240, due: '2026-01-28', status: 'paid' },
];

export const entriesData = [
    {
        id: 'JE-2401',
        date: '2026-02-06',
        reference: 'POS-4831',
        description: 'POS sales batch',
        lines: [
            { accountId: 'acc-1000', debit: 2450, credit: 0, memo: 'Cash receipts' },
            { accountId: 'acc-4000', debit: 0, credit: 2120, memo: 'Sales revenue' },
            { accountId: 'acc-2200', debit: 0, credit: 330, memo: 'Sales tax' },
        ],
    },
    {
        id: 'JE-2402',
        date: '2026-02-04',
        reference: 'BILL-1294',
        description: 'Inventory replenishment',
        lines: [
            { accountId: 'acc-5000', debit: 1180, credit: 0, memo: 'COGS' },
            { accountId: 'acc-2000', debit: 0, credit: 1180, memo: 'Accounts payable' },
        ],
    },
];

export const reportCards = [
    { id: 'rep-1', label: 'Trial Balance', value: '$312,540' },
    { id: 'rep-2', label: 'Profit & Loss', value: '$48,220' },
    { id: 'rep-3', label: 'Balance Sheet', value: '$264,320' },
    { id: 'rep-4', label: 'Tax Summary', value: '$7,410' },
];

export const assetsData = [
    {
        id: 'asset-1',
        tag: 'AST-0001',
        name: 'POS Terminal',
        category: 'Equipment',
        location: 'Main Store',
        custodian: 'Front Desk',
        acquisitionDate: '2024-06-15',
        cost: 1850,
        status: 'active',
    },
    {
        id: 'asset-2',
        tag: 'AST-0002',
        name: 'Delivery Van',
        category: 'Vehicles',
        location: 'Warehouse',
        custodian: 'Logistics',
        acquisitionDate: '2023-03-05',
        cost: 22400,
        status: 'active',
    },
    {
        id: 'asset-3',
        tag: 'AST-0003',
        name: 'Refrigeration Unit',
        category: 'Equipment',
        location: 'Cold Storage',
        custodian: 'Inventory',
        acquisitionDate: '2022-11-20',
        cost: 6400,
        status: 'maintenance',
    },
    {
        id: 'asset-4',
        tag: 'AST-0004',
        name: 'Office Furniture Set',
        category: 'Furniture',
        location: 'HQ',
        custodian: 'Admin',
        acquisitionDate: '2021-07-02',
        cost: 3200,
        status: 'active',
    },
];

export const customersData = [
    { id: 'cust-1', name: 'Lilongwe Mart', email: 'finance@lilongwemart.test', status: 'active', balance: 18400 },
    { id: 'cust-2', name: 'Mzuzu Clinic', email: 'accounts@mzuzuclinic.test', status: 'active', balance: 9320 },
    { id: 'cust-3', name: 'Blantyre Foods', email: 'ap@blantyrefoods.test', status: 'on-hold', balance: 0 },
];

export const invoicesData = [
    { id: 'inv-1001', customer: 'Lilongwe Mart', date: '2026-02-05', due: '2026-02-20', amount: 6200, status: 'sent' },
    { id: 'inv-1002', customer: 'Mzuzu Clinic', date: '2026-02-02', due: '2026-02-18', amount: 4120, status: 'part-paid' },
    { id: 'inv-1003', customer: 'Blantyre Foods', date: '2026-01-20', due: '2026-02-04', amount: 5000, status: 'overdue' },
];

export const receiptsData = [
    { id: 'rcpt-2001', customer: 'Mzuzu Clinic', date: '2026-02-06', amount: 1800, method: 'Bank transfer', appliedTo: 'inv-1002' },
    { id: 'rcpt-2002', customer: 'Lilongwe Mart', date: '2026-02-07', amount: 2200, method: 'Mobile money', appliedTo: 'inv-1001' },
];

export const invoiceLinesData = {
    'inv-1001': [
        { id: 'line-1', description: 'POS Subscription (Feb)', quantity: 1, unitPrice: 3000, taxRate: 16.5 },
        { id: 'line-2', description: 'Support Retainer', quantity: 1, unitPrice: 2500, taxRate: 16.5 },
    ],
    'inv-1002': [
        { id: 'line-3', description: 'EHR Integration', quantity: 1, unitPrice: 2800, taxRate: 16.5 },
        { id: 'line-4', description: 'Training Session', quantity: 2, unitPrice: 600, taxRate: 0 },
    ],
    'inv-1003': [
        { id: 'line-5', description: 'Inventory module rollout', quantity: 1, unitPrice: 5000, taxRate: 16.5 },
    ],
};

export const customerStatementsData = {
    'cust-1': [
        { id: 'stmt-1', date: '2026-02-05', type: 'Invoice', reference: 'inv-1001', amount: 6200 },
        { id: 'stmt-2', date: '2026-02-07', type: 'Receipt', reference: 'rcpt-2002', amount: -2200 },
    ],
    'cust-2': [
        { id: 'stmt-3', date: '2026-02-02', type: 'Invoice', reference: 'inv-1002', amount: 4120 },
        { id: 'stmt-4', date: '2026-02-06', type: 'Receipt', reference: 'rcpt-2001', amount: -1800 },
    ],
    'cust-3': [
        { id: 'stmt-5', date: '2026-01-20', type: 'Invoice', reference: 'inv-1003', amount: 5000 },
    ],
};

export const arAgingData = [
    { bucket: 'Current', amount: 9800 },
    { bucket: '1-30 days', amount: 4200 },
    { bucket: '31-60 days', amount: 1800 },
    { bucket: '61-90 days', amount: 900 },
    { bucket: '90+ days', amount: 560 },
];
