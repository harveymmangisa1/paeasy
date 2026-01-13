from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import Tenant, Branch
from rest_framework import viewsets, serializers
from .onboarding import onboard_tenant, get_available_modules, update_tenant_modules

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'branches', BranchViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Onboarding endpoints
    path('onboard/', onboard_tenant, name='onboard_tenant'),
    path('modules/', get_available_modules, name='available_modules'),
    path('update-modules/', update_tenant_modules, name='update_modules'),
]
