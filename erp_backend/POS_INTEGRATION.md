# POS Integration Guide - Django Backend

## Overview
Your POS system is now integrated with the Django backend. The POS can communicate with Django APIs instead of Supabase.

## API Endpoints for POS

### Base URL
```
http://localhost:8000/api/v1/sales/pos/
```

### Authentication
All requests must include:
```
Headers:
  X-Tenant-ID: <tenant_uuid>
  Authorization: Bearer <jwt_token>  (optional for now)
```

### Available Endpoints

#### 1. Get Products
```
GET /api/v1/sales/pos/products/?branch_id=<branch_id>
```
Returns all products with stock levels for the specified branch.

#### 2. Get Staff
```
GET /api/v1/sales/pos/staff/
```
Returns all staff members for the tenant.

#### 3. Create Sale
```
POST /api/v1/sales/pos/create-sale/
Content-Type: application/json

{
  "branch_id": "uuid",
  "receipt_number": "RCP-001",
  "subtotal": 100.00,
  "discount_amount": 0,
  "tax_amount": 10.00,
  "total_amount": 110.00,
  "paid_amount": 110.00,
  "change_amount": 0,
  "payment_method": "cash",
  "staff_id": "user_id",
  "staff_name": "John Doe",
  "items": [
    {
      "product_id": "uuid",
      "name": "Product Name",
      "quantity": 2,
      "unit_price": 50.00,
      "total": 100.00
    }
  ],
  "status": "completed"
}
```

## Configuring POS to Use Django

### Option 1: Environment Variables
Update your POS `.env.local`:
```env
# Replace Supabase with Django
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_TENANT_ID=<your_tenant_uuid>

# Keep these for now (can be removed later)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Option 2: API Adapter Layer
Create `src/lib/django-api.ts` in your POS:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

export async function fetchProducts(branchId: string) {
  const response = await fetch(`${API_BASE}/sales/pos/products/?branch_id=${branchId}`, {
    headers: {
      'X-Tenant-ID': TENANT_ID,
    }
  });
  return response.json();
}

export async function createSale(saleData: any) {
  const response = await fetch(`${API_BASE}/sales/pos/create-sale/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_ID,
    },
    body: JSON.stringify(saleData)
  });
  return response.json();
}
```

## Data Migration

### From Supabase to Django
If you have existing data in Supabase:

1. Export data from Supabase
2. Run Django migrations
3. Use the seed script to import data
4. Update POS configuration

## Testing

1. Start Django backend:
```bash
cd erp_backend
python manage.py runserver
```

2. Test endpoints:
```bash
# Get products
curl -H "X-Tenant-ID: <tenant_id>" http://localhost:8000/api/v1/sales/pos/products/

# Create sale
curl -X POST -H "Content-Type: application/json" -H "X-Tenant-ID: <tenant_id>" \
  -d '{"receipt_number":"TEST-001","total_amount":100}' \
  http://localhost:8000/api/v1/sales/pos/create-sale/
```

3. Start POS:
```bash
cd pos
npm run dev
```

## Next Steps

1. ✅ Django backend is ready
2. ⚠️ Update POS to use Django APIs (modify `src/lib/supabase.ts` or create adapter)
3. ⚠️ Run migrations: `python manage.py makemigrations && python manage.py migrate`
4. ⚠️ Create test tenant and branch
5. ⚠️ Test POS sales flow

## Notes

- Stock levels automatically update when sales are created
- All sales are tenant-isolated
- Receipt numbers must be unique
- POS can work offline and sync later (implement queue in POS)
