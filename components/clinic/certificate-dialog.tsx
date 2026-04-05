"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, User } from "lucide-react"
import { toast } from "sonner"

interface CertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  clinicId: string
  patientName: string
  onGenerated: (file: File, meta: { appointmentId: string; isCertificate: true }) => void
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  completed: "Concluída",
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-purple-100 text-purple-800",
}

export function CertificateDialog({
  open,
  onOpenChange,
  patientId,
  clinicId,
  patientName,
  onGenerated,
}: CertificateDialogProps) {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [clinicName, setClinicName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedId("")
    loadData()
  }, [open, patientId, clinicId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profResult, clinicResult] = await Promise.all([
        supabase.from("professionals").select("id").eq("clinic_id", clinicId),
        supabase.from("clinics").select("clinic_name").eq("id", clinicId).single(),
      ])

      if ((clinicResult as any).data) setClinicName((clinicResult as any).data.clinic_name)

      const professionalIds = (profResult.data as any[])?.map((p: any) => p.id) ?? []
      if (!professionalIds.length) { setLoading(false); return }

      const { data } = await supabase
        .from("appointments")
        .select("*, professional:professionals(name, specialty)")
        .eq("patient_id", patientId)
        .in("professional_id", professionalIds)
        .in("status", ["scheduled", "confirmed", "completed"])
        .order("appointment_date", { ascending: false })

      const list: any[] = data ?? []
      setAppointments(list)
      if (list.length) setSelectedId(list[0].id)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    const apt = appointments.find((a) => a.id === selectedId)
    if (!apt) return

    setGenerating(true)
    try {
      const [{ default: jsPDF }, QRCode] = await Promise.all([
        import("jspdf"),
        import("qrcode"),
      ])

      // ── Verification code ────────────────────────────────────────────────
      const verificationCode = Array.from({ length: 4 }, () =>
        Math.random().toString(36).substring(2, 7).toUpperCase()
      ).join("-")

      const verificationUrl = "https://www.youtube.com/watch?v=2yJgwwDcgV8&list=RD2yJgwwDcgV8&start_radio=1"

      // Generate QR code as data URL (PNG)
      const qrDataUrl: string = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      })

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageWidth = 210
      const margin = 25
      const contentWidth = pageWidth - margin * 2

      const center = (text: string, y: number, size: number, style: "normal" | "bold" | "italic" = "normal") => {
        doc.setFont("helvetica", style)
        doc.setFontSize(size)
        doc.text(text, pageWidth / 2, y, { align: "center" })
      }

      // ── Header ──────────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.text(clinicName || "Clínica", pageWidth / 2, 30, { align: "center" })

      center("ATESTADO MÉDICO", 42, 14, "bold")

      doc.setDrawColor(80, 80, 80)
      doc.setLineWidth(0.5)
      doc.line(margin, 47, pageWidth - margin, 47)

      // ── Body ─────────────────────────────────────────────────────────────
      const date = new Date(apt.appointment_date + "T00:00:00")
      const dateStr = date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

      const startTime = apt.start_time.substring(0, 5)
      const endTime = apt.end_time.substring(0, 5)
      const doctorName = apt.professional?.name ?? "Profissional"
      const specialty = apt.professional?.specialty ?? ""

      const bodyText =
        `Certificamos que ${patientName} esteve em consulta médica com o(a) Dr(a). ` +
        `${doctorName}${specialty ? `, especialista em ${specialty}` : ""}, ` +
        `no dia ${capitalizedDate}, das ${startTime} às ${endTime} horas.`

      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      const bodyLines = doc.splitTextToSize(bodyText, contentWidth)
      doc.text(bodyLines, margin, 62)
      const bodyEndY = 62 + bodyLines.length * 7

      doc.text(
        "Este atestado é emitido para os fins que se fizerem necessários.",
        margin,
        bodyEndY + 14,
      )

      // ── Issue date ───────────────────────────────────────────────────────
      const today = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      doc.text(`Emitido em: ${today}`, margin, bodyEndY + 30)

      // ── Digital signature block ──────────────────────────────────────────
      const sigBlockY = bodyEndY + 46
      const sigBlockH = 52
      const qrSize = 36

      // Outer box
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin, sigBlockY, contentWidth, sigBlockH, 2, 2)

      // Header bar inside box
      doc.setFillColor(240, 240, 240)
      doc.roundedRect(margin, sigBlockY, contentWidth, 8, 2, 2)
      doc.rect(margin, sigBlockY + 4, contentWidth, 4, "F") // flatten bottom corners of header

      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      doc.text("ASSINATURA DIGITAL — DOCUMENTO VERIFICÁVEL ELETRONICAMENTE", margin + 3, sigBlockY + 5.5)

      // Left side: doctor info + verification code
      const textX = margin + 4
      const textStartY = sigBlockY + 14

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(30, 30, 30)
      doc.text(`Dr(a). ${doctorName}`, textX, textStartY)

      if (specialty) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.setTextColor(80, 80, 80)
        doc.text(specialty, textX, textStartY + 6)
      }

      // Verification code label
      const codeY = textStartY + (specialty ? 16 : 12)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("Código de verificação:", textX, codeY)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(20, 20, 20)
      doc.text(verificationCode, textX, codeY + 6)

      // Verification site
      doc.setFont("helvetica", "italic")
      doc.setFontSize(7.5)
      doc.setTextColor(80, 100, 160)
      doc.text("Verifique em: www.verifique.test", textX, codeY + 13)

      // Right side: QR code
      const qrX = margin + contentWidth - qrSize - 4
      const qrY = sigBlockY + (sigBlockH - qrSize) / 2 + 2
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(6.5)
      doc.setTextColor(120, 120, 120)
      doc.text("Escaneie para verificar", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" })

      // Reset text color
      doc.setTextColor(0, 0, 0)

      // ── Footer ───────────────────────────────────────────────────────────
      doc.setLineWidth(0.3)
      doc.setDrawColor(160, 160, 160)
      doc.line(margin, 272, pageWidth - margin, 272)
      doc.setFont("helvetica", "italic")
      doc.setFontSize(8)
      doc.text(
        "Documento gerado eletronicamente pelo sistema de gestão da clínica.",
        pageWidth / 2,
        277,
        { align: "center" },
      )

      // ── Create File ──────────────────────────────────────────────────────
      const pdfBlob = doc.output("blob")
      const safeName = patientName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()
      const fileName = `atestado-${safeName}-${apt.appointment_date}.pdf`
      const file = new File([pdfBlob], fileName, { type: "application/pdf" })

      onGenerated(file, { appointmentId: apt.id, isCertificate: true })
      onOpenChange(false)
      toast.success("Atestado gerado! Envie a mensagem para também enviar por email.")
    } catch (err) {
      console.error("Erro ao gerar PDF:", err)
      toast.error("Erro ao gerar o atestado.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Atestado Médico
          </DialogTitle>
          <DialogDescription>
            Selecione a consulta de <strong>{patientName}</strong> para emitir o atestado.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma consulta encontrada para este paciente.
          </p>
        ) : (
          <ScrollArea className="max-h-72 pr-1">
            <div className="space-y-2">
              {appointments.map((apt) => {
                const isSelected = apt.id === selectedId
                const dateStr = new Date(apt.appointment_date + "T00:00:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                return (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => setSelectedId(apt.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {apt.professional?.name}
                          {apt.professional?.specialty && (
                            <span className="text-muted-foreground font-normal">
                              — {apt.professional.specialty}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {apt.start_time.substring(0, 5)} – {apt.end_time.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs shrink-0 ${STATUS_COLORS[apt.status] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {STATUS_LABELS[apt.status] ?? apt.status}
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedId || generating}
          >
            {generating ? "Gerando..." : "Gerar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
