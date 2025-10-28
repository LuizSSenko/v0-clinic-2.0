# 🔧 Fix: Adicionar status "confirmed" ao enum

## Problema
Ao tentar confirmar ou reagendar um agendamento, aparece o erro:
```
invalid input value for enum appointment_status: "confirmed"
```

## Solução

Execute o script SQL `015_add_confirmed_status.sql` no **SQL Editor** do Supabase Dashboard.

### Passo a Passo:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **+ New query**
4. Cole o conteúdo do arquivo `scripts/015_add_confirmed_status.sql`
5. Clique em **Run**

### O que o script faz:

- Adiciona o valor `'confirmed'` ao enum `appointment_status`
- Verifica se já existe antes de adicionar (seguro para executar múltiplas vezes)
- Mostra os valores do enum antes e depois

### Valores do enum após executar:

- ✅ `scheduled` - Agendado
- ✅ `confirmed` - Confirmado
- ✅ `cancelled` - Cancelado
- ✅ `completed` - Concluído

### Após executar o script:

O sistema funcionará corretamente e você poderá:
- ✅ Confirmar agendamentos (botão "Confirmar Agendamento")
- ✅ Reagendar agendamentos
- ✅ Ver o badge verde "Confirmado" no calendário
- ✅ Filtrar por agendamentos confirmados

## Verificação

Para verificar se funcionou, execute no SQL Editor:

```sql
SELECT unnest(enum_range(NULL::appointment_status))::text AS status_values;
```

Deve retornar 4 linhas com os 4 status.
