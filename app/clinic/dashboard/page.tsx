"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ClinicDashboardClient } from "@/components/clinic/clinic-dashboard-client"
import { Spinner } from "@/components/ui/spinner"
import type { Database } from "@/lib/types"

type Clinic = Database["public"]["Tables"]["clinics"]["Row"]
type Professional = Database["public"]["Tables"]["professionals"]["Row"]

export default function ClinicDashboardPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [professionals, setProfessionals] = useState<Professional[]>([])
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

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

        if (!profile) {
          router.push("/clinic/setup")
          return
        }

        if (profile.user_type !== "clinic") {
          router.push("/patient/dashboard")
          return
        }

        const { data: clinicData } = await supabase.from("clinics").select("*").eq("profile_id", user.id).maybeSingle()

        if (!clinicData) {
          router.push("/clinic/setup")
          return
        }

        setClinic(clinicData)

        const { data: professionalsData } = await supabase
          .from("professionals")
          .select("*")
          .eq("clinic_id", clinicData.id)
          .order("name")

        setProfessionals(professionalsData || [])
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

  if (!clinic) {
    return null
  }

  return <ClinicDashboardClient clinic={clinic} initialProfessionals={professionals} />
}
