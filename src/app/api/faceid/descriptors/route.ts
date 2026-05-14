import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    // Get face descriptors from database
    const descriptors = await prisma.faceDescriptor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        descriptor: true,
        confidence: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      userId,
      descriptorsCount: descriptors.length,
      descriptors: descriptors.map(desc => ({
        id: desc.id,
        descriptor: JSON.parse(desc.descriptor), // Parse JSON string back to array
        confidence: desc.confidence,
        createdAt: desc.createdAt
      }))
    })
  } catch (error) {
    console.error("Get face descriptors error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const imageFile = formData.get('faceImage') as File

    if (!userId || !imageFile) {
      return NextResponse.json("Missing userId or faceImage", { status: 400 })
    }

    // Only admin can upload face images for other users, users can upload their own
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // Convert file to buffer for processing
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // For now, we'll store the image and mark it for descriptor extraction
    // In a real implementation, you'd extract descriptors server-side
    // But since face-api.js works in browser, we'll extract descriptors client-side

    // Create FaceID directory if it doesn't exist
    const faceDir = path.join(process.cwd(), 'public', 'FaceID', userId)
    if (!fs.existsSync(faceDir)) {
      fs.mkdirSync(faceDir, { recursive: true })
    }

    // Get existing images count
    const existingFiles = fs.existsSync(faceDir) ? fs.readdirSync(faceDir) : []
    const imageCount = existingFiles.filter(f => f.endsWith('.jpg') || f.endsWith('.png')).length

    if (imageCount >= 6) {
      return NextResponse.json("Maximum 6 face images allowed per user", { status: 400 })
    }

    // Save the image
    const filename = `face_${Date.now()}_${imageCount + 1}.jpg`
    const filePath = path.join(faceDir, filename)
    fs.writeFileSync(filePath, buffer)

    return NextResponse.json({
      success: true,
      filename,
      url: `/FaceID/${userId}/${filename}`,
      message: "Face image uploaded successfully. Descriptor will be extracted client-side.",
      note: "Face descriptors are extracted and stored in browser localStorage for security."
    })
  } catch (error) {
    console.error("Upload face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

// Endpoint to store face descriptors from client
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { userId, descriptors } = await request.json()

    if (!userId || !descriptors) {
      return NextResponse.json("Missing userId or descriptors", { status: 400 })
    }

    // Only allow users to store their own descriptors
    if (session.user.id !== userId) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // Validate descriptors format
    if (!Array.isArray(descriptors) || descriptors.length === 0) {
      return NextResponse.json("Invalid descriptors format", { status: 400 })
    }

    // Store descriptors in database
    const storedDescriptors = []
    for (const desc of descriptors) {
      const stored = await prisma.faceDescriptor.create({
        data: {
          userId,
          descriptor: JSON.stringify(desc.descriptor), // Convert array to JSON string
          confidence: desc.confidence || null
        }
      })
      storedDescriptors.push(stored)
    }

    console.log(`Stored ${storedDescriptors.length} face descriptors for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: `${storedDescriptors.length} face descriptors stored successfully`
    })
  } catch (error) {
    console.error("Store face descriptors error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}