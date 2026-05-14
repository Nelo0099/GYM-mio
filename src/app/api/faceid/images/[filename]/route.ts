import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
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

    // Only allow users to view their own images or admins to view any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // Get image from database
    const faceImage = await prisma.faceImage.findFirst({
      where: {
        userId,
        filename
      }
    })

    if (!faceImage) {
      return NextResponse.json("Image not found", { status: 404 })
    }

    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(faceImage.imageData, 'base64')

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': faceImage.mimeType,
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

    // URL structure: /api/faceid/images/{userId}/{filename}
    const [userId, filename] = params.filename.split('/')

    if (!userId || !filename) {
      return NextResponse.json("Invalid path", { status: 400 })
    }

    // Only allow users to delete their own images or admins to delete any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // Delete image from database
    const deletedImage = await prisma.faceImage.deleteMany({
      where: {
        userId,
        filename
      }
    })

    if (deletedImage.count === 0) {
      return NextResponse.json("Image not found", { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Face image deleted successfully"
    })
  } catch (error) {
    console.error("Delete face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}