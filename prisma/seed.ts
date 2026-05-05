import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('User*123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'rojonelov@gmail.com' },
    update: {},
    create: {
      email: 'rojonelov@gmail.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Admin user created:', admin)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })