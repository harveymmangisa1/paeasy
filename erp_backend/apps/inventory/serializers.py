from rest_framework import serializers
from apps.core.serializers import TenantAwareSerializer
from .models import Category, Product, BranchStock, StockTransfer, TransferItem

class CategorySerializer(TenantAwareSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(TenantAwareSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    class Meta:
        model = Product
        fields = '__all__'

class BranchStockSerializer(TenantAwareSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = BranchStock
        fields = '__all__'
