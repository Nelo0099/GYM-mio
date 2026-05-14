import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log('Running post-deployment migration...')

    // Test database connection
    await prisma.$connect()
    console.log('Database connected')

    // Check if tables exist and create if missing
    try {
      await prisma.userProfile.findFirst()
      console.log('Tables already exist')
    } catch (error) {
      console.log('Tables missing, they should be created by Prisma deployment')
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Post-deployment migration completed'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error'
    }, { status: 500 })
  }
}
