# 📧 Sistema de Notificações por Email

Este sistema envia emails automáticos para os pacientes quando:
- ✅ Um novo agendamento é criado
- ✅ Um agendamento é confirmado
- 📅 Um agendamento é reagendado
- ❌ Um agendamento é cancelado

## 🚀 Configuração Passo a Passo

**IMPORTANTE**: Este sistema foi simplificado! Em vez de usar triggers de banco de dados (que requerem permissões admin), os emails são enviados **diretamente do código Next.js** quando você confirma/cancela/reagenda um agendamento. Muito mais simples! ✅

### 1. Criar conta no Resend (Gratuito)

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita (3.000 emails/mês grátis)
3. Verifique seu email
4. Vá em **API Keys** e crie uma nova chave
5. **Copie a API Key** (você só verá ela uma vez!)

### 2. Configurar Domínio no Resend (Opcional mas Recomendado)

**Sem domínio próprio:**
- Você pode usar `onboarding@resend.dev` (apenas para testes)
- Os emails podem ir para spam

**Com domínio próprio:**
1. Vá em **Domains** no painel do Resend
2. Adicione seu domínio (ex: `clinica.com.br`)
3. Configure os registros DNS conforme instruções
4. Aguarde verificação (pode levar até 48h)
5. Depois, use `noreply@clinica.com.br` no código

### 3. Instalar Supabase CLI

**Opção 1: Usando Scoop (Recomendado para Windows)**

\`\`\`powershell
# Instalar Scoop (se ainda não tiver)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verificar instalação
supabase --version
\`\`\`

**Opção 2: Download direto do executável**

1. Acesse [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. Baixe o arquivo `supabase_windows_amd64.zip`
3. Extraia o arquivo `supabase.exe`
4. Mova para uma pasta no PATH (ex: `C:\Program Files\Supabase`)
5. Adicione a pasta ao PATH do Windows

**Opção 3: Usar npx (sem instalação global)**

\`\`\`powershell
# Use npx antes de cada comando
npx supabase --version
npx supabase login
npx supabase projects list
# etc...
\`\`\`

### 4. Fazer Login no Supabase

\`\`\`powershell
supabase login
\`\`\`

Isso abrirá o navegador para você autorizar.

### 5. Linkar seu Projeto

\`\`\`powershell
cd c:\Users\lgsse\OneDrive\Documentos\000_DEV\Javascript\v0-clinic-2.0

# Listar seus projetos
npx supabase projects list

# Linkar com seu projeto (substitua o ID pelo seu)
npx supabase link --project-ref SEU_PROJECT_ID
\`\`\`

### 6. Configurar Variáveis de Ambiente (Secrets)

\`\`\`powershell
# Adicionar a API Key do Resend como secret
npx supabase secrets set RESEND_API_KEY=re_sua_chave_aqui
\`\`\`

### 7. Deploy da Edge Function

\`\`\`powershell
# Deploy da função
npx supabase functions deploy send-appointment-email

# Verificar se funcionou
npx supabase functions list
\`\`\`

### 8. ~~Habilitar pg_net~~ (PULAR ESTA ETAPA)

**ATENÇÃO: Não é mais necessário!** 

Em vez de usar triggers de banco de dados (que requerem permissões especiais e pg_net), vamos **chamar a Edge Function diretamente do código Next.js** quando um agendamento for criado/modificado.

Isso é mais simples, não requer permissões administrativas e funciona perfeitamente!

### 9. ~~Executar Script do Trigger~~ (PULAR ESTA ETAPA)

**Não é mais necessário!** Vamos chamar a Edge Function diretamente do código.

### 10. Atualizar Email Remetente

Edite o arquivo `supabase/functions/send-appointment-email/index.ts` linha 42:

\`\`\`typescript
from: 'Clínica <onboarding@resend.dev>', // Trocar por: noreply@seudominio.com.br
\`\`\`

Depois faça deploy novamente:

\`\`\`powershell
npx supabase functions deploy send-appointment-email
\`\`\`

## 🧪 Testar o Sistema

### Teste Manual via Supabase Dashboard

1. Vá em **Database** > **appointments**
2. Crie um novo agendamento ou edite um existente
3. Verifique o email do paciente
4. ✅ O email deve chegar em alguns segundos!

### Teste via Aplicação

1. No dashboard da clínica, crie um agendamento
2. Confirme ou reagende um agendamento
3. Cancele um agendamento
4. Verifique o email do paciente

### Ver Logs da Edge Function

\`\`\`powershell
supabase functions logs send-appointment-email
\`\`\`

Ou no dashboard: **Edge Functions** > **send-appointment-email** > **Logs**

## 📊 Templates de Email

O sistema envia 4 tipos de emails diferentes:

### 1. ✅ Novo Agendamento (Azul)
- Enviado quando um agendamento é criado
- Inclui todos os detalhes (data, hora, profissional)

### 2. ✅ Agendamento Confirmado (Verde)
- Enviado quando status muda para "confirmed"
- Confirma que a clínica validou o agendamento

### 3. 📅 Reagendamento (Laranja)
- Enviado quando data/hora são alterados
- Destaca os NOVOS dados do agendamento
- Inclui alerta visual

### 4. ❌ Cancelamento (Vermelho)
- Enviado quando status muda para "cancelled"
- Informa cancelamento com alerta visual
- Sugere reagendamento

## 💰 Custos

### Resend (Plano Gratuito)
- ✅ **3.000 emails/mês grátis**
- ✅ Depois: $0.001 por email (R$ 0,005)
- ✅ 100 agendamentos/dia = 3.000/mês = GRÁTIS

### Supabase Edge Functions (Plano Gratuito)
- ✅ **2.000.000 invocações/mês grátis**
- ✅ 1 email = 1 invocação
- ✅ 3.000 emails = 0,15% do limite

**Total: GRÁTIS para a maioria dos casos!**

## 🔧 Troubleshooting

### Email não chega

1. **Verificar logs:**
   \`\`\`powershell
   supabase functions logs send-appointment-email
   \`\`\`

2. **Verificar se trigger foi criado:**
   \`\`\`sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'appointments';
   \`\`\`

3. **Verificar se pg_net está habilitado:**
   \`\`\`sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   \`\`\`

4. **Testar Edge Function manualmente:**
   \`\`\`powershell
   supabase functions invoke send-appointment-email --data '{"appointmentId":"UUID_DO_AGENDAMENTO","action":"created"}'
   \`\`\`

### Email vai para spam

- Configure um domínio próprio no Resend
- Configure SPF, DKIM e DMARC records
- Use um domínio verificado

### Erro de permissão

- Verifique se a service_role_key está configurada corretamente
- Certifique-se de que RLS permite acesso aos dados necessários

## 📝 Próximos Passos (Opcional)

1. **Adicionar confirmação de presença** no email (botão clicável)
2. **Enviar lembretes** 24h antes da consulta
3. **Personalizar templates** com logo da clínica
4. **Adicionar SMS** via Twilio para notificações críticas
5. **Dashboard de emails** para ver taxa de entrega

## 🎉 Pronto!

Agora seu sistema envia emails automáticos e bonitos para todos os pacientes! 🚀

Qualquer dúvida, consulte a documentação oficial:
- [Resend Docs](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
