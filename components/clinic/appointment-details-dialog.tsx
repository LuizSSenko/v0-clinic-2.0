"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Mail, Phone, MapPin, FileText, X, CalendarDays, AlertTriangle, MessageSquare } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { MessagesDialog } from "../shared/messages-dialog"

// Função helper para enviar email via Edge Function
const sendAppointmentEmail = async (appointmentId: string, action: string) => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke('send-appointment-email', {
      body: { appointmentId, action }
    })
    
    if (error) {
      console.error('Erro ao enviar email:', error)
      // Não bloqueia a operação se o email falhar
    } else {
      console.log('Email enviado com sucesso:', data)
    }
  } catch (err) {
    console.error('Erro ao chamar Edge Function:', err)
    // Não bloqueia a operação se o email falhar
  }
}

interface AppointmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
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
      phone?: string
      address?: string
      city?: string
      state?: string
      zip_code?: string
    }
    professional?: {
      name: string
      specialty: string
    }
  }
  onUpdate?: () => void
}

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  onUpdate,
}: AppointmentDetailsDialogProps) {
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false)
  const [newDate, setNewDate] = useState(appointment.appointment_date)
  const [newStartTime, setNewStartTime] = useState(appointment.start_time.substring(0, 5))
  const [newEndTime, setNewEndTime] = useState(appointment.end_time.substring(0, 5))
  const [notes, setNotes] = useState(appointment.notes || "")
  const [loading, setLoading] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      scheduled: {
        label: "Agendado",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      confirmed: {
        label: "Confirmado",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      cancelled: {
        label: "Cancelado",
        className: "bg-white text-red-700 border-red-300",
      },
      completed: {
        label: "Concluído",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      },
    }
    return configs[status as keyof typeof configs] || configs.scheduled
  }

  const handleCancel = async () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = async () => {
    setShowCancelConfirm(false)

    setLoading(true)
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointment.id)

    setLoading(false)

    if (error) {
      toast.error("Erro ao cancelar agendamento", {
        description: error.message,
      })
    } else {
      // Enviar email de cancelamento
      sendAppointmentEmail(appointment.id, 'cancelled')
      
      toast.success("Agendamento cancelado com sucesso!")
      onUpdate?.()
      onOpenChange(false)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    const { error } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", appointment.id)

    setLoading(false)

    if (error) {
      toast.error("Erro ao confirmar agendamento", {
        description: error.message,
      })
    } else {
      // Enviar email de confirmação
      sendAppointmentEmail(appointment.id, 'confirmed')
      
      toast.success("Agendamento confirmado!")
      onUpdate?.()
      onOpenChange(false)
    }
  }

  const handleReschedule = async () => {
    if (!newDate || !newStartTime || !newEndTime) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha todos os campos de data e horário",
      })
      return
    }

    // Validar horários
    if (newStartTime >= newEndTime) {
      toast.error("Horário inválido", {
        description: "O horário de início deve ser anterior ao horário de término",
      })
      return
    }

    setShowRescheduleConfirm(true)
  }

  const confirmReschedule = async () => {
    setShowRescheduleConfirm(false)

    setLoading(true)
    const { error } = await supabase
      .from("appointments")
      .update({
        appointment_date: newDate,
        start_time: newStartTime + ":00",
        end_time: newEndTime + ":00",
        notes: notes,
      })
      .eq("id", appointment.id)

    setLoading(false)

    if (error) {
      toast.error("Erro ao reagendar", {
        description: error.message,
      })
    } else {
      // Enviar email de reagendamento
      sendAppointmentEmail(appointment.id, 'rescheduled')
      
      toast.success("Agendamento reagendado com sucesso!")
      setIsEditing(false)
      onUpdate?.()
      onOpenChange(false)
    }
  }

  const statusConfig = getStatusConfig(appointment.status)

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">Detalhes do Agendamento</DialogTitle>
              <DialogDescription>
                Visualize e gerencie informações do agendamento
              </DialogDescription>
            </div>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Profissional */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Profissional
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{appointment.professional?.name || "Profissional"}</p>
              <p className="text-muted-foreground">{appointment.professional?.specialty}</p>
            </div>
          </div>

          {/* Informações do Paciente */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Paciente
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{appointment.patient?.full_name || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.patient?.email || "Não informado"}</span>
              </div>
              {appointment.patient?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.patient.phone}</span>
                </div>
              )}
              {(appointment.patient?.address || appointment.patient?.city) && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    {appointment.patient.address && <p>{appointment.patient.address}</p>}
                    {(appointment.patient.city || appointment.patient.state) && (
                      <p className="text-muted-foreground">
                        {appointment.patient.city}
                        {appointment.patient.city && appointment.patient.state && " - "}
                        {appointment.patient.state}
                        {appointment.patient.zip_code && ` | ${appointment.patient.zip_code}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data e Horário */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isEditing ? "Reagendar" : "Data e Horário"}
            </h3>

            {!isEditing ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{formatDate(appointment.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatTime(appointment.start_time)} às {formatTime(appointment.end_time)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-date">Nova Data</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-start-time">Horário Início</Label>
                    <Input
                      id="new-start-time"
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-end-time">Horário Fim</Label>
                    <Input
                      id="new-end-time"
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </h3>
            {!isEditing ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {appointment.notes || "Nenhuma observação registrada"}
              </p>
            ) : (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre o agendamento..."
                rows={3}
              />
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {appointment.status !== "cancelled" && (
            <>
              {!isEditing ? (
                <>
                  {appointment.status === "scheduled" && (
                    <Button onClick={handleConfirm} disabled={loading} variant="default">
                      Confirmar Agendamento
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowMessages(true)}
                    disabled={loading}
                    variant="outline"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mensagens
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                    variant="outline"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Reagendar
                  </Button>
                  <Button onClick={handleCancel} disabled={loading} variant="destructive">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar Agendamento
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleReschedule} disabled={loading}>
                    Salvar Reagendamento
                  </Button>
                  <Button onClick={() => setIsEditing(false)} disabled={loading} variant="outline">
                    Cancelar Edição
                  </Button>
                </>
              )}
            </>
          )}
          {appointment.status === "cancelled" && (
            <p className="text-sm text-muted-foreground">
              Este agendamento foi cancelado e não pode ser modificado.
            </p>
          )}
        </div>
      </DialogContent>

      {/* Diálogo de confirmação de cancelamento */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Confirmar Cancelamento
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              Não
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancel}
              disabled={loading}
            >
              {loading ? "Cancelando..." : "Sim, Cancelar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de reagendamento */}
      <Dialog open={showRescheduleConfirm} onOpenChange={setShowRescheduleConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Confirmar Reagendamento
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja reagendar este agendamento para a nova data e horário selecionados?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRescheduleConfirm(false)}
            >
              Não
            </Button>
            <Button
              type="button"
              onClick={confirmReschedule}
              disabled={loading}
            >
              {loading ? "Reagendando..." : "Sim, Reagendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>

    {/* Dialog de mensagens */}
    {appointment.status !== "cancelled" && (
      <MessagesDialog
        open={showMessages}
        onOpenChange={setShowMessages}
        appointment={appointment}
        userType="clinic"
      />
    )}
    </>
  )
}
