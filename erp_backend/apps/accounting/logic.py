from django.db import transaction
from .models import Account, JournalEntry, LedgerLine

def create_journal_entry(tenant, branch, date, description, lines, source_type=None, source_id=None, reference=''):
    """
    lines: list of dicts {'account_id': id, 'debit': amount, 'credit': amount, 'description': str}
    """
    with transaction.atomic():
        entry = JournalEntry.objects.create(
            tenant=tenant,
            branch=branch,
            date=date,
            description=description,
            source_type=source_type,
            source_id=source_id,
            reference=reference
        )
        
        total_debit = 0
        total_credit = 0

        for line in lines:
            debit = line.get('debit', 0)
            credit = line.get('credit', 0)
            total_debit += debit
            total_credit += credit

            LedgerLine.objects.create(
                tenant=tenant,
                entry=entry,
                account_id=line['account_id'],
                debit=debit,
                credit=credit,
                description=line.get('description', '')
            )
        
        # Basic validation: debits must equal credits
        if abs(total_debit - total_credit) > 0.001:
            raise ValueError(f"Debits ({total_debit}) and credits ({total_credit}) must be equal")
            
        return entry

def post_sale_to_gl(sale):
    """
    Automatically creates a journal entry for a POS sale.
    Dr. Cash/Bank (Total)
    Cr. Sales Revenue (Subtotal)
    Cr. Sales Tax Payable (Tax)
    """
    tenant = sale.tenant
    branch = sale.branch
    
    # Standard COA Codes (should be configurable in tenant settings)
    accounts = {
        'cash': '1000',
        'revenue': '4000',
        'tax_payable': '2200'
    }

    try:
        cash_acc = Account.objects.get(tenant=tenant, code=accounts['cash'])
        rev_acc = Account.objects.get(tenant=tenant, code=accounts['revenue'])
        tax_acc = Account.objects.get(tenant=tenant, code=accounts['tax_payable'])
    except Account.DoesNotExist:
        # Fallback or error handling
        return

    lines = [
        {'account_id': cash_acc.id, 'debit': sale.total_amount, 'credit': 0, 'description': f"Receipt {sale.receipt_number}"},
        {'account_id': rev_acc.id, 'debit': 0, 'credit': sale.subtotal, 'description': "Sales Revenue"},
    ]

    if sale.tax_amount > 0:
        lines.append({'account_id': tax_acc.id, 'debit': 0, 'credit': sale.tax_amount, 'description': "Sales Tax"})

    create_journal_entry(
        tenant, branch, sale.created_at.date(),
        f"POS Sale: {sale.receipt_number}",
        lines,
        source_type='pos_sale',
        source_id=sale.id,
        reference=sale.receipt_number
    )

def post_invoice_to_gl(invoice):
    """
    Dr. Accounts Receivable
    Cr. Sales Revenue
    Cr. Tax Payable
    """
    tenant = invoice.tenant
    accounts = {'ar': '1200', 'revenue': '4000', 'tax': '2200'}
    
    try:
        ar_acc = Account.objects.get(tenant=tenant, code=accounts['ar'])
        rev_acc = Account.objects.get(tenant=tenant, code=accounts['revenue'])
        tax_acc = Account.objects.get(tenant=tenant, code=accounts['tax'])
    except Account.DoesNotExist:
        return

    lines = [
        {'account_id': ar_acc.id, 'debit': invoice.total_amount, 'credit': 0},
        {'account_id': rev_acc.id, 'debit': 0, 'credit': invoice.subtotal},
    ]

    if invoice.tax_total > 0:
        lines.append({'account_id': tax_acc.id, 'debit': 0, 'credit': invoice.tax_total})

    create_journal_entry(
        tenant, invoice.branch, invoice.date,
        f"Invoice {invoice.invoice_number}",
        lines,
        source_type='invoice',
        source_id=invoice.id,
        reference=invoice.invoice_number
    )

def post_bill_to_gl(bill):
    """
    Dr. Expense/Inventory
    Dr. Input Tax (if applicable)
    Cr. Accounts Payable
    """
    tenant = bill.tenant
    accounts = {'ap': '2000', 'expense': '5000', 'input_tax': '1300'}
    
    try:
        ap_acc = Account.objects.get(tenant=tenant, code=accounts['ap'])
        exp_acc = Account.objects.get(tenant=tenant, code=accounts['expense'])
        tax_acc = Account.objects.get(tenant=tenant, code=accounts['input_tax'])
    except Account.DoesNotExist:
        return

    lines = [
        {'account_id': exp_acc.id, 'debit': bill.subtotal, 'credit': 0},
        {'account_id': ap_acc.id, 'debit': 0, 'credit': bill.total_amount},
    ]

    if bill.tax_amount > 0:
        lines.append({'account_id': tax_acc.id, 'debit': bill.tax_amount, 'credit': 0})

    create_journal_entry(
        tenant, bill.branch, bill.date,
        f"Bill {bill.bill_number} from {bill.vendor.name}",
        lines,
        source_type='bill',
        source_id=bill.id,
        reference=bill.bill_number
    )
