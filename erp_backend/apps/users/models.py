import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('branch_manager', 'Branch Manager'),
        ('accountant', 'Accountant'),
        ('sales_rep', 'Sales Rep'),
        ('inventory_manager', 'Inventory Manager'),
        ('hr_manager', 'HR Manager'),
        ('cashier', 'Cashier'),
        ('viewer', 'Viewer (Read-only)'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cashier')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    branches = models.ManyToManyField('tenants.Branch', blank=True, related_name='staff')
    
    # Granular Permissions (JSONField for flexibility)
    custom_permissions = models.JSONField(default=dict, blank=True)
    # Example: {
    #   'inventory': {'view': True, 'create': True, 'edit': False, 'delete': False},
    #   'sales': {'view': True, 'create': True, 'edit': True, 'delete': False},
    #   'hr': {'view': False, 'create': False, 'edit': False, 'delete': False}
    # }
    
    # User Status
    is_invited = models.BooleanField(default=False)
    invitation_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    invitation_sent_at = models.DateTimeField(null=True, blank=True)
    invitation_accepted_at = models.DateTimeField(null=True, blank=True)
    
    # Additional Info
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Access Control
    can_access_all_branches = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def has_permission(self, module, action):
        """
        Check if user has permission for a specific action on a module
        module: 'inventory', 'sales', 'hr', etc.
        action: 'view', 'create', 'edit', 'delete'
        """
        # Super admin and tenant admin have all permissions
        if self.role in ['super_admin', 'tenant_admin']:
            return True
        
        # Check custom permissions
        if self.custom_permissions:
            module_perms = self.custom_permissions.get(module, {})
            if action in module_perms:
                return module_perms[action]
        
        # Default role-based permissions
        return self.get_default_permission(module, action)
    
    def get_default_permission(self, module, action):
        """Get default permissions based on role"""
        role_permissions = {
            'branch_manager': {
                'inventory': {'view': True, 'create': True, 'edit': True, 'delete': False},
                'sales': {'view': True, 'create': True, 'edit': True, 'delete': False},
                'hr': {'view': True, 'create': False, 'edit': False, 'delete': False},
                'accounting': {'view': True, 'create': False, 'edit': False, 'delete': False},
            },
            'accountant': {
                'accounting': {'view': True, 'create': True, 'edit': True, 'delete': False},
                'sales': {'view': True, 'create': False, 'edit': False, 'delete': False},
            },
            'inventory_manager': {
                'inventory': {'view': True, 'create': True, 'edit': True, 'delete': True},
                'sales': {'view': True, 'create': False, 'edit': False, 'delete': False},
            },
            'hr_manager': {
                'hr': {'view': True, 'create': True, 'edit': True, 'delete': True},
            },
            'sales_rep': {
                'sales': {'view': True, 'create': True, 'edit': True, 'delete': False},
                'inventory': {'view': True, 'create': False, 'edit': False, 'delete': False},
                'crm': {'view': True, 'create': True, 'edit': True, 'delete': False},
            },
            'cashier': {
                'sales': {'view': True, 'create': True, 'edit': False, 'delete': False},
                'inventory': {'view': True, 'create': False, 'edit': False, 'delete': False},
            },
            'viewer': {
                'inventory': {'view': True, 'create': False, 'edit': False, 'delete': False},
                'sales': {'view': True, 'create': False, 'edit': False, 'delete': False},
                'hr': {'view': True, 'create': False, 'edit': False, 'delete': False},
                'accounting': {'view': True, 'create': False, 'edit': False, 'delete': False},
            }
        }
        
        role_perms = role_permissions.get(self.role, {})
        module_perms = role_perms.get(module, {})
        return module_perms.get(action, False)
    
    def get_accessible_modules(self):
        """Get list of modules this user can access"""
        # Check tenant's active modules
        if not self.tenant:
            return []
        
        active_modules = self.tenant.active_modules or {}
        accessible = []
        
        for module, is_active in active_modules.items():
            if is_active and self.has_permission(module, 'view'):
                accessible.append(module)
        
        return accessible

class UserInvitation(models.Model):
    """Track user invitations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')
    token = models.CharField(max_length=100, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    custom_permissions = models.JSONField(default=dict, blank=True)
    branches = models.ManyToManyField('tenants.Branch', blank=True)
    
    def is_valid(self):
        """Check if invitation is still valid"""
        return (
            self.status == 'pending' and
            timezone.now() < self.expires_at
        )
