-- Migration: Add phone and email fields to clinics table
-- Purpose: Allow clinics to store contact information for email notifications

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'phone'
  ) THEN
    ALTER TABLE clinics ADD COLUMN phone TEXT;
    RAISE NOTICE 'Column phone added to clinics table';
  ELSE
    RAISE NOTICE 'Column phone already exists in clinics table';
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clinics' AND column_name = 'email'
  ) THEN
    ALTER TABLE clinics ADD COLUMN email TEXT;
    RAISE NOTICE 'Column email added to clinics table';
  ELSE
    RAISE NOTICE 'Column email already exists in clinics table';
  END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clinics' 
  AND column_name IN ('phone', 'email')
ORDER BY column_name;
