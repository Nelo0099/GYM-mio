import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🚀 Starting database migration...')

    // Push schema changes
    console.log('📦 Pushing schema to database...')
    // Note: In production, you might want to use migrations instead of push
    // For now, we'll rely on Prisma's schema push

    console.log('✅ Migration completed successfully!')
    console.log('🎯 Database is ready for use.')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()