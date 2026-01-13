from django.db import models
from apps.core.models import TenantAwareModel

class Category(TenantAwareModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Product(TenantAwareModel):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50) # Unique within tenant
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    barcode = models.CharField(max_length=100, blank=True)
    
    # Industry Specific Fields (Optional)
    expiry_date = models.DateField(null=True, blank=True) # Pharmacy/Food
    batch_number = models.CharField(max_length=100, blank=True) # Manufacturing/Pharmacy
    service_duration = models.IntegerField(null=True, blank=True) # Service Industry (minutes)
    
    class Meta:
        unique_together = ('tenant', 'sku')

    def __str__(self):
        return self.name

class BranchStock(TenantAwareModel):
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE, related_name='stock')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='branch_stock')
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    reorder_point = models.DecimalField(max_digits=12, decimal_places=3, default=10)
    
    class Meta:
        unique_together = ('branch', 'product')

class StockTransfer(TenantAwareModel):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    source_branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE, related_name='transfers_out')
    destination_branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE, related_name='transfers_in')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    remarks = models.TextField(blank=True)

class TransferItem(TenantAwareModel):
    transfer = models.ForeignKey(StockTransfer, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
