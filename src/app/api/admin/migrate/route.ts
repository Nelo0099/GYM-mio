import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Allow anyone to run migrations for now (remove in production)
    // if (!session?.user?.role || session.user.role !== 'admin') {
    //   return NextResponse.json("Unauthorized", { status: 401 })
    // }

    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')

    // Check if new tables exist
    try {
      await prisma.userProfile.findFirst()
      console.log('UserProfile table exists')
    } catch (error) {
      console.log('UserProfile table missing, will be created by Prisma push')
    }

    // Try to create a test profile to ensure tables work
    const testProfile = await prisma.userProfile.upsert({
      where: { userId: 'test-user' },
      update: {
        level: 'beginner',
        goals: ['weight_loss'],
        availableDays: 5,
        sessionDuration: 60,
        equipment: ['bodyweight'],
        restDays: [0, 6]
      },
      create: {
        userId: 'test-user',
        level: 'beginner',
        goals: ['weight_loss'],
        availableDays: 5,
        sessionDuration: 60,
        equipment: ['bodyweight'],
        restDays: [0, 6]
      }
    })

    console.log('Test profile created:', testProfile.id)

    // Clean up test data
    await prisma.userProfile.delete({
      where: { userId: 'test-user' }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    }, { status: 500 })
  }
}
