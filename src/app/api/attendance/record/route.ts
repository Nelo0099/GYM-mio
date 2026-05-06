import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json("Missing userId", { status: 400 })
    }

    // Get current date in Havana, Cuba timezone (UTC-4)
    const now = new Date()
    const havanaTime = new Date(now.getTime() - (4 * 60 * 60 * 1000)) // UTC-4
    const dateStr = havanaTime.toISOString().split('T')[0] // YYYY-MM-DD format
    const timestamp = havanaTime.toISOString()

    // Check if attendance already exists for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateStr
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json({
        message: "Attendance already recorded for today",
        attendance: existingAttendance
      })
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: dateStr,
        timestamp,
        createdAt: timestamp,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: "Attendance recorded successfully",
      attendance
    })
  } catch (error) {
    console.error("Attendance registration error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}