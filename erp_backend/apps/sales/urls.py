from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, CustomerViewSet, QuotationViewSet, InvoiceViewSet, CRMLogViewSet
from .views import pos_create_sale
from .pos_views import register_pos, sync_sales
from .pos_integration import pos_get_products, pos_get_staff, request_stock_transfer, check_stock_availability

router = DefaultRouter()
router.register(r'sales', SaleViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'quotations', QuotationViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'logs', CRMLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # POS-specific endpoints (with centralized inventory)
    path('pos/register/', register_pos),
    path('pos/sync/', sync_sales),
    path('pos/create-sale/', pos_create_sale),
    path('pos/products/', pos_get_products),  # Centralized inventory
    path('pos/staff/', pos_get_staff),  # HR shift integration
    path('pos/request-transfer/', request_stock_transfer),  # Multi-site
    path('pos/check-stock/', check_stock_availability),  # Multi-site
]
