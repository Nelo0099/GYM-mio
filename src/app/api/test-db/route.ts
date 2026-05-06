import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection...")

    // Test database connection
    await prisma.$connect()
    console.log("Connected to database")

    const userCount = await prisma.user.count()
    console.log("User count:", userCount)

    await prisma.$disconnect()
    console.log("Disconnected from database")

    return NextResponse.json({
      status: "Database connected successfully",
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Database connection error:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json({
      status: "Database connection failed",
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}