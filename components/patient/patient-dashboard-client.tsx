"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Profile } from "@/lib/types"
import { Calendar, Clock, LogOut, Plus, Settings } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AppointmentCard } from "./appointment-card"
import { BookAppointmentDialog } from "./book-appointment-dialog"
import { MessagesDialog } from "../shared/messages-dialog"
import { SettingsDialog } from "./settings-dialog"
import { ThemeToggle } from "../shared/theme-toggle"

interface PatientDashboardClientProps {
  profile: Profile
  initialAppointments: any[]
}

export function PatientDashboardClient({ profile, initialAppointments }: PatientDashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [currentProfile, setCurrentProfile] = useState(profile)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [bookDialogOpen, setBookDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return

    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId)

    if (!error) {
      setAppointments(appointments.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt)))
      
      // Enviar email de notificação de cancelamento
      try {
        await supabase.functions.invoke('send-appointment-email', {
          body: { appointmentId, action: 'cancelled' }
        })
        console.log("📧 Email de cancelamento enviado ao paciente")
      } catch (emailError) {
        console.error("⚠️ Erro ao enviar email (não bloqueia o cancelamento):", emailError)
      }
    }
  }

  const handleAppointmentBooked = (newAppointment: any) => {
    setAppointments([...appointments, newAppointment])
  }

  const handleOpenMessages = (appointment: any) => {
    setSelectedAppointment(appointment)
    setMessagesDialogOpen(true)
  }

  const upcomingAppointments = appointments.filter(
    (apt) => {
      const aptDate = new Date(apt.appointment_date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return apt.status === "scheduled" && aptDate >= today
    }
  )

  const pastAppointments = appointments.filter(
    (apt) => {
      const aptDate = new Date(apt.appointment_date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return apt.status === "completed" || aptDate < today
    }
  )

  const cancelledAppointments = appointments.filter((apt) => apt.status === "cancelled")

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-semibold">Olá, {currentProfile.full_name}</h1>
            <p className="text-sm text-muted-foreground">Seus agendamentos</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setSettingsDialogOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button size="lg" onClick={() => setBookDialogOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Agendar Consulta
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              Próximas ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              <Clock className="mr-2 h-4 w-4" />
              Anteriores ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas ({cancelledAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    onMessage={handleOpenMessages}
                    showCancel
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Você não tem consultas agendadas</p>
                  <Button onClick={() => setBookDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agendar Consulta
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-6">
            {pastAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} onMessage={handleOpenMessages} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma consulta anterior</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4 mt-6">
            {cancelledAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} onMessage={handleOpenMessages} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">Nenhuma consulta cancelada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BookAppointmentDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
        onAppointmentBooked={handleAppointmentBooked}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        profile={currentProfile}
        onProfileUpdated={setCurrentProfile}
      />

      {selectedAppointment && (
        <MessagesDialog
          open={messagesDialogOpen}
          onOpenChange={setMessagesDialogOpen}
          appointment={selectedAppointment}
          userType="patient"
        />
      )}
    </div>
  )
}
