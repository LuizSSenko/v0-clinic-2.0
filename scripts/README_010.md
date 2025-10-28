# Script 010 - Verificar e Corrigir Perfis Ausentes

## Problema Identificado

Os agendamentos têm `patient_id` válidos, mas o Supabase não consegue carregar os dados do paciente porque **os perfis não existem na tabela `profiles`**.

Exemplo do console:
```
⚠️ Agendamento 0 (ID: 03a55322-...) não tem paciente associado. 
patient_id: 70c5899d-c1e1-428f-bb46-f80d734197ed
```

## Causa do Problema

O trigger `handle_new_user()` que deveria criar o perfil automaticamente pode ter falhado em alguns casos, deixando usuários no `auth.users` sem perfil correspondente em `profiles`.

## Como Executar

### Passo 1: Verificar o problema

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute a **primeira query** do arquivo `010_check_missing_profiles.sql`:

```sql
SELECT 
    a.id as appointment_id,
    a.patient_id,
    p.full_name as patient_name,
    CASE WHEN p.id IS NULL THEN 'PERFIL AUSENTE' ELSE 'OK' END as status
FROM appointments a
LEFT JOIN profiles p ON a.patient_id = p.id
WHERE p.id IS NULL;
```

Se retornar linhas, significa que há agendamentos com pacientes sem perfil.

### Passo 2: Verificar usuários sem perfil

Execute a **segunda query**:

```sql
SELECT 
    u.id,
    u.email,
    CASE WHEN p.id IS NULL THEN 'PERFIL AUSENTE' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

Isso mostra quais usuários existem no `auth.users` mas não têm perfil em `profiles`.

### Passo 3: Corrigir - Criar perfis ausentes

Execute a **terceira query** (o INSERT):

```sql
INSERT INTO profiles (id, email, full_name, user_type)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário Sem Nome') as full_name,
    COALESCE(u.raw_user_meta_data->>'user_type', 'patient')::text as user_type
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

Esta query cria perfis para todos os usuários que não têm.

### Passo 4: Verificar a correção

Execute a **quarta query** para confirmar que agora todos os agendamentos têm pacientes:

```sql
SELECT 
    a.id as appointment_id,
    a.patient_id,
    p.full_name as patient_name,
    p.email as patient_email,
    CASE WHEN p.id IS NULL THEN 'PERFIL AUSENTE' ELSE 'OK' END as status
FROM appointments a
LEFT JOIN profiles p ON a.patient_id = p.id
ORDER BY a.appointment_date DESC;
```

Todos devem mostrar `status = 'OK'`.

## Após a Correção

1. Recarregue a página do dashboard da clínica
2. Clique no nome da profissional
3. Agora os nomes dos pacientes devem aparecer corretamente ao invés de "Paciente não encontrado"

## Prevenção Futura

O trigger `handle_new_user()` já foi corrigido com tratamento de erros (script 006), então novos usuários não devem ter este problema.

## Observação

Se alguns pacientes ainda aparecerem como "Usuário Sem Nome", isso significa que eles não preencheram o nome completo durante o cadastro. Eles podem atualizar no botão "⚙️ Configurações" do dashboard.
