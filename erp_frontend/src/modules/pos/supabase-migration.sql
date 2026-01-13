-- PaeasyShop Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id UUID, -- For multi-tenant support
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    supplier VARCHAR(255),
    image TEXT,
    barcodes JSONB DEFAULT '[]'::jsonb,
    unit_of_measure VARCHAR(50) DEFAULT 'piece',
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id UUID, -- For multi-tenant support
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL,
    change_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'mobile_money', 'bank_card', 'credit')),
    payment_details JSONB,
    staff_id BIGINT NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    customer_id BIGINT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'returned', 'partial_return')),
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table (for reference, actual auth handled by Supabase Auth)
CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    tenant_id UUID, -- For multi-tenant support
    user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'cashier')),
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants Table (for multi-tenant support)
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id BIGINT REFERENCES staff(id),
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    max_users INTEGER DEFAULT 5,
    max_products INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problem Reports Table
CREATE TABLE IF NOT EXISTS problem_reports (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID,
    staff_id BIGINT NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'inventory', 'payment', 'other')),
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sync_status ON products(sync_status);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);

CREATE INDEX IF NOT EXISTS idx_sales_tenant ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt ON sales(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_sync_status ON sales(sync_status);

CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

CREATE INDEX IF NOT EXISTS idx_problem_reports_tenant ON problem_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_problem_reports_staff ON problem_reports(staff_id);
CREATE INDEX IF NOT EXISTS idx_problem_reports_status ON problem_reports(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_reports ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Users can view products from their tenant"
    ON products FOR SELECT
    USING (
        tenant_id IS NULL OR 
        tenant_id IN (
            SELECT tenant_id FROM staff WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'manager')
        )
    );

CREATE POLICY "Admins can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'manager')
        )
    );

-- Sales Policies
CREATE POLICY "Users can view sales from their tenant"
    ON sales FOR SELECT
    USING (
        tenant_id IS NULL OR 
        tenant_id IN (
            SELECT tenant_id FROM staff WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "All staff can insert sales"
    ON sales FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Staff Policies
CREATE POLICY "Users can view staff from their tenant"
    ON staff FOR SELECT
    USING (
        tenant_id IS NULL OR 
        tenant_id IN (
            SELECT tenant_id FROM staff WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage staff"
    ON staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Problem Reports Policies
CREATE POLICY "Users can view problem reports"
    ON problem_reports FOR SELECT
    USING (
        tenant_id IS NULL OR 
        tenant_id IN (
            SELECT tenant_id FROM staff WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "All staff can create problem reports"
    ON problem_reports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can update problem reports"
    ON problem_reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'manager')
        )
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PaeasyShop database schema created successfully!';
    RAISE NOTICE 'Tables created: products, sales, staff, tenants, problem_reports';
    RAISE NOTICE 'Row Level Security enabled on all tables';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update your .env.local with Supabase credentials';
    RAISE NOTICE '2. Update src/lib/sync.ts to use real Supabase client';
    RAISE NOTICE '3. Test the sync functionality';
END $$;
