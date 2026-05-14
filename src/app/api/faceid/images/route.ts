import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from 'fs'
import path from 'path'

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

    const faceDir = path.join(process.cwd(), 'public', 'FaceID', userId)

    if (!fs.existsSync(faceDir)) {
      return NextResponse.json({ faceImages: [] })
    }

    const files = fs.readdirSync(faceDir)
    const imageFiles = files
      .filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'))
      .map(filename => ({
        filename,
        url: `/FaceID/${userId}/${filename}`
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

    // Convert file to buffer for processing
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Create FaceID directory if it doesn't exist
    const faceDir = path.join(process.cwd(), 'public', 'FaceID', userId)
    if (!fs.existsSync(faceDir)) {
      fs.mkdirSync(faceDir, { recursive: true })
    }

    // Get existing images count
    const existingFiles = fs.existsSync(faceDir) ? fs.readdirSync(faceDir) : []
    const imageCount = existingFiles.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')).length

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
      message: "Face image uploaded successfully"
    })
  } catch (error) {
    console.error("Upload face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}