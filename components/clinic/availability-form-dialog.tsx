"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { DayOfWeek, ProfessionalAvailability } from "@/lib/types"

interface DayConfig {
  enabled: boolean
  start_time: string
  end_time: string
}

type WeekConfig = Record<DayOfWeek, DayConfig>

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "monday",    label: "Segunda-feira" },
  { value: "tuesday",   label: "Terça-feira"   },
  { value: "wednesday", label: "Quarta-feira"  },
  { value: "thursday",  label: "Quinta-feira"  },
  { value: "friday",    label: "Sexta-feira"   },
  { value: "saturday",  label: "Sábado"        },
  { value: "sunday",    label: "Domingo"       },
]

const WEEKDAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday"]

const DEFAULT_WEEK: WeekConfig = {
  monday:    { enabled: false, start_time: "08:00", end_time: "17:00" },
  tuesday:   { enabled: false, start_time: "08:00", end_time: "17:00" },
  wednesday: { enabled: false, start_time: "08:00", end_time: "17:00" },
  thursday:  { enabled: false, start_time: "08:00", end_time: "17:00" },
  friday:    { enabled: false, start_time: "08:00", end_time: "17:00" },
  saturday:  { enabled: false, start_time: "08:00", end_time: "17:00" },
  sunday:    { enabled: false, start_time: "08:00", end_time: "17:00" },
}

function buildConfig(existing: ProfessionalAvailability[]): WeekConfig {
  const config: WeekConfig = structuredClone(DEFAULT_WEEK)
  for (const a of existing) {
    config[a.day_of_week] = {
      enabled:    true,
      start_time: a.start_time.substring(0, 5),
      end_time:   a.end_time.substring(0, 5),
    }
  }
  return config
}

export interface AvailabilitySubmitData {
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
}

interface AvailabilityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AvailabilitySubmitData[]) => Promise<void>
  existingAvailabilities: ProfessionalAvailability[]
}

export function AvailabilityFormDialog({
  open,
  onOpenChange,
  onSubmit,
  existingAvailabilities,
}: AvailabilityFormDialogProps) {
  const [config, setConfig] = useState<WeekConfig>(() => buildConfig(existingAvailabilities))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) setConfig(buildConfig(existingAvailabilities))
  }, [open, existingAvailabilities])

  const updateDay = (day: DayOfWeek, patch: Partial<DayConfig>) =>
    setConfig((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))

  const selectWeekdays = () =>
    setConfig((prev) => {
      const next = structuredClone(prev)
      WEEKDAYS.forEach((d) => { next[d].enabled = true })
      next.saturday.enabled = false
      next.sunday.enabled   = false
      return next
    })

  const applyToAll = () => {
    const first = DAYS.find(({ value }) => config[value].enabled)
    if (!first) return
    const { start_time, end_time } = config[first.value]
    setConfig((prev) => {
      const next = structuredClone(prev)
      DAYS.forEach(({ value }) => {
        if (next[value].enabled) {
          next[value].start_time = start_time
          next[value].end_time   = end_time
        }
      })
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const enabled = DAYS
      .filter(({ value }) => config[value].enabled)
      .map(({ value }) => ({
        day_of_week: value,
        start_time:  config[value].start_time,
        end_time:    config[value].end_time,
      }))

    for (const d of enabled) {
      if (d.start_time >= d.end_time) {
        const label = DAYS.find((x) => x.value === d.day_of_week)?.label
        alert(`Horário inválido em ${label}: o horário de início deve ser antes do término.`)
        return
      }
    }

    setIsLoading(true)
    try {
      await onSubmit(enabled)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const enabledCount = DAYS.filter(({ value }) => config[value].enabled).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Disponibilidade Semanal</DialogTitle>
          <DialogDescription>
            Marque os dias de atendimento e defina os horários de cada dia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Quick-action buttons */}
          <div className="flex gap-2 mb-4">
            <Button type="button" variant="outline" size="sm" onClick={selectWeekdays}>
              Selecionar Seg–Sex
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyToAll}
              disabled={enabledCount < 2}
              title="Copia o horário do primeiro dia marcado para todos os outros dias marcados"
            >
              Mesmo horário para todos
            </Button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[20px_1fr_110px_12px_110px] gap-x-3 items-center px-2 mb-1">
            <span />
            <span className="text-xs text-muted-foreground font-medium">Dia</span>
            <span className="text-xs text-muted-foreground font-medium text-center">Início</span>
            <span />
            <span className="text-xs text-muted-foreground font-medium text-center">Término</span>
          </div>

          {/* Day rows */}
          <div className="space-y-1.5">
            {DAYS.map(({ value, label }) => {
              const day = config[value]
              return (
                <div
                  key={value}
                  className={`grid grid-cols-[20px_1fr_110px_12px_110px] gap-x-3 items-center rounded-md px-2 py-2 transition-colors ${
                    day.enabled ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                  }`}
                >
                  <Checkbox
                    id={`day-${value}`}
                    checked={day.enabled}
                    onCheckedChange={(checked) => updateDay(value, { enabled: !!checked })}
                  />
                  <Label
                    htmlFor={`day-${value}`}
                    className={`text-sm cursor-pointer select-none ${
                      day.enabled ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </Label>
                  <Input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => updateDay(value, { start_time: e.target.value })}
                    disabled={!day.enabled}
                    className="h-8 text-sm text-center px-1"
                  />
                  <span className="text-muted-foreground text-xs text-center">–</span>
                  <Input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => updateDay(value, { end_time: e.target.value })}
                    disabled={!day.enabled}
                    className="h-8 text-sm text-center px-1"
                  />
                </div>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            {enabledCount === 0
              ? "Nenhum dia selecionado."
              : `${enabledCount} dia${enabledCount !== 1 ? "s" : ""} selecionado${enabledCount !== 1 ? "s" : ""}.`}
          </p>

          <DialogFooter className="mt-4">
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
