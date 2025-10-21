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
  onSubmit: (data: Partial<BlockedTime> | Partial<BlockedTime>[]) => Promise<void>
  blockedTime?: BlockedTime
  workingDays?: string[] // Array com os dias de trabalho do profissional
}

export function BlockedTimeFormDialog({ open, onOpenChange, onSubmit, blockedTime, workingDays = [] }: BlockedTimeFormDialogProps) {
  const [date, setDate] = useState(blockedTime?.date || "")
  const [startTime, setStartTime] = useState(blockedTime?.start_time || "12:00")
  const [endTime, setEndTime] = useState(blockedTime?.end_time || "13:00")
  const [reason, setReason] = useState(blockedTime?.reason || "")
  const [blockAllDays, setBlockAllDays] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (blockAllDays) {
        // Criar um bloqueio recorrente para cada dia de trabalho
        const blockedTimes: Partial<BlockedTime>[] = workingDays.map(day => ({
          id: blockedTime?.id,
          is_recurring: true,
          day_of_week: day as any,
          start_time: startTime,
          end_time: endTime,
          reason: reason || undefined,
        }))
        
        await onSubmit(blockedTimes)
      } else {
        // Bloqueio pontual
        await onSubmit({
          id: blockedTime?.id,
          is_recurring: false,
          date,
          start_time: startTime,
          end_time: endTime,
          reason: reason || undefined,
        })
      }
      
      onOpenChange(false)
      // Reset form
      if (!blockedTime) {
        setDate("")
        setStartTime("12:00")
        setEndTime("13:00")
        setReason("")
        setBlockAllDays(false)
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
            {!blockedTime && workingDays.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="block-all-days"
                  checked={blockAllDays}
                  onChange={(e) => setBlockAllDays(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="block-all-days" className="text-sm font-normal cursor-pointer">
                  Bloquear em todos os dias de trabalho (permanente)
                </Label>
              </div>
            )}
            
            {!blockAllDays && (
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            )}
            
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
            
            {blockAllDays && (
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-medium">💡 Bloqueio recorrente permanente</p>
                <p className="mt-1">
                  Este horário será bloqueado automaticamente em todos os dias de trabalho.
                  Não é necessário criar bloqueios para cada data - o sistema fará isso automaticamente!
                </p>
              </div>
            )}
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
