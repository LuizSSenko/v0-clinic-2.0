# Como Executar o Script 009 - Adicionar Campos de Endereço

## Instruções

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `009_add_user_address_fields.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

## O que este script faz

Este script adiciona os seguintes campos à tabela `profiles`:

- **address**: Endereço completo (rua, número, complemento)
- **city**: Cidade
- **state**: Estado (UF - 2 caracteres)
- **zip_code**: CEP (formato: 00000-000)

Todos os campos são opcionais (NULL permitido) para não afetar perfis existentes.

## Após executar

Após executar o script com sucesso, você pode:

1. Usar o botão "Configurações" no dashboard do paciente
2. Preencher as informações de endereço
3. Salvar as alterações

As informações ficarão armazenadas no perfil do usuário.
