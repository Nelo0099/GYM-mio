import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}