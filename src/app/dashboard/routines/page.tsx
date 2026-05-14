"use client"

import { useSession } from "next-auth/react"
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
import { Plus, Calendar, Dumbbell, Settings, ArrowLeft, Eye, Zap, Trash2 } from "lucide-react"

interface UserProfile {
  id: string
  level: string
  goals: string[]
  availableDays: number
  sessionDuration: number
  equipment: string[]
  restDays: number[]
}

interface RoutineExerciseInput {
  name: string
  sets?: number
  reps?: number
  weight?: number
  restTime?: number
  notes?: string
}

interface RoutineDayInput {
  dayOfWeek: number
  name: string
  duration: number
  exercises: RoutineExerciseInput[]
}

interface NewRoutineForm {
  name: string
  description: string
  assignToDay: number | null
  dailyRoutines: RoutineDayInput[]
}

interface DailyExercise {
  id: string
  name: string
  sets: number | null
  reps: number | null
  weight: number | null
  restTime: number | null
  notes: string | null
  order: number
}

interface DailyRoutine {
  id: string
  dayOfWeek: number
  name: string
  duration: number | null
  exercises: DailyExercise[]
}

interface WeeklyRoutine {
  id: string
  name: string
  description: string | null
  type: string
  isActive: boolean
  createdAt: string
  dailyRoutines: DailyRoutine[]
  assignedDay?: number | null
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const createEmptyRoutineForm = (): NewRoutineForm => ({
  name: '',
  description: '',
  assignToDay: null,
  dailyRoutines: Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    name: `${dayNames[i]} - Descanso`,
    duration: 60,
    exercises: [],
  })),
})

export default function RoutinesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [routines, setRoutines] = useState<WeeklyRoutine[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<WeeklyRoutine | null>(null)
  const [newRoutine, setNewRoutine] = useState<NewRoutineForm>(createEmptyRoutineForm)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchRoutines()
    fetchProfile()
  }, [session, status, router])

  const fetchRoutines = async () => {
    const response = await fetch('/api/user/routines')
    if (response.ok) {
      const data = await response.json()
      setRoutines(data)
    }
  }

  const fetchProfile = async () => {
    const response = await fetch('/api/user/profile')
    if (response.ok) {
      const data = await response.json()
      setProfile(data)
    }
  }

  const handleCreateCustomRoutine = async () => {
    if (!newRoutine.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la rutina es obligatorio",
        variant: "destructive",
      })
      return
    }

    let dailyRoutinesToSend = newRoutine.dailyRoutines.filter(day =>
      day.exercises.length > 0 || !day.name.includes('Descanso')
    )

    // If assigning to specific day, only send that day's routine
    if (newRoutine.assignToDay !== null) {
      const specificDay = newRoutine.dailyRoutines[newRoutine.assignToDay]
      if (specificDay.exercises.length > 0) {
        dailyRoutinesToSend = [{
          dayOfWeek: newRoutine.assignToDay,
          name: specificDay.name,
          duration: specificDay.duration,
          exercises: specificDay.exercises
        }]
      } else {
        toast({
          title: "Error",
          description: "El día seleccionado no tiene ejercicios",
          variant: "destructive",
        })
        return
      }
    }

    const response = await fetch('/api/user/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newRoutine.name,
        description: newRoutine.description,
        type: 'custom',
        dailyRoutines: dailyRoutinesToSend
      }),
    })

    if (response.ok) {
      toast({
        title: "Rutina creada",
        description: "Tu rutina semanal ha sido guardada",
      })
      setIsCreateDialogOpen(false)
      setNewRoutine(createEmptyRoutineForm())
      fetchRoutines()
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive",
      })
    }
  }

  const updateProfile = async () => {
    if (!profile) return

    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })

    if (response.ok) {
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido guardado",
      })
      setIsProfileDialogOpen(false)
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    }
  }

  const deleteRoutine = async (routineId: string, routineName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la rutina "${routineName}"? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/user/routines?id=${routineId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Rutina eliminada",
          description: "La rutina ha sido eliminada correctamente",
        })
        fetchRoutines()
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la rutina",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete routine error:', error)
      toast({
        title: "Error",
        description: "Error al eliminar la rutina",
        variant: "destructive",
      })
    }
  }

  const deleteAllRoutines = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODAS tus rutinas semanales? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const deletePromises = routines.map(routine =>
        fetch(`/api/user/routines?id=${routine.id}`, { method: 'DELETE' })
      )

      const results = await Promise.all(deletePromises)
      const successCount = results.filter(r => r.ok).length

      if (successCount === routines.length) {
        toast({
          title: "Rutinas eliminadas",
          description: `Se eliminaron ${routines.length} rutinas correctamente`,
        })
        fetchRoutines()
      } else {
        toast({
          title: "Error parcial",
          description: `Se eliminaron ${successCount} de ${routines.length} rutinas`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Delete all routines error:', error)
      toast({
        title: "Error",
        description: "Error al eliminar las rutinas",
        variant: "destructive",
      })
    }
  }

  const assignRoutineToDay = async (routineId: string, dayOfWeek: number | null) => {
    try {
      if (dayOfWeek === null) {
        return
      }

      // First, unassign from any existing day
      const existingAssignments = routines.flatMap(r =>
        r.dailyRoutines.filter(dr => dr.dayOfWeek === dayOfWeek)
      )

      if (existingAssignments.length > 0) {
        toast({
          title: "Día ocupado",
          description: "Este día ya tiene una rutina asignada. Primero desasigna la otra rutina.",
          variant: "destructive",
        })
        return
      }

      // For now, just show a message - full implementation would need backend support
      toast({
        title: "Función en desarrollo",
        description: `Rutina asignada al día ${dayNames[dayOfWeek]}`,
      })
    } catch (error) {
      console.error('Assign routine error:', error)
      toast({
        title: "Error",
        description: "Error al asignar la rutina",
        variant: "destructive",
      })
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando tus rutinas...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Mis Rutinas</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gestiona tus rutinas de ejercicio semanales</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {routines.length > 0 && (
              <Button
                onClick={deleteAllRoutines}
                variant="destructive"
                size="sm"
                className="text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Todas
              </Button>
            )}
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={() => setIsProfileDialogOpen(true)} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Perfil
            </Button>
          </div>
        </div>

        {/* Create Routine Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto text-sm">
                <Plus className="h-4 w-4" />
                Crear Rutina Personalizada
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Crear Rutina Personalizada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routine-name">Nombre de la Rutina</Label>
                  <Input
                    id="routine-name"
                    value={newRoutine.name}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Rutina de Fuerza"
                  />
                </div>

                <div>
                  <Label htmlFor="routine-description">Descripción (opcional)</Label>
                  <Textarea
                    id="routine-description"
                    value={newRoutine.description}
                    onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe tu rutina semanal..."
                  />
                </div>

                <div>
                  <Label>Asignar a día específico (opcional)</Label>
                  <select
                    value={newRoutine.assignToDay ?? ''}
                    onChange={(e) => setNewRoutine(prev => ({
                      ...prev,
                      assignToDay: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="w-full p-2 border rounded-md mt-2"
                  >
                    <option value="">Crear rutina semanal completa</option>
                    {dayNames.map((dayName, index) => (
                      <option key={index} value={index}>
                        Asignar solo a {dayName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Si seleccionas un día, solo se creará la rutina para ese día específico
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                  <Button onClick={handleCreateCustomRoutine} className="flex-1">
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

        {/* Routines List */}
        <div className="grid gap-4 sm:gap-6">
          {routines.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12 px-4">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No tienes rutinas semanales</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-4 px-2">
                  Crea tu primera rutina semanal personalizada
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {routines.map((routine) => (
                <Card key={routine.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                      <div className="min-w-0">
                        <CardTitle className="text-lg">{routine.name}</CardTitle>
                        {routine.description && (
                          <p className="text-muted-foreground mt-1">{routine.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant={routine.type === 'auto' ? 'default' : 'secondary'}>
                            {routine.type === 'auto' ? 'Automática' : 'Personalizada'}
                          </Badge>
                          <Badge variant="outline">
                            {routine.dailyRoutines.length} días
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => setSelectedRoutine(routine)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        <Button
                          onClick={() => deleteRoutine(routine.id, routine.name)}
                          variant="destructive"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                       </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Asignar rutina semanal a día específico:</Label>
                        <select
                          value={routine.assignedDay || ''}
                          onChange={(e) => assignRoutineToDay(routine.id, e.target.value ? parseInt(e.target.value) : null)}
                          className="text-sm p-2 border rounded bg-background"
                        >
                          <option value="">Sin asignar</option>
                          {dayNames.map((dayName, index) => (
                            <option key={index} value={index}>
                              {dayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-3">Días de la semana:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2">
                          {routine.dailyRoutines.map((day) => (
                            <div key={day.dayOfWeek} className="p-3 border rounded-lg">
                              <h5 className="font-medium text-sm">{dayNames[day.dayOfWeek]}</h5>
                              <p className="text-xs text-muted-foreground">{day.name}</p>
                              <p className="text-xs text-muted-foreground">{day.exercises.length} ejercicios</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Routine Detail Dialog */}
        {selectedRoutine && (
          <Dialog open={!!selectedRoutine} onOpenChange={() => setSelectedRoutine(null)}>
            <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{selectedRoutine.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedRoutine.dailyRoutines.map((day) => (
                  <Card key={day.dayOfWeek}>
                    <CardHeader>
                      <CardTitle className="text-lg">{day.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {dayNames[day.dayOfWeek]} - {day.exercises.length} ejercicios
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {day.exercises.map((exercise) => (
                          <div key={exercise.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{exercise.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {exercise.sets} series × {exercise.reps} reps
                                {exercise.weight && exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="w-[95vw] max-w-lg mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Configurar Perfil de Entrenamiento</DialogTitle>
              <p className="text-sm text-muted-foreground">Esta configuración determina cómo se generan tus rutinas automáticas</p>
            </DialogHeader>
            {profile && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nivel de experiencia</Label>
                  <select
                    value={profile.level}
                    onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="beginner">Principiante (0-6 meses)</option>
                    <option value="intermediate">Intermedio (6-18 meses)</option>
                    <option value="advanced">Avanzado (+18 meses)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Objetivos principales</Label>
                  <div className="space-y-2 mt-2">
                    {['weight_loss', 'muscle_gain', 'strength', 'endurance', 'maintenance'].map(goal => (
                      <label key={goal} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={profile.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({ ...profile, goals: [...profile.goals, goal] })
                            } else {
                              setProfile({ ...profile, goals: profile.goals.filter(g => g !== goal) })
                            }
                          }}
                        />
                        {goal === 'weight_loss' ? 'Pérdida de peso' :
                         goal === 'muscle_gain' ? 'Ganancia muscular' :
                         goal === 'strength' ? 'Fuerza máxima' :
                         goal === 'endurance' ? 'Resistencia' : 'Mantenimiento'}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Días disponibles por semana</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={profile.availableDays}
                    onChange={(e) => setProfile({ ...profile, availableDays: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Duración por sesión (minutos)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="120"
                    value={profile.sessionDuration}
                    onChange={(e) => setProfile({ ...profile, sessionDuration: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Equipamiento disponible</Label>
                  <div className="space-y-2 mt-2">
                    {['dumbbells', 'barbell', 'machines', 'bodyweight', 'resistance_bands'].map(equip => (
                      <label key={equip} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={profile.equipment.includes(equip)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({ ...profile, equipment: [...profile.equipment, equip] })
                            } else {
                              setProfile({ ...profile, equipment: profile.equipment.filter(e => e !== equip) })
                            }
                          }}
                        />
                        {equip === 'dumbbells' ? 'Mancuernas' :
                         equip === 'barbell' ? 'Barra' :
                         equip === 'machines' ? 'Máquinas' :
                         equip === 'bodyweight' ? 'Peso corporal' : 'Bandas elásticas'}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Días de descanso</Label>
                  <div className="space-y-2 mt-2">
                    {dayNames.map((dayName, index) => (
                      <label key={index} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={profile.restDays.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({ ...profile, restDays: [...profile.restDays, index] })
                            } else {
                              setProfile({ ...profile, restDays: profile.restDays.filter(d => d !== index) })
                            }
                          }}
                        />
                        {dayName}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Objetivos</Label>
                  <div className="space-y-2">
                    {['weight_loss', 'muscle_gain', 'strength', 'endurance', 'maintenance'].map(goal => (
                      <label key={goal} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({ ...profile, goals: [...profile.goals, goal] })
                            } else {
                              setProfile({ ...profile, goals: profile.goals.filter(g => g !== goal) })
                            }
                          }}
                        />
                        {goal === 'weight_loss' ? 'Pérdida de peso' :
                         goal === 'muscle_gain' ? 'Ganancia muscular' :
                         goal === 'strength' ? 'Fuerza' :
                         goal === 'endurance' ? 'Resistencia' : 'Mantenimiento'}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Días disponibles por semana</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={profile.availableDays}
                    onChange={(e) => setProfile({ ...profile, availableDays: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Duración por sesión (minutos)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="120"
                    value={profile.sessionDuration}
                    onChange={(e) => setProfile({ ...profile, sessionDuration: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Equipamiento disponible</Label>
                  <div className="space-y-2">
                    {['dumbbells', 'barbell', 'machines', 'bodyweight', 'resistance_bands'].map(equip => (
                      <label key={equip} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={profile.equipment.includes(equip)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({ ...profile, equipment: [...profile.equipment, equip] })
                            } else {
                              setProfile({ ...profile, equipment: profile.equipment.filter(e => e !== equip) })
                            }
                          }}
                        />
                        {equip === 'dumbbells' ? 'Mancuernas' :
                         equip === 'barbell' ? 'Barra' :
                         equip === 'machines' ? 'Máquinas' :
                         equip === 'bodyweight' ? 'Peso corporal' : 'Bandas elásticas'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={updateProfile} className="flex-1">
                    Guardar Perfil
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsProfileDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
