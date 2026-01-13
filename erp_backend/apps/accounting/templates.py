from .models import Account

INDUSTRY_COA_TEMPLATES = {
    'retail': [
        ('1000', 'Cash on Hand', 'asset'),
        ('1200', 'Inventory', 'asset'),
        ('4000', 'Retail Sales', 'revenue'),
        ('5000', 'Cost of Goods Sold', 'expense'),
    ],
    'service': [
        ('1000', 'Bank Account', 'asset'),
        ('4000', 'Service Revenue', 'revenue'),
        ('5100', 'Labor Costs', 'expense'),
    ],
    'pharmacy': [
        ('1000', 'Main Register', 'asset'),
        ('1200', 'Medical Supplies Inventory', 'asset'),
        ('4000', 'Prescription Sales', 'revenue'),
        ('5000', 'Procurement Costs', 'expense'),
    ],
}

def setup_industry_coa(tenant):
    industry = tenant.industry
    template = INDUSTRY_COA_TEMPLATES.get(industry, INDUSTRY_COA_TEMPLATES['retail'])
    
    for code, name, acc_type in template:
        Account.objects.get_or_create(
            tenant=tenant,
            code=code,
            defaults={'name': name, 'account_type': acc_type}
        )
