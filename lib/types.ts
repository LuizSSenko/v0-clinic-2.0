export type UserType = "patient" | "clinic"
export type AppointmentStatus = "scheduled" | "cancelled" | "completed"
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export interface Profile {
  id: string
  email: string
  full_name: string
  user_type: UserType
  phone?: string
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  profile_id: string
  clinic_name: string
  address?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  clinic_id: string
  name: string
  specialty: string
  average_appointment_duration: number
  created_at: string
  updated_at: string
}

export interface ProfessionalAvailability {
  id: string
  professional_id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  created_at: string
}

export interface BlockedTime {
  id: string
  professional_id: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  professional_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  appointment_id: string
  sender_id: string
  message: string
  created_at: string
}
