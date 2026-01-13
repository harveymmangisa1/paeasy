from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import POSDevice, Sale, SaleItem
from apps.inventory.models import BranchStock
from django.db import transaction

@api_view(['POST'])
@permission_classes([AllowAny])
def register_pos(request):
    # In a real app, validate with a secret or branch-specific code
    tenant_id = request.data.get('tenant_id')
    branch_id = request.data.get('branch_id')
    device_name = request.data.get('device_name')
    device_id = request.data.get('device_id')
    
    # Simple token generation for scaffold
    import secrets
    token = secrets.token_hex(32)
    
    device, created = POSDevice.objects.update_or_create(
        device_id=device_id,
        defaults={
            'tenant_id': tenant_id,
            'branch_id': branch_id,
            'name': device_name,
            'token': token,
            'is_active': True
        }
    )
    
    return Response({
        'token': token,
        'device_name': device.name,
        'branch_id': branch_id
    })

@api_view(['POST'])
def sync_sales(request):
    sales_data = request.data.get('sales', [])
    tenant_id = request.tenant_id # From middleware
    
    with transaction.atomic():
        for sale_dt in sales_data:
            pos_id = sale_dt.get('pos_transaction_id')
            if Sale.objects.filter(pos_transaction_id=pos_id).exists():
                continue # Idempotency
            
            sale = Sale.objects.create(
                tenant_id=tenant_id,
                branch_id=sale_dt['branch_id'],
                total_amount=sale_dt['total'],
                tax_amount=sale_dt['tax_total'],
                pos_transaction_id=pos_id,
                payment_status='paid'
            )
            
            for item_dt in sale_dt.get('items', []):
                SaleItem.objects.create(
                    sale=sale,
                    product_id=item_dt['product_id'],
                    quantity=item_dt['quantity'],
                    unit_price=item_dt['price'],
                    line_total=float(item_dt['quantity']) * float(item_dt['price'])
                )
                
                # Update inventory
                stock = BranchStock.objects.get(branch_id=sale_dt['branch_id'], product_id=item_dt['product_id'])
                stock.quantity -= item_dt['quantity']
                stock.save()
                
    return Response({'status': 'sync_completed'})
