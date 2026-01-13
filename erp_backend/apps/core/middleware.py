from django.http import JsonResponse
from apps.tenants.models import Tenant

class ModuleAccessMiddleware:
    """
    Middleware to check if tenant has access to requested module
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Map URL patterns to required modules
        self.module_map = {
            '/api/v1/inventory/': 'inventory',
            '/api/v1/sales/': 'sales',
            '/api/v1/hr/': 'hr',
            '/api/v1/accounting/': 'accounting',
            '/api/v1/crm/': 'crm',
        }

    def __call__(self, request):
        # Skip for admin and auth endpoints
        if request.path.startswith('/admin') or request.path.startswith('/api/v1/auth'):
            return self.get_response(request)
        
        # Get tenant
        tenant_id = request.headers.get('X-Tenant-ID')
        if not tenant_id:
            return self.get_response(request)
        
        try:
            tenant = Tenant.objects.get(id=tenant_id)
            
            # Check if module is active for this tenant
            for url_pattern, module_name in self.module_map.items():
                if request.path.startswith(url_pattern):
                    active_modules = tenant.active_modules or {}
                    if not active_modules.get(module_name, False):
                        return JsonResponse({
                            'error': f'Module "{module_name}" is not active for your account',
                            'module': module_name,
                            'upgrade_required': True
                        }, status=403)
            
            # Attach tenant to request for easy access
            request.tenant = tenant
            
        except Tenant.DoesNotExist:
            pass
        
        return self.get_response(request)
