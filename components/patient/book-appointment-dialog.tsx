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
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { InteractiveCalendar } from "./interactive-calendar"

interface BookAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentBooked: (appointment: any) => void
}

export function BookAppointmentDialog({ open, onOpenChange, onAppointmentBooked }: BookAppointmentDialogProps) {
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [clinics, setClinics] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [workingDays, setWorkingDays] = useState<string[]>([])

  const [selectedClinic, setSelectedClinic] = useState("")
  const [selectedProfessional, setSelectedProfessional] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (open) {
      loadClinics()
    }
  }, [open])

  useEffect(() => {
    if (selectedClinic) {
      loadProfessionals(selectedClinic)
    }
  }, [selectedClinic])

  useEffect(() => {
    if (selectedProfessional) {
      loadWorkingDays(selectedProfessional)
      setSelectedDate("") // Reset date when professional changes
      setSelectedTime("")
    }
  }, [selectedProfessional])

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      loadAvailableSlots(selectedProfessional, selectedDate)
    }
  }, [selectedProfessional, selectedDate])

  const loadClinics = async () => {
    const { data } = await supabase.from("clinics").select("*").order("clinic_name")
    setClinics(data || [])
  }

  const loadProfessionals = async (clinicId: string) => {
    const { data } = await supabase.from("professionals").select("*").eq("clinic_id", clinicId).order("name")
    setProfessionals(data || [])
  }

  const loadWorkingDays = async (professionalId: string) => {
    const { data } = await supabase
      .from("professional_availability")
      .select("day_of_week")
      .eq("professional_id", professionalId)
    
    setWorkingDays(data?.map(d => d.day_of_week) || [])
  }

  const loadAvailableSlots = async (professionalId: string, date: string) => {
    setLoadingSlots(true)
    try {
      const selectedDate = new Date(date + 'T00:00:00')
      const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

      // Get professional's availability for this day
      const { data: availability } = await supabase
        .from("professional_availability")
        .select("*")
        .eq("professional_id", professionalId)
        .eq("day_of_week", dayOfWeek)
        .single()

      if (!availability) {
        setAvailableSlots([])
        return
      }

      // Get professional info for duration
      const { data: professional } = await supabase
        .from("professionals")
        .select("average_appointment_duration")
        .eq("id", professionalId)
        .single()

      if (!professional) return

      // Get existing appointments for this day
      const { data: existingAppointments } = await supabase
        .from("appointments")
        .select("start_time, end_time")
        .eq("professional_id", professionalId)
        .eq("appointment_date", date)
        .eq("status", "scheduled")

      // Get blocked times for this specific date
      const { data: specificBlockedTimes } = await supabase
        .from("blocked_times")
        .select("start_time, end_time")
        .eq("professional_id", professionalId)
        .eq("is_recurring", false)
        .eq("date", date)

      // Get recurring blocked times for this day of week
      const { data: recurringBlockedTimes } = await supabase
        .from("blocked_times")
        .select("start_time, end_time")
        .eq("professional_id", professionalId)
        .eq("is_recurring", true)
        .eq("day_of_week", dayOfWeek)

      // Combine both types of blocked times
      const allBlockedTimes = [
        ...(specificBlockedTimes || []),
        ...(recurringBlockedTimes || [])
      ]

      // Generate time slots
      const slots = generateTimeSlots(
        availability.start_time,
        availability.end_time,
        professional.average_appointment_duration,
        existingAppointments || [],
        allBlockedTimes,
      )

      setAvailableSlots(slots)
    } finally {
      setLoadingSlots(false)
    }
  }

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    duration: number,
    existingAppointments: any[],
    blockedTimes: any[],
  ) => {
    const slots: string[] = []
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    let currentMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    while (currentMinutes + duration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60)
      const minutes = currentMinutes % 60
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

      // Calculate end time for this slot
      const endSlotMinutes = currentMinutes + duration
      const endHours = Math.floor(endSlotMinutes / 60)
      const endMinutesSlot = endSlotMinutes % 60
      const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMinutesSlot.toString().padStart(2, "0")}`

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((apt) => {
        return timeStr < apt.end_time && endTimeStr > apt.start_time
      })

      // Check if slot conflicts with blocked times
      const isBlocked = blockedTimes.some((blocked) => {
        return timeStr < blocked.end_time && endTimeStr > blocked.start_time
      })

      if (!hasConflict && !isBlocked) {
        slots.push(timeStr)
      }

      currentMinutes += duration
    }

    return slots
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("=== INÍCIO DO AGENDAMENTO ===")
    console.log("Estado atual:", {
      selectedClinic,
      selectedProfessional,
      selectedDate,
      selectedTime,
      notes
    })

    // Validações
    if (!selectedClinic) {
      alert("Por favor, selecione uma clínica")
      return
    }

    if (!selectedProfessional) {
      alert("Por favor, selecione um profissional")
      return
    }

    if (!selectedDate) {
      alert("Por favor, selecione uma data")
      return
    }

    if (!selectedTime) {
      alert("Por favor, selecione um horário")
      return
    }

    setIsLoading(true)

    try {
      // Validar que a data não é passada
      const selectedDateObj = new Date(selectedDate + 'T00:00:00')
      const todayObj = new Date()
      todayObj.setHours(0, 0, 0, 0)
      
      if (selectedDateObj < todayObj) {
        alert('Não é possível agendar consultas em datas passadas.')
        setIsLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get professional info for duration
      console.log("🔍 Buscando informações do profissional:", selectedProfessional)
      const { data: professional, error: profError } = await supabase
        .from("professionals")
        .select("average_appointment_duration")
        .eq("id", selectedProfessional)
        .single()

      console.log("📋 Profissional carregado:", professional)

      if (profError || !professional) {
        console.error("❌ Erro ao buscar profissional:", profError)
        alert("Erro ao buscar informações do profissional")
        return
      }

      // Calculate end time - usar 30 minutos como padrão se não tiver duração
      const duration = Number((professional as any).average_appointment_duration) || 30
      console.log("⏱️ Duração da consulta:", duration, "minutos")
      
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + duration
      const endHours = Math.floor(endMinutes / 60)
      const endMinutesSlot = endMinutes % 60
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutesSlot.toString().padStart(2, "0")}`
      
      console.log("🕐 Horários calculados:", { 
        inicio: selectedTime, 
        fim: endTime, 
        duracao: duration 
      })

      const { data: newAppointment, error } = await supabase
        .from("appointments")
        .insert({
          patient_id: user.id,
          professional_id: selectedProfessional,
          appointment_date: selectedDate,
          start_time: selectedTime,
          end_time: endTime,
          status: "scheduled",
          notes: notes || null,
        })
        .select(
          `
          *,
          professional:professionals(
            *,
            clinic:clinics(*)
          )
        `,
        )
        .single()

      if (error) {
        console.error("❌ ERRO AO CRIAR AGENDAMENTO")
        console.error("Código do erro:", error.code)
        console.error("Mensagem:", error.message)
        console.error("Detalhes:", error.details)
        console.error("Dados que foram enviados:", {
          patient_id: user.id,
          professional_id: selectedProfessional,
          appointment_date: selectedDate,
          start_time: selectedTime,
          end_time: endTime,
          status: "scheduled",
          notes: notes || null,
        })
        alert(`Erro ao criar agendamento: ${error.message}`)
        throw error
      }

      console.log("✅ AGENDAMENTO CRIADO COM SUCESSO:", newAppointment)
      onAppointmentBooked(newAppointment)
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error("❌ ERRO NO PROCESSO DE AGENDAMENTO:", error)
      if (error.message) {
        alert(`Erro: ${error.message}`)
      } else {
        alert("Erro ao criar agendamento. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
      console.log("=== FIM DO AGENDAMENTO ===")
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedClinic("")
    setSelectedProfessional("")
    setSelectedDate("")
    setSelectedTime("")
    setNotes("")
    setProfessionals([])
    setAvailableSlots([])
  }

  const canProceedToStep2 = selectedClinic && selectedProfessional
  const canProceedToStep3 = canProceedToStep2 && selectedDate && selectedTime

  // Get minimum date (today) - usando timezone local para evitar problemas
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset()) // Ajusta para timezone local
  const todayStr = today.toISOString().split("T")[0]

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetForm()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Agendar Consulta</DialogTitle>
          <DialogDescription>
            Selecione a clínica, profissional e horário para sua consulta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Clínica */}
          <div className="space-y-2">
            <Label className="font-semibold">Clínica</Label>
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma clínica" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.clinic_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Profissional */}
          {selectedClinic && (
            <div className="space-y-2">
              <Label className="font-semibold">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name} - {prof.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Calendário Mensal */}
          {canProceedToStep2 && (
            <div className="space-y-3">
              <Label className="font-semibold">Selecione uma Data</Label>
              
              <InteractiveCalendar
                professionalId={selectedProfessional}
                workingDays={workingDays}
                onDateSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedTime("")
                }}
                selectedDate={selectedDate}
                minDate={todayStr}
              />

              {/* Horários disponíveis aparecem aqui embaixo quando seleciona data */}
              {selectedDate && (
                <div className="space-y-2 pt-2">
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedTime === slot ? "default" : "outline"}
                          onClick={() => setSelectedTime(slot)}
                          size="sm"
                          className="font-medium"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-3">
                      Sem horários disponíveis
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {canProceedToStep3 && (
            <div className="space-y-2">
              <Label className="font-semibold">Observações (Opcional)</Label>
              <Textarea
                placeholder="Motivo da consulta..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!canProceedToStep3 || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
