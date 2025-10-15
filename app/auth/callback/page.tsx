"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      try {
        // Get the user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) throw new Error("No user found")

        // Check if profile exists
        const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (!existingProfile) {
          // Get pending profile data from localStorage
          const pendingData = localStorage.getItem("pendingProfile")

          if (pendingData) {
            const profileData = JSON.parse(pendingData)

            // Create profile
            const { error: profileError } = await supabase.from("profiles").insert({
              id: user.id,
              email: profileData.email,
              full_name: profileData.full_name,
              user_type: profileData.user_type,
            })

            if (profileError) throw profileError

            // If clinic, create clinic record
            if (profileData.user_type === "clinic" && profileData.clinic_name) {
              const { error: clinicError } = await supabase.from("clinics").insert({
                profile_id: user.id,
                clinic_name: profileData.clinic_name,
              })

              if (clinicError) throw clinicError
            }

            localStorage.removeItem("pendingProfile")
          }
        }

        // Redirect based on user type
        const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

        if (profile?.user_type === "clinic") {
          router.push("/clinic/dashboard")
        } else {
          router.push("/patient/dashboard")
        }
      } catch (err) {
        console.error("Error in auth callback:", err)
        setError(err instanceof Error ? err.message : "Erro ao processar autenticação")
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/auth/login" className="text-primary underline">
            Voltar para login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <Spinner className="mx-auto mb-4" />
        <p className="text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  )
}
