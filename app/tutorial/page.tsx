import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  UserPlus, 
  Search,
  CheckCircle,
  Settings,
  FileText,
  Bell,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function TutorialPage() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ClinicApp</span>
          </div>
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      {/* Tutorial Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Tutorial - Primeiros Passos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Aprenda a usar o ClinicApp em poucos minutos. Escolha seu perfil abaixo para começar.
          </p>
        </div>

        <Tabs defaultValue="patient" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="patient" className="text-base">
              <Users className="mr-2 h-4 w-4" />
              Tutorial para Pacientes
            </TabsTrigger>
            <TabsTrigger value="clinic" className="text-base">
              <Calendar className="mr-2 h-4 w-4" />
              Tutorial para Clínicas
            </TabsTrigger>
          </TabsList>

          {/* Tutorial para Pacientes */}
          <TabsContent value="patient" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">1</span>
                  Criar sua Conta
                </CardTitle>
                <CardDescription>Comece cadastrando-se no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Cadastro Inicial</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Cadastrar" na página inicial e preencha seus dados: nome completo, email, telefone e endereço. 
                      Escolha uma senha segura e confirme que você é um <strong>Paciente</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Confirmação de Email</p>
                    <p className="text-sm text-muted-foreground">
                      Após o cadastro, verifique sua caixa de entrada para confirmar seu email. Isso garante a segurança da sua conta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">2</span>
                  Buscar e Agendar Consultas
                </CardTitle>
                <CardDescription>Encontre profissionais disponíveis e agende sua consulta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Buscar Profissionais</p>
                    <p className="text-sm text-muted-foreground">
                      Na sua dashboard, use a busca para encontrar profissionais por nome ou especialidade. 
                      Você verá todos os profissionais cadastrados no sistema.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Ver Horários Disponíveis</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Agendar" no profissional desejado. Um calendário interativo mostrará os horários disponíveis. 
                      Dias com disponibilidade aparecem em destaque.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Confirmar Agendamento</p>
                    <p className="text-sm text-muted-foreground">
                      Escolha o dia e horário ideal, adicione observações se necessário (motivo da consulta, sintomas) e confirme. 
                      Você receberá uma notificação de confirmação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">3</span>
                  Gerenciar suas Consultas
                </CardTitle>
                <CardDescription>Acompanhe, reagende ou cancele seus agendamentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Visualizar Consultas</p>
                    <p className="text-sm text-muted-foreground">
                      Na aba "Minhas Consultas", você vê todas as suas consultas agendadas, confirmadas e histórico completo. 
                      Use os filtros para buscar por status ou período.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Reagendar ou Cancelar</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em qualquer consulta para ver detalhes. Você pode reagendar para outro horário disponível 
                      ou cancelar se necessário. A clínica será notificada automaticamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">4</span>
                  Comunicação com a Clínica
                </CardTitle>
                <CardDescription>Troque mensagens e envie arquivos sobre suas consultas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Chat Integrado</p>
                    <p className="text-sm text-muted-foreground">
                      Dentro de cada consulta, você pode abrir o chat para conversar com a clínica. 
                      Tire dúvidas, informe mudanças ou envie documentos (exames, receitas, etc.).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Envio de Arquivos</p>
                    <p className="text-sm text-muted-foreground">
                      Você pode enviar arquivos de até 10MB (PDF, Word, imagens). Útil para compartilhar 
                      exames, documentos ou imagens relacionadas à consulta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">5</span>
                  Configurações da Conta
                </CardTitle>
                <CardDescription>Atualize seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Editar Perfil</p>
                    <p className="text-sm text-muted-foreground">
                      Acesse "Configurações" para atualizar nome, telefone, endereço ou alterar sua senha. 
                      Mantenha seus dados sempre atualizados para melhor comunicação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorial para Clínicas */}
          <TabsContent value="clinic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">1</span>
                  Cadastro da Clínica
                </CardTitle>
                <CardDescription>Configure sua clínica no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Criar Conta da Clínica</p>
                    <p className="text-sm text-muted-foreground">
                      Na página de cadastro, escolha o tipo <strong>Clínica</strong> e preencha: nome da clínica, 
                      CNPJ, telefone, email, endereço completo e dados de contato. Crie uma senha segura.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Ativação da Conta</p>
                    <p className="text-sm text-muted-foreground">
                      Confirme o email de verificação. Após o login, você será direcionado para configurar 
                      sua clínica antes de começar a receber agendamentos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">2</span>
                  Cadastrar Profissionais
                </CardTitle>
                <CardDescription>Adicione médicos e especialistas da sua clínica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Adicionar Profissional</p>
                    <p className="text-sm text-muted-foreground">
                      Na aba "Profissionais", clique em "+ Novo Profissional". Preencha nome, especialidade 
                      (ex: Cardiologista, Ortopedista), registro profissional e outras informações relevantes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Gerenciar Profissionais</p>
                    <p className="text-sm text-muted-foreground">
                      Você pode editar informações, desativar temporariamente ou remover profissionais. 
                      Cada profissional tem sua própria grade de horários.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">3</span>
                  Configurar Disponibilidade
                </CardTitle>
                <CardDescription>Defina horários de atendimento e bloqueios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Horários de Expediente</p>
                    <p className="text-sm text-muted-foreground">
                      Para cada profissional, configure os dias da semana e horários de atendimento. 
                      Defina o intervalo entre consultas (ex: 30 minutos, 1 hora). Você pode ter grades diferentes por dia.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Bloquear Horários</p>
                    <p className="text-sm text-muted-foreground">
                      Bloqueie horários para almoço, reuniões ou férias. Use "Bloqueio Único" para datas específicas 
                      ou "Bloqueio Recorrente" para bloqueios que se repetem (ex: toda terça das 12h às 13h).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Visualização no Calendário</p>
                    <p className="text-sm text-muted-foreground">
                      O calendário semanal mostra todos os horários disponíveis, agendados e bloqueados de forma visual. 
                      Fácil de identificar lacunas ou sobrecarga de horários.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">4</span>
                  Gerenciar Agendamentos
                </CardTitle>
                <CardDescription>Controle as consultas dos pacientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Visualizar Consultas</p>
                    <p className="text-sm text-muted-foreground">
                      Na aba "Calendário Geral", você vê todas as consultas agendadas. Use filtros para ver por 
                      profissional, status (Agendada, Confirmada, Cancelada, Concluída) ou período.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Confirmar e Atualizar Status</p>
                    <p className="text-sm text-muted-foreground">
                      Clique em qualquer consulta para ver detalhes completos do paciente e observações. 
                      Você pode confirmar, reagendar, cancelar ou marcar como concluída após o atendimento.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Notificações Automáticas</p>
                    <p className="text-sm text-muted-foreground">
                      Quando você confirma ou altera uma consulta, o paciente recebe notificação por email automaticamente. 
                      Isso mantém todos informados em tempo real.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">5</span>
                  Sistema de Mensagens
                </CardTitle>
                <CardDescription>Comunicação direta com os pacientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Aba de Mensagens</p>
                    <p className="text-sm text-muted-foreground">
                      Na aba "Mensagens", você vê todas as conversas com pacientes organizadas por consulta. 
                      Conversas com mensagens não lidas aparecem em destaque.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Filtros Inteligentes</p>
                    <p className="text-sm text-muted-foreground">
                      Filtre conversas por status da consulta ou período de tempo. Útil para priorizar 
                      consultas confirmadas ou próximas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Troca de Arquivos</p>
                    <p className="text-sm text-muted-foreground">
                      Receba exames, documentos ou imagens dos pacientes. Envie orientações, receitas ou 
                      resultados. Todos os arquivos ficam salvos no histórico da consulta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">6</span>
                  Configurações da Clínica
                </CardTitle>
                <CardDescription>Mantenha os dados da clínica atualizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Editar Informações</p>
                    <p className="text-sm text-muted-foreground">
                      Atualize o nome da clínica, telefones de contato, endereço, horário de funcionamento geral 
                      e outras informações que os pacientes veem ao buscar profissionais.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Preferências de Notificação</p>
                    <p className="text-sm text-muted-foreground">
                      Configure como deseja receber notificações de novos agendamentos, cancelamentos ou mensagens. 
                      Mantenha-se sempre informado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-card rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Agora que você conhece o sistema, crie sua conta e comece a usar o ClinicApp hoje mesmo!
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Criar Conta Grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Já tenho uma conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ClinicApp. Sistema de Agendamento Clínico.</p>
        </div>
      </footer>
    </div>
  )
}
