"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/lib/types"
import { Send } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface MessagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
  userType: "patient" | "clinic"
}

export function MessagesDialog({ open, onOpenChange, appointment, userType }: MessagesDialogProps) {
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    if (open) {
      loadMessages()
      getCurrentUser()
      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${appointment.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `appointment_id=eq.${appointment.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message])
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [open, appointment.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("appointment_id", appointment.id)
      .order("created_at", { ascending: true })

    setMessages(data || [])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("messages").insert({
        appointment_id: appointment.id,
        sender_id: user.id,
        message: newMessage.trim(),
      })

      if (!error) {
        setNewMessage("")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mensagens - {appointment.professional.name}</DialogTitle>
          <DialogDescription>
            {appointment.professional.clinic.clinic_name} •{" "}
            {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às {appointment.start_time}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}
                      >
                        {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
