import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      include: {
        exercises: true,
      },
    })

    return NextResponse.json(workouts)
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { name, description, exercises } = await request.json()

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
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}