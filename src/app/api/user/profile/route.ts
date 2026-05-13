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
      availableDays: 3,
      sessionDuration: 60,
      equipment: ["bodyweight"]
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { level, goals, availableDays, sessionDuration, equipment } = await request.json()

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        level,
        goals,
        availableDays,
        sessionDuration,
        equipment
      },
      create: {
        userId: session.user.id,
        level,
        goals,
        availableDays,
        sessionDuration,
        equipment
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}