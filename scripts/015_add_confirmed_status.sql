-- Adicionar o status 'confirmed' ao enum appointment_status

-- IMPORTANTE: Execute este comando SOZINHO primeiro (sem o restante do script)
-- Depois de executar, faça COMMIT e então execute as queries de verificação

-- Passo 1: Adicionar 'confirmed' ao enum (EXECUTE SOZINHO)
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'confirmed';

-- PARE AQUI! Faça COMMIT da transação acima antes de continuar.
-- No Supabase SQL Editor, clique em "Run" apenas para a linha acima.
-- Depois, execute as queries abaixo separadamente para verificar:

-- Passo 2: Verificar que foi adicionado (execute depois do commit)
-- SELECT unnest(enum_range(NULL::appointment_status))::text AS status_values;

-- O enum agora deve ter: 'scheduled', 'cancelled', 'completed', 'confirmed'
