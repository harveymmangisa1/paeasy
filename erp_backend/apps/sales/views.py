from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.utils import timezone
from apps.core.views import TenantAwareViewSet
from .models import Sale, Customer, POSDevice, Quotation, Invoice, CRMLog
from .serializers import SaleSerializer, CustomerSerializer, QuotationSerializer, InvoiceSerializer, CRMLogSerializer
from apps.inventory.models import Product, BranchStock
from apps.users.models import User

class CustomerViewSet(TenantAwareViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class CRMLogViewSet(TenantAwareViewSet):
    queryset = CRMLog.objects.all()
    serializer_class = CRMLogSerializer

class QuotationViewSet(TenantAwareViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    @action(detail=True, methods=['post'])
    def convert_to_invoice(self, request, pk=None):
        quotation = self.get_object()
        if quotation.status == 'converted':
            return Response({'error': 'Already converted'}, status=400)
        
        import uuid
        from django.utils import timezone
        from datetime import timedelta
        
        invoice = Invoice.objects.create(
            tenant=quotation.tenant,
            branch=quotation.branch,
            customer=quotation.customer,
            invoice_number=f"INV-{uuid.uuid4().hex[:6].upper()}",
            date=timezone.now().date(),
            due_date=timezone.now().date() + timedelta(days=30),
            subtotal=quotation.total_amount,
            tax_total=0,
            total_amount=quotation.total_amount,
            status='draft'
        )
        
        for item in quotation.items.all():
            from .models import InvoiceItem
            InvoiceItem.objects.create(
                tenant=quotation.tenant,
                invoice=invoice,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total
            )
            
        quotation.status = 'converted'
        quotation.save()
        
        return Response({'status': 'converted', 'invoice_id': str(invoice.id)})

class InvoiceViewSet(TenantAwareViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class SaleViewSet(TenantAwareViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    filterset_fields = ['branch', 'customer', 'payment_status', 'status']

# POS-specific endpoints
@api_view(['POST'])
def pos_create_sale(request):
    """Create a sale from POS - compatible with POS system format"""
    try:
        tenant_id = request.headers.get('X-Tenant-ID')
        data = request.data
        
        # Create sale
        sale = Sale.objects.create(
            tenant_id=tenant_id,
            branch_id=data.get('branch_id'),
            receipt_number=data.get('receipt_number'),
            subtotal=data.get('subtotal', 0),
            discount_amount=data.get('discount_amount', 0),
            tax_amount=data.get('tax_amount', 0),
            total_amount=data.get('total_amount'),
            paid_amount=data.get('paid_amount', 0),
            change_amount=data.get('change_amount', 0),
            payment_method=data.get('payment_method', 'cash'),
            staff_id_id=data.get('staff_id'),
            staff_name=data.get('staff_name', ''),
            items=data.get('items', []),
            status=data.get('status', 'completed'),
            sync_status='synced'
        )
        
        # Update stock levels
        for item in data.get('items', []):
            try:
                stock = BranchStock.objects.get(
                    tenant_id=tenant_id,
                    branch_id=data.get('branch_id'),
                    product_id=item.get('product_id')
                )
                stock.quantity -= item.get('quantity', 0)
                stock.save()
            except BranchStock.DoesNotExist:
                pass
        
        return Response({
            'id': sale.id,
            'uuid': str(sale.id),
            'receipt_number': sale.receipt_number,
            'status': 'success'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def pos_get_products(request):
    """Get products for POS - returns in POS-compatible format"""
    tenant_id = request.headers.get('X-Tenant-ID')
    branch_id = request.query_params.get('branch_id')
    
    products = Product.objects.filter(tenant_id=tenant_id, is_deleted=False)
    
    result = []
    for product in products:
        # Get stock for this branch
        stock_qty = 0
        if branch_id:
            try:
                stock = BranchStock.objects.get(
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    product=product
                )
                stock_qty = float(stock.quantity)
            except BranchStock.DoesNotExist:
                pass
        
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
            'created_at': product.created_at.isoformat(),
            'updated_at': product.updated_at.isoformat()
        })
    
    return Response(result)

@api_view(['GET'])
def pos_get_staff(request):
    """Get staff for POS - returns in POS-compatible format"""
    tenant_id = request.headers.get('X-Tenant-ID')
    
    staff = User.objects.filter(tenant_id=tenant_id)
    
    result = []
    for user in staff:
        result.append({
            'id': user.id,
            'uuid': str(user.id),
            'username': user.username,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active,
        })
    
    return Response(result)
