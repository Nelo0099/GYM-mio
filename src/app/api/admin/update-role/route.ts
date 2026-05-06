import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { userId, role } = await request.json()

    if (!userId || !['admin', 'user'].includes(role)) {
      return NextResponse.json("Invalid data", { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    return NextResponse.json({ message: "Role updated", user })
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}