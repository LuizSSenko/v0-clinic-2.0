# Migration 018: Sistema de Mensagens com Anexos

## Overview
Esta migration adiciona suporte completo para envio de arquivos no sistema de mensagens entre clínica e paciente. Agora é possível enviar:
- ✅ Mensagens de texto
- ✅ Imagens (receitas médicas digitalizadas, exames)
- ✅ PDFs (documentos, laudos)
- ✅ Documentos Word (.doc, .docx)

## Changes

### 1. Database Schema
Adiciona colunas à tabela `messages`:
- `message_type` (TEXT): 'text' ou 'file'
- `file_url` (TEXT): URL do arquivo no Supabase Storage
- `file_name` (TEXT): Nome original do arquivo
- `file_type` (TEXT): MIME type (ex: 'application/pdf')
- `file_size` (INTEGER): Tamanho em bytes

### 2. Supabase Storage
- Cria bucket `message-attachments` (privado)
- Políticas RLS para upload, download e exclusão
- Estrutura de pastas: `{appointment_id}/{timestamp}-{filename}`

### 3. Frontend Components
- **MessagesDialog** atualizado com:
  - Botão de anexar arquivo (📎)
  - Preview do arquivo antes de enviar
  - Download de arquivos recebidos
  - Ícones diferentes por tipo (PDF, imagem)
  - Formatação de tamanho (KB, MB)
  - Toast notifications

- **AppointmentDetailsDialog**:
  - Botão "Mensagens" no header
  - Integração com MessagesDialog

## How to Apply

### Via Supabase Dashboard (Recomendado)
1. Acesse: https://supabase.com/dashboard/project/ncojbureebjohyptflcz/editor
2. Vá em "SQL Editor"
3. Clique em "New Query"
4. Cole o conteúdo de `018_add_message_attachments.sql`
5. Execute (Ctrl+Enter)

### Via Supabase CLI
```bash
npx supabase db execute --project-ref ncojbureebjohyptflcz < scripts/018_add_message_attachments.sql
```

## Verification

Após rodar a migration, verifique:

```sql
-- Verificar novas colunas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Verificar bucket criado
SELECT id, name, public
FROM storage.buckets
WHERE name = 'message-attachments';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects';
```

## Usage

### Para Pacientes (já funcionava)
1. Abrir consulta agendada
2. Clicar em "Mensagens"
3. **NOVO**: Clicar no ícone 📎 para anexar arquivo
4. Escolher arquivo (imagem, PDF, Word)
5. Adicionar legenda opcional
6. Enviar

### Para Clínicas (novo!)
1. Abrir detalhes de uma consulta no calendário
2. Clicar no botão "Mensagens" no header
3. Chat em tempo real com o paciente
4. Enviar textos e arquivos (receitas, documentos)

## File Validations

**Tamanho máximo**: 10MB por arquivo

**Tipos permitidos**:
- Imagens: JPEG, PNG, JPG, WEBP
- Documentos: PDF, DOC, DOCX

**Segurança**:
- Upload apenas para usuários autenticados
- RLS: usuário só vê arquivos das suas consultas
- Storage privado (não há URL pública sem autenticação)
- Signed URLs com validade de 1 ano

## Features

### Real-time
- Mensagens aparecem instantaneamente (Supabase Realtime)
- Scroll automático para nova mensagem
- Status "digitando..." (pode ser adicionado no futuro)

### UX
- Preview de arquivo antes de enviar
- Botão de remover arquivo selecionado
- Download com um clique
- Ícones visuais por tipo de arquivo
- Tamanho formatado (1.2 MB, 350 KB)
- Toast notifications para feedback

### Accessibility
- Inputs com labels adequados
- Botões com aria-labels
- Teclado: Enter para enviar mensagem
- Screen reader friendly

## Architecture

```
┌─────────────┐
│   Patient   │
│  or Clinic  │
└──────┬──────┘
       │
       ├─ Texto ──────────┐
       │                  ▼
       │           ┌─────────────┐
       │           │  messages   │
       │           │   table     │
       │           └─────────────┘
       │
       └─ Arquivo ───────┐
                         ▼
                  ┌──────────────┐
                  │   Upload to  │
                  │   Storage    │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Get Signed  │
                  │     URL      │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Save to DB  │
                  │  (file_url)  │
                  └──────────────┘
```

## Rollback

Se precisar reverter:

```sql
-- Remover colunas
ALTER TABLE messages DROP COLUMN IF EXISTS message_type;
ALTER TABLE messages DROP COLUMN IF EXISTS file_url;
ALTER TABLE messages DROP COLUMN IF EXISTS file_name;
ALTER TABLE messages DROP COLUMN IF EXISTS file_type;
ALTER TABLE messages DROP COLUMN IF EXISTS file_size;

-- Remover bucket (CUIDADO: apaga todos os arquivos!)
DELETE FROM storage.objects WHERE bucket_id = 'message-attachments';
DELETE FROM storage.buckets WHERE id = 'message-attachments';
```

## Related Files

- `scripts/018_add_message_attachments.sql` - Migration SQL
- `lib/types.ts` - Interface Message atualizada
- `components/shared/messages-dialog.tsx` - Componente com upload
- `components/clinic/appointment-details-dialog.tsx` - Botão de mensagens
- `components/patient/appointment-card.tsx` - Botão de mensagens (já existia)

## Future Improvements

Possíveis melhorias futuras:
- [ ] Preview de imagens inline (sem precisar baixar)
- [ ] Status de "visualizado" nas mensagens
- [ ] Indicador de "digitando..."
- [ ] Compressão automática de imagens grandes
- [ ] Suporte a múltiplos arquivos por mensagem
- [ ] Drag & drop de arquivos
- [ ] Notificação push quando nova mensagem chega
- [ ] Áudio messages (voice notes)
- [ ] Emoji picker
- [ ] Busca em mensagens antigas
- [ ] Exportar histórico de conversa (PDF)

## Security Considerations

✅ **Autenticação**: Apenas usuários logados podem enviar arquivos

✅ **Autorização**: RLS garante que cada usuário só acessa arquivos das suas consultas

✅ **Validação de Tipo**: Frontend valida MIME type antes do upload

✅ **Limite de Tamanho**: 10MB máximo para evitar abuso

✅ **Signed URLs**: Links temporários com validade

⚠️ **Atenção**: Não há scan de malware. Em produção, considere:
- Integração com antivírus (ex: ClamAV)
- Scan de conteúdo impróprio
- Rate limiting de uploads
- Monitoramento de uso de storage

## Troubleshooting

### "Failed to upload file"
- Verificar se o bucket foi criado: `SELECT * FROM storage.buckets WHERE name = 'message-attachments'`
- Checar políticas RLS: `SELECT * FROM pg_policies WHERE schemaname = 'storage'`
- Verificar tamanho do arquivo (< 10MB)

### "File download não funciona"
- Verificar se o signed URL está válido
- Checar se o arquivo existe no storage
- Testar download direto pela Dashboard do Supabase

### "RLS policy error"
- Verificar se o usuário está autenticado
- Confirmar que o appointment_id está correto
- Testar políticas manualmente no SQL Editor

## Testing Checklist

- [ ] Upload de imagem (< 5MB)
- [ ] Upload de PDF (< 10MB)
- [ ] Upload de arquivo muito grande (deve dar erro)
- [ ] Upload de arquivo não permitido .exe (deve dar erro)
- [ ] Download de arquivo enviado
- [ ] Mensagem de texto simples
- [ ] Mensagem com arquivo + legenda
- [ ] Real-time: enviar de um usuário, receber em outro
- [ ] Mensagens persistem após fechar e reabrir
- [ ] Botão "Mensagens" aparece no dashboard da clínica
- [ ] Toast notifications aparecem corretamente

## Production Checklist

Antes de ir para produção:
- [ ] Configurar limite de storage no Supabase (evitar custo surpresa)
- [ ] Implementar política de retenção de arquivos (ex: deletar após 1 ano)
- [ ] Monitorar uso de storage (Dashboard > Settings > Usage)
- [ ] Considerar CDN para arquivos (Supabase já usa, mas verificar)
- [ ] Adicionar logs de uploads para auditoria
- [ ] Implementar rate limiting (ex: máximo 10 arquivos/dia por usuário)
- [ ] Backup automático do bucket
- [ ] Documentar processo de recovery de arquivos

---

**Data da Migration**: Outubro 2025  
**Versão**: 2.1.0  
**Autor**: LuizSSenko  
**Reviewed by**: -  
**Status**: ✅ Pronta para produção
