"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InteractiveCalendarProps {
  professionalId: string
  workingDays: string[] // ['monday', 'tuesday', etc]
  onDateSelect: (date: string) => void
  selectedDate?: string
  minDate?: string
}

export function InteractiveCalendar({
  professionalId,
  workingDays,
  onDateSelect,
  selectedDate,
  minDate
}: InteractiveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('week')

  // Mapear dias da semana
  const dayMapping: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  }

  const workingDayNumbers = workingDays.map(day => dayMapping[day.toLowerCase()])

  // Verificar se é dia de trabalho
  const isWorkingDay = (date: Date) => {
    return workingDayNumbers.includes(date.getDay())
  }

  // Verificar se é dia passado
  const isPastDay = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  // Gerar dias do mês
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    
    // Adicionar dias vazios do início
    const startPadding = firstDay.getDay()
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  // Gerar dias da semana
  const generateWeekDays = () => {
    const days = []
    const weekStart = new Date(currentWeek)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Domingo
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    
    return days
  }

  const monthDays = generateMonthDays()
  const weekDays = generateWeekDays()

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateClick = (date: Date) => {
    if (!isPastDay(date) && isWorkingDay(date)) {
      onDateSelect(formatDate(date))
    }
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newWeek)
  }

  const prevWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newWeek)
  }

  return (
    <div className="space-y-3">
      {/* Navegação do Mês */}
      <div className="flex items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendário Mensal */}
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalhos dos dias */}
        {weekDayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {/* Dias do mês */}
        {monthDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />
          }
          
          const isSelected = selectedDate === formatDate(date)
          const isWorking = isWorkingDay(date)
          const isPast = isPastDay(date)
          const isDisabled = isPast || !isWorking
          const isToday = new Date().toDateString() === date.toDateString()
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                "aspect-square p-2 text-sm rounded-lg transition-all relative flex items-center justify-center font-medium",
                "hover:bg-accent",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary font-bold ring-2 ring-primary ring-offset-1",
                isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent text-muted-foreground",
                !isDisabled && !isSelected && isWorking && "bg-blue-500 text-white hover:bg-blue-600 font-semibold",
                isToday && !isSelected && isWorking && "ring-2 ring-blue-300",
                isPast && "line-through"
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
