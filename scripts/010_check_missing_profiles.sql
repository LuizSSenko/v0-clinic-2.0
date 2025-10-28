-- Script para verificar e corrigir perfis de pacientes ausentes

-- 1. Verificar agendamentos sem perfil de paciente
SELECT 
    a.id as appointment_id,
    a.patient_id,
    a.appointment_date,
    a.start_time,
    p.full_name as patient_name,
    CASE WHEN p.id IS NULL THEN 'PERFIL AUSENTE' ELSE 'OK' END as status
FROM appointments a
LEFT JOIN profiles p ON a.patient_id = p.id
WHERE p.id IS NULL;

-- 2. Verificar se os usuários existem no auth.users mas não em profiles
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE WHEN p.id IS NULL THEN 'PERFIL AUSENTE' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. SOLUÇÃO: Criar perfis ausentes baseados nos usuários do auth.users
-- ATENÇÃO: Execute este INSERT apenas após verificar os SELECTs acima

INSERT INTO profiles (id, email, full_name, user_type)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário Sem Nome') as full_name,
    COALESCE((u.raw_user_meta_data->>'user_type')::user_type, 'patient'::user_type) as user_type
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar novamente após o INSERT
SELECT 
    a.id as appointment_id,
    a.patient_id,
    p.full_name as patient_name,
    p.email as patient_email,
    CASE WHEN p.id IS NULL THEN 'PERFIL AUSENTE' ELSE 'OK' END as status
FROM appointments a
LEFT JOIN profiles p ON a.patient_id = p.id
ORDER BY a.appointment_date DESC;
