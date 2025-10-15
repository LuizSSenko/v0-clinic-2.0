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
import { Textarea } from "@/components/ui/textarea"
import type { BlockedTime } from "@/lib/types"
import { useState } from "react"

interface BlockedTimeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<BlockedTime>) => Promise<void>
  blockedTime?: BlockedTime
}

export function BlockedTimeFormDialog({ open, onOpenChange, onSubmit, blockedTime }: BlockedTimeFormDialogProps) {
  const [date, setDate] = useState(blockedTime?.date || "")
  const [startTime, setStartTime] = useState(blockedTime?.start_time || "12:00")
  const [endTime, setEndTime] = useState(blockedTime?.end_time || "13:00")
  const [reason, setReason] = useState(blockedTime?.reason || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        id: blockedTime?.id,
        date,
        start_time: startTime,
        end_time: endTime,
        reason: reason || undefined,
      })
      onOpenChange(false)
      // Reset form
      if (!blockedTime) {
        setDate("")
        setStartTime("12:00")
        setEndTime("13:00")
        setReason("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{blockedTime ? "Editar Bloqueio" : "Bloquear Horário"}</DialogTitle>
          <DialogDescription>Bloqueie horários para almoço, reuniões, etc.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start-time">Horário de Início</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">Horário de Término</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Almoço, Reunião..."
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
