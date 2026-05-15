import Link from "next/link"
import { AlertCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 ClinicApp. Todos os direitos reservados.
          </p>
          <Link 
            href="/aviso-legal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <AlertCircle className="h-4 w-4" />
            Aviso Legal e Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  )
}
