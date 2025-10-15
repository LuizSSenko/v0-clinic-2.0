import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Conta Criada!</CardTitle>
            <CardDescription>Verifique seu email para confirmar sua conta</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta e fazer login.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Ir para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
