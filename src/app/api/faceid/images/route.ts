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

    const faceDir = path.join(process.cwd(), 'src', 'photoface', userId)
    const associationFile = path.join(faceDir, 'association.json')

    // Check if user has face data
    if (!fs.existsSync(associationFile)) {
      return NextResponse.json({ faceImages: [] })
    }

    // Read association file
    const associationData = JSON.parse(fs.readFileSync(associationFile, 'utf-8'))

    const imageFiles = associationData.images.map((image: any) => ({
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

    // Convert file to buffer for processing
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Create photoface directory if it doesn't exist
    const photofaceDir = path.join(process.cwd(), 'src', 'photoface')
    if (!fs.existsSync(photofaceDir)) {
      fs.mkdirSync(photofaceDir, { recursive: true })
    }

    // Create user-specific directory
    const userFaceDir = path.join(photofaceDir, userId)
    if (!fs.existsSync(userFaceDir)) {
      fs.mkdirSync(userFaceDir, { recursive: true })
    }

    // Read or create association file
    const associationFile = path.join(userFaceDir, 'association.json')
    let associationData = { userId, images: [] }

    if (fs.existsSync(associationFile)) {
      associationData = JSON.parse(fs.readFileSync(associationFile, 'utf-8'))
    }

    // Check image count limit
    if (associationData.images.length >= 6) {
      return NextResponse.json("Maximum 6 face images allowed per user", { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `face_${timestamp}_${associationData.images.length + 1}.jpg`
    const filePath = path.join(userFaceDir, filename)

    // Save the image
    fs.writeFileSync(filePath, buffer)

    // Update association file
    const imageData = {
      filename,
      uploadedAt: new Date().toISOString(),
      size: buffer.length
    }

    associationData.images.push(imageData)
    fs.writeFileSync(associationFile, JSON.stringify(associationData, null, 2))

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