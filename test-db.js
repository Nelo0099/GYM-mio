import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully!');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();