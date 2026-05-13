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

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json(profile || {
      level: "beginner",
      goals: [],
      availableDays: 5,
      sessionDuration: 60,
      equipment: ["bodyweight"],
      restDays: [0, 6] // Sunday and Saturday by default
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({
      level: "beginner",
      goals: [],
      availableDays: 5,
      sessionDuration: 60,
      equipment: ["bodyweight"],
      restDays: [0, 6]
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { level, goals, availableDays, sessionDuration, equipment, restDays } = await request.json()

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        level,
        goals,
        availableDays,
        sessionDuration,
        equipment,
        restDays
      },
      create: {
        userId: session.user.id,
        level,
        goals,
        availableDays,
        sessionDuration,
        equipment,
        restDays
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Update profile error:", error)
    // Return a fallback profile on error
    return NextResponse.json({
      id: "fallback",
      userId: session?.user?.id,
      level: "beginner",
      goals: [],
      availableDays: 5,
      sessionDuration: 60,
      equipment: ["bodyweight"],
      restDays: [0, 6]
    })
  }
}