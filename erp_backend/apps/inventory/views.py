from apps.core.views import TenantAwareViewSet
from .models import Category, Product, BranchStock
from .serializers import CategorySerializer, ProductSerializer, BranchStockSerializer

class CategoryViewSet(TenantAwareViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(TenantAwareViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class BranchStockViewSet(TenantAwareViewSet):
    queryset = BranchStock.objects.all()
    serializer_class = BranchStockSerializer
    filterset_fields = ['branch']
