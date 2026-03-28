// Edge Function para enviar emails de notificação de agendamentos
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: 'RESEND_API_KEY secret is not configured on this project',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const { appointmentId, action } = await req.json()

    if (!appointmentId || !action) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: 'appointmentId and action are required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Criar cliente Supabase com service role key para acessar todos os dados
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar dados completos do agendamento
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, email),
        professional:professionals(
          name, 
          specialty,
          clinic:clinics(clinic_name, address, phone, email)
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: 'Agendamento não encontrado',
          details: appointmentError?.message,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (!appointment.patient?.email) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: 'Paciente sem email cadastrado',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Preparar dados do email baseado na ação
    const emailData = prepareEmailData(appointment, action)

    // Enviar email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Clínica <onboarding@resend.dev>', // Email de teste do Resend (funciona sem domínio)
        to: [appointment.patient.email],
        subject: emailData.subject,
        html: emailData.html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: 'Resend API error',
          provider_status: res.status,
          provider_error: data.message || data,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        skipped: true,
        reason: error instanceof Error ? error.message : 'Unexpected error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})

function prepareEmailData(appointment: any, action: string) {
  const date = new Date(appointment.appointment_date + 'T00:00:00')
  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const startTime = appointment.start_time.substring(0, 5)
  const endTime = appointment.end_time.substring(0, 5)

  // Helper function para exibir informações da clínica
  const clinicInfoBlock = `
    <div class="detail">
      <div class="label">🏥 Clínica:</div>
      <div><strong>${appointment.professional.clinic.clinic_name}</strong></div>
      <div style="margin-top: 5px; color: #6b7280;">${appointment.professional.clinic.address || 'Endereço não informado'}</div>
      ${appointment.professional.clinic.phone ? `<div style="margin-top: 3px; color: #6b7280;">📞 ${appointment.professional.clinic.phone}</div>` : ''}
      ${appointment.professional.clinic.email ? `<div style="margin-top: 3px; color: #6b7280;">📧 ${appointment.professional.clinic.email}</div>` : ''}
    </div>
  `

  const templates = {
    created: {
      subject: '✅ Agendamento Confirmado',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #4F46E5; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Agendamento Confirmado</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${appointment.patient.full_name}</strong>,</p>
                <p>Sua consulta foi agendada na <strong>${appointment.professional.clinic.clinic_name}</strong>!</p>
                
                <div class="detail">
                  <div class="label">📅 Data:</div>
                  <div>${formattedDate}</div>
                </div>
                
                <div class="detail">
                  <div class="label">🕐 Horário:</div>
                  <div>${startTime} às ${endTime}</div>
                </div>
                
                <div class="detail">
                  <div class="label">👨‍⚕️ Profissional:</div>
                  <div>${appointment.professional.name} - ${appointment.professional.specialty}</div>
                </div>
                
                ${clinicInfoBlock}
                
                ${appointment.notes ? `
                  <div class="detail">
                    <div class="label">📝 Observações:</div>
                    <div>${appointment.notes}</div>
                  </div>
                ` : ''}
                
                <p style="margin-top: 20px;">Por favor, chegue com 10 minutos de antecedência.</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    confirmed: {
      subject: '✅ Agendamento Confirmado',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #10B981; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Consulta Confirmada</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${appointment.patient.full_name}</strong>,</p>
                <p>Sua consulta foi confirmada pela <strong>${appointment.professional.clinic.clinic_name}</strong>!</p>
                
                <div class="detail">
                  <div class="label">📅 Data:</div>
                  <div>${formattedDate}</div>
                </div>
                
                <div class="detail">
                  <div class="label">🕐 Horário:</div>
                  <div>${startTime} às ${endTime}</div>
                </div>
                
                <div class="detail">
                  <div class="label">👨‍⚕️ Profissional:</div>
                  <div>${appointment.professional.name} - ${appointment.professional.specialty}</div>
                </div>
                
                ${clinicInfoBlock}
                
                <p style="margin-top: 20px;">Aguardamos você!</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    rescheduled: {
      subject: '📅 Agendamento Reagendado',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #F59E0B; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #F59E0B; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
              .alert { background: #FEF3C7; padding: 15px; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Agendamento Reagendado</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${appointment.patient.full_name}</strong>,</p>
                
                <div class="alert">
                  <strong>⚠️ Atenção:</strong> Seu agendamento foi alterado para uma nova data/horário.
                </div>
                
                <p><strong>Novos dados do agendamento:</strong></p>
                
                <div class="detail">
                  <div class="label">📅 Nova Data:</div>
                  <div>${formattedDate}</div>
                </div>
                
                <div class="detail">
                  <div class="label">🕐 Novo Horário:</div>
                  <div>${startTime} às ${endTime}</div>
                </div>
                
                <div class="detail">
                  <div class="label">👨‍⚕️ Profissional:</div>
                  <div>${appointment.professional.name} - ${appointment.professional.specialty}</div>
                </div>
                
                ${clinicInfoBlock}
                
                ${appointment.notes ? `
                  <div class="detail">
                    <div class="label">📝 Observações:</div>
                    <div>${appointment.notes}</div>
                  </div>
                ` : ''}
                
                <p style="margin-top: 20px;">Por favor, confirme sua presença na nova data.</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    cancelled: {
      subject: '❌ Agendamento Cancelado',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #EF4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .detail { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #EF4444; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
              .alert { background: #FEE2E2; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #EF4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Agendamento Cancelado</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${appointment.patient.full_name}</strong>,</p>
                
                <div class="alert">
                  <strong>❌ Seu agendamento foi cancelado.</strong>
                </div>
                
                <p><strong>Dados do agendamento cancelado:</strong></p>
                
                <div class="detail">
                  <div class="label">📅 Data:</div>
                  <div>${formattedDate}</div>
                </div>
                
                <div class="detail">
                  <div class="label">🕐 Horário:</div>
                  <div>${startTime} às ${endTime}</div>
                </div>
                
                <div class="detail">
                  <div class="label">👨‍⚕️ Profissional:</div>
                  <div>${appointment.professional.name} - ${appointment.professional.specialty}</div>
                </div>
                
                ${clinicInfoBlock}
                
                <p style="margin-top: 20px;">Se desejar reagendar, entre em contato com a clínica.</p>
              </div>
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }
  }

  return templates[action as keyof typeof templates] || templates.created
}
