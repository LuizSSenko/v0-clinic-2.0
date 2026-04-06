"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isHighContrast = mounted && theme === "dark"

  const handleToggle = () => {
    setTheme(isHighContrast ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={className}
      aria-label={isHighContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
      title={isHighContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
    >
      {isHighContrast ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
      {isHighContrast ? "Modo Claro" : "Alto Contraste"}
    </Button>
  )
}
