import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Footer } from "@/components/shared/footer"
import { Calendar, Clock, Users, MessageSquare, BookOpen } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ClinicApp</span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href="/tutorial">
                <BookOpen className="mr-2 h-4 w-4" />
                Tutorial
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center flex-1">
        <h1 className="text-5xl font-bold tracking-tight text-balance mb-6">Agendamento Clínico Simplificado</h1>
        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
          Conecte pacientes e clínicas de forma eficiente. Gerencie consultas, profissionais e comunicação em um só
          lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Começar Agora</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/login">Fazer Login</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/tutorial">
              <BookOpen className="mr-2 h-4 w-4" />
              Ver Tutorial
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Agendamento Fácil</h3>
            <p className="text-sm text-muted-foreground">
              Pacientes podem agendar consultas nos horários disponíveis de forma rápida e intuitiva.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gestão de Profissionais</h3>
            <p className="text-sm text-muted-foreground">
              Clínicas gerenciam profissionais, especialidades e disponibilidade de horários.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Controle de Horários</h3>
            <p className="text-sm text-muted-foreground">
              Defina expedientes, bloqueie horários para almoço ou reuniões facilmente.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Comunicação Direta</h3>
            <p className="text-sm text-muted-foreground">
              Troque mensagens sobre agendamentos entre pacientes e clínicas.
            </p>
          </div>
        </div>

      {/* Footer */}
      <Footer />
      </section>
    </div>
  )
}
