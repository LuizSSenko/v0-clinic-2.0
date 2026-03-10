"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Clock, Calendar, User, Filter, X } from "lucide-react"
import { MessagesChat } from "../shared/messages-chat"

interface Conversation {
  appointment: any
  lastMessage: any
  unreadCount: number
}

interface MessagesTabProps {
  clinicId: string
}

type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "all"

export function MessagesTab({ clinicId }: MessagesTabProps) {
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadConversations()

    // Real-time subscription para novas mensagens
    const channel = supabase
      .channel('clinic-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clinicId])

  const loadConversations = async () => {
    setLoading(true)
    try {
      // Buscar todos os appointments da clínica que têm mensagens
      const { data: professionals } = await supabase
        .from('professionals')
        .select('id')
        .eq('clinic_id', clinicId)

      if (!professionals || professionals.length === 0) {
        setConversations([])
        return
      }

      const professionalIds = professionals.map(p => p.id)

      // Buscar appointments com mensagens
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone),
          professional:professionals(id, name, specialty),
          messages(id, message, message_type, created_at, sender_id)
        `)
        .in('professional_id', professionalIds)
        .order('appointment_date', { ascending: false })

      if (!appointments) {
        setConversations([])
        return
      }

      // Filtrar apenas appointments com mensagens e processar
      const conversationsData = appointments
        .filter(apt => apt.messages && apt.messages.length > 0)
        .map(apt => {
          const messages = apt.messages as any[]
          const sortedMessages = messages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          return {
            appointment: apt,
            lastMessage: sortedMessages[0],
            unreadCount: 0 // Pode implementar contagem de não lidas depois
          }
        })
        .sort((a, b) => 
          new Date(b.lastMessage.created_at).getTime() - 
          new Date(a.lastMessage.created_at).getTime()
        )

      setConversations(conversationsData)
      setFilteredConversations(conversationsData)
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...conversations]

    // Filtro de status
    if (statusFilter !== "all") {
      filtered = filtered.filter(conv => conv.appointment.status === statusFilter)
    }

    // Filtro de data
    if (startDate) {
      filtered = filtered.filter(conv => {
        // Usar appointment_date e comparar apenas a parte da data (sem hora)
        const aptDateStr = conv.appointment.appointment_date || conv.appointment.date
        const aptDate = new Date(aptDateStr)
        const filterStartDate = new Date(startDate)
        
        // Normalizar para meia-noite para comparação correta
        aptDate.setHours(0, 0, 0, 0)
        filterStartDate.setHours(0, 0, 0, 0)
        
        return aptDate >= filterStartDate
      })
    }

    if (endDate) {
      filtered = filtered.filter(conv => {
        // Usar appointment_date e comparar apenas a parte da data (sem hora)
        const aptDateStr = conv.appointment.appointment_date || conv.appointment.date
        const aptDate = new Date(aptDateStr)
        const filterEndDate = new Date(endDate)
        
        // Normalizar para meia-noite para comparação correta
        aptDate.setHours(0, 0, 0, 0)
        filterEndDate.setHours(23, 59, 59, 999) // Fim do dia
        
        return aptDate <= filterEndDate
      })
    }

    setFilteredConversations(filtered)
  }, [conversations, statusFilter, startDate, endDate])

  const clearFilters = () => {
    setStatusFilter("all")
    setStartDate("")
    setEndDate("")
  }

  const hasActiveFilters = statusFilter !== "all" || startDate !== "" || endDate !== ""

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}min`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else if (diffInHours < 48) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada'
      case 'confirmed': return 'Confirmada'
      case 'cancelled': return 'Cancelada'
      case 'completed': return 'Concluída'
      default: return status
    }
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhuma conversa ainda</p>
          <p className="text-sm text-muted-foreground mt-2">
            As conversas aparecerão aqui quando pacientes enviarem mensagens
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
      {/* Lista de Conversas */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversas
              </CardTitle>
              <CardDescription>
                {filteredConversations.length} de {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "border-primary" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={(value: AppointmentStatus) => setStatusFilter(value)}>
                  <SelectTrigger id="status-filter" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Data Início → Data Fim</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 flex-1"
                    placeholder="Data inicial"
                  />
                  <span className="text-muted-foreground">→</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 flex-1"
                    placeholder="Data final"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-1 p-4">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhuma conversa encontrada
                  </p>
                  {hasActiveFilters && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Tente ajustar os filtros
                    </p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => (
                <button
                  key={conv.appointment.id}
                  onClick={() => setSelectedConversation(conv.appointment)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedConversation?.id === conv.appointment.id
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {conv.appointment.patient?.full_name || 'Paciente'}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDate(conv.lastMessage.created_at)}
                        </span>
                      </div>

                      {/* Profissional */}
                      <p className="text-xs text-muted-foreground mb-1">
                        {conv.appointment.professional?.name} - {conv.appointment.professional?.specialty}
                      </p>

                      {/* Data da consulta */}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.appointment.appointment_date).toLocaleDateString('pt-BR')}
                        </span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {conv.appointment.start_time.substring(0, 5)}
                        </span>
                      </div>

                      {/* Status da consulta */}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mb-2 ${getStatusColor(conv.appointment.status)}`}
                      >
                        {getStatusLabel(conv.appointment.status)}
                      </Badge>

                      {/* Última mensagem */}
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage.message_type === 'file' 
                          ? '📎 Arquivo enviado' 
                          : truncateMessage(conv.lastMessage.message)
                        }
                      </p>

                      {/* Badge de não lidas (se houver) */}
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="mt-2">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área de Chat */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {selectedConversation.patient?.full_name || 'Paciente'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 flex-wrap">
                    <span>{selectedConversation.professional?.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(selectedConversation.appointment_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span>às</span>
                    <span>{selectedConversation.start_time.substring(0, 5)}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(selectedConversation.status)}`}
                    >
                      {getStatusLabel(selectedConversation.status)}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Renderizar o MessagesChat como conteúdo inline */}
            <CardContent className="flex-1 flex flex-col p-6">
              <MessagesChat
                appointment={selectedConversation}
                userType="clinic"
                clinicId={clinicId}
              />
            </CardContent>
          </div>
        ) : (
          <CardContent className="flex flex-col items-center justify-center h-full">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Selecione uma conversa</p>
            <p className="text-sm text-muted-foreground mt-2">
              Escolha um paciente à esquerda para ver as mensagens
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
