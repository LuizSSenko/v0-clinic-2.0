"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Filter, CalendarDays, CalendarRange } from "lucide-react"
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
  professionals?: Array<{ id: string; name: string; specialty?: string }>
  onAppointmentClick?: (appointment: Appointment) => void
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]
const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function WeeklyCalendar({ appointments, professionals = [], onAppointmentClick }: WeeklyCalendarProps) {
  const [view, setView] = useState<"week" | "month">("week")

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMondayOf(new Date()))

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [professionalFilter, setProfessionalFilter] = useState<string>("all")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Unique specialties from registered professionals
  const availableSpecialties = Array.from(
    new Set(professionals.map((p) => p.specialty).filter((s): s is string => !!s))
  ).sort()

  // ── Shared filter logic ───────────────────────────────────────────────
  const passesFilters = (apt: Appointment) => {
    if (statusFilter === "active" && apt.status === "cancelled") return false
    if (statusFilter !== "all" && statusFilter !== "active" && apt.status !== statusFilter) return false
    if (professionalFilter !== "all" && apt.professional_id !== professionalFilter) return false
    if (specialtyFilter !== "all" && apt.professional?.specialty !== specialtyFilter) return false
    return true
  }

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments
      .filter((apt) => apt.appointment_date === dateStr && passesFilters(apt))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // ── Week view helpers ─────────────────────────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  const previousWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() - 7)
    setCurrentWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + 7)
    setCurrentWeekStart(d)
  }

  const goToToday = () => {
    setCurrentWeekStart(getMondayOf(new Date()))
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    setCurrentMonthDate(d)
  }

  const formatWeekTitle = () => {
    const first = weekDays[0]
    const last = weekDays[6]
    if (first.getMonth() === last.getMonth()) {
      return `${MONTH_NAMES[first.getMonth()]} de ${first.getFullYear()}`
    }
    return `${MONTH_NAMES[first.getMonth()]} – ${MONTH_NAMES[last.getMonth()]} de ${first.getFullYear()}`
  }

  // ── Month view helpers ────────────────────────────────────────────────
  const previousMonth = () => {
    const d = new Date(currentMonthDate)
    d.setMonth(d.getMonth() - 1)
    setCurrentMonthDate(d)
  }

  const nextMonth = () => {
    const d = new Date(currentMonthDate)
    d.setMonth(d.getMonth() + 1)
    setCurrentMonthDate(d)
  }

  /** Build a grid of Date|null cells for the month (Sunday-first columns) */
  const buildMonthGrid = () => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startPad = firstDay.getDay() // 0 = Sunday
    const totalDays = lastDay.getDate()

    const cells: (Date | null)[] = []
    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  const monthGrid = buildMonthGrid()
  const monthTitle = `${MONTH_NAMES[currentMonthDate.getMonth()]} de ${currentMonthDate.getFullYear()}`

  /** Click on a day count badge → switch to week view at that day's week */
  const handleMonthDayClick = (date: Date) => {
    setCurrentWeekStart(getMondayOf(date))
    setView("week")
  }

  // ── Common helpers ────────────────────────────────────────────────────
  const isToday = (date: Date) => {
    const t = new Date()
    return (
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      scheduled: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Agendado" },
      confirmed: { className: "bg-green-100 text-green-800 border-green-200", label: "Confirmado" },
      cancelled: { className: "bg-white text-red-700 border-red-300", label: "Cancelado" },
      completed: { className: "bg-gray-100 text-gray-700 border-gray-200", label: "Concluído" },
    }
    const config = variants[status] || variants.scheduled
    return (
      <Badge variant="outline" className={`text-[10px] ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <CardTitle className="text-xl">
            {view === "week" ? "Calendário da Semana" : "Calendário Mensal"}
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggle */}
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                className="rounded-none gap-1.5"
                onClick={() => setView("week")}
              >
                <CalendarDays className="h-4 w-4" />
                Semana
              </Button>
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                className="rounded-none gap-1.5"
                onClick={() => setView("month")}
              >
                <CalendarRange className="h-4 w-4" />
                Mês
              </Button>
            </div>

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
            <Button
              variant="outline"
              size="icon"
              onClick={view === "week" ? previousWeek : previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {view === "week" ? formatWeekTitle() : monthTitle}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={view === "week" ? nextWeek : nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">
                  Status do Agendamento
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue />
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
              <div className="space-y-2">
                <Label htmlFor="professional-filter" className="text-sm font-medium">
                  Profissional
                </Label>
                <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                  <SelectTrigger id="professional-filter">
                    <SelectValue />
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
              <div className="space-y-2">
                <Label htmlFor="specialty-filter" className="text-sm font-medium">
                  Especialidade
                </Label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger id="specialty-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Especialidades</SelectItem>
                    {availableSpecialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              {appointments.filter(passesFilters).length} de {appointments.length} agendamentos
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* ── WEEK VIEW ────────────────────────────────────────────── */}
        {view === "week" && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, index) => {
              const dayAbbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
              const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
              const dayAppointments = getAppointmentsForDay(date)
              const today = isToday(date)

              return (
                <div
                  key={index}
                  className={`border rounded-lg overflow-hidden ${today ? "ring-2 ring-primary" : ""}`}
                >
                  <div
                    className={`p-2 text-center ${
                      today ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="text-xs font-medium">{dayAbbr[date.getDay()]}</div>
                    <div className="text-lg font-bold">{date.getDate()}</div>
                    <div className="text-[10px]">{monthAbbr[date.getMonth()]}</div>
                  </div>
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
                            <div className="font-semibold text-[11px]">
                              {apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}
                            </div>
                            <div
                              className="font-medium truncate"
                              title={apt.patient?.full_name}
                            >
                              {apt.patient?.full_name || "Paciente não encontrado"}
                            </div>
                            <div
                              className="text-[10px] text-muted-foreground truncate"
                              title={apt.professional?.name}
                            >
                              {apt.professional?.name || "Profissional"}
                            </div>
                            {apt.professional?.specialty && (
                              <div className="text-[9px] text-muted-foreground truncate">
                                {apt.professional.specialty}
                              </div>
                            )}
                            <div className="pt-1">{getStatusBadge(apt.status)}</div>
                            {apt.notes && (
                              <div
                                className="text-[9px] text-muted-foreground italic truncate"
                                title={apt.notes}
                              >
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
        )}

        {/* ── MONTH VIEW ───────────────────────────────────────────── */}
        {view === "month" && (
          <div>
            {/* Day-of-week header row */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES_SHORT.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {monthGrid.map((date, i) => {
                if (!date) {
                  return <div key={`pad-${i}`} className="bg-muted/30 min-h-[80px]" />
                }

                const count = getAppointmentsForDay(date).length
                const today = isToday(date)
                const isCurrentMonth = date.getMonth() === currentMonthDate.getMonth()

                return (
                  <button
                    key={i}
                    onClick={() => handleMonthDayClick(date)}
                    title="Clique para ver a semana"
                    className={`bg-background min-h-[80px] p-2 flex flex-col w-full text-left cursor-pointer transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      !isCurrentMonth ? "opacity-40" : ""
                    } ${today ? "ring-2 ring-inset ring-primary" : ""}`}
                  >
                    {/* Day number */}
                    <span
                      className={
                        today
                          ? "text-xs font-semibold self-start w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
                          : "text-sm font-medium self-start leading-none"
                      }
                    >
                      {date.getDate()}
                    </span>

                    {/* Appointment count badge */}
                    {count > 0 && (
                      <span className="mt-auto self-start">
                        <Badge
                          variant="secondary"
                          className="text-sm font-bold bg-primary text-primary-foreground border border-primary shadow-sm px-2.5 py-0.5"
                        >
                          {count}
                        </Badge>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Clique em qualquer dia para ver a semana correspondente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
