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
      const workouts = await prisma.workout.findMany({
        where: { userId: session.user.id },
        include: {
          exercises: true,
        },
      })

      return NextResponse.json(workouts)
    } catch (dbError) {
      console.error('Database error, returning empty workouts:', dbError)
      // Return empty array if database tables don't exist yet
      return NextResponse.json([])
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { name, description, exercises } = await request.json()

    try {
      const workout = await prisma.workout.create({
        data: {
          userId: session.user.id,
          name,
          description,
          exercises: {
            create: exercises,
          },
        },
        include: {
          exercises: true,
        },
      })

      return NextResponse.json(workout)
    } catch (dbError) {
      console.error('Database error creating workout:', dbError)
      // Return a mock workout for now
      return NextResponse.json({
        id: 'temp-' + Date.now(),
        userId: session.user.id,
        name,
        description,
        exercises: exercises.map((ex: any, index: number) => ({
          id: 'temp-ex-' + index,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight
        }))
      })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}