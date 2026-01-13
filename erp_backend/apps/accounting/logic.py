from django.db import transaction
from .models import Account, JournalEntry, LedgerLine

def create_journal_entry(tenant, branch, date, description, lines):
    """
    lines: list of dicts {'account_id': id, 'debit': amount, 'credit': amount}
    """
    with transaction.atomic():
        entry = JournalEntry.objects.create(
            tenant=tenant,
            branch=branch,
            date=date,
            description=description
        )
        
        for line in lines:
            LedgerLine.objects.create(
                tenant=tenant,
                entry=entry,
                account_id=line['account_id'],
                debit=line.get('debit', 0),
                credit=line.get('credit', 0)
            )
        
        # Basic validation: debits must equal credits
        debits = sum(float(l.get('debit', 0)) for l in lines)
        credits = sum(float(l.get('credit', 0)) for l in lines)
        
        if abs(debits - credits) > 0.001:
            raise ValueError("Debits and credits must be equal")
            
        return entry

def post_sale_to_gl(sale):
    """
    Automatically creates a journal entry for a sales transaction.
    Dr. Accounts Receivable / Cash
    Cr. Sales Revenue
    """
    tenant = sale.tenant
    branch = sale.branch
    
    # In a real app, these accounts should be looked up from tenant settings
    try:
        cash_account = Account.objects.get(tenant=tenant, code='1000') # Cash/Bank
        sales_account = Account.objects.get(tenant=tenant, code='4000') # Sales Revenue
    except Account.DoesNotExist:
        return # Skip if accounts aren't setup
        
    lines = [
        {'account_id': cash_account.id, 'debit': sale.total_amount, 'credit': 0},
        {'account_id': sales_account.id, 'debit': 0, 'credit': sale.total_amount},
    ]
    
    create_journal_entry(
        tenant, 
        branch, 
        sale.created_at.date(), 
        f"Sale Transaction: {sale.id}", 
        lines
    )
