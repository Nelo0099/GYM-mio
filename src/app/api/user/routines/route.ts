import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    try {
      const routines = await prisma.weeklyRoutine.findMany({
        where: { userId: session.user.id },
        include: {
          dailyRoutines: {
            include: {
              exercises: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { dayOfWeek: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(routines)
    } catch (dbError) {
      console.error('Database error fetching routines:', dbError)
      // Return empty array if tables don't exist
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("Get routines error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { name, description, type, dailyRoutines } = await request.json()

    try {
      // If it's an auto-generated routine, create based on user profile
      if (type === 'auto') {
        let profile
        try {
          profile = await prisma.userProfile.findUnique({
            where: { userId: session.user.id }
          })

          // If no profile exists, create one with defaults
          if (!profile) {
            profile = await prisma.userProfile.create({
              data: {
                userId: session.user.id,
                level: 'beginner',
                goals: ['weight_loss'],
                availableDays: 5,
                sessionDuration: 60,
                equipment: ['bodyweight'],
                restDays: [0, 6]
              }
            })
            console.log('Created default profile for user:', session.user.id)
          }
        } catch (profileError) {
          console.log('Profile table not found or error, using fallback defaults')
          profile = {
            level: 'beginner',
            goals: ['weight_loss'],
            availableDays: 5,
            sessionDuration: 60,
            equipment: ['bodyweight'],
            restDays: [0, 6]
          }
        }

        // Generate auto routine based on profile
        const autoRoutine = generateAutoRoutine(profile)
        return NextResponse.json(autoRoutine)
      }

      // Create custom routine
      const routine = await prisma.weeklyRoutine.create({
        data: {
          userId: session.user.id,
          name,
          description,
          type: 'custom',
          dailyRoutines: {
            create: dailyRoutines.map((day: any) => ({
              dayOfWeek: day.dayOfWeek,
              name: day.name,
              duration: day.duration,
              exercises: {
                create: day.exercises.map((exercise: any, index: number) => ({
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight,
                  restTime: exercise.restTime,
                  notes: exercise.notes,
                  order: index
                }))
              }
            }))
          }
        },
        include: {
          dailyRoutines: {
            include: {
              exercises: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { dayOfWeek: 'asc' }
          }
        }
      })

      return NextResponse.json(routine)
    } catch (dbError) {
      console.error('Database error creating routine:', dbError)

      // Return a mock routine for custom routines
      if (type !== 'auto') {
        return NextResponse.json({
          id: 'temp-' + Date.now(),
          userId: session.user.id,
          name,
          description,
          type: 'custom',
          dailyRoutines: dailyRoutines.map((day: any, dayIndex: number) => ({
            id: 'temp-day-' + dayIndex,
            dayOfWeek: day.dayOfWeek,
            name: day.name,
            duration: day.duration,
            exercises: day.exercises.map((exercise: any, exIndex: number) => ({
              id: 'temp-ex-' + dayIndex + '-' + exIndex,
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime,
              notes: exercise.notes,
              order: exIndex
            }))
          }))
        })
      }

      // For auto routines, still try to generate
      const mockProfile = {
        level: 'beginner',
        goals: ['weight_loss'],
        availableDays: 5,
        sessionDuration: 60,
        equipment: ['bodyweight'],
        restDays: [0, 6]
      }
      const autoRoutine = generateAutoRoutine(mockProfile)
      return NextResponse.json(autoRoutine)
    }
  } catch (error) {
    console.error("Create routine error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const muscleGroupRoutines = {
  0: { // Domingo - Descanso (generalmente)
    name: 'Descanso',
    exercises: []
  },
  1: { // Lunes - Pecho
    name: 'Pecho',
    exercises: [
      { name: 'Press de banca', sets: 4, reps: '8-10', weight: 0, restTime: 120 },
      { name: 'Press inclinado con mancuernas', sets: 3, reps: '10', weight: 0, restTime: 90 },
      { name: 'Aperturas con mancuernas', sets: 3, reps: '12', weight: 0, restTime: 90 },
      { name: 'Fondos en paralelas', sets: 3, reps: '8-12', weight: 0, restTime: 90 },
      { name: 'Cruces en polea', sets: 3, reps: '12-15', weight: 0, restTime: 90 }
    ]
  },
  2: { // Martes - Espalda
    name: 'Espalda',
    exercises: [
      { name: 'Dominadas o jalón al pecho', sets: 4, reps: '8-10', weight: 0, restTime: 120 },
      { name: 'Remo con barra', sets: 4, reps: '8', weight: 0, restTime: 120 },
      { name: 'Remo en máquina', sets: 3, reps: '10', weight: 0, restTime: 90 },
      { name: 'Peso muerto rumano', sets: 3, reps: '8', weight: 0, restTime: 90 },
      { name: 'Pull-over en polea', sets: 3, reps: '12', weight: 0, restTime: 90 }
    ]
  },
  3: { // Miércoles - Piernas
    name: 'Piernas',
    exercises: [
      { name: 'Sentadilla', sets: 4, reps: '8', weight: 0, restTime: 150 },
      { name: 'Prensa de piernas', sets: 4, reps: '10', weight: 0, restTime: 120 },
      { name: 'Zancadas', sets: 3, reps: '12 por pierna', weight: 0, restTime: 90 },
      { name: 'Curl femoral', sets: 3, reps: '12', weight: 0, restTime: 90 },
      { name: 'Extensiones de cuádriceps', sets: 3, reps: '15', weight: 0, restTime: 90 },
      { name: 'Elevación de gemelos', sets: 4, reps: '15-20', weight: 0, restTime: 60 }
    ]
  },
  4: { // Jueves - Hombros
    name: 'Hombros',
    exercises: [
      { name: 'Press militar', sets: 4, reps: '8-10', weight: 0, restTime: 120 },
      { name: 'Elevaciones laterales', sets: 4, reps: '12-15', weight: 0, restTime: 90 },
      { name: 'Pájaros o elevación posterior', sets: 3, reps: '12', weight: 0, restTime: 90 },
      { name: 'Remo al mentón', sets: 3, reps: '10', weight: 0, restTime: 90 },
      { name: 'Encogimientos de trapecio', sets: 3, reps: '12', weight: 0, restTime: 90 }
    ]
  },
  5: { // Viernes - Brazos
    name: 'Brazos',
    exercises: [
      { name: 'Curl con barra (Bíceps)', sets: 4, reps: '10', weight: 0, restTime: 90 },
      { name: 'Curl martillo', sets: 3, reps: '12', weight: 0, restTime: 90 },
      { name: 'Curl en banco inclinado', sets: 3, reps: '10', weight: 0, restTime: 90 },
      { name: 'Press cerrado (Tríceps)', sets: 4, reps: '8-10', weight: 0, restTime: 90 },
      { name: 'Extensión en polea', sets: 3, reps: '12', weight: 0, restTime: 90 },
      { name: 'Fondos en banco', sets: 3, reps: '15', weight: 0, restTime: 90 }
    ]
  },
  6: { // Sábado - Full Body (opcional)
    name: 'Full Body',
    exercises: [
      { name: 'Peso muerto', sets: 3, reps: '5', weight: 0, restTime: 150 },
      { name: 'Press de banca', sets: 3, reps: '8', weight: 0, restTime: 120 },
      { name: 'Remo con mancuerna', sets: 3, reps: '10', weight: 0, restTime: 120 },
      { name: 'Sentadilla frontal', sets: 3, reps: '8', weight: 0, restTime: 120 },
      { name: 'Plancha', sets: 3, reps: '45-60s', weight: 0, restTime: 60 }
    ]
  }
}

function generateAutoRoutine(profile: any) {
  const { level, goals, sessionDuration, equipment, restDays = [0, 6] } = profile
  // Calculate available days as total days minus rest days
  const totalDays = 7
  const availableDays = totalDays - restDays.length
  const hasWeights = equipment.includes('dumbbells') || equipment.includes('barbell')
  const hasMachines = equipment.includes('machines')

  // Generate routine based on level and goals
  const routine = {
    name: `Rutina ${level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedia' : 'Avanzada'} - ${goals.join(', ')}`,
    description: `Rutina generada automáticamente según tu perfil. Días de descanso: ${restDays.map(d => dayNames[d]).join(', ')}`,
    type: 'auto',
    dailyRoutines: []
  }

  // Create daily routines for all 7 days
  for (let day = 0; day < 7; day++) {
    if (restDays.includes(day)) {
      // Rest day
      routine.dailyRoutines.push({
        dayOfWeek: day,
        name: `${dayNames[day]} - Descanso`,
        duration: 0,
        exercises: []
      })
    } else {
      // Training day - use predefined muscle group routines
      const dayRoutine = muscleGroupRoutines[day] || muscleGroupRoutines[1] // fallback to chest
      const adjustedExercises = adjustExercisesForLevel(dayRoutine.exercises, level, goals)

      routine.dailyRoutines.push({
        dayOfWeek: day,
        name: `${dayNames[day]} - ${dayRoutine.name}`,
        duration: sessionDuration,
        exercises: adjustedExercises.map((ex, index) => ({ ...ex, order: index }))
      })
    }
  }

  return routine
}

function adjustExercisesForLevel(exercises: any[], level: string, goals: string[]) {
  return exercises.map(exercise => {
    let sets = exercise.sets
    let reps = exercise.reps
    let restTime = exercise.restTime

    // Adjust based on level
    if (level === 'beginner') {
      sets = Math.max(3, sets - 1) // Reduce sets for beginners
      restTime = Math.min(restTime, 90) // Shorter rest for beginners
    } else if (level === 'intermediate') {
      // Keep original values
    } else if (level === 'advanced') {
      sets = sets + 1 // Add sets for advanced
      restTime = Math.max(restTime, 150) // Longer rest for advanced
    }

    // Adjust based on goals
    if (goals.includes('strength')) {
      reps = Math.floor(parseInt(reps) * 0.7) // Fewer reps for strength
      restTime = Math.max(restTime, 120) // Longer rest for strength
    } else if (goals.includes('weight_loss')) {
      restTime = Math.min(restTime, 60) // Shorter rest for cardio-like training
    }

    return {
      ...exercise,
      sets,
      reps,
      restTime,
      notes: goals.includes('weight_loss') ?
        'Enfócate en la técnica y controla el tempo' :
        goals.includes('strength') ?
        'Mantén buena forma y usa pesos desafiantes' :
        'Concéntrate en la ejecución perfecta'
    }
  })
}