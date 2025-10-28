-- Remover triggers antigos que causam o erro "schema 'net' does not exist"

-- 1. Remover triggers
DROP TRIGGER IF EXISTS appointment_created_trigger ON appointments;
DROP TRIGGER IF EXISTS appointment_updated_trigger ON appointments;

-- 2. Remover função do trigger
DROP FUNCTION IF EXISTS notify_appointment_change();

-- 3. Verificar que foram removidos
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'appointments';

-- Se não retornar nenhuma linha, está tudo certo! ✅
