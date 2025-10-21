-- Script para criar usuários de DEBUG
-- IMPORTANTE: Execute este script apenas em ambiente de desenvolvimento
-- 
-- Usuários criados:
-- Paciente: paciente@gmail.com / senha: 123456
-- Clínica: clinica@gmail.com / senha: 123456

-- ====================================
-- CRIAR PACIENTE DE DEBUG
-- ====================================

-- Criar usuário paciente
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'paciente@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Criar perfil para o paciente
INSERT INTO profiles (id, user_type, full_name, phone)
SELECT 
  id,
  'patient',
  'Paciente Debug',
  '(11) 91111-1111'
FROM auth.users
WHERE email = 'paciente@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  user_type = 'patient',
  full_name = 'Paciente Debug',
  phone = '(11) 91111-1111';

-- ====================================
-- CRIAR CLÍNICA DE DEBUG
-- ====================================

-- Criar usuário clínica
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'clinica@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Criar perfil para a clínica
INSERT INTO profiles (id, user_type, full_name, phone)
SELECT 
  id,
  'clinic',
  'Clínica Debug',
  '(11) 92222-2222'
FROM auth.users
WHERE email = 'clinica@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  user_type = 'clinic',
  full_name = 'Clínica Debug',
  phone = '(11) 92222-2222';

-- Criar dados da clínica
INSERT INTO clinics (profile_id, name, address, working_hours)
SELECT 
  id,
  'Clínica Debug',
  'Rua Debug, 456 - São Paulo, SP',
  '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-12:00"}'
FROM profiles
WHERE user_type = 'clinic' AND email IN (SELECT email FROM auth.users WHERE email = 'clinica@gmail.com')
ON CONFLICT (profile_id) DO UPDATE
SET 
  name = 'Clínica Debug',
  address = 'Rua Debug, 456 - São Paulo, SP',
  working_hours = '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-12:00"}';

-- ====================================
-- MENSAGEM DE CONFIRMAÇÃO
-- ====================================

DO $$
BEGIN
  RAISE NOTICE '✅ Usuários de DEBUG criados com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📧 PACIENTE:';
  RAISE NOTICE '   Email: paciente@gmail.com';
  RAISE NOTICE '   Senha: 123456';
  RAISE NOTICE '';
  RAISE NOTICE '🏥 CLÍNICA:';
  RAISE NOTICE '   Email: clinica@gmail.com';
  RAISE NOTICE '   Senha: 123456';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Estes usuários são apenas para DEBUG!';
END $$;
