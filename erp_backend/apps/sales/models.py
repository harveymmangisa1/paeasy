from django.db import models
from apps.core.models import TenantAwareModel

class Customer(TenantAwareModel):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # CRM Specific Fields
    STATUS_CHOICES = (
        ('lead', 'Lead'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('blocked', 'Blocked'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lead')
    notes = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

class CRMLog(TenantAwareModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='logs')
    author = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    log_type = models.CharField(max_length=50)
    content = models.TextField()

class Invoice(TenantAwareModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

class InvoiceItem(TenantAwareModel):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

class Quotation(TenantAwareModel):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='quotations')
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE)
    quotation_number = models.CharField(max_length=50, unique=True)
    date = models.DateField()
    expiry_date = models.DateField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('converted', 'Converted to Invoice'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

class QuotationItem(TenantAwareModel):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

class Sale(TenantAwareModel):
    """POS Sale - compatible with POS system structure"""
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE, related_name='sales')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchases')
    
    # POS-specific fields
    receipt_number = models.CharField(max_length=100, unique=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    payment_method = models.CharField(max_length=50, default='cash')  # cash, card, mobile_money, credit
    staff_id = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='pos_sales')
    staff_name = models.CharField(max_length=255, blank=True)
    
    # Store items as JSON for POS compatibility
    items = models.JSONField(default=list)
    
    STATUS_CHOICES = (
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=20, default='completed')
    
    SYNC_STATUS_CHOICES = (
        ('synced', 'Synced'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    )
    sync_status = models.CharField(max_length=20, default='synced')
    
    # For POS sync idempotency
    pos_transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    
    PAYMENT_STATUS = (
        ('unpaid', 'Unpaid'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
    )
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='paid')

class SaleItem(TenantAwareModel):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='sale_items')
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

class Payment(TenantAwareModel):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=50)
    reference = models.CharField(max_length=100, blank=True)

class POSDevice(TenantAwareModel):
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE, related_name='pos_devices')
    name = models.CharField(max_length=100)
    device_id = models.CharField(max_length=100, unique=True)
    token = models.CharField(max_length=255, unique=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
