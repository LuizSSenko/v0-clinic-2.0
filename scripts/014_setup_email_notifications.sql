-- Script para configurar notificações automáticas por email
-- Este script cria um trigger que dispara a Edge Function sempre que um agendamento é criado ou modificado

-- 1. Criar função que invoca a Edge Function
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
BEGIN
  -- Determinar o tipo de ação baseado no trigger
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar o tipo de atualização
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      action_type := 'cancelled';
    ELSIF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
      action_type := 'confirmed';
    ELSIF NEW.appointment_date != OLD.appointment_date 
       OR NEW.start_time != OLD.start_time 
       OR NEW.end_time != OLD.end_time THEN
      action_type := 'rescheduled';
    ELSE
      -- Outras atualizações não enviam email
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  -- Invocar a Edge Function de forma assíncrona usando pg_net
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-appointment-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'appointmentId', NEW.id,
        'action', action_type
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para INSERT (novos agendamentos)
DROP TRIGGER IF EXISTS appointment_created_trigger ON appointments;
CREATE TRIGGER appointment_created_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_change();

-- 3. Criar trigger para UPDATE (modificações)
DROP TRIGGER IF EXISTS appointment_updated_trigger ON appointments;
CREATE TRIGGER appointment_updated_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_change();

-- 4. Verificar se os triggers foram criados
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'appointments'
  AND trigger_name IN ('appointment_created_trigger', 'appointment_updated_trigger');
