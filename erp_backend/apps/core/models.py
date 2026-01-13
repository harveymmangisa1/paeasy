import uuid
from django.db import models
from django.conf import settings
from django.http import JsonResponse
from threading import local

_thread_locals = local()

def set_current_tenant(tenant_id):
    _thread_locals.tenant_id = tenant_id

def get_current_tenant():
    return getattr(_thread_locals, 'tenant_id', None)

class TenantAwareModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='%(class)s_created')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='%(class)s_updated')
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def delete(self, **kwargs):
        self.is_deleted = True
        self.save()

class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # In a real app, extract from JWT claims or subdomain
        tenant_id = request.headers.get('X-Tenant-ID')
        if not tenant_id and not request.path.startswith('/admin') and not request.path.startswith('/api/pos/register'):
             # Allow POS registration and admin without tenant header initially or handle accordingly
             pass
        
        set_current_tenant(tenant_id)
        response = self.get_response(request)
        return response
