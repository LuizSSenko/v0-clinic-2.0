"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Clinic, Professional, ProfessionalAvailability, BlockedTime } from "@/lib/types"
import { Plus, Edit, Trash2, Calendar, Clock, LogOut, Users, MessageSquare, CalendarDays, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { ProfessionalFormDialog } from "./professional-form-dialog"
import { AvailabilityFormDialog, type AvailabilitySubmitData } from "./availability-form-dialog"
import { BlockedTimeFormDialog } from "./blocked-time-form-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { MessagesDialog } from "../shared/messages-dialog"
import { WeeklyCalendar } from "./weekly-calendar"
import { AppointmentDetailsDialog } from "./appointment-details-dialog"
import { ClinicSettingsDialog } from "./clinic-settings-dialog"
import { MessagesTab } from "./messages-tab"

interface ClinicDashboardClientProps {
  clinic: Clinic
  initialProfessionals: Professional[]
}

export function ClinicDashboardClient({ clinic, initialProfessionals }: ClinicDashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [availabilities, setAvailabilities] = useState<ProfessionalAvailability[]>([])
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [allAppointments, setAllAppointments] = useState<any[]>([])

  const [professionalDialogOpen, setProfessionalDialogOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | undefined>()

  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false)

  const [blockedTimeDialogOpen, setBlockedTimeDialogOpen] = useState(false)
  const [editingBlockedTime, setEditingBlockedTime] = useState<BlockedTime | undefined>()

  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false)
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<any>(null)

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  // Carregar todos os agendamentos ao montar o componente
  useEffect(() => {
    loadAllAppointments()
  }, [])

  useEffect(() => {
    if (selectedProfessional) {
      loadAvailabilities(selectedProfessional.id)
      loadBlockedTimes(selectedProfessional.id)
      loadAppointments(selectedProfessional.id)
    }
  }, [selectedProfessional])

  const loadAllAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, email, phone, address, city, state, zip_code),
        professional:professionals(name, specialty, clinic:clinics(clinic_name, address, phone, email))
      `,
      )
      .in("professional_id", professionals.map((p) => p.id))
      .gte("appointment_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) // Últimos 30 dias
      .lte("appointment_date", new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) // Próximos 60 dias
      .order("appointment_date", { ascending: true })

    if (error) {
      console.error("Erro ao carregar todos os agendamentos:", error)
    } else {
      setAllAppointments(data || [])
    }
  }

  const loadAvailabilities = async (professionalId: string) => {
    const { data } = await supabase
      .from("professional_availability")
      .select("*")
      .eq("professional_id", professionalId)
      .order("day_of_week")

    setAvailabilities(data || [])
  }

  const loadBlockedTimes = async (professionalId: string) => {
    const { data } = await supabase
      .from("blocked_times")
      .select("*")
      .eq("professional_id", professionalId)
      .order("date", { ascending: false })

    setBlockedTimes(data || [])
  }

  const loadAppointments = async (professionalId: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, email)
      `,
      )
      .eq("professional_id", professionalId)
      .order("appointment_date", { ascending: false })

    if (error) {
      console.error("Erro ao carregar agendamentos:", error)
    }

    setAppointments(data || [])
  }

  const handleAddProfessional = async (data: Partial<Professional>) => {
    const { data: newProfessional, error } = await supabase
      .from("professionals")
      .insert({
        clinic_id: clinic.id,
        name: data.name!,
        specialty: data.specialty!,
        average_appointment_duration: data.average_appointment_duration!,
      })
      .select()
      .single()

    if (!error && newProfessional) {
      setProfessionals([...professionals, newProfessional])
    }
  }

  const handleEditProfessional = async (data: Partial<Professional>) => {
    const { error } = await supabase
      .from("professionals")
      .update({
        name: data.name,
        specialty: data.specialty,
        average_appointment_duration: data.average_appointment_duration,
      })
      .eq("id", data.id!)

    if (!error) {
      setProfessionals(professionals.map((p) => (p.id === data.id ? { ...p, ...data } : p)))
      if (selectedProfessional?.id === data.id) {
        setSelectedProfessional({ ...selectedProfessional, ...data } as Professional)
      }
    }
  }

  const handleDeleteProfessional = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return

    const { error } = await supabase.from("professionals").delete().eq("id", id)

    if (!error) {
      setProfessionals(professionals.filter((p) => p.id !== id))
      if (selectedProfessional?.id === id) {
        setSelectedProfessional(null)
      }
    }
  }

  const handleAddAvailability = async (data: AvailabilitySubmitData[]) => {
    if (!selectedProfessional) return

    const { error: deleteError } = await supabase
      .from("professional_availability")
      .delete()
      .eq("professional_id", selectedProfessional.id)

    if (deleteError) return

    if (data.length === 0) {
      setAvailabilities([])
      return
    }

    const rows = data.map((d) => ({
      professional_id: selectedProfessional.id,
      day_of_week: d.day_of_week,
      start_time: d.start_time,
      end_time: d.end_time,
    }))

    const { data: inserted, error } = await supabase
      .from("professional_availability")
      .insert(rows)
      .select()

    if (!error && inserted) {
      setAvailabilities(inserted)
    }
  }

  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta disponibilidade?")) return

    const { error } = await supabase.from("professional_availability").delete().eq("id", id)

    if (!error) {
      setAvailabilities(availabilities.filter((a) => a.id !== id))
    }
  }

  const handleAddBlockedTime = async (data: Partial<BlockedTime> | Partial<BlockedTime>[]) => {
    if (!selectedProfessional) return

    // Verificar se é um array (bloqueio recorrente em múltiplos dias) ou um único bloqueio
    if (Array.isArray(data)) {
      // Bloqueios recorrentes (um para cada dia da semana)
      const blockedTimesData = data.map(item => ({
        professional_id: selectedProfessional.id,
        is_recurring: true,
        day_of_week: item.day_of_week,
        start_time: item.start_time!,
        end_time: item.end_time!,
        reason: item.reason,
      }))

      const { data: newBlockedTimes, error } = await supabase
        .from("blocked_times")
        .insert(blockedTimesData)
        .select()

      if (!error && newBlockedTimes) {
        setBlockedTimes([...newBlockedTimes, ...blockedTimes])
      }
    } else {
      // Bloqueio pontual (data específica)
      const { data: newBlockedTime, error } = await supabase
        .from("blocked_times")
        .insert({
          professional_id: selectedProfessional.id,
          is_recurring: false,
          date: data.date!,
          start_time: data.start_time!,
          end_time: data.end_time!,
          reason: data.reason,
        })
        .select()
        .single()

      if (!error && newBlockedTime) {
        setBlockedTimes([newBlockedTime, ...blockedTimes])
      }
    }
  }

  const handleDeleteBlockedTime = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este bloqueio?")) return

    const { error } = await supabase.from("blocked_times").delete().eq("id", id)

    if (!error) {
      setBlockedTimes(blockedTimes.filter((b) => b.id !== id))
    }
  }

  const handleOpenMessages = (appointment: any) => {
    setSelectedAppointment({
      ...appointment,
      professional: {
        ...selectedProfessional,
        clinic: clinic,
      },
    })
    setMessagesDialogOpen(true)
  }

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointmentDetails(appointment)
    setAppointmentDetailsOpen(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const dayLabels: Record<string, string> = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo",
  }

  const statusColors = {
    scheduled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  }

  const statusLabels = {
    scheduled: "Agendada",
    cancelled: "Cancelada",
    completed: "Concluída",
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div>
            <h1 className="text-xl font-semibold">{clinic.clinic_name}</h1>
            <p className="text-sm text-muted-foreground">Painel da Clínica</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsDialogOpen(true)}
            >
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
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendário Geral
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="professionals">
              <Users className="mr-2 h-4 w-4" />
              Profissionais
            </TabsTrigger>
          </TabsList>

          {/* Aba Calendário Geral */}
          <TabsContent value="calendar">
            <WeeklyCalendar 
              appointments={allAppointments} 
              professionals={professionals.map(p => ({ id: p.id, name: p.name }))}
              onAppointmentClick={handleAppointmentClick}
            />
          </TabsContent>

          {/* Aba Mensagens */}
          <TabsContent value="messages">
            <MessagesTab clinicId={clinic.id} />
          </TabsContent>

          {/* Aba Profissionais */}
          <TabsContent value="professionals">
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* Professionals List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profissionais</CardTitle>
                    <Button
                      size="icon-sm"
                      onClick={() => {
                        setEditingProfessional(undefined)
                        setProfessionalDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>Gerencie sua equipe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {professionals.map((professional) => (
                      <button
                        key={professional.id}
                        onClick={() => setSelectedProfessional(professional)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedProfessional?.id === professional.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="font-medium">{professional.name}</div>
                        <div className="text-sm opacity-80">{professional.specialty}</div>
                      </button>
                    ))}
                    {professionals.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum profissional cadastrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

          {/* Professional Details */}
          {selectedProfessional ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedProfessional.name}</CardTitle>
                    <CardDescription>{selectedProfessional.specialty}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => {
                        setEditingProfessional(selectedProfessional)
                        setProfessionalDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => handleDeleteProfessional(selectedProfessional.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="availability">
                  <TabsList className="w-full">
                    <TabsTrigger value="availability" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Disponibilidade
                    </TabsTrigger>
                    <TabsTrigger value="blocked" className="flex-1">
                      <Clock className="mr-2 h-4 w-4" />
                      Bloqueios
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="flex-1">
                      <Users className="mr-2 h-4 w-4" />
                      Agendamentos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="availability" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Horários de atendimento semanais</p>
                      <Button
                        size="sm"
                        onClick={() => setAvailabilityDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Configurar
                      </Button>
                    </div>

                    {availabilities.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Dia</TableHead>
                            <TableHead>Início</TableHead>
                            <TableHead>Término</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availabilities.map((availability) => (
                            <TableRow key={availability.id}>
                              <TableCell>{dayLabels[availability.day_of_week]}</TableCell>
                              <TableCell>{availability.start_time}</TableCell>
                              <TableCell>{availability.end_time}</TableCell>
                              <TableCell>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAvailability(availability.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma disponibilidade configurada
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="blocked" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Horários bloqueados (almoço, reuniões, etc)</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingBlockedTime(undefined)
                          setBlockedTimeDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Bloquear
                      </Button>
                    </div>

                    {blockedTimes.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Início</TableHead>
                            <TableHead>Término</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {blockedTimes.map((blocked) => (
                            <TableRow key={blocked.id}>
                              <TableCell>
                                {blocked.is_recurring 
                                  ? `Todos os ${dayLabels[blocked.day_of_week!]}s`
                                  : new Date(blocked.date!).toLocaleDateString("pt-BR")}
                              </TableCell>
                              <TableCell>{blocked.start_time}</TableCell>
                              <TableCell>{blocked.end_time}</TableCell>
                              <TableCell>{blocked.reason || "-"}</TableCell>
                              <TableCell>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteBlockedTime(blocked.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhum horário bloqueado</p>
                    )}
                  </TabsContent>

                  <TabsContent value="appointments" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Consultas agendadas</p>
                    </div>

                    {appointments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {appointment.patient?.full_name || "Paciente não encontrado"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {appointment.patient?.email || "N/A"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString("pt-BR")}
                              </TableCell>
                              <TableCell>
                                {appointment.start_time} - {appointment.end_time}
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                                  {statusLabels[appointment.status as keyof typeof statusLabels]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button size="icon-sm" variant="ghost" onClick={() => handleOpenMessages(appointment)}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um profissional para gerenciar</p>
                </div>
              </CardContent>
            </Card>
          )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProfessionalFormDialog
        open={professionalDialogOpen}
        onOpenChange={setProfessionalDialogOpen}
        onSubmit={editingProfessional ? handleEditProfessional : handleAddProfessional}
        professional={editingProfessional}
      />

      <AvailabilityFormDialog
        open={availabilityDialogOpen}
        onOpenChange={setAvailabilityDialogOpen}
        onSubmit={handleAddAvailability}
        existingAvailabilities={availabilities}
      />

      <BlockedTimeFormDialog
        open={blockedTimeDialogOpen}
        onOpenChange={setBlockedTimeDialogOpen}
        onSubmit={handleAddBlockedTime}
        blockedTime={editingBlockedTime}
        workingDays={availabilities.map(a => a.day_of_week)}
      />

      {selectedAppointment && (
        <MessagesDialog
          open={messagesDialogOpen}
          onOpenChange={setMessagesDialogOpen}
          appointment={selectedAppointment}
          userType="clinic"
        />
      )}

      {selectedAppointmentDetails && (
        <AppointmentDetailsDialog
          open={appointmentDetailsOpen}
          onOpenChange={setAppointmentDetailsOpen}
          appointment={selectedAppointmentDetails}
          clinicId={clinic.id}
          onUpdate={() => {
            loadAllAppointments()
            if (selectedProfessional) {
              loadAppointments(selectedProfessional.id)
            }
          }}
        />
      )}

      <ClinicSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        clinic={clinic}
        onSettingsUpdated={() => {
          // Recarregar a página para atualizar as informações da clínica
          router.refresh()
        }}
      />
    </div>
  )
}
