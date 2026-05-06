import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json("Missing userId", { status: 400 })
    }

    // Prevent deletion of the main admin
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userToDelete) {
      return NextResponse.json("User not found", { status: 404 })
    }

    if (userToDelete.email === 'rojonelov@gmail.com') {
      return NextResponse.json("Cannot delete main admin", { status: 403 })
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}