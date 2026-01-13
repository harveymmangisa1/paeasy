-- Secure RLS Policies for Multi-Tenancy

-- 1. Enable RLS on tables (idempotent)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY; -- Ensure quotations is secured
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 2. Drop insecure "Public Access" policies
DROP POLICY IF EXISTS "Public Access" ON products;
DROP POLICY IF EXISTS "Public Access" ON sales;
DROP POLICY IF EXISTS "Public Access" ON staff;
DROP POLICY IF EXISTS "Public Access" ON tenants;
-- Drop potentially existing policies on quotations
DROP POLICY IF EXISTS "Public Access" ON quotations;
DROP POLICY IF EXISTS "Enable read access for all users" ON quotations;
DROP POLICY IF EXISTS "Enable insert for all users" ON quotations;
DROP POLICY IF EXISTS "Enable update for all users" ON quotations;
DROP POLICY IF EXISTS "Enable delete for all users" ON quotations;

-- 3. Define Helper Function for Tenant Lookup (Optional but cleaner)
-- Or just use direct subqueries to avoid function permission issues. USE SUBQUERIES.

-- 4. STAFF Table Policies
-- Allow users to read their OWN staff record (needed for tenant lookup)
CREATE POLICY "Users can read own staff record" ON staff
  FOR SELECT
  USING (auth.uid() = uuid);

-- Allow admins (or anyone?) to update their own record? Or maybe just read.
-- For now, read is crucial.

-- 5. PRODUCTS Table Policies
-- View: Only if user belongs to the same tenant
CREATE POLICY "Tenant read access" ON products
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()));

-- Insert/Update/Delete: Only if user belongs to the same tenant
CREATE POLICY "Tenant write access" ON products
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()));

-- 6. SALES Table Policies
CREATE POLICY "Tenant access sales" ON sales
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()));

-- 7. QUOTATIONS Table Policies
CREATE POLICY "Tenant access quotations" ON quotations
  FOR ALL
  USING (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()))
  WITH CHECK (tenant_id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()));

-- 8. TENANTS Table
-- Allow reading own tenant details
CREATE POLICY "Read own tenant" ON tenants
  FOR SELECT
  USING (id = (SELECT tenant_id FROM staff WHERE uuid = auth.uid()));

-- Allow creating a tenant (usually done during setup, might need special handling)
-- For signup, we used admin client, so RLS doesn't matter there.
