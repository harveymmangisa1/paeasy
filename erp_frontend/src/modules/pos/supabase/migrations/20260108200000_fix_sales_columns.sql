-- Add missing columns to sales table
ALTER TABLE sales 
  ADD COLUMN IF NOT EXISTS customer_id bigint,
  ADD COLUMN IF NOT EXISTS notes text;
