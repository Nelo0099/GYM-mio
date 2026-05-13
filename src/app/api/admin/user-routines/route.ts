import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json("Missing userId parameter", { status: 400 })
    }

    const routines = await prisma.weeklyRoutine.findMany({
      where: { userId },
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    return NextResponse.json({ user, routines })
  } catch (error) {
    console.error("Get user routines error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { userId, routineId, action, data } = await request.json()

    if (!userId) {
      return NextResponse.json("Missing userId", { status: 400 })
    }

    switch (action) {
      case 'update_exercise':
        const { exerciseId, updates } = data
        await prisma.dailyExercise.update({
          where: { id: exerciseId },
          data: updates
        })
        break

      case 'replace_routine':
        // Delete existing routine
        await prisma.weeklyRoutine.delete({
          where: { id: routineId }
        })

        // Create new routine
        const newRoutine = await prisma.weeklyRoutine.create({
          data: {
            userId,
            ...data.routine
          },
          include: {
            dailyRoutines: {
              include: { exercises: { orderBy: { order: 'asc' } } },
              orderBy: { dayOfWeek: 'asc' }
            }
          }
        })
        return NextResponse.json(newRoutine)

      default:
        return NextResponse.json("Invalid action", { status: 400 })
    }

    // Return updated routine
    const updatedRoutine = await prisma.weeklyRoutine.findUnique({
      where: { id: routineId },
      include: {
        dailyRoutines: {
          include: { exercises: { orderBy: { order: 'asc' } } },
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedRoutine)
  } catch (error) {
    console.error("Update user routine error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}