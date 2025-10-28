# 🏥 V0 Clinic 2.0 - Sistema de Agendamento Médico

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/luizssenkos-projects/v0-clinic-appointment-app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

Sistema completo de gerenciamento de consultas médicas com agendamento online, notificações por email e painel administrativo para clínicas.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Como Funciona](#-como-funciona)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Banco de Dados](#-banco-de-dados)
- [Sistema de Emails](#-sistema-de-emails)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)

---

## 🎯 Visão Geral

**V0 Clinic 2.0** é uma plataforma moderna e completa para gestão de consultas médicas que conecta clínicas e pacientes de forma eficiente. O sistema oferece:

- **Para Pacientes**: Interface intuitiva para agendar consultas, visualizar histórico e receber notificações automáticas
- **Para Clínicas**: Painel administrativo completo com calendário semanal, gestão de profissionais, horários e configurações

### 🎬 Demo ao Vivo
**[https://vercel.com/luizssenkos-projects/v0-clinic-appointment-app](https://vercel.com/luizssenkos-projects/v0-clinic-appointment-app)**

---

## ✨ Funcionalidades

### 👤 Para Pacientes

#### 📅 Agendamento Inteligente
- **Sistema de disponibilidade em tempo real**
  - Visualização de horários disponíveis por profissional
  - Bloqueio automático de horários conflitantes
  - Calendário interativo com navegação mensal
  - Duração média de consulta configurável por profissional

- **Gestão de Consultas**
  - Visualização de consultas em abas: Próximas / Anteriores / Canceladas
  - Cancelamento de consultas com confirmação
  - Badge visual de status (Agendada/Cancelada/Confirmada/Concluída)

#### 📧 Notificações por Email
Emails automáticos e responsivos em **4 situações**:
1. **Consulta Agendada** (azul) - Confirmação imediata ao criar agendamento
2. **Consulta Confirmada** (verde) - Quando a clínica confirma o horário
3. **Consulta Reagendada** (laranja) - Notificação de mudança de data/horário
4. **Consulta Cancelada** (vermelho) - Aviso de cancelamento

Cada email inclui:
- 📅 Data e horário da consulta
- 👨‍⚕️ Nome e especialidade do profissional
- 🏥 Nome, endereço, telefone e email da clínica
- 📝 Observações (quando aplicável)

#### ⚙️ Configurações de Perfil
- Edição de dados pessoais (nome, telefone)
- Gerenciamento de endereço completo (rua, cidade, estado, CEP)
- Interface amigável com validação de campos

---

### 🏥 Para Clínicas

#### 📊 Dashboard Administrativo

**Aba 1: Calendário Geral** 🗓️
- **Visualização Semanal Completa**
  - Grade de 7 dias com todos os agendamentos
  - Navegação: Semana Anterior / Próxima / Hoje
  - Cards coloridos por status de consulta
  
- **Filtros Avançados**
  - Por Status: Todos / Ativos (exclui canceladas) / Apenas Canceladas
  - Por Profissional: Ver agenda específica ou todos
  - Contador de consultas por dia
  
- **Interatividade**
  - Clique no agendamento para ver detalhes completos
  - Ações rápidas: Confirmar / Reagendar / Cancelar
  - Atualização em tempo real

**Aba 2: Gestão de Profissionais** 👨‍⚕️
- **CRUD Completo de Profissionais**
  - Cadastro: Nome, especialidade, duração média de consulta
  - Edição e exclusão com confirmação
  - Visualização em tabela responsiva

- **Gestão de Disponibilidade**
  - Configuração de horários por dia da semana
  - Múltiplos horários por dia (ex: manhã e tarde)
  - Edição e remoção de períodos de disponibilidade

- **Bloqueios de Horário**
  - **Bloqueios Pontuais**: Data específica (ex: férias, feriados)
  - **Bloqueios Recorrentes**: Dia da semana (ex: todas as quartas-feiras)
  - Horário customizável (início e fim)
  - Campo opcional para motivo do bloqueio

#### 📋 Diálogo de Detalhes da Consulta
Ao clicar em um agendamento no calendário:

- **Visualização Completa**
  - Dados do paciente (nome, email, telefone, endereço)
  - Informações do profissional
  - Data, horário e observações

- **Modo de Edição**
  - Reagendamento com calendário interativo
  - Validação: data >= hoje, início < fim
  - Edição de observações
  - Preview das mudanças antes de salvar

- **Ações Disponíveis**
  - ✅ **Confirmar Consulta**: Altera status para "confirmada" + envia email
  - ♻️ **Reagendar**: Atualiza data/hora + envia email de notificação
  - ❌ **Cancelar**: Muda status para "cancelada" + envia email ao paciente

- **Confirmações Customizadas**
  - Diálogos claros com botões "Não" e "Sim, [Ação]"
  - Toast notifications para feedback de sucesso/erro

#### ⚙️ Configurações da Clínica
- **Informações de Contato**
  - Nome da clínica (obrigatório)
  - Endereço completo (exibido nos emails)
  - Telefone de contato
  - Email institucional
  
- **Uso nos Emails**
  - Todas as informações aparecem automaticamente nos emails enviados
  - Atualização em tempo real

---

## 🛠️ Tecnologias

### Frontend
- **[Next.js 15.2.4](https://nextjs.org/)** - Framework React com App Router
- **[React 19.0.0](https://react.dev/)** - Biblioteca UI com Client Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS 3.4.1](https://tailwindcss.com/)** - Estilização utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI acessíveis e customizáveis
- **[Lucide React](https://lucide.dev/)** - Ícones modernos
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications elegantes

### Backend & Infraestrutura
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database com Row Level Security (RLS)
  - Authentication (Email/Password)
  - Edge Functions (Deno runtime)
  - Real-time subscriptions
  
- **[Supabase Edge Functions](https://supabase.com/docs/guides/functions)** - Serverless Functions
  - Runtime: Deno
  - Deploy: Supabase CLI
  - CORS configurado para integração com Next.js

- **[Resend](https://resend.com/)** - Serviço de envio de emails
  - 3.000 emails gratuitos/mês
  - Templates HTML responsivos
  - API simples e confiável

### DevOps & Deploy
- **[Vercel](https://vercel.com/)** - Hospedagem do frontend
- **[Git/GitHub](https://github.com/)** - Controle de versão
- **[pnpm](https://pnpm.io/)** - Gerenciador de pacotes eficiente

---

## 🏗️ Arquitetura

### Fluxo de Dados

\`\`\`
┌─────────────────┐
│   Next.js App   │
│  (Vercel Edge)  │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌────────────────┐  ┌──────────────────┐
│   Supabase     │  │  Supabase Edge   │
│   PostgreSQL   │  │    Function      │
│   + Auth       │  │  (send-email)    │
└────────────────┘  └────────┬─────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Resend API     │
                    │  (Email Sender) │
                    └─────────────────┘
\`\`\`

### Fluxo de Email (Exemplo: Cancelamento)

1. **Paciente/Clínica** clica em "Cancelar Consulta"
2. **Next.js Client** atualiza status no banco: `UPDATE appointments SET status='cancelled'`
3. **Next.js Client** chama Edge Function: `supabase.functions.invoke('send-appointment-email')`
4. **Edge Function** busca dados completos: appointment + patient + professional + clinic
5. **Edge Function** gera HTML do email com template vermelho
6. **Edge Function** envia via Resend API
7. **Resend** entrega email ao paciente
8. **Toast Notification** confirma sucesso ao usuário

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS implementadas:

- **Pacientes**: Só veem suas próprias consultas
- **Clínicas**: Só veem consultas dos seus profissionais
- **Profissionais**: Vinculados à clínica que os cadastrou
- **Disponibilidade/Bloqueios**: Só a clínica dona pode editar

---

## 🚀 Como Funciona

### 1️⃣ Cadastro e Autenticação

**Onde?** `/app/auth/sign-up/page.tsx` e `/app/auth/login/page.tsx`

**Como?**
1. Usuário escolhe tipo de conta: Paciente ou Clínica
2. Preenche: email, senha, nome completo
3. Supabase Auth cria usuário
4. **Trigger automático** cria registro em `profiles` e `clinics` (se for clínica)

**Quando?** Primeiro acesso ao sistema

**Por quê?** Separação de permissões e contextos (paciente vs clínica)

---

### 2️⃣ Agendamento de Consulta (Visão Paciente)

**Onde?** `components/patient/book-appointment-dialog.tsx`

**Como funciona?**

1. **Seleção de Profissional**
   - Query busca todos os profissionais da clínica
   - Exibe: nome + especialidade
   
2. **Seleção de Data**
   - Calendário interativo (próximos 60 dias)
   - Desabilita domingos e datas passadas
   
3. **Seleção de Horário**
   - **Query complexa** verifica:
     - Disponibilidade do profissional no dia da semana
     - Horários já agendados (evita conflito)
     - Bloqueios pontuais (data específica)
     - Bloqueios recorrentes (dia da semana)
   - Gera slots de 30min baseado em `average_appointment_duration`
   - Exibe apenas horários livres
   
4. **Confirmação**
   - Insere em `appointments` com status "scheduled"
   - **Chama Edge Function** para enviar email de confirmação
   - Toast de sucesso
   - Atualiza lista de consultas

**Quando?** Paciente quer marcar uma consulta

**Por quê?** Evita duplos agendamentos e conflitos de horário

---

### 3️⃣ Calendário Semanal (Visão Clínica)

**Onde?** `components/clinic/weekly-calendar.tsx`

**Como funciona?**

1. **Carregamento de Dados**
   \`\`\`typescript
   // Query com JOINs
   const { data } = await supabase
     .from('appointments')
     .select(`
       *,
       patient:profiles(full_name),
       professional:professionals(name, specialty)
     `)
     .gte('appointment_date', startDate)
     .lte('appointment_date', endDate)
   \`\`\`

2. **Renderização**
   - Grid de 7 colunas (uma por dia da semana)
   - Cards ordenados por horário
   - Cores por status:
     - 🟦 Azul: scheduled
     - 🟩 Verde: confirmed  
     - ⬜ Branco fundo + texto vermelho: cancelled
     - 🟪 Roxo: completed

3. **Filtros em Tempo Real**
   - Status: Lógica cliente-side com `.filter()`
   - Profissional: Recarrega dados do banco

4. **Clique no Card**
   - Passa objeto appointment para diálogo de detalhes
   - Abre modal sobreposto

**Quando?** Clínica quer visão geral da semana

**Por quê?** Facilita gestão e identificação rápida de consultas

---

### 4️⃣ Detalhes e Gestão de Consulta

**Onde?** `components/clinic/appointment-details-dialog.tsx`

**Como funciona?**

#### Modo Visualização
- Exibe dados do paciente (com scroll se necessário)
- Mostra profissional, data, horário, observações
- 3 botões de ação + botão Editar

#### Modo Edição
\`\`\`typescript
const [isEditing, setIsEditing] = useState(false)
\`\`\`
- Campos editáveis: data, horário início/fim, observações
- Validações:
  - Data >= hoje
  - Hora início < hora fim
  - Formato HH:MM
  
#### Ações com Email Integrado

**Confirmar Consulta:**
\`\`\`typescript
const handleConfirm = async () => {
  // 1. Atualiza banco
  await supabase.from('appointments')
    .update({ status: 'confirmed' })
  
  // 2. Envia email
  await sendAppointmentEmail(appointment.id, 'confirmed')
  
  // 3. Feedback
  toast.success('Consulta confirmada!')
}
\`\`\`

**Reagendar:**
- Salva nova data/hora/observações
- Email template laranja com destaque de "Nova Data"
- Atualiza calendário automaticamente

**Cancelar:**
- Confirmação customizada (botões "Não" e "Sim, Cancelar")
- Email template vermelho
- Remove do calendário de ativos (se filtro estiver em "active")

**Quando?** Clínica precisa gerenciar uma consulta específica

**Por quê?** Centraliza todas as ações em um só lugar + notifica paciente

---

### 5️⃣ Sistema de Emails Automáticos

**Onde?** `supabase/functions/send-appointment-email/index.ts`

**Como funciona?**

#### 1. Chamada da Edge Function
\`\`\`typescript
// Do Next.js Client
await supabase.functions.invoke('send-appointment-email', {
  body: { 
    appointmentId: 'uuid-here',
    action: 'created' | 'confirmed' | 'rescheduled' | 'cancelled'
  }
})
\`\`\`

#### 2. Processamento na Edge Function
\`\`\`typescript
// 1. Busca dados completos com JOIN
const { data: appointment } = await supabase
  .from('appointments')
  .select(`
    *,
    patient:profiles(full_name, email),
    professional:professionals(
      name, specialty,
      clinic:clinics(clinic_name, address, phone, email)
    )
  `)
  .eq('id', appointmentId)
  .single()

// 2. Prepara template HTML baseado na action
const emailData = prepareEmailData(appointment, action)

// 3. Envia via Resend
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'onboarding@resend.dev',
    to: appointment.patient.email,
    subject: emailData.subject,
    html: emailData.html
  })
})
\`\`\`

#### 3. Templates HTML Responsivos

Cada template inclui:
- Header colorido (cor varia por action)
- Blocos de informação com ícones
- Dados da clínica (nome, endereço, telefone, email)
- Footer com aviso "Email automático"

**Helper Function:**
\`\`\`typescript
const clinicInfoBlock = `
  <div class="detail">
    <div class="label">🏥 Clínica:</div>
    <div><strong>${clinic_name}</strong></div>
    <div>${address || 'Endereço não informado'}</div>
    ${phone ? `<div>📞 ${phone}</div>` : ''}
    ${email ? `<div>📧 ${email}</div>` : ''}
  </div>
`
\`\`\`

#### 4. Tratamento de Erros
- Emails são **não-bloqueantes**: se falharem, a operação principal (agendar/cancelar) ainda funciona
- Logs no console para debugging
- Try-catch em todas as chamadas

**Quando?** Após qualquer mudança em um agendamento

**Por quê?** 
- Mantém paciente informado
- Reduz no-shows (faltas)
- Profissionaliza a comunicação
- Histórico automático por email

---

### 6️⃣ Gestão de Disponibilidade

**Onde?** `components/clinic/availability-form-dialog.tsx`

**Como funciona?**

1. **Cadastro de Horário Regular**
   \`\`\`typescript
   {
     professional_id: 'uuid',
     day_of_week: 'monday',
     start_time: '09:00',
     end_time: '12:00'
   }
   \`\`\`
   - Permite múltiplos períodos por dia (ex: 09:00-12:00 + 14:00-18:00)

2. **Validações**
   - Hora início < hora fim
   - Formato HH:MM
   - Não permite sobreposição (verificado no backend)

3. **Uso no Agendamento**
   - Query filtra por `day_of_week = dayjs(date).format('dddd').toLowerCase()`
   - Gera slots baseado no período de disponibilidade

**Quando?** Clínica define horário de trabalho do profissional

**Por quê?** Evita agendamentos fora do horário de atendimento

---

### 7️⃣ Bloqueios de Horário

**Onde?** `components/clinic/blocked-time-form-dialog.tsx`

**Como funciona?**

#### Bloqueio Pontual (Data Específica)
\`\`\`typescript
{
  professional_id: 'uuid',
  date: '2025-11-15',
  start_time: '00:00',
  end_time: '23:59',
  reason: 'Férias',
  is_recurring: false
}
\`\`\`

#### Bloqueio Recorrente (Dia da Semana)
\`\`\`typescript
{
  professional_id: 'uuid',
  day_of_week: 'wednesday',
  start_time: '14:00',
  end_time: '18:00',
  reason: 'Reunião semanal',
  is_recurring: true,
  date: null // não tem data específica
}
\`\`\`

**Uso no Agendamento:**
\`\`\`typescript
// Query filtra bloqueios pontuais
.eq('date', selectedDate)
.eq('is_recurring', false)

// Query filtra bloqueios recorrentes
.eq('day_of_week', dayOfWeek)
.eq('is_recurring', true)
\`\`\`

**Quando?** 
- Férias, feriados, eventos (pontual)
- Reuniões semanais, dia de folga fixo (recorrente)

**Por quê?** Flexibilidade para diferentes tipos de indisponibilidade

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- pnpm (ou npm/yarn)
- Conta no Supabase (gratuita)
- Conta no Resend (gratuita - 3k emails/mês)
- Git

### Passo a Passo

\`\`\`bash
# 1. Clone o repositório
git clone https://github.com/LuizSSenko/v0-clinic-2.0.git
cd v0-clinic-2.0

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# 4. Inicie o servidor de desenvolvimento
pnpm dev
\`\`\`

Acesse: http://localhost:3000

---

## ⚙️ Configuração

### 1. Supabase

#### Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Anote: `Project URL` e `anon public key`

#### Rodar Migrations
Acesse: `SQL Editor` no dashboard

Execute os scripts em ordem:
\`\`\`
scripts/001_create_tables.sql
scripts/002_enable_rls.sql
scripts/003_create_profile_trigger.sql
scripts/015_add_confirmed_status.sql
scripts/016_remove_old_triggers.sql
scripts/017_add_clinic_contact_fields.sql
\`\`\`

### 2. Resend (Emails)

\`\`\`bash
# 1. Crie conta em resend.com
# 2. Acesse: API Keys → Create API Key
# 3. Copie a chave (começa com re_)
\`\`\`

### 3. Edge Function

\`\`\`bash
# Instalar Supabase CLI
npx supabase login

# Deploy da função
npx supabase functions deploy send-appointment-email \
  --project-ref SEU_PROJECT_REF \
  --no-verify-jwt

# Configurar secrets
npx supabase secrets set \
  RESEND_API_KEY=re_sua_chave_aqui \
  SUPABASE_URL=https://seu-projeto.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
\`\`\`

### 4. Variáveis de Ambiente

Crie `.env.local`:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key

# Edge Function (apenas se diferente do Supabase URL)
NEXT_PUBLIC_EDGE_FUNCTION_URL=https://seu-projeto.supabase.co/functions/v1
\`\`\`

---

## 📁 Estrutura do Projeto

\`\`\`
v0-clinic-2.0/
├── app/                          # Next.js App Router
│   ├── auth/                     # Páginas de autenticação
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── sign-up-success/
│   │   └── callback/             # Callback do Supabase Auth
│   ├── clinic/                   # Páginas da clínica
│   │   ├── dashboard/            # Dashboard principal
│   │   └── setup/                # Primeira configuração
│   ├── patient/                  # Páginas do paciente
│   │   ├── dashboard/
│   │   └── setup/
│   ├── layout.tsx                # Layout global + Toaster
│   ├── page.tsx                  # Página inicial
│   └── globals.css               # Estilos globais
│
├── components/                   # Componentes React
│   ├── clinic/                   # Componentes específicos da clínica
│   │   ├── clinic-dashboard-client.tsx      # Dashboard principal
│   │   ├── weekly-calendar.tsx              # Calendário semanal
│   │   ├── appointment-details-dialog.tsx   # Modal de detalhes
│   │   ├── professional-form-dialog.tsx     # CRUD profissional
│   │   ├── availability-form-dialog.tsx     # Gestão de horários
│   │   ├── blocked-time-form-dialog.tsx     # Bloqueios
│   │   └── clinic-settings-dialog.tsx       # Configurações
│   │
│   ├── patient/                  # Componentes do paciente
│   │   ├── patient-dashboard-client.tsx
│   │   ├── appointment-card.tsx             # Card de consulta
│   │   ├── book-appointment-dialog.tsx      # Modal de agendamento
│   │   ├── interactive-calendar.tsx
│   │   └── settings-dialog.tsx
│   │
│   ├── shared/                   # Componentes compartilhados
│   │   └── messages-dialog.tsx              # Sistema de mensagens
│   │
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── sonner.tsx           # Toast notifications
│   │   └── ...
│   │
│   └── theme-provider.tsx        # Provider de tema dark/light
│
├── lib/                          # Utilitários e configs
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Funções helper
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (browser)
│       └── server.ts             # Cliente Supabase (server)
│
├── supabase/
│   └── functions/
│       └── send-appointment-email/
│           └── index.ts          # Edge Function de emails
│
├── scripts/                      # SQL Migrations
│   ├── 001_create_tables.sql
│   ├── 002_enable_rls.sql
│   ├── 003_create_profile_trigger.sql
│   ├── 015_add_confirmed_status.sql
│   ├── 016_remove_old_triggers.sql
│   ├── 017_add_clinic_contact_fields.sql
│   └── README_*.md              # Documentação das migrations
│
├── public/                       # Arquivos estáticos
├── styles/                       # CSS adicional
│
├── .env.local                    # Variáveis de ambiente (não commitado)
├── .gitignore
├── components.json               # Config shadcn/ui
├── middleware.ts                 # Middleware do Next.js (auth)
├── next.config.mjs               # Config Next.js
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md                     # Este arquivo
\`\`\`

---

## 🗄️ Banco de Dados

### Schema (PostgreSQL + Supabase)

#### `profiles`
Estende `auth.users` do Supabase Auth
\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'clinic')),
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

#### `clinics`
\`\`\`sql
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id),
  clinic_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,           -- Migration 017
  email TEXT,           -- Migration 017
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

#### `professionals`
\`\`\`sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  average_appointment_duration INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

#### `professional_availability`
\`\`\`sql
CREATE TABLE professional_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN (
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  )),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

#### `blocked_times`
\`\`\`sql
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  date DATE,                    -- NULL se is_recurring=true
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false,
  day_of_week TEXT,             -- Usado apenas se is_recurring=true
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

#### `appointments`
\`\`\`sql
CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'cancelled', 'completed'
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Relacionamentos

\`\`\`
profiles (user_type='clinic')
  ↓ one-to-one
clinics
  ↓ one-to-many
professionals
  ↓ one-to-many
  ├─ professional_availability
  ├─ blocked_times
  └─ appointments
       ↓ many-to-one
     profiles (user_type='patient')
\`\`\`

### Índices Importantes

\`\`\`sql
-- Performance em queries frequentes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_availability_professional ON professional_availability(professional_id);
CREATE INDEX idx_blocked_times_professional ON blocked_times(professional_id);
\`\`\`

### Triggers

#### 1. Criação Automática de Profile
\`\`\`sql
-- Quando usuário se cadastra no Supabase Auth,
-- automaticamente cria registro em profiles e clinics
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
\`\`\`

#### 2. Prevenção de Conflitos
\`\`\`sql
-- Impede agendamentos sobrepostos para o mesmo profissional
CREATE TRIGGER check_appointment_overlap
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION prevent_appointment_overlap();
\`\`\`

---

## 📧 Sistema de Emails

### Arquitetura do Envio

\`\`\`mermaid
graph LR
    A[Next.js Client] -->|supabase.functions.invoke| B[Edge Function]
    B -->|SELECT com JOIN| C[Supabase DB]
    C -->|dados completos| B
    B -->|prepareEmailData| D[Template HTML]
    D -->|POST| E[Resend API]
    E -->|SMTP| F[Email do Paciente]
\`\`\`

### Templates de Email

Todos os templates seguem estrutura similar:

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* CSS inline para compatibilidade com clientes de email */
      body { font-family: Arial, sans-serif; }
      .header { background: [COR]; color: white; }
      .detail { background: white; padding: 10px; }
      .label { font-weight: bold; color: [COR]; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>[TÍTULO]</h1>
      </div>
      <div class="content">
        <p>Olá <strong>[NOME_PACIENTE]</strong>,</p>
        
        <!-- Blocos de informação -->
        <div class="detail">
          <div class="label">📅 Data:</div>
          <div>[DATA_FORMATADA]</div>
        </div>
        
        <!-- ... mais blocos ... -->
        
        <!-- Informações da clínica -->
        <div class="detail">
          <div class="label">🏥 Clínica:</div>
          <div><strong>[CLINIC_NAME]</strong></div>
          <div>[ENDEREÇO]</div>
          <div>📞 [TELEFONE]</div>
          <div>📧 [EMAIL]</div>
        </div>
      </div>
    </div>
  </body>
</html>
\`\`\`

### Cores por Tipo

| Template | Cor Header | Cor Labels | Uso |
|----------|-----------|------------|-----|
| created | #4F46E5 (Azul) | #4F46E5 | Agendamento inicial |
| confirmed | #10B981 (Verde) | #10B981 | Confirmação pela clínica |
| rescheduled | #F59E0B (Laranja) | #F59E0B | Mudança de data/hora |
| cancelled | #EF4444 (Vermelho) | #EF4444 | Cancelamento |

### Configuração do Resend

1. **Criar conta**: [resend.com](https://resend.com)
2. **API Key**: Dashboard → API Keys → Create
3. **Domínio** (opcional para produção):
   - Adicionar domínio verificado
   - Configurar DNS (SPF, DKIM)
   - Usar `noreply@seudominio.com` como sender

**Desenvolvimento**: Use `onboarding@resend.dev` (funciona sem verificação)

### Rate Limits

- **Plano Gratuito**: 3.000 emails/mês, 100 emails/dia
- **Retry**: Edge Function não faz retry automático
- **Fallback**: Se email falhar, operação principal não é afetada

---

## 🚀 Deploy

### Deploy Frontend (Vercel)

\`\`\`bash
# Método 1: Via Vercel CLI
npm i -g vercel
vercel login
vercel

# Método 2: Via GitHub
# 1. Push para GitHub
# 2. Acesse vercel.com → New Project
# 3. Importe repositório
# 4. Configure variáveis de ambiente
# 5. Deploy
\`\`\`

**Variáveis de Ambiente no Vercel:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`

### Deploy Edge Function (Supabase)

\`\`\`bash
# 1. Login
npx supabase login

# 2. Link ao projeto
npx supabase link --project-ref SEU_PROJECT_REF

# 3. Deploy
npx supabase functions deploy send-appointment-email --no-verify-jwt

# 4. Configurar secrets
npx supabase secrets set RESEND_API_KEY=re_xxx
npx supabase secrets set SUPABASE_URL=https://xxx.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
\`\`\`

### Verificação Pós-Deploy

- [ ] Frontend carrega corretamente
- [ ] Login/Cadastro funcionam
- [ ] Agendamento cria consulta no banco
- [ ] Email é recebido após agendamento
- [ ] Calendário exibe consultas
- [ ] Ações (confirmar/cancelar) funcionam
- [ ] Emails são recebidos para todas as ações

---

## 🗺️ Roadmap

### 🔄 Em Desenvolvimento
- [ ] Sistema de mensagens entre paciente e clínica
- [ ] Notificações push (browser)
- [ ] Exportação de relatórios (PDF)

### 🎯 Próximas Features
- [ ] Pagamento online integrado (Stripe)
- [ ] Videochamada para teleconsultas (Twilio/WebRTC)
- [ ] App mobile (React Native)
- [ ] Lembretes automáticos (WhatsApp via Twilio)
- [ ] Dashboard analítico para clínicas
- [ ] Sistema de avaliações (paciente avalia consulta)
- [ ] Multi-idioma (i18n)
- [ ] Tema escuro persistente
- [ ] Integração com calendários (Google Calendar, Outlook)
- [ ] Upload de documentos médicos
- [ ] Prontuário eletrônico

### 🐛 Melhorias Técnicas
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (Plausible/Umami)
- [ ] Rate limiting na Edge Function
- [ ] Cache de queries frequentes
- [ ] Otimização de imagens (next/image)
- [ ] Lazy loading de componentes
- [ ] Service Worker para offline

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Luiz Senko**
- GitHub: [@LuizSSenko](https://github.com/LuizSSenko)
- Projeto: [v0-clinic-2.0](https://github.com/LuizSSenko/v0-clinic-2.0)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## ⚠️ Troubleshooting

### Erro: "Invalid API Key" no Resend
- Verifique se o secret está configurado: `npx supabase secrets list`
- Recrie a API Key no Resend e atualize o secret

### Erro: "CORS policy" ao chamar Edge Function
- Certifique-se de que `corsHeaders` está sendo retornado em todas as responses
- Verifique se a Edge Function foi deployada após adicionar CORS

### Emails não estão sendo enviados
1. Check logs da Edge Function: Dashboard Supabase → Functions → send-appointment-email → Logs
2. Verifique se os secrets estão configurados corretamente
3. Confirme que a query está retornando dados (incluindo phone e email da clínica)

### Horários disponíveis não aparecem
- Verifique se o profissional tem disponibilidade cadastrada para o dia da semana
- Confirme que não há bloqueios cobrindo todo o período
- Check console para erros na query

### "TypeError: Cannot read properties of null"
- Provavelmente dados relacionados (JOIN) estão faltando
- Verifique se todas as tabelas relacionadas têm dados (clinics, professionals, etc)

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Migrations SQL
Toda a documentação detalhada das migrations está em:
- `scripts/README_009.md` - Adição de campos de endereço
- `scripts/README_011_EMERGENCIA.md` - Correção de RLS policies
- `scripts/README_015.md` - Status "confirmed"
- `scripts/README_017.md` - Phone e email da clínica
- `scripts/README_EMAIL_NOTIFICATIONS.md` - Sistema completo de emails

---

## 🙏 Agradecimentos

- [v0.dev](https://v0.dev) pela prototipagem inicial
- [Vercel](https://vercel.com) pela hospedagem
- [Supabase](https://supabase.com) pela infraestrutura de backend
- [Resend](https://resend.com) pelo serviço de emails
- Comunidade Open Source pelos componentes e libraries

---

<div align="center">

**Feito com ❤️ e ☕**

⭐ Se este projeto foi útil, considere dar uma estrela!

</div>
\`\`\`
