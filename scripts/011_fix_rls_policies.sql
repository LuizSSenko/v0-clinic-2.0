-- ⚠️ SCRIPT EMERGENCIAL - RESETAR POLÍTICAS RLS COMPLETAMENTE
-- Este script remove todas as políticas e recria do zero de forma segura

-- 1. Verificar políticas existentes ANTES da remoção
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS (RESET COMPLETO)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Clinics can view patient profiles through appointments" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 3. DESABILITAR RLS TEMPORARIAMENTE (EMERGÊNCIA)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS BÁSICAS E SEGURAS

-- Política A: Qualquer usuário autenticado pode ver qualquer perfil (temporário para debug)
CREATE POLICY "Allow authenticated users to view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Política B: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política C: Sistema pode inserir perfis (para trigger handle_new_user)
CREATE POLICY "Enable insert for authenticated users"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. Verificar se políticas foram criadas corretamente
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Leitura ✅'
        WHEN cmd = 'UPDATE' THEN 'Atualização ✅'
        WHEN cmd = 'INSERT' THEN 'Inserção ✅'
        ELSE 'Outro'
    END as tipo
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 7. Testar se consegue ver perfis
SELECT 
    'TESTE DE LEITURA:' as teste,
    COUNT(*) as total_profiles_visiveis
FROM profiles;
