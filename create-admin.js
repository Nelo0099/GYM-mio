import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('User*123', 10)

    const user = await prisma.user.upsert({
      where: { email: 'rojonelov@gmail.com' },
      update: {},
      create: {
        email: 'rojonelov@gmail.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      },
    })

    console.log('Admin user created successfully:', user.email, 'Role:', user.role)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()