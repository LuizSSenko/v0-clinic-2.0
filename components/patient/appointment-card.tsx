"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, X, MessageSquare } from "lucide-react"

interface AppointmentCardProps {
  appointment: any
  onCancel?: (id: string) => void
  onMessage?: (appointment: any) => void
  showCancel?: boolean
}

export function AppointmentCard({ appointment, onCancel, onMessage, showCancel }: AppointmentCardProps) {
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{appointment.professional.name}</CardTitle>
            <CardDescription>{appointment.professional.specialty}</CardDescription>
          </div>
          <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
            {statusLabels[appointment.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{appointment.professional.clinic.clinic_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString("pt-BR")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {appointment.start_time} - {appointment.end_time}
          </span>
        </div>
        {appointment.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {onMessage && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => onMessage(appointment)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Mensagens
            </Button>
          )}
          {showCancel && appointment.status === "scheduled" && (
            <Button variant="destructive" size="sm" className="flex-1" onClick={() => onCancel?.(appointment.id)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
