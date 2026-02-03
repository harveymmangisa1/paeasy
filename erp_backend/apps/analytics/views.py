from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.sales.models import Sale
from apps.inventory.models import BranchStock
from django.db import models
from django.db.models import Sum
from apps.core.models import get_current_tenant

@api_view(['GET'])
def dashboard_stats(request):
    tenant_id = get_current_tenant()
    if not tenant_id:
        return Response({'error': 'Tenant ID required'}, status=400)
    
    branch_id = request.query_params.get('branch_id')
    
    sales_qs = Sale.objects.filter(tenant_id=tenant_id)
    stock_qs = BranchStock.objects.filter(tenant_id=tenant_id)
    
    if branch_id:
        sales_qs = sales_qs.filter(branch_id=branch_id)
        stock_qs = stock_qs.filter(branch_id=branch_id)
    
    total_revenue = sales_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_sales = sales_qs.count()
    low_stock_count = stock_qs.filter(quantity__lte=models.F('reorder_point')).count()
    
    return Response({
        'total_revenue': total_revenue,
        'total_sales': total_sales,
        'low_stock_count': low_stock_count,
        # Placeholder for trend data
        'sales_trend': [
            {'date': '2025-01-01', 'amount': 400},
            {'date': '2025-01-02', 'amount': 300},
            {'date': '2025-01-03', 'amount': 500},
        ]
    })
