-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    max_users INTEGER NOT NULL DEFAULT 2,
    max_products INTEGER NOT NULL DEFAULT 50,
    max_locations INTEGER NOT NULL DEFAULT 1,
    features JSONB DEFAULT '{}',
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'trial', -- trial, active, canceled, past_due, unpaid
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- Usage Logs Table (for tracking API usage, product creation, etc.)
CREATE TABLE IF NOT EXISTS usage_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- 'product', 'user', 'sale', 'api_call'
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'read'
    resource_id BIGINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add subscription fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_resource_type ON usage_logs(resource_type);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, max_users, max_products, max_locations, features) VALUES
('free', 'Free', 0.00, 0.00, 2, 50, 1, '{"support": "community", "reports": "basic"}'),
('basic', 'Basic', 29.00, 290.00, 5, 500, 3, '{"support": "email", "reports": "advanced", "multi_location": true}'),
('premium', 'Premium', 99.00, 990.00, 20, 10000, 10, '{"support": "priority", "reports": "advanced", "multi_location": true, "api_access": true, "custom_integrations": true}')
ON CONFLICT (name) DO NOTHING;

-- Function to check product limit
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    plan_name TEXT;
BEGIN
    -- Get current product count for tenant
    SELECT COUNT(*) INTO current_count
    FROM products
    WHERE tenant_id = NEW.tenant_id;
    
    -- Get max products allowed for tenant's plan
    SELECT sp.max_products, sp.name INTO max_allowed, plan_name
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.tenant_id = NEW.tenant_id
    AND s.status IN ('trial', 'active');
    
    -- If no subscription found, use free plan limits
    IF max_allowed IS NULL THEN
        max_allowed := 50;
        plan_name := 'free';
    END IF;
    
    -- Check if limit exceeded
    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Product limit reached. Current plan: %. Limit: %. Upgrade to add more products.', 
            plan_name, max_allowed
            USING HINT = 'upgrade_required';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product limit (Using CREATE OR REPLACE TRIGGER if supported, otherwise DROP IF EXISTS)
DROP TRIGGER IF EXISTS enforce_product_limit ON products;
CREATE TRIGGER enforce_product_limit
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_product_limit();

-- Function to log usage
CREATE OR REPLACE FUNCTION log_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usage_logs (tenant_id, resource_type, action, resource_id, metadata)
    VALUES (
        NEW.tenant_id,
        TG_TABLE_NAME,
        TG_OP,
        NEW.id,
        jsonb_build_object('timestamp', NOW())
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create usage logging triggers
DROP TRIGGER IF EXISTS log_product_usage ON products;
CREATE TRIGGER log_product_usage
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_usage();

DROP TRIGGER IF EXISTS log_sale_usage ON sales;
CREATE TRIGGER log_sale_usage
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION log_usage();

COMMENT ON TABLE subscription_plans IS 'Available subscription tiers and their limits';
COMMENT ON TABLE subscriptions IS 'Active subscriptions for tenants';
COMMENT ON TABLE usage_logs IS 'Tracks resource usage for billing and analytics';
COMMENT ON FUNCTION check_product_limit() IS 'Enforces product limits based on subscription plan';
