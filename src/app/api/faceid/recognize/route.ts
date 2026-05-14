import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { userId, confidence, isRecognized } = await request.json()

    if (typeof confidence !== 'number' || typeof isRecognized !== 'boolean') {
      return NextResponse.json("Invalid recognition data", { status: 400 })
    }

    // Validate that the recognized user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Recognized user not found in database"
      })
    }

    // Log the recognition attempt for security monitoring
    console.log(`Face recognition attempt: User ${session.user.id} ${isRecognized ? 'successfully' : 'failed to'} recognize ${userId} with ${Math.round(confidence * 100)}% confidence`)

    return NextResponse.json({
      success: isRecognized,
      user: isRecognized ? user : null,
      confidence: confidence,
      message: isRecognized ? "Face recognized successfully" : "Face not recognized"
    })
  } catch (error) {
    console.error("Face recognition validation error:", error)
    return NextResponse.json({
      success: false,
      message: "Face recognition validation failed"
    }, { status: 500 })
  }
}