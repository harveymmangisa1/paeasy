from django.db import models
from apps.core.models import TenantAwareModel

class Account(TenantAwareModel):
    ACCOUNT_TYPES = (
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
    )
    
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    class Meta:
        unique_together = ('tenant', 'code')

    def __str__(self):
        return f"{self.code} - {self.name}"

class Tax(TenantAwareModel):
    name = models.CharField(max_length=50)
    rate = models.DecimalField(max_digits=5, decimal_places=2) # e.g. 15.00 for 15%
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"

class Vendor(TenantAwareModel):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    tax_number = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return self.name

class JournalEntry(TenantAwareModel):
    date = models.DateField()
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE)
    source_type = models.CharField(max_length=50, blank=True) # e.g., 'invoice', 'bill', 'pos_sale'
    source_id = models.UUIDField(null=True, blank=True)

class LedgerLine(TenantAwareModel):
    entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.CharField(max_length=255, blank=True)

class Bill(TenantAwareModel):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='bills')
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE)
    bill_number = models.CharField(max_length=50)
    date = models.DateField()
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return f"Bill {self.bill_number} - {self.vendor.name}"
