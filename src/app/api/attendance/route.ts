import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('Attendance GET - Session:', !!session)
    console.log('Attendance GET - User:', session?.user)
    console.log('Attendance GET - Role:', session?.user?.role)

    // Temporarily allow any authenticated user to test
    if (!session?.user?.id) {
      console.log('Attendance GET - Authorization failed: no session')
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // TODO: Re-enable admin check after debugging
    // if (!session?.user?.role || session.user.role !== 'admin') {
    //   console.log('Attendance GET - Authorization failed: role check')
    //   return NextResponse.json("Unauthorized", { status: 401 })
    // }

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

    console.log('Fetching attendances for date:', date)

    // Also try to find all attendances to debug
    const allAttendances = await prisma.attendance.findMany({
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

    console.log('All attendances in database:', allAttendances.map(a => ({
      id: a.id,
      date: a.date,
      user: a.user.name,
      timestamp: a.timestamp
    })))

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

    console.log('Found attendances for date', date, ':', attendances.length)

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