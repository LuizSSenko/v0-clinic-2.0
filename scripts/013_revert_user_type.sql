-- Script para corrigir user_type de lgssenko@gmail.com

-- 1. Verificar estado atual
SELECT 
    email,
    full_name,
    user_type,
    created_at
FROM profiles
WHERE email = 'lgssenko@gmail.com';

-- 2. Alterar de clinic para patient
UPDATE profiles 
SET user_type = 'patient'
WHERE email = 'lgssenko@gmail.com';

-- 3. Verificar se foi alterado
SELECT 
    email,
    full_name,
    user_type,
    '✅ Alterado para patient' as status
FROM profiles
WHERE email = 'lgssenko@gmail.com';

-- 4. Ver todos os perfis por tipo
SELECT 
    user_type,
    email,
    full_name
FROM profiles
ORDER BY user_type, email;
