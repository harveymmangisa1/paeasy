-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    membership_number TEXT,
    balance NUMERIC(15, 2) DEFAULT 0,
    credit_limit NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Users can view their tenant's customers" ON customers
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM staff WHERE uuid = auth.uid()
    ));

CREATE POLICY "Users can insert customers for their tenant" ON customers
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM staff WHERE uuid = auth.uid()
    ));

CREATE POLICY "Users can update their tenant's customers" ON customers
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM staff WHERE uuid = auth.uid()
    ));

CREATE POLICY "Users can delete their tenant's customers" ON customers
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM staff WHERE uuid = auth.uid()
    ));
