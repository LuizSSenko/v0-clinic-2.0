"use client"

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
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  onProfileUpdated: (profile: Profile) => void
}

export function SettingsDialog({ open, onOpenChange, profile, onProfileUpdated }: SettingsDialogProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados do formulário
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState(profile.phone || "")
  const [address, setAddress] = useState(profile.address || "")
  const [city, setCity] = useState(profile.city || "")
  const [state, setState] = useState(profile.state || "")
  const [zipCode, setZipCode] = useState(profile.zip_code || "")

  // Buscar email do usuário
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
    }
    if (open) {
      fetchUserEmail()
    }
  }, [open, supabase.auth])

  // Resetar form quando abrir
  useEffect(() => {
    if (open) {
      setFullName(profile.full_name || "")
      setPhone(profile.phone || "")
      setAddress(profile.address || "")
      setCity(profile.city || "")
      setState(profile.state || "")
      setZipCode(profile.zip_code || "")
    }
  }, [open, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      alert("Por favor, preencha o nome completo")
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          zip_code: zipCode.trim() || null,
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      alert("Configurações atualizadas com sucesso!")
      onProfileUpdated(data)
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error)
      alert("Erro ao atualizar configurações. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-0.5 pb-2">
          <DialogTitle className="text-base font-bold">Configurações do Usuário</DialogTitle>
          <DialogDescription className="text-xs">
            Atualize suas informações pessoais
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nome Completo */}
          <div className="space-y-1">
            <Label className="font-semibold text-xs">Nome Completo *</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="h-8 text-xs"
              required
            />
          </div>

          {/* Email (somente leitura) */}
          <div className="space-y-1">
            <Label className="font-semibold text-xs">Email</Label>
            <Input
              value={email}
              disabled
              className="h-8 text-xs bg-muted"
            />
            <p className="text-[10px] text-muted-foreground">O email não pode ser alterado</p>
          </div>

          {/* Telefone */}
          <div className="space-y-1">
            <Label className="font-semibold text-xs">Telefone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="h-8 text-xs"
            />
          </div>

          {/* Endereço */}
          <div className="space-y-1">
            <Label className="font-semibold text-xs">Endereço</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, complemento"
              className="h-8 text-xs"
            />
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="font-semibold text-xs">Cidade</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-semibold text-xs">Estado</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="UF"
                maxLength={2}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* CEP */}
          <div className="space-y-1">
            <Label className="font-semibold text-xs">CEP</Label>
            <Input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="00000-000"
              className="h-8 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-8 text-xs"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
