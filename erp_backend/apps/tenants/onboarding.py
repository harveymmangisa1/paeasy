from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from apps.tenants.models import Tenant, Branch
from apps.users.models import User
from apps.accounting.templates import setup_industry_coa
import uuid

from django.utils.text import slugify
import random
import string

@api_view(['POST'])
@permission_classes([AllowAny])
def onboard_tenant(request):
    """
    Complete onboarding flow for new tenant
    
    Expected payload:
    {
        "company_name": "Acme Corp",
        "industry": "retail",
        "admin_email": "admin@acme.com",
        "admin_password": "secure_password",
        "selected_modules": ["inventory", "pos", "sales"],
        "subscription_tier": "starter",
        "enable_multi_site": true
    }
    """
    data = request.data
    
    try:
        # Generate clean subdomain
        base_subdomain = slugify(data['company_name'])
        # Append random string to ensure uniqueness if needed, or just use base for now
        # Ideally we check for uniqueness loop, but for MVP this is okay with a fallback
        subdomain = base_subdomain
        
        if Tenant.objects.filter(subdomain=subdomain).exists():
            # Append random 4 chars
            suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            subdomain = f"{subdomain}-{suffix}"

        # Create tenant
        tenant = Tenant.objects.create(
            name=data['company_name'],
            subdomain=subdomain,
            industry=data.get('industry', 'retail'),
            subscription_tier=data.get('subscription_tier', 'free'),
            enable_multi_site=data.get('enable_multi_site', True)
        )
        
        # Set active modules
        selected_modules = data.get('selected_modules', [])
        active_modules = {
            'inventory': 'inventory' in selected_modules,
            'pos': 'pos' in selected_modules,
            'sales': 'sales' in selected_modules,
            'hr': 'hr' in selected_modules,
            'accounting': 'accounting' in selected_modules,
            'crm': 'crm' in selected_modules,
        }
        tenant.active_modules = active_modules
        tenant.save()
        
        # Create HQ branch
        hq_branch = Branch.objects.create(
            tenant=tenant,
            name=f"{data['company_name']} - HQ",
            code='HQ',
            is_hq=True
        )
        
        # Create admin user
        admin_user = User.objects.create_user(
            username=data['admin_email'],
            email=data['admin_email'],
            password=data['admin_password'],
            tenant=tenant,
            role='tenant_admin'
        )
        admin_user.branches.add(hq_branch)
        
        # Setup Chart of Accounts if accounting module is active
        if active_modules.get('accounting'):
            setup_industry_coa(tenant)
        
        return Response({
            'success': True,
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'active_modules': active_modules,
            'hq_branch_id': str(hq_branch.id),
            'admin_user_id': str(admin_user.id),
            'message': 'Onboarding completed successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_available_modules(request):
    """Get list of available modules with descriptions"""
    modules = [
        {
            'id': 'inventory',
            'name': 'Inventory Management',
            'description': 'Track stock levels, manage products, and handle transfers',
            'icon': 'package',
            'required_for': ['pos', 'sales']
        },
        {
            'id': 'pos',
            'name': 'Point of Sale',
            'description': 'Complete POS system with offline support and real-time sync',
            'icon': 'shopping-cart',
            'requires': ['inventory']
        },
        {
            'id': 'sales',
            'name': 'Sales & Orders',
            'description': 'Manage sales orders, quotations, and invoices',
            'icon': 'trending-up',
            'requires': ['inventory']
        },
        {
            'id': 'hr',
            'name': 'Human Resources',
            'description': 'Employee management, attendance, payroll, and performance',
            'icon': 'users'
        },
        {
            'id': 'accounting',
            'name': 'Accounting & Finance',
            'description': 'Chart of accounts, journal entries, and financial reports',
            'icon': 'calculator'
        },
        {
            'id': 'crm',
            'name': 'CRM & B2B',
            'description': 'Customer relationship management and B2B invoicing',
            'icon': 'user-check'
        },
    ]
    
    return Response(modules)

@api_view(['POST'])
def update_tenant_modules(request):
    """Update active modules for existing tenant"""
    tenant_id = request.headers.get('X-Tenant-ID')
    
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        new_modules = request.data.get('modules', {})
        
        # Merge with existing
        active_modules = tenant.active_modules or {}
        active_modules.update(new_modules)
        tenant.active_modules = active_modules
        tenant.save()
        
        return Response({
            'success': True,
            'active_modules': active_modules
        })
        
    except Tenant.DoesNotExist:
        return Response({'error': 'Tenant not found'}, status=404)
