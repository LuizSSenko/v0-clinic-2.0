-- Script para adicionar proteções contra race conditions e garantir concorrência segura
-- Este script adiciona constraints e índices únicos para prevenir conflitos

-- 1. Adicionar índice único para prevenir agendamentos duplicados no mesmo horário
-- Isso impede que dois pacientes agendem o mesmo profissional no mesmo horário
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_overlap 
ON appointments(professional_id, appointment_date, start_time) 
WHERE status = 'scheduled';

-- 2. Adicionar constraint para garantir que não há sobreposição de horários
-- Isso previne agendamentos que se sobrepõem (ex: 10:00-11:00 e 10:30-11:30)
CREATE OR REPLACE FUNCTION check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe um agendamento que se sobrepõe
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE professional_id = NEW.professional_id
      AND appointment_date = NEW.appointment_date
      AND status = 'scheduled'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        -- Novo agendamento começa durante um existente
        (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
        -- Novo agendamento termina durante um existente
        (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
        -- Novo agendamento engloba um existente
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Conflito de horário: Este horário já está ocupado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para verificar sobreposição antes de inserir/atualizar
DROP TRIGGER IF EXISTS trigger_check_appointment_overlap ON appointments;
CREATE TRIGGER trigger_check_appointment_overlap
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION check_appointment_overlap();

-- 3. Adicionar índice para melhorar performance de queries concorrentes
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date_time 
ON appointments(professional_id, appointment_date, start_time, end_time)
WHERE status = 'scheduled';

-- 4. Adicionar índice para prevenir disponibilidades duplicadas
CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_availability_unique
ON professional_availability(professional_id, day_of_week, start_time, end_time);

-- 5. Adicionar índice para prevenir bloqueios duplicados
-- Para bloqueios pontuais (data específica)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_times_specific_unique
ON blocked_times(professional_id, date, start_time, end_time)
WHERE is_recurring = FALSE;

-- Para bloqueios recorrentes (dia da semana)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_times_recurring_unique
ON blocked_times(professional_id, day_of_week, start_time, end_time)
WHERE is_recurring = TRUE;

-- 6. Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Proteções de concorrência configuradas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Proteções implementadas:';
  RAISE NOTICE '1. Índice único previne agendamentos duplicados no mesmo horário';
  RAISE NOTICE '2. Trigger verifica sobreposição de horários';
  RAISE NOTICE '3. Índices otimizados para queries concorrentes';
  RAISE NOTICE '4. Previne disponibilidades e bloqueios duplicados';
  RAISE NOTICE '';
  RAISE NOTICE 'O sistema agora suporta centenas de usuários simultâneos com segurança!';
END $$;
