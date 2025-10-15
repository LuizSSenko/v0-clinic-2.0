"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      console.log("[v0] Getting user...")
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("[v0] User:", user)

      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      console.log("[v0] Upserting profile with data:", {
        id: user.id,
        email: user.email,
        full_name: formData.fullName,
        user_type: "patient",
        phone: formData.phone,
      })

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.fullName,
          user_type: "patient",
          phone: formData.phone,
        })
        .select()

      console.log("[v0] Profile upsert result:", { profileData, profileError })

      if (profileError) {
        console.error("[v0] Profile error:", profileError)
        throw profileError
      }

      console.log("[v0] Profile created successfully, redirecting to dashboard")
      router.push("/patient/dashboard")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error setting up patient:", error)
      alert("Erro ao configurar perfil. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
          <CardDescription>Adicione suas informações para começar a usar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nome Completo
              </label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
