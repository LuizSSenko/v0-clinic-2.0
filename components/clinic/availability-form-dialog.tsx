"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DayOfWeek, ProfessionalAvailability } from "@/lib/types"
import { useState } from "react"

interface AvailabilityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<ProfessionalAvailability>) => Promise<void>
  availability?: ProfessionalAvailability
}

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Segunda-feira" },
  { value: "tuesday", label: "Terça-feira" },
  { value: "wednesday", label: "Quarta-feira" },
  { value: "thursday", label: "Quinta-feira" },
  { value: "friday", label: "Sexta-feira" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
]

export function AvailabilityFormDialog({ open, onOpenChange, onSubmit, availability }: AvailabilityFormDialogProps) {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(availability?.day_of_week || "monday")
  const [startTime, setStartTime] = useState(availability?.start_time || "08:00")
  const [endTime, setEndTime] = useState(availability?.end_time || "17:00")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        id: availability?.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{availability ? "Editar Disponibilidade" : "Adicionar Disponibilidade"}</DialogTitle>
          <DialogDescription>Configure os horários de atendimento</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Dia da Semana</Label>
              <Select value={dayOfWeek} onValueChange={(value) => setDayOfWeek(value as DayOfWeek)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start-time">Horário de Início</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">Horário de Término</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
