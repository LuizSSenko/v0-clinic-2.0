"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Appointment {
  id: string
  patient_id: string
  professional_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: "scheduled" | "confirmed" | "cancelled" | "completed"
  notes?: string
  patient?: {
    full_name: string
    email: string
  }
  professional?: {
    name: string
    specialty: string
  }
}

interface WeeklyCalendarProps {
  appointments: Appointment[]
  professionals?: Array<{ id: string; name: string }>
  onAppointmentClick?: (appointment: Appointment) => void
}

export function WeeklyCalendar({ appointments, professionals = [], onAppointmentClick }: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Segunda-feira
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  // Estados de filtro
  const [statusFilter, setStatusFilter] = useState<string>("active") // "all", "active", "scheduled", "confirmed", "cancelled", "completed"
  const [professionalFilter, setProfessionalFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Gerar array com os 7 dias da semana (seg a dom)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  // Navegar semanas
  const previousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  // Filtrar agendamentos por dia E por filtros
  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments
      .filter((apt) => {
        // Filtro por data
        if (apt.appointment_date !== dateStr) return false

        // Filtro por status
        if (statusFilter === "active") {
          // "active" = tudo exceto cancelado
          if (apt.status === "cancelled") return false
        } else if (statusFilter !== "all") {
          // Filtro específico (scheduled, confirmed, cancelled, completed)
          if (apt.status !== statusFilter) return false
        }

        // Filtro por profissional
        if (professionalFilter !== "all") {
          if (apt.professional_id !== professionalFilter) return false
        }

        return true
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Formatar data
  const formatDate = (date: Date) => {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    return {
      dayName: dayNames[date.getDay()],
      day: date.getDate(),
      month: monthNames[date.getMonth()],
    }
  }

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Badge de status com cores LEGÍVEIS
  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { className: string; label: string }
    > = {
      scheduled: { 
        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200", 
        label: "Agendado" 
      },
      confirmed: { 
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200", 
        label: "Confirmado" 
      },
      cancelled: { 
        className: "bg-white text-red-700 border-red-300 dark:bg-gray-900 dark:text-red-400 dark:border-red-800", 
        label: "Cancelado" 
      },
      completed: { 
        className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300", 
        label: "Concluído" 
      },
    }
    const config = variants[status] || variants.scheduled
    return (
      <Badge variant="outline" className={`text-[10px] ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  // Formatar mês/ano
  const formatMonthYear = () => {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    const firstDay = weekDays[0]
    const lastDay = weekDays[6]
    
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${monthNames[firstDay.getMonth()]} de ${firstDay.getFullYear()}`
    } else {
      return `${monthNames[firstDay.getMonth()]} - ${monthNames[lastDay.getMonth()]} de ${firstDay.getFullYear()}`
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">Calendário da Semana</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">{formatMonthYear()}</span>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro de Status */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">
                  Status do Agendamento
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativos (Sem Cancelados)</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="scheduled">Apenas Agendados</SelectItem>
                    <SelectItem value="confirmed">Apenas Confirmados</SelectItem>
                    <SelectItem value="cancelled">Apenas Cancelados</SelectItem>
                    <SelectItem value="completed">Apenas Concluídos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Profissional */}
              <div className="space-y-2">
                <Label htmlFor="professional-filter" className="text-sm font-medium">
                  Profissional
                </Label>
                <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                  <SelectTrigger id="professional-filter">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Profissionais</SelectItem>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-sm text-muted-foreground text-center">
              {(() => {
                const filtered = appointments.filter((apt) => {
                  if (statusFilter === "active" && apt.status === "cancelled") return false
                  if (statusFilter !== "all" && statusFilter !== "active" && apt.status !== statusFilter)
                    return false
                  if (professionalFilter !== "all" && apt.professional_id !== professionalFilter) return false
                  return true
                })
                return `Mostrando ${filtered.length} de ${appointments.length} agendamentos`
              })()}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dateInfo = formatDate(date)
            const dayAppointments = getAppointmentsForDay(date)
            const today = isToday(date)

            return (
              <div
                key={index}
                className={`border rounded-lg overflow-hidden ${today ? "ring-2 ring-primary" : ""}`}
              >
                {/* Cabeçalho do dia */}
                <div className={`p-2 text-center ${today ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="text-xs font-medium">{dateInfo.dayName}</div>
                  <div className="text-lg font-bold">{dateInfo.day}</div>
                  <div className="text-[10px]">{dateInfo.month}</div>
                </div>

                {/* Lista de agendamentos */}
                <ScrollArea className="h-[500px]">
                  <div className="p-1 space-y-1">
                    {dayAppointments.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-4">
                        Sem agendamentos
                      </div>
                    ) : (
                      dayAppointments.map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => onAppointmentClick?.(apt)}
                          className={`w-full text-left p-2 rounded border text-xs space-y-1 transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                            apt.status === "cancelled"
                              ? "bg-destructive/10 border-destructive/20 hover:bg-destructive/20"
                              : apt.status === "confirmed"
                                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900 hover:bg-green-100"
                                : "bg-background hover:bg-muted"
                          }`}
                        >
                          {/* Horário */}
                          <div className="font-semibold text-[11px]">
                            {apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}
                          </div>

                          {/* Paciente */}
                          <div className="font-medium truncate" title={apt.patient?.full_name}>
                            {apt.patient?.full_name || "Paciente não encontrado"}
                          </div>

                          {/* Profissional */}
                          <div className="text-[10px] text-muted-foreground truncate" title={apt.professional?.name}>
                            {apt.professional?.name || "Profissional"}
                          </div>

                          {/* Especialidade */}
                          {apt.professional?.specialty && (
                            <div className="text-[9px] text-muted-foreground truncate">
                              {apt.professional.specialty}
                            </div>
                          )}

                          {/* Status */}
                          <div className="pt-1">{getStatusBadge(apt.status)}</div>

                          {/* Observações (se houver) */}
                          {apt.notes && (
                            <div className="text-[9px] text-muted-foreground italic truncate" title={apt.notes}>
                              {apt.notes}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
