"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Dumbbell, Calendar, TrendingUp, Target, QrCode, Scan, LogOut } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"

interface Workout {
  id: string
  name: string
  description: string | null
  exercises: Array<{
    name: string
    sets: number | null
    reps: number | null
    weight: number | null
  }>
  createdAt: string
}

export default function UserDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    description: '',
    exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }]
  })
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
    fetchWorkouts()
  }, [session, status, router])

  const fetchWorkouts = async () => {
    const response = await fetch('/api/workouts')
    if (response.ok) {
      const data = await response.json()
      setWorkouts(data)
    }
  }

  const handleCreateWorkout = async () => {
    if (!newWorkout.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la rutina es obligatorio",
        variant: "destructive",
      })
      return
    }

    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newWorkout.name,
        description: newWorkout.description,
        exercises: newWorkout.exercises.filter(ex => ex.name.trim())
      }),
    })

    if (response.ok) {
      toast({
        title: "Rutina creada",
        description: "Tu nueva rutina ha sido guardada",
      })
      setIsCreateDialogOpen(false)
      setNewWorkout({
        name: '',
        description: '',
        exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }]
      })
      fetchWorkouts()
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive",
      })
    }
  }

  const addExercise = () => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: 3, reps: 10, weight: 0 }]
    }))
  }

  const updateExercise = (index: number, field: string, value: string | number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      )
    }))
  }

  const removeExercise = (index: number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  const handleQrScan = async (decodedText: string, decodedResult: any) => {
    console.log('QR scanned, raw text:', decodedText)
    try {
      const qrData = JSON.parse(decodedText)
      console.log('Parsed QR data:', qrData)

      if (qrData.type === 'attendance') {
        console.log('QR scanned, recording attendance for user:', session?.user?.id)
        // Register attendance
        const response = await fetch('/api/attendance/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: session?.user?.id }),
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
    console.error("QR scan error:", error)
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
          aspectRatio: 1.0,
          supportedScanTypes: ["qr_code"], // Explicitly specify QR codes
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
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Mi Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido de vuelta, {session?.user?.name}!</p>
            <Badge variant="secondary" className="mt-2">Usuario</Badge>
          </div>
          <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-4">
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button
                  onClick={startQrScanner}
                  className="flex items-center gap-2 px-8 py-3 text-lg"
                  size="lg"
                >
                  <Scan className="h-5 w-5" />
                  Escanear QR para Registrar Asistencia
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Escanea el código QR del gimnasio para registrar tu asistencia diaria
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Scanner Dialog */}
        <Dialog open={isQrScannerOpen} onOpenChange={closeQrScanner}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Escanear Código QR
              </DialogTitle>
            </DialogHeader>
            <div id="qr-reader" className="w-full"></div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeQrScanner}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Rutinas</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workouts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ejercicios Totales</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workouts.reduce((total, workout) => total + workout.exercises.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Workout Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Nueva Rutina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Rutina</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workout-name">Nombre de la Rutina</Label>
                  <Input
                    id="workout-name"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Rutina de Fuerza"
                  />
                </div>

                <div>
                  <Label htmlFor="workout-description">Descripción (opcional)</Label>
                  <Textarea
                    id="workout-description"
                    value={newWorkout.description}
                    onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe tu rutina..."
                  />
                </div>

                <div>
                  <Label>Ejercicios</Label>
                  <div className="space-y-3 mt-2">
                    {newWorkout.exercises.map((exercise, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            placeholder="Nombre del ejercicio"
                            value={exercise.name}
                            onChange={(e) => updateExercise(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-16">
                          <Input
                            type="number"
                            placeholder="Sets"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="w-16">
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Peso"
                            value={exercise.weight}
                            onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                          />
                        </div>
                        {newWorkout.exercises.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExercise(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addExercise}
                    className="mt-2"
                  >
                    + Agregar Ejercicio
                  </Button>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateWorkout} className="flex-1">
                    Crear Rutina
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workouts List */}
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold">Mis Rutinas</h2>
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tienes rutinas aún</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera rutina para comenzar tu transformación
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Crear Primera Rutina
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {workouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{workout.name}</CardTitle>
                        {workout.description && (
                          <p className="text-muted-foreground mt-1">{workout.description}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {workout.exercises.length} ejercicios
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="font-medium">{exercise.name}</span>
                          <div className="text-sm text-muted-foreground">
                            {exercise.sets}×{exercise.reps} {exercise.weight > 0 && `@ ${exercise.weight}kg`}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Creado: {new Date(workout.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}