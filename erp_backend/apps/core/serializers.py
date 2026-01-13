from rest_framework import serializers
from apps.core.models import get_current_tenant

class TenantAwareSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        tenant_id = get_current_tenant()
        if tenant_id:
            validated_data['tenant_id'] = tenant_id
        return super().create(validated_data)
