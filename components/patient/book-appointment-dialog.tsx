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

  const loadAvailableSlots = async (professionalId: string, date: string) => {
    setLoadingSlots(true)
    try {
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "lowercase" })

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

      // Get blocked times for this day
      const { data: blockedTimes } = await supabase
        .from("blocked_times")
        .select("start_time, end_time")
        .eq("professional_id", professionalId)
        .eq("date", date)

      // Generate time slots
      const slots = generateTimeSlots(
        availability.start_time,
        availability.end_time,
        professional.average_appointment_duration,
        existingAppointments || [],
        blockedTimes || [],
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
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get professional info for duration
      const { data: professional } = await supabase
        .from("professionals")
        .select("average_appointment_duration")
        .eq("id", selectedProfessional)
        .single()

      if (!professional) return

      // Calculate end time
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + professional.average_appointment_duration
      const endHours = Math.floor(endMinutes / 60)
      const endMinutesSlot = endMinutes % 60
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutesSlot.toString().padStart(2, "0")}`

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

      if (error) throw error

      onAppointmentBooked(newAppointment)
      onOpenChange(false)
      resetForm()
    } finally {
      setIsLoading(false)
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

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetForm()
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Consulta</DialogTitle>
          <DialogDescription>Escolha a clínica, profissional e horário desejado</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Step 1: Select Clinic and Professional */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  1
                </div>
                <h3 className="font-semibold">Selecione a Clínica e Profissional</h3>
              </div>

              <div className="grid gap-4 pl-10">
                <div className="grid gap-2">
                  <Label htmlFor="clinic">Clínica</Label>
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

                {selectedClinic && (
                  <div className="grid gap-2">
                    <Label htmlFor="professional">Profissional</Label>
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
              </div>
            </div>

            {/* Step 2: Select Date and Time */}
            {canProceedToStep2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    2
                  </div>
                  <h3 className="font-semibold">Escolha Data e Horário</h3>
                </div>

                <div className="grid gap-4 pl-10">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                        setSelectedTime("")
                      }}
                      required
                    />
                  </div>

                  {selectedDate && (
                    <div className="grid gap-2">
                      <Label>Horários Disponíveis</Label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <Spinner />
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              type="button"
                              variant={selectedTime === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">Nenhum horário disponível para esta data</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Add Notes */}
            {canProceedToStep3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    3
                  </div>
                  <h3 className="font-semibold">Observações (Opcional)</h3>
                </div>

                <div className="grid gap-2 pl-10">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione informações relevantes sobre a consulta..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canProceedToStep3 || isLoading}>
              {isLoading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
