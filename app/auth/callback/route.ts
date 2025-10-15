import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.user

      // Criar perfil e clínica se necessário
      if (user?.user_metadata) {
        const { full_name, user_type, clinic_name } = user.user_metadata

        // Criar perfil
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email!,
          full_name,
          user_type,
        })

        // Se for clínica, criar registro da clínica
        if (user_type === "clinic" && clinic_name) {
          await supabase.from("clinics").upsert({
            profile_id: user.id,
            name: clinic_name,
          })
        }
      }

      // Redirecionar baseado no tipo de usuário
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle()

      if (profile?.user_type === "clinic") {
        return NextResponse.redirect(`${origin}/clinic/dashboard`)
      } else if (profile?.user_type === "patient") {
        return NextResponse.redirect(`${origin}/patient/dashboard`)
      }
    }
  }

  // Retornar para login em caso de erro
  return NextResponse.redirect(`${origin}/auth/login`)
}
