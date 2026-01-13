from rest_framework import viewsets
from .models import get_current_tenant

class TenantFilterMixin:
    def get_queryset(self):
        tenant_id = get_current_tenant()
        queryset = super().get_queryset()
        if tenant_id:
            return queryset.filter(tenant_id=tenant_id, is_deleted=False)
        return queryset.none() # Return empty if no tenant context

class TenantAwareViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(tenant_id=get_current_tenant())
