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

class JournalEntry(TenantAwareModel):
    date = models.DateField()
    description = models.TextField()
    reference = models.CharField(max_length=100, blank=True)
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE)

class LedgerLine(TenantAwareModel):
    entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
