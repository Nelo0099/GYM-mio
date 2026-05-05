import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query'],
})

export { prisma }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma