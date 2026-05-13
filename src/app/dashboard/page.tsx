"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Scan, LogOut, List } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"

export default function UserDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user?.role === 'admin') {
      router.push('/admin/dashboard')
      return
    }
  }, [session, status, router])

  const handleQrScan = async (decodedText: string, decodedResult: any) => {
    console.log('QR scanned, raw text:', decodedText)
    try {
      const qrData = JSON.parse(decodedText)
      console.log('Parsed QR data:', qrData)
      console.log('Current session status:', status)
      console.log('Current session data:', session)

      if (qrData.type === 'attendance') {
        console.log('QR scanned, recording attendance for user:', session?.user?.id)

        // Check if we have a valid session
        if (!session?.user?.id) {
          console.error('No valid session found!')
          toast({
            title: "Error de sesión",
            description: "Tu sesión no está activa. Intenta recargar la página.",
            variant: "destructive",
          })
          return
        }

        console.log('Session user ID found:', session.user.id)
        // Register attendance
        const response = await fetch('/api/attendance/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}), // Empty body, user ID comes from session
        })

        console.log('Attendance record response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          toast({
            title: "¡Asistencia registrada!",
            description: `Bienvenido al gimnasio. Hora: ${new Date().toLocaleTimeString('es-ES')}`,
          })

          // Close scanner
          if (scanner) {
            scanner.clear().catch(console.error)
            setScanner(null)
          }
          setIsQrScannerOpen(false)
        } else {
          toast({
            title: "Error",
            description: "No se pudo registrar la asistencia",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Código QR inválido",
          description: "Este no es un código QR de asistencia válido",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("QR scan error:", error)
      toast({
        title: "Error al escanear",
        description: "El código QR no es válido",
        variant: "destructive",
      })
    }
  }

  const handleQrError = (error: any) => {
    // Only log serious errors, not every frame
    if (error?.includes && error.includes('No MultiFormat Readers')) {
      console.warn("QR scan: No code detected in frame")
    } else {
      console.error("QR scan error:", error)
    }
  }

  const startQrScanner = () => {
    console.log('Starting QR scanner')
    setIsQrScannerOpen(true)

    // Initialize scanner after dialog opens
    setTimeout(() => {
      console.log('Initializing Html5QrcodeScanner')
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          qrbox: 250, // Simple square qrbox
          aspectRatio: 1.0,
        },
        false
      )

      console.log('Rendering scanner')
      qrScanner.render(handleQrScan, handleQrError)
      setScanner(qrScanner)
    }, 100)
  }

  const closeQrScanner = () => {
    if (scanner) {
      scanner.clear().catch(console.error)
      setScanner(null)
    }
    setIsQrScannerOpen(false)
  }

  if (status === 'loading') return (
    <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Mi Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Bienvenido de vuelta, {session?.user?.name}!</p>
            <Badge variant="secondary" className="mt-2 text-xs">Usuario</Badge>
          </div>
          <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-sm">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button
                  onClick={startQrScanner}
                  className="flex items-center gap-2 px-6 py-3 text-base w-full sm:w-auto"
                  disabled={status !== 'authenticated' || !session?.user?.id}
                >
                  <Scan className="h-4 w-4" />
                  Escanear QR
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Registra tu asistencia diaria
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/dashboard/routines')}
                  className="flex items-center gap-2 px-6 py-3 text-base w-full sm:w-auto"
                >
                  <List className="h-4 w-4" />
                  Mis Rutinas
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Gestiona tus rutinas de ejercicio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Scanner Dialog */}
        <Dialog open={isQrScannerOpen} onOpenChange={closeQrScanner}>
          <DialogContent className="w-[95vw] max-w-md mx-4 p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                Escanear Código QR
              </DialogTitle>
            </DialogHeader>
            <div id="qr-reader" className="w-full min-h-[250px] sm:min-h-[300px]"></div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={closeQrScanner} className="w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}