from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, JournalEntryViewSet, TaxViewSet, VendorViewSet, BillViewSet, TransactionViewSet, AccountingStatsViewSet

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'entries', JournalEntryViewSet)
router.register(r'journal-entries', JournalEntryViewSet)
router.register(r'taxes', TaxViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'bills', BillViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'stats', AccountingStatsViewSet, basename='accounting-stats')

urlpatterns = [
    path('', include(router.urls)),
]
