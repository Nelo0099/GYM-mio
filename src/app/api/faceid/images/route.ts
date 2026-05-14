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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json("Missing userId", { status: 400 })
    }

    // Only allow users to view their own images or admins to view any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // Get face images from database
    const faceImages = await prisma.faceImage.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        filename: true,
        mimeType: true,
        size: true,
        uploadedAt: true
      }
    })

    // Convert to the expected format
    const imageFiles = faceImages.map(image => ({
      filename: image.filename,
      url: `/api/faceid/images/${userId}/${image.filename}`
    }))

    return NextResponse.json({ faceImages: imageFiles })
  } catch (error) {
    console.error("Get face images error:", error)
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

    // Check image count limit (6 images max per user)
    const existingImagesCount = await prisma.faceImage.count({
      where: { userId }
    })

    if (existingImagesCount >= 6) {
      return NextResponse.json("Maximum 6 face images allowed per user", { status: 400 })
    }

    // Convert file to buffer and then to base64
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const base64Data = buffer.toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `face_${timestamp}_${existingImagesCount + 1}.jpg`

    // Store image in database
    await prisma.faceImage.create({
      data: {
        userId,
        filename,
        imageData: base64Data,
        mimeType,
        size: buffer.length
      }
    })

    return NextResponse.json({
      success: true,
      filename,
      url: `/api/faceid/images/${userId}/${filename}`,
      message: "Face image uploaded successfully"
    })
  } catch (error) {
    console.error("Upload face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}