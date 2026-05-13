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

    // If it's an auto-generated routine, create based on user profile
    if (type === 'auto') {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!profile) {
        return NextResponse.json("Profile required for auto routines", { status: 400 })
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
  } catch (error) {
    console.error("Create routine error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

function generateAutoRoutine(profile: any) {
  const { level, goals, availableDays, sessionDuration, equipment } = profile
  const hasWeights = equipment.includes('dumbbells') || equipment.includes('barbell')
  const hasMachines = equipment.includes('machines')

  // Base exercises based on equipment
  const baseExercises = {
    bodyweight: ['Push-ups', 'Squats', 'Lunges', 'Planks', 'Burpees'],
    weights: ['Bench Press', 'Squats', 'Deadlifts', 'Rows', 'Shoulder Press'],
    machines: ['Lat Pulldown', 'Leg Press', 'Chest Press', 'Seated Row', 'Leg Curl']
  }

  // Select exercises based on available equipment
  let availableExercises = [...baseExercises.bodyweight]
  if (hasWeights) availableExercises.push(...baseExercises.weights)
  if (hasMachines) availableExercises.push(...baseExercises.machines)

  // Generate routine based on level and goals
  const routine = {
    name: `Rutina ${level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedia' : 'Avanzada'} - ${goals.join(', ')}`,
    description: `Rutina generada automáticamente según tu perfil`,
    type: 'auto',
    dailyRoutines: []
  }

  // Create daily routines
  for (let day = 0; day < availableDays; day++) {
    const dayName = getDayName(day)
    const exercises = generateDayExercises(availableExercises, level, sessionDuration, goals)

    routine.dailyRoutines.push({
      dayOfWeek: day,
      name: `${dayName} - ${level === 'beginner' ? 'Full Body' : day % 2 === 0 ? 'Upper Body' : 'Lower Body'}`,
      duration: sessionDuration,
      exercises: exercises.map((ex, index) => ({ ...ex, order: index }))
    })
  }

  return routine
}

function getDayName(dayIndex: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayIndex]
}

function generateDayExercises(exercises: string[], level: string, duration: number, goals: string[]) {
  const exerciseCount = level === 'beginner' ? 4 : level === 'intermediate' ? 6 : 8
  const selectedExercises = exercises.sort(() => 0.5 - Math.random()).slice(0, exerciseCount)

  return selectedExercises.map(exercise => {
    let sets, reps, weight

    if (level === 'beginner') {
      sets = 3
      reps = goals.includes('strength') ? 8 : 12
      weight = goals.includes('strength') ? 20 : 0
    } else if (level === 'intermediate') {
      sets = 4
      reps = goals.includes('strength') ? 6 : 10
      weight = goals.includes('strength') ? 40 : 10
    } else {
      sets = 5
      reps = goals.includes('strength') ? 5 : 8
      weight = goals.includes('strength') ? 60 : 20
    }

    return {
      name: exercise,
      sets,
      reps,
      weight,
      restTime: level === 'beginner' ? 90 : level === 'intermediate' ? 120 : 150,
      notes: goals.includes('weight_loss') ? 'Enfócate en la técnica' : 'Mantén buena forma'
    }
  })
}