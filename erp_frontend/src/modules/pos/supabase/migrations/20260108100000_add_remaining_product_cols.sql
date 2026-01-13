-- Add remaining missing columns to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS supplier text,
  ADD COLUMN IF NOT EXISTS unit_of_measure text,
  ADD COLUMN IF NOT EXISTS taxable boolean default false,
  ADD COLUMN IF NOT EXISTS tax_rate numeric default 0;
