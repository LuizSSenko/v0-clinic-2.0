-- Script para criar usuários de teste para debug
-- IMPORTANTE: Este script deve ser executado apenas em ambiente de desenvolvimento

-- Criar usuário paciente de teste
-- Email: paciente@test.com
-- Senha: 123456789
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
  'paciente@test.com',
  crypt('123456789', gen_salt('bf')),
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
  'Paciente Teste',
  '(11) 99999-9999'
FROM auth.users
WHERE email = 'paciente@test.com'
ON CONFLICT (id) DO UPDATE
SET 
  user_type = 'patient',
  full_name = 'Paciente Teste',
  phone = '(11) 99999-9999';

-- Criar usuário clínica de teste
-- Email: clinica@test.com
-- Senha: 123456789
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
  'clinica@test.com',
  crypt('123456789', gen_salt('bf')),
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
  'Clínica Teste',
  '(11) 98888-8888'
FROM auth.users
WHERE email = 'clinica@test.com'
ON CONFLICT (id) DO UPDATE
SET 
  user_type = 'clinic',
  full_name = 'Clínica Teste',
  phone = '(11) 98888-8888';

-- Criar dados da clínica
INSERT INTO clinics (profile_id, name, address, working_hours)
SELECT 
  id,
  'Clínica Teste',
  'Rua Teste, 123 - São Paulo, SP',
  '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00"}'
FROM profiles
WHERE user_type = 'clinic' AND full_name = 'Clínica Teste'
ON CONFLICT (profile_id) DO UPDATE
SET 
  name = 'Clínica Teste',
  address = 'Rua Teste, 123 - São Paulo, SP',
  working_hours = '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00"}';
