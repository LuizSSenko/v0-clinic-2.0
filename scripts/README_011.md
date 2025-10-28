# Script 011 - Correção de Políticas RLS para Visualização de Perfis de Pacientes

## 🎯 Objetivo
Corrigir as políticas de Row Level Security (RLS) para permitir que clínicas vejam os perfis dos pacientes que têm agendamentos com seus profissionais.

## ❗ Problema Identificado
A query do Supabase está retornando `patient: null` mesmo com os perfis existindo no banco de dados. Isso acontece porque **as políticas RLS da tabela `profiles` estão bloqueando o acesso** quando uma clínica tenta ler dados de perfis de pacientes através do JOIN.

### Console Output:
```
📋 Total de agendamentos carregados: 11
"patient": null  // ❌ Todos retornam null
"patient_id": "70c5899d-c1e1-428f-bb46-f80d734197ed"  // ✅ ID válido
```

### Verificação no Banco:
```sql
-- Banco de dados confirma que perfis existem:
SELECT * FROM profiles WHERE id = '70c5899d-c1e1-428f-bb46-f80d734197ed';
-- ✅ Retorna: full_name = "Paciente", user_type = "patient"
```

**Conclusão**: O problema é RLS bloqueando acesso cross-user.

## 🔧 Solução

### O que o script faz:

1. **Verificar políticas existentes** - Lista todas as políticas RLS na tabela `profiles`
2. **Criar política específica** - Permite que clínicas vejam perfis de pacientes através de agendamentos
3. **Verificar criação** - Confirma que a política foi criada corretamente

### Como a política funciona:

```sql
-- Usuário pode acessar perfil SE:
-- 1. É o próprio perfil (auth.uid() = id)
-- OU
-- 2. É uma clínica vendo perfil de paciente com agendamento
EXISTS (
    SELECT 1
    FROM appointments a
    INNER JOIN professionals p ON a.professional_id = p.id
    INNER JOIN profiles clinic_profile ON p.clinic_id = clinic_profile.id
    WHERE a.patient_id = profiles.id          -- O perfil sendo consultado
    AND clinic_profile.id = auth.uid()        -- É a clínica logada
    AND clinic_profile.user_type = 'clinic'   -- Confirma tipo clinic
)
```

## 📋 Como Executar

### Passo 1: Abrir Supabase Dashboard
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto: **v0-clinic-2.0**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar Query 1 (Verificar Políticas)
```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

Você verá as políticas existentes. Anote o que aparecer.

### Passo 3: Executar Query 2 e 3 (Criar Nova Política)
```sql
-- Remover política antiga se existir
DROP POLICY IF EXISTS "Clinics can view patient profiles through appointments" ON profiles;

-- Criar nova política
CREATE POLICY "Clinics can view patient profiles through appointments"
ON profiles
FOR SELECT
USING (
    auth.uid() = id
    OR
    EXISTS (
        SELECT 1
        FROM appointments a
        INNER JOIN professionals p ON a.professional_id = p.id
        INNER JOIN profiles clinic_profile ON p.clinic_id = clinic_profile.id
        WHERE a.patient_id = profiles.id
        AND clinic_profile.id = auth.uid()
        AND clinic_profile.user_type = 'clinic'
    )
);
```

**Resultado esperado**: `CREATE POLICY` ou `SUCCESS`

### Passo 4: Executar Query 4 (Verificar)
```sql
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles' 
AND policyname = 'Clinics can view patient profiles through appointments';
```

**Resultado esperado**: 1 linha mostrando a política criada

### Passo 5: Testar no Frontend
1. Feche todas as abas do navegador
2. Abra nova aba: http://localhost:3000
3. Faça login como clínica (lgssenko@gmail.com)
4. Entre no dashboard da clínica
5. Clique no profissional "Maria"
6. Abra console (F12)

**Resultado esperado**:
```
📋 Dados completos: [
  {
    "patient": {                    // ✅ Não mais null!
      "id": "70c5899d-...",
      "full_name": "Paciente",      // ✅ Nome aparece!
      "email": "lgssenko@gmail.com",
      "user_type": "patient"
    }
  }
]
```

## 🔍 Troubleshooting

### Erro: "permission denied for table profiles"
**Causa**: Política RLS muito restritiva
**Solução**: Execute novamente o script 002_enable_rls.sql para resetar políticas base

### Erro: "policy already exists"
**Causa**: Política já foi criada antes
**Solução**: Execute só o DROP POLICY antes de criar novamente

### Ainda retorna null após criar política
**Causa**: Cache do Supabase ou sessão antiga
**Solução**: 
1. Faça logout da aplicação
2. Feche TODAS as abas do navegador
3. Abra nova aba e faça login novamente

## 📊 Impacto

### Antes (Bloqueado por RLS):
```
Query: appointments com JOIN em profiles
Supabase RLS: ❌ Bloqueia acesso a profiles de outros usuários
Resultado: patient: null
```

### Depois (Liberado pela Nova Política):
```
Query: appointments com JOIN em profiles  
Supabase RLS: ✅ Permite se existe agendamento
Resultado: patient: { full_name: "Paciente", ... }
```

## ⚠️ Segurança

Esta política **mantém a segurança** porque:

1. ✅ Clínicas só veem pacientes **com agendamentos seus**
2. ✅ Pacientes não podem ver perfis de outros pacientes
3. ✅ Cada usuário sempre pode ver seu próprio perfil
4. ✅ Não expõe dados de pacientes sem relacionamento

## 🎯 Próximos Passos

Após executar este script:

1. ✅ Dashboard da clínica mostrará nomes dos pacientes
2. ✅ Não mais "Paciente não encontrado"
3. ✅ Dados completos disponíveis no console
4. 🔄 Remover logs de debug do código (opcional)

---

**Data**: 27/10/2025  
**Autor**: GitHub Copilot  
**Problema Original**: RLS bloqueando JOINs em profiles  
**Status**: Aguardando execução
