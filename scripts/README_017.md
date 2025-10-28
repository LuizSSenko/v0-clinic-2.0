# Migration 017: Add Clinic Contact Fields

## Overview
This migration adds `phone` and `email` columns to the `clinics` table to allow clinics to store and display their contact information in email notifications.

## Changes
- Adds `phone TEXT` column to `clinics` table
- Adds `email TEXT` column to `clinics` table
- Both columns are nullable (optional)

## Why This Migration?
When we implemented email notifications, we added the clinic name and address to the email templates. However, clinics didn't have a way to configure this information through the UI. This migration completes the clinic settings feature by:

1. Adding the database columns for phone and email
2. Enabling the new Clinic Settings dialog to save this data
3. Allowing this information to be displayed in future email templates

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/ncojbureebjohyptflcz/editor
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `017_add_clinic_contact_fields.sql`
5. Click "Run" or press Ctrl+Enter
6. Verify the output shows: "Column phone added to clinics table" and "Column email added to clinics table"

### Option 2: Using Supabase CLI
\`\`\`bash
npx supabase db execute --project-ref ncojbureebjohyptflcz < scripts/017_add_clinic_contact_fields.sql
\`\`\`

## Verification
After running the migration, you can verify it worked by running:

\`\`\`sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clinics'
ORDER BY ordinal_position;
\`\`\`

You should see `phone` and `email` in the list of columns.

## Frontend Changes
This migration is part of a larger feature:

1. **Type Update**: `lib/types.ts` - Added `phone?` and `email?` to the `Clinic` interface
2. **New Component**: `components/clinic/clinic-settings-dialog.tsx` - Dialog for editing clinic settings
3. **Dashboard Update**: Added "Configurações" button next to "Sair" button in clinic dashboard

## Testing
After applying this migration:

1. Login as a clinic user
2. Click the "Configurações" button in the header
3. Fill in the clinic name, address, phone, and email
4. Click "Salvar Configurações"
5. Verify the data is saved (you can check by reopening the dialog)
6. Create/confirm an appointment and check that the email now shows complete clinic information

## Rollback (if needed)
If you need to rollback this migration:

\`\`\`sql
ALTER TABLE clinics DROP COLUMN IF EXISTS phone;
ALTER TABLE clinics DROP COLUMN IF EXISTS email;
\`\`\`

Note: This will permanently delete any phone and email data that was stored.

## Related Files
- `scripts/017_add_clinic_contact_fields.sql` - Migration script
- `lib/types.ts` - Type definitions
- `components/clinic/clinic-settings-dialog.tsx` - Settings UI
- `components/clinic/clinic-dashboard-client.tsx` - Dashboard integration
- `supabase/functions/send-appointment-email/index.ts` - Email templates (can be updated to include phone/email)

## Next Steps
After this migration, you may want to:
1. Update email templates to include clinic phone and email
2. Add phone number formatting/validation
3. Add email format validation
4. Consider adding a clinic logo field for branding
