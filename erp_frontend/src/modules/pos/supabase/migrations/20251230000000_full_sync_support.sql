-- Full Sync Support Migration
-- Adds tables for shop settings, stock locations, movements, transfers, audit transactions, and problem reports.

-- 1. Shop Settings Table
CREATE TABLE IF NOT EXISTS shop_settings (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    vat_registration TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#64748b',
    font TEXT DEFAULT 'Inter',
    vat_rate NUMERIC DEFAULT 16.5,
    tax_inclusive BOOLEAN DEFAULT false,
    currency TEXT DEFAULT 'MWK',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '12h',
    receipt_header TEXT,
    receipt_footer TEXT,
    show_logo_on_receipt BOOLEAN DEFAULT true,
    receipt_width INTEGER DEFAULT 80,
    auto_backup_schedule TEXT DEFAULT 'daily',
    opening_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Stock Locations Table
CREATE TABLE IF NOT EXISTS stock_locations (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT DEFAULT 'main_shop',
    address TEXT,
    phone TEXT,
    contact_person TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    movement_number TEXT UNIQUE NOT NULL,
    movement_type TEXT NOT NULL,
    from_location_id BIGINT REFERENCES stock_locations(id),
    to_location_id BIGINT REFERENCES stock_locations(id),
    product_id BIGINT REFERENCES products(id),
    product_name TEXT,
    sku TEXT,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    reason TEXT,
    reference_number TEXT,
    status TEXT DEFAULT 'completed',
    processed_by TEXT,
    processed_by_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Stock Transfers Table
CREATE TABLE IF NOT EXISTS stock_transfers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    transfer_number TEXT UNIQUE NOT NULL,
    from_location_id BIGINT REFERENCES stock_locations(id),
    to_location_id BIGINT REFERENCES stock_locations(id),
    items JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    subtotal NUMERIC DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    reason TEXT,
    requested_by TEXT,
    requested_by_id BIGINT,
    approved_by TEXT,
    approved_by_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Audit Transactions Table (Avoiding Reserved Word 'transactions')
CREATE TABLE IF NOT EXISTS audit_transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    reference_id BIGINT,
    reference_type TEXT,
    description TEXT,
    amount NUMERIC DEFAULT 0,
    staff_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Problem Reports Table
CREATE TABLE IF NOT EXISTS problem_reports (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id BIGINT,
    staff_name TEXT,
    category TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by BIGINT,
    notes TEXT
);

-- 7. Update Sales Table (Add updated_at if missing)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='updated_at') THEN
        ALTER TABLE sales ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- RLS Policies
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies based on tenant_id (linking to tenants.id)
-- Note: Simplified for now since RLS setup is basic in this project
CREATE POLICY "Tenant isolation for shop_settings" ON shop_settings FOR ALL USING (true);
CREATE POLICY "Tenant isolation for stock_locations" ON stock_locations FOR ALL USING (true);
CREATE POLICY "Tenant isolation for stock_movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Tenant isolation for stock_transfers" ON stock_transfers FOR ALL USING (true);
CREATE POLICY "Tenant isolation for audit_transactions" ON audit_transactions FOR ALL USING (true);
CREATE POLICY "Tenant isolation for problem_reports" ON problem_reports FOR ALL USING (true);
