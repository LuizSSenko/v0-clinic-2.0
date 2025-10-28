-- Adiciona campos de endereço ao perfil do usuário
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Comentários para documentação
COMMENT ON COLUMN profiles.address IS 'Endereço completo do usuário (rua, número, complemento)';
COMMENT ON COLUMN profiles.city IS 'Cidade do usuário';
COMMENT ON COLUMN profiles.state IS 'Estado (UF) do usuário';
COMMENT ON COLUMN profiles.zip_code IS 'CEP do usuário';
