import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      session: session,
      user: session?.user,
      role: session?.user?.role,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Session test error:", error)
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}