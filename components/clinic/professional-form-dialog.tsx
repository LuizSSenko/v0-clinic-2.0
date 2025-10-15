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
import type { Professional } from "@/lib/types"
import { useState } from "react"

interface ProfessionalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Professional>) => Promise<void>
  professional?: Professional
}

export function ProfessionalFormDialog({ open, onOpenChange, onSubmit, professional }: ProfessionalFormDialogProps) {
  const [name, setName] = useState(professional?.name || "")
  const [specialty, setSpecialty] = useState(professional?.specialty || "")
  const [duration, setDuration] = useState(professional?.average_appointment_duration?.toString() || "30")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        id: professional?.id,
        name,
        specialty,
        average_appointment_duration: Number.parseInt(duration),
      })
      onOpenChange(false)
      // Reset form
      if (!professional) {
        setName("")
        setSpecialty("")
        setDuration("30")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{professional ? "Editar Profissional" : "Adicionar Profissional"}</DialogTitle>
          <DialogDescription>
            {professional ? "Atualize as informações do profissional" : "Adicione um novo profissional à sua clínica"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duração Média da Consulta (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
