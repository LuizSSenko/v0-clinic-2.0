"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PatientDashboardClient } from "@/components/patient/patient-dashboard-client"
import { Spinner } from "@/components/ui/spinner"
import type { Database } from "@/lib/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Appointment = Database["public"]["Tables"]["appointments"]["Row"] & {
  professional: Database["public"]["Tables"]["professionals"]["Row"] & {
    clinic: Database["public"]["Tables"]["clinics"]["Row"]
  }
}

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/auth/login")
          return
        }

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

        if (!profileData) {
          router.push("/patient/setup")
          return
        }

        if (profileData.user_type !== "patient") {
          router.push("/clinic/dashboard")
          return
        }

        setProfile(profileData)

        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(
            `
            *,
            professional:professionals(
              *,
              clinic:clinics(*)
            )
          `,
          )
          .eq("patient_id", user.id)
          .order("appointment_date", { ascending: true })

        setAppointments((appointmentsData as Appointment[]) || [])
      } catch (error) {
        console.error("[v0] Erro ao carregar dados:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return <PatientDashboardClient profile={profile} initialAppointments={appointments} />
}
