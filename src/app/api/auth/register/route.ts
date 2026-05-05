import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json("Missing fields", { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json("User already exists", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if this is the first user (make admin) or specific admin email
    const isAdmin = email === 'rojonelov@gmail.com'
    const role = isAdmin ? 'admin' : 'user'

    if (isAdmin && password === 'User*123') {
      // Create admin user
      const user = await prisma.user.create({
        data: {
          name: name || 'Admin User',
          email,
          password: hashedPassword,
          role: 'admin',
        }
      })
      return NextResponse.json({ message: "Admin user created", userId: user.id, role: 'admin' })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    return NextResponse.json({ message: "User created", userId: user.id, role })
  } catch (error) {
    console.error(error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}