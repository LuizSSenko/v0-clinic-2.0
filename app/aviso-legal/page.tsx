import type { Metadata } from "next"
import { ArrowLeft, BadgeAlert, FileWarning, ShieldAlert } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Aviso Legal e Privacidade | ClinicApp",
  description: "Aviso legal, limitações e condições de uso da plataforma ClinicApp.",
}

export default function AvisoLegalPage() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 via-rose-50 to-amber-50">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ClinicApp</span>
          </Link>
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Aviso legal</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance">Política de Privacidade e Limitações de Uso</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
              Esta página resume pontos importantes sobre o estado atual do software, responsabilidades e uso das informações.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeAlert className="h-5 w-5 text-amber-600" />
                Software em desenvolvimento
              </CardTitle>
              <CardDescription>
                A plataforma ainda pode mudar sem aviso prévio e não deve ser considerada produto final.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                O ClinicApp está em fase de desenvolvimento, testes e ajustes contínuos. Funcionalidades podem ser adicionadas,
                removidas, alteradas ou apresentar comportamento inesperado.
              </p>
              <p>
                As informações exibidas no sistema são fornecidas "como estão". Não garantimos disponibilidade ininterrupta,
                ausência total de falhas, exatidão absoluta ou adequação para qualquer finalidade específica.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-amber-600" />
                Limitação de responsabilidade
              </CardTitle>
              <CardDescription>
                O uso da plataforma é de responsabilidade do usuário e da organização que a opera.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Não nos responsabilizamos por perdas, danos diretos ou indiretos, interrupções de serviço, exclusão de dados,
                decisões tomadas com base nas informações do sistema ou quaisquer prejuízos decorrentes do uso da plataforma.
              </p>
              <p>
                O usuário é responsável por validar informações críticas antes de agir com base nelas, incluindo cadastros,
                agendamentos, mensagens, documentos e configurações operacionais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-emerald-600" />
                Privacidade e dados
              </CardTitle>
              <CardDescription>
                O tratamento de dados deve seguir as configurações aplicadas pela clínica ou pelo responsável pelo uso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                As informações inseridas na plataforma podem ser usadas para permitir o funcionamento do serviço, suporte,
                auditoria e melhorias do sistema.
              </p>
              <p>
                Cada responsável pelo uso deve revisar suas práticas de privacidade, retenção e compartilhamento de dados de
                acordo com a legislação aplicável e com suas próprias políticas internas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condições gerais</CardTitle>
              <CardDescription>
                O acesso e uso contínuo da plataforma significam concordância com os termos aqui descritos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Ao utilizar o sistema, você reconhece que leu e entendeu este aviso, concordando em usar a plataforma por sua
                conta e risco, respeitando seus limites técnicos e operacionais.
              </p>
              <p>
                Se alguma funcionalidade for crítica para sua operação, recomendamos validação manual, backups regulares e
                acompanhamento contínuo antes de depender integralmente do software.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}