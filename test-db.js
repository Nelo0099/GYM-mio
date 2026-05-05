import { prisma } from './src/lib/db'

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully!')
    await prisma.$disconnect()
  } catch (error) {
    console.error('Database connection failed:', error)
  }
}

testConnection()