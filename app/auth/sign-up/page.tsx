"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { UserType } from "@/lib/types"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState<UserType>("patient")
  const [clinicName, setClinicName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (userType === "clinic" && !clinicName.trim()) {
      setError("Nome da clínica é obrigatório")
      setIsLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            user_type: userType,
            clinic_name: userType === "clinic" ? clinicName : null,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Store the data in localStorage to be used after confirmation
        localStorage.setItem(
          "pendingProfile",
          JSON.stringify({
            id: authData.user.id,
            email,
            full_name: fullName,
            user_type: userType,
            clinic_name: userType === "clinic" ? clinicName : null,
          }),
        )
      }

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>Preencha os dados para criar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Tipo de Usuário</Label>
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="patient" id="patient" />
                      <Label htmlFor="patient" className="font-normal cursor-pointer">
                        Paciente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="clinic" id="clinic" />
                      <Label htmlFor="clinic" className="font-normal cursor-pointer">
                        Clínica
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {userType === "clinic" && (
                  <div className="grid gap-2">
                    <Label htmlFor="clinicName">Nome da Clínica</Label>
                    <Input
                      id="clinicName"
                      type="text"
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirmar Senha</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
