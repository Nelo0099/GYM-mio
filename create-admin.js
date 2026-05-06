import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected successfully')

    const hashedPassword = await bcrypt.hash('User*123', 10)
    console.log('Password hashed')

    const user = await prisma.user.upsert({
      where: { email: 'rojonelov@gmail.com' },
      update: {
        password: hashedPassword,
        role: 'admin'
      },
      create: {
        email: 'rojonelov@gmail.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      },
    })

    console.log('✅ Admin user created/updated successfully!')
    console.log('📧 Email:', user.email)
    console.log('👤 Name:', user.name)
    console.log('🔐 Role:', user.role)
    console.log('🆔 ID:', user.id)
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('Database connection closed')
  }
}

createAdminUser()