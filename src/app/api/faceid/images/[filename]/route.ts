import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // URL structure: /api/faceid/images/[userId]/[filename]
    // params.filename will be "userId/filename"
    const [userId, filename] = params.filename.split('/')

    if (!userId || !filename) {
      return NextResponse.json("Invalid path", { status: 400 })
    }

    // Only allow users to view their own images or admins to view any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const userFaceDir = path.join(process.cwd(), 'src', 'photoface', userId)
    const filePath = path.join(userFaceDir, filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json("Image not found", { status: 404 })
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(filePath)

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error("Get face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // URL structure: /api/faceid/images/[userId]/[filename]
    const [userId, filename] = params.filename.split('/')

    if (!userId || !filename) {
      return NextResponse.json("Invalid path", { status: 400 })
    }

    // Only allow users to delete their own images or admins to delete any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const userFaceDir = path.join(process.cwd(), 'src', 'photoface', userId)
    const associationFile = path.join(userFaceDir, 'association.json')
    const filePath = path.join(userFaceDir, filename)

    if (!fs.existsSync(associationFile) || !fs.existsSync(filePath)) {
      return NextResponse.json("Image not found", { status: 404 })
    }

    // Read and update association file
    const associationData = JSON.parse(fs.readFileSync(associationFile, 'utf-8'))
    associationData.images = associationData.images.filter((img: any) => img.filename !== filename)

    // Delete the file
    fs.unlinkSync(filePath)

    // Update association file
    fs.writeFileSync(associationFile, JSON.stringify(associationData, null, 2))

    return NextResponse.json({
      success: true,
      message: "Face image deleted successfully"
    })
  } catch (error) {
    console.error("Delete face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}