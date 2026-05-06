import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json("Missing date parameter", { status: 400 })
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json("Invalid date format. Use YYYY-MM-DD", { status: 400 })
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        date: date
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    return NextResponse.json({
      date,
      attendances,
      total: attendances.length
    })
  } catch (error) {
    console.error("Attendance fetch error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}