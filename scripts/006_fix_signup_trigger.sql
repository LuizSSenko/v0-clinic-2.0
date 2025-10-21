-- Script para corrigir o trigger de criação de perfil
-- Este script corrige problemas comuns que causam erro 500 no signup

-- 1. Drop do trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recriar a função com tratamento de erros melhorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_type user_type;
  v_full_name TEXT;
  v_clinic_name TEXT;
BEGIN
  -- Extrair e validar os dados do metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_user_type := COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'patient');
  v_clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', '');

  -- Inserir o perfil
  INSERT INTO public.profiles (id, email, full_name, user_type, phone)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_user_type,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  
  -- Se for clínica, criar registro na tabela clinics
  IF v_user_type = 'clinic' THEN
    INSERT INTO public.clinics (profile_id, clinic_name, address, description)
    VALUES (
      NEW.id,
      v_clinic_name,
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'description', '')
    )
    ON CONFLICT (profile_id) DO UPDATE
    SET 
      clinic_name = EXCLUDED.clinic_name,
      address = EXCLUDED.address,
      description = EXCLUDED.description,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro (aparecerá nos logs do Supabase)
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    -- Não falha o signup, apenas loga o erro
    RETURN NEW;
END;
$$;

-- 3. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se há profiles órfãos (users sem profile)
INSERT INTO public.profiles (id, email, full_name, user_type, phone)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
  COALESCE((u.raw_user_meta_data->>'user_type')::user_type, 'patient'),
  COALESCE(u.raw_user_meta_data->>'phone', '')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger corrigido com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Mudanças aplicadas:';
  RAISE NOTICE '1. Função handle_new_user() recriada com tratamento de erros';
  RAISE NOTICE '2. Trigger on_auth_user_created recriado';
  RAISE NOTICE '3. Profiles órfãos foram criados (se existiam)';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora você pode tentar criar contas novamente!';
END $$;
