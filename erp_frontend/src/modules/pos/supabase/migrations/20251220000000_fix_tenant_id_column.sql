-- Ensure tenant_id is BIGINT to maintain relational integrity
-- Standardizing on BIGINT for all tenant references

-- Drop the foreign key constraint temporarily if it exists
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_tenant_id_fkey;
ALTER TABLE staff DROP CONSTRAINT IF EXISTS valid_tenant_id;

-- Drop dependent policy from quotations table that references staff.tenant_id
DROP POLICY IF EXISTS "Users can view quotations from their tenant" ON quotations;

-- Ensure column is BIGINT (reverting previous text hack if it was attempted)
ALTER TABLE staff 
ALTER COLUMN tenant_id TYPE bigint USING (
  CASE 
    WHEN tenant_id::text ~ '^[0-9]+$' THEN tenant_id::text::bigint 
    ELSE NULL -- Non-numeric tenant IDs are invalid for a BIGINT FK
  END
);

-- Recreate the foreign key constraint
ALTER TABLE staff 
ADD CONSTRAINT staff_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_tenant_id ON staff(tenant_id);

-- Recreate quotations policy (ensuring it matches the BIGINT type)
CREATE POLICY "Users can view quotations from their tenant"
    ON quotations FOR SELECT
    USING (
        tenant_id IS NULL OR
        tenant_id IN (
            SELECT tenant_id FROM staff WHERE uuid = auth.uid()
        )
    );