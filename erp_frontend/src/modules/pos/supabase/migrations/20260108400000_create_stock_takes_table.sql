-- Create Stock Takes Table
CREATE TABLE IF NOT EXISTS stock_takes (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    location_id BIGINT REFERENCES stock_locations(id),
    location_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'cancelled')),
    items JSONB NOT NULL,
    notes TEXT,
    conducted_by TEXT NOT NULL,
    conducted_by_id BIGINT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE stock_takes ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY "Tenant isolation for stock_takes" ON stock_takes FOR ALL USING (true);
