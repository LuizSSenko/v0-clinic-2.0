"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/lib/types"
import { Send, Paperclip, X, FileText, Image as ImageIcon, Download } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
            const newMessage = payload.new as Message
            // Evitar duplicação: só adicionar se a mensagem não existe no estado
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === newMessage.id)
              if (exists) return prev
              return [...prev, newMessage]
            })
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande! Máximo: 10MB')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use: imagens, PDF ou Word')
      return
    }

    setSelectedFile(file)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      // Nome único do arquivo: appointmentId/messageId-timestamp-filename
      const timestamp = Date.now()
      const fileName = `${appointment.id}/${timestamp}-${file.name}`

      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obter URL pública (signed URL para 1 ano)
      const { data: urlData } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(fileName, 31536000) // 1 ano em segundos

      return urlData?.signedUrl || null
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao enviar arquivo')
      return null
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Precisa ter mensagem OU arquivo
    if (!newMessage.trim() && !selectedFile) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      let fileUrl = null
      let messageData: any = {
        appointment_id: appointment.id,
        sender_id: user.id,
        message_type: 'text',
        message: newMessage.trim() || '',
      }

      // Se tem arquivo, faz upload primeiro
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile)
        if (fileUrl) {
          messageData = {
            ...messageData,
            message_type: 'file',
            message: newMessage.trim() || `Enviou: ${selectedFile.name}`,
            file_url: fileUrl,
            file_name: selectedFile.name,
            file_type: selectedFile.type,
            file_size: selectedFile.size
          }
        } else {
          toast.error('Erro ao enviar arquivo')
          return
        }
      }

      const { data: insertedMessage, error } = await supabase
        .from("messages")
        .insert(messageData)
        .select()
        .single()

      if (!error && insertedMessage) {
        // Adicionar mensagem imediatamente ao estado local
        setMessages((prev) => [...prev, insertedMessage])
        setNewMessage("")
        removeSelectedFile()
        toast.success(selectedFile ? 'Arquivo enviado!' : 'Mensagem enviada!')
      } else {
        toast.error('Erro ao enviar mensagem')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Download iniciado!')
    } catch (error) {
      toast.error('Erro ao baixar arquivo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mensagens - {appointment.professional?.name || "Profissional"}</DialogTitle>
          <DialogDescription>
            {appointment.professional?.clinic?.clinic_name || "Clínica"} •{" "}
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
                const isFile = message.message_type === 'file'
                
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-background/10 rounded">
                            {getFileIcon(message.file_type || '')}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{message.file_name}</p>
                              <p className="text-xs opacity-70">{formatFileSize(message.file_size || 0)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(message.file_url!, message.file_name!)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                          {message.message && message.message !== `Enviou: ${message.file_name}` && (
                            <p className="text-sm">{message.message}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{message.message}</p>
                      )}
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

        <form onSubmit={handleSendMessage} className="space-y-2 pt-4 border-t">
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={removeSelectedFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedFile ? "Adicione uma legenda (opcional)" : "Digite sua mensagem..."}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || (!newMessage.trim() && !selectedFile)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
