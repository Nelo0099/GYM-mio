import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Register API called")

    const body = await request.json()
    console.log("Request body:", body)

    const { name, email, password } = body

    if (!name || !email || !password) {
      console.log("Missing fields:", { name, email, password: !!password })
      return NextResponse.json("Missing fields", { status: 400 })
    }

    console.log("Checking database connection...")
    await prisma.$connect()
    console.log("Database connected")

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Password hashed")

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("User already exists:", email)
      return NextResponse.json("User already exists", { status: 400 })
    }

    // Determine role based on email
    const role = email === 'rojonelov@gmail.com' ? 'admin' : 'user'

    console.log("Creating user with role:", role)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    console.log("User created successfully:", user.id)

    return NextResponse.json({
      message: "User created",
      userId: user.id,
      role: user.role
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}