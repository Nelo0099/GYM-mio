import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from 'fs'
import path from 'path'

export async function DELETE(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const filename = params.filename

    if (!filename) {
      return NextResponse.json("Missing filename", { status: 400 })
    }

    // Extract userId from the filename or find the user directory
    // Since filenames are like face_timestamp_index.jpg, we need to find which user owns it
    const faceIdDir = path.join(process.cwd(), 'public', 'FaceID')

    if (!fs.existsSync(faceIdDir)) {
      return NextResponse.json("Image not found", { status: 404 })
    }

    // Find the user directory containing this file
    const userDirs = fs.readdirSync(faceIdDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    let userId = null
    let filePath = null

    for (const uid of userDirs) {
      const userFaceDir = path.join(faceIdDir, uid)
      const potentialPath = path.join(userFaceDir, filename)
      if (fs.existsSync(potentialPath)) {
        userId = uid
        filePath = potentialPath
        break
      }
    }

    if (!userId || !filePath) {
      return NextResponse.json("Image not found", { status: 404 })
    }

    // Only allow users to delete their own images or admins to delete any
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    // Delete the file
    fs.unlinkSync(filePath)

    return NextResponse.json({
      success: true,
      message: "Face image deleted successfully"
    })
  } catch (error) {
    console.error("Delete face image error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}