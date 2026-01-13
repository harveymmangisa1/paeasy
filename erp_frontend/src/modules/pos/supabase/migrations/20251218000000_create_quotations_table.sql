-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'converted')),
    notes TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for quotations
CREATE INDEX IF NOT EXISTS idx_quotations_tenant ON quotations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_number ON quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- RLS for quotations
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotations from their tenant"
    ON quotations FOR SELECT
    USING (
        tenant_id IS NULL OR
        tenant_id::text IN (
            SELECT tenant_id::text FROM staff WHERE uuid = auth.uid()
        )
    );

CREATE POLICY "All staff can insert quotations"
    ON quotations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE uuid = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "All staff can update quotations"
    ON quotations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE uuid = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "All staff can delete quotations"
    ON quotations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE uuid = auth.uid()
            AND is_active = true
        )
    );
