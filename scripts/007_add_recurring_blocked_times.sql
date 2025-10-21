-- Script para adicionar suporte a bloqueios recorrentes
-- Isso permite bloquear horários permanentemente em dias específicos da semana
-- Exemplo: Almoço todos os dias (segunda a sexta)

-- 1. Adicionar colunas para suporte a bloqueios recorrentes
ALTER TABLE blocked_times 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_of_week day_of_week;

-- 2. Tornar a coluna 'date' opcional (NULL) para bloqueios recorrentes
ALTER TABLE blocked_times 
ALTER COLUMN date DROP NOT NULL;

-- 3. Adicionar constraint para garantir que:
-- - Se is_recurring = TRUE, day_of_week deve estar preenchido e date deve ser NULL
-- - Se is_recurring = FALSE, date deve estar preenchido e day_of_week deve ser NULL
ALTER TABLE blocked_times
DROP CONSTRAINT IF EXISTS check_recurring_or_specific;

ALTER TABLE blocked_times
ADD CONSTRAINT check_recurring_or_specific CHECK (
  (is_recurring = TRUE AND day_of_week IS NOT NULL AND date IS NULL) OR
  (is_recurring = FALSE AND date IS NOT NULL AND day_of_week IS NULL)
);

-- 4. Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_blocked_times_recurring ON blocked_times(professional_id, is_recurring, day_of_week);

-- 5. Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Bloqueios recorrentes configurados com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora você pode:';
  RAISE NOTICE '1. Criar bloqueios pontuais (is_recurring = FALSE, com date)';
  RAISE NOTICE '2. Criar bloqueios recorrentes (is_recurring = TRUE, com day_of_week)';
  RAISE NOTICE '';
  RAISE NOTICE 'Exemplo de bloqueio recorrente:';
  RAISE NOTICE '  - Almoço todo dia útil: 12:00-13:00';
  RAISE NOTICE '  - is_recurring = TRUE';
  RAISE NOTICE '  - day_of_week = monday, tuesday, etc.';
  RAISE NOTICE '  - date = NULL';
END $$;
