from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from apps.inventory.models import Product, BranchStock
from apps.users.models import User
from apps.hr.models import ShiftAssignment, Employee
from datetime import datetime, date

@api_view(['GET'])
def pos_get_products(request):
    """
    Get products for POS from CENTRALIZED inventory
    Returns products with stock levels for the specified branch
    """
    tenant_id = request.headers.get('X-Tenant-ID')
    branch_id = request.query_params.get('branch_id')
    
    if not branch_id:
        return Response({'error': 'branch_id is required'}, status=400)
    
    # Get products from centralized inventory
    products = Product.objects.filter(tenant_id=tenant_id, is_deleted=False)
    
    result = []
    for product in products:
        # Get stock for THIS specific branch
        stock_qty = 0
        try:
            stock = BranchStock.objects.get(
                tenant_id=tenant_id,
                branch_id=branch_id,
                product=product
            )
            stock_qty = float(stock.quantity)
        except BranchStock.DoesNotExist:
            # Product exists centrally but not stocked at this branch
            stock_qty = 0
        
        result.append({
            'id': product.id,
            'uuid': str(product.id),
            'sku': product.sku,
            'name': product.name,
            'description': product.description,
            'cost_price': float(product.cost_price),
            'selling_price': float(product.price),
            'category': product.category.name if product.category else '',
            'stock_quantity': stock_qty,
            'barcodes': [product.barcode] if product.barcode else [],
            'available_at_branch': stock_qty > 0,
            'created_at': product.created_at.isoformat(),
            'updated_at': product.updated_at.isoformat()
        })
    
    return Response(result)

@api_view(['GET'])
def pos_get_staff(request):
    """
    Get staff for POS with HR shift integration
    Only returns staff scheduled for current shift if HR module is active
    """
    tenant_id = request.headers.get('X-Tenant-ID')
    branch_id = request.query_params.get('branch_id')
    
    # Check if HR module is active
    from apps.tenants.models import Tenant
    tenant = Tenant.objects.get(id=tenant_id)
    hr_module_active = tenant.active_modules.get('hr', False)
    
    # Base query: all active users in this branch
    staff = User.objects.filter(tenant_id=tenant_id, is_active=True)
    
    if branch_id:
        staff = staff.filter(branches__id=branch_id)
    
    result = []
    today = date.today()
    
    for user in staff:
        staff_data = {
            'id': user.id,
            'uuid': str(user.id),
            'username': user.username,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
            'on_shift': True,  # Default to true if HR not active
            'shift_info': None
        }
        
        # If HR module is active, check shift schedule
        if hr_module_active:
            try:
                employee = Employee.objects.get(user=user, tenant_id=tenant_id)
                
                # Check if employee has a shift assignment for today
                shift_assignment = ShiftAssignment.objects.filter(
                    employee=employee,
                    date=today
                ).select_related('shift').first()
                
                if shift_assignment:
                    staff_data['on_shift'] = True
                    staff_data['shift_info'] = {
                        'shift_name': shift_assignment.shift.name,
                        'start_time': shift_assignment.shift.start_time.strftime('%H:%M'),
                        'end_time': shift_assignment.shift.end_time.strftime('%H:%M'),
                    }
                else:
                    # No shift assigned for today
                    staff_data['on_shift'] = False
                    
            except Employee.DoesNotExist:
                # User exists but no employee profile
                pass
        
        result.append(staff_data)
    
    # If HR is active, filter to only show staff on shift
    if hr_module_active:
        result = [s for s in result if s['on_shift']]
    
    return Response(result)

@api_view(['POST'])
def request_stock_transfer(request):
    """
    Request stock transfer from another branch
    Used when POS branch runs out of stock
    """
    from apps.inventory.models import StockTransfer, TransferItem
    
    tenant_id = request.headers.get('X-Tenant-ID')
    data = request.data
    
    try:
        transfer = StockTransfer.objects.create(
            tenant_id=tenant_id,
            from_branch_id=data['from_branch_id'],
            to_branch_id=data['to_branch_id'],
            status='pending',
            notes=data.get('notes', 'POS stock request')
        )
        
        # Add items
        for item in data.get('items', []):
            TransferItem.objects.create(
                tenant_id=tenant_id,
                transfer=transfer,
                product_id=item['product_id'],
                quantity=item['quantity']
            )
        
        return Response({
            'success': True,
            'transfer_id': str(transfer.id),
            'status': 'pending',
            'message': 'Stock transfer request created'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def check_stock_availability(request):
    """
    Check stock availability across all branches
    Helps POS know where to request transfer from
    """
    tenant_id = request.headers.get('X-Tenant-ID')
    product_id = request.query_params.get('product_id')
    
    if not product_id:
        return Response({'error': 'product_id is required'}, status=400)
    
    # Get stock levels across all branches
    stock_levels = BranchStock.objects.filter(
        tenant_id=tenant_id,
        product_id=product_id
    ).select_related('branch')
    
    result = []
    for stock in stock_levels:
        result.append({
            'branch_id': str(stock.branch.id),
            'branch_name': stock.branch.name,
            'quantity': float(stock.quantity),
            'available': stock.quantity > 0
        })
    
    return Response({
        'product_id': product_id,
        'stock_by_branch': result,
        'total_stock': sum(s['quantity'] for s in result)
    })
