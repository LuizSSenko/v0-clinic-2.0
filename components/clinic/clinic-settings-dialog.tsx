"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ClinicSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clinic: {
    id: string
    clinic_name: string
    address?: string
    phone?: string
    email?: string
  }
  onSettingsUpdated: () => void
}

export function ClinicSettingsDialog({
  open,
  onOpenChange,
  clinic,
  onSettingsUpdated
}: ClinicSettingsDialogProps) {
  const supabase = createClient()

  const [formData, setFormData] = useState({
    clinic_name: "",
    address: "",
    phone: "",
    email: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (clinic) {
      setFormData({
        clinic_name: clinic.clinic_name || "",
        address: clinic.address || "",
        phone: clinic.phone || "",
        email: clinic.email || ""
      })
    }
  }, [clinic])

  const handleSave = async () => {
    if (!formData.clinic_name.trim()) {
      toast.error("O nome da clínica é obrigatório")
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("clinics")
        .update({
          clinic_name: formData.clinic_name.trim(),
          address: formData.address.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null
        })
        .eq("id", clinic.id)

      if (error) throw error

      toast.success("Configurações salvas com sucesso!")
      onSettingsUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast.error("Erro ao salvar configurações. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações da Clínica</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua clínica. Estas informações serão exibidas nos emails enviados aos pacientes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da Clínica */}
          <div className="space-y-2">
            <Label htmlFor="clinic_name">
              Nome da Clínica <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clinic_name"
              value={formData.clinic_name}
              onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
              placeholder="Ex: Clínica Saúde Total"
            />
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP, CEP 01234-567"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Este endereço será exibido nos emails de confirmação enviados aos pacientes
            </p>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: (11) 1234-5678"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email de Contato</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ex: contato@clinica.com.br"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
