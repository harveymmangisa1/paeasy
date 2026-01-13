import uuid
from django.db import models

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    subdomain = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    INDUSTRY_CHOICES = (
        ('retail', 'Retail'),
        ('pharmacy', 'Pharmacy'),
        ('service', 'Service System'),
        ('restaurant', 'Restaurant/Hospitality'),
        ('manufacturing', 'Manufacturing'),
    )
    
    industry = models.CharField(max_length=20, choices=INDUSTRY_CHOICES, default='retail')
    logo = models.ImageField(upload_to='tenants/logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#3B82F6')
    
    # SaaS Module Selection
    SUBSCRIPTION_TIERS = (
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    )
    subscription_tier = models.CharField(max_length=20, choices=SUBSCRIPTION_TIERS, default='free')
    subscription_expires = models.DateField(null=True, blank=True)
    
    # Module Activation (JSONField for flexibility)
    active_modules = models.JSONField(default=dict, blank=True)
    # Example: {'inventory': True, 'pos': True, 'hr': True, 'accounting': False, 'crm': False}
    
    # Multi-site configuration
    enable_multi_site = models.BooleanField(default=True)
    max_branches = models.IntegerField(default=5)

    def __str__(self):
        return self.name

class Branch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='branches')
    parent_branch = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_branches')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50) # Unique within tenant
    is_hq = models.BooleanField(default=False)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    
    class Meta:
        unique_together = ('tenant', 'code')

    def __str__(self):
        return f"{self.tenant.name} - {self.name}"
