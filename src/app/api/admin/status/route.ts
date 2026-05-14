import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')

    // Test basic queries
    const userCount = await prisma.user.count().catch(() => 0)
    const workoutCount = await prisma.workout.count().catch(() => 0)

    // Test new tables
    let profileCount = 0
    let routineCount = 0
    let dailyRoutineCount = 0
    let dailyExerciseCount = 0

    try {
      profileCount = await prisma.userProfile.count()
    } catch (error) {
      console.log('UserProfile table not found')
    }

    try {
      routineCount = await prisma.weeklyRoutine.count()
    } catch (error) {
      console.log('WeeklyRoutine table not found')
    }

    try {
      dailyRoutineCount = await prisma.dailyRoutine.count()
    } catch (error) {
      console.log('DailyRoutine table not found')
    }

    try {
      dailyExerciseCount = await prisma.dailyExercise.count()
    } catch (error) {
      console.log('DailyExercise table not found')
    }

    await prisma.$disconnect()

    return NextResponse.json({
      status: 'connected',
      tables: {
        users: userCount,
        workouts: workoutCount,
        userProfiles: profileCount,
        weeklyRoutines: routineCount,
        dailyRoutines: dailyRoutineCount,
        dailyExercises: dailyExerciseCount
      },
      message: profileCount > 0 ? 'All tables exist' : 'New tables missing - run migration'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 500 })
  }
}
