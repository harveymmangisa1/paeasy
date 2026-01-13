from rest_framework import serializers
from apps.core.serializers import TenantAwareSerializer
from .models import Customer, CRMLog, Quotation, QuotationItem, Invoice, InvoiceItem, Sale, SaleItem, Payment

class CRMLogSerializer(TenantAwareSerializer):
    class Meta:
        model = CRMLog
        fields = '__all__'

class CustomerSerializer(TenantAwareSerializer):
    logs = CRMLogSerializer(many=True, read_only=True)
    class Meta:
        model = Customer
        fields = '__all__'

class QuotationItemSerializer(TenantAwareSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'

class QuotationSerializer(TenantAwareSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.name')
    class Meta:
        model = Quotation
        fields = '__all__'

class InvoiceItemSerializer(TenantAwareSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'

class InvoiceSerializer(TenantAwareSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.name')
    class Meta:
        model = Invoice
        fields = '__all__'

# POS / Sales Serializers
class SaleItemSerializer(TenantAwareSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = SaleItem
        fields = '__all__'

class PaymentSerializer(TenantAwareSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class SaleSerializer(TenantAwareSerializer):
    sale_items = SaleItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    branch_name = serializers.ReadOnlyField(source='branch.name')
    staff_name = serializers.ReadOnlyField(source='staff_id.get_full_name')
    
    class Meta:
        model = Sale
        fields = '__all__'
