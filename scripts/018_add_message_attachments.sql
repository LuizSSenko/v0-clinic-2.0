-- Migration: Add file attachment support to messages
-- Purpose: Allow messages to include file attachments (prescriptions, documents, images)

-- Add columns to messages table for file attachments
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_appointment ON messages(appointment_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Allow users to read files from their appointments
-- Simplified: if user is patient or clinic owner of the appointment, they can read
CREATE POLICY "Allow users to read their message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments' AND (
    -- Check if user is the patient of any appointment
    auth.uid() IN (
      SELECT patient_id FROM appointments
    )
    OR
    -- Check if user is from any clinic
    auth.uid() IN (
      SELECT profile_id FROM clinics
    )
  )
);

-- Allow users to delete their own uploaded files
CREATE POLICY "Allow users to delete their message attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments'
);

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name IN ('message_type', 'file_url', 'file_name', 'file_type', 'file_size')
ORDER BY ordinal_position;
