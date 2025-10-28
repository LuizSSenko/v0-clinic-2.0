-- Script para verificar se usuários e perfis existem no banco de dados

-- 1. Verificar usuários na tabela auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data->>'user_type' as user_type,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar perfis na tabela profiles
SELECT 
    id,
    email,
    full_name,
    user_type,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. Verificar se há usuários sem perfil
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'user_type' as user_type_auth,
    CASE WHEN p.id IS NULL THEN '❌ SEM PERFIL' ELSE '✅ TEM PERFIL' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Contar usuários por tipo
SELECT 
    user_type,
    COUNT(*) as total
FROM profiles
GROUP BY user_type;

-- 5. Verificar clínicas específicas
SELECT * FROM profiles WHERE user_type = 'clinic';

-- 6. Verificar pacientes específicos  
SELECT * FROM profiles WHERE user_type = 'patient';

-- 7. Verificar se as contas de teste existem
SELECT 
    email,
    full_name,
    user_type,
    created_at
FROM profiles
WHERE email IN ('lgssenko@gmail.com', 'fabiosoaresgt@gmail.com')
ORDER BY user_type, email;
