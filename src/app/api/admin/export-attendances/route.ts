import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const format = searchParams.get('format') || 'excel' // excel, word, txt

    if (!date) {
      return NextResponse.json("Missing date parameter", { status: 400 })
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        date: date
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Generate content based on format
    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'excel':
        // Simple CSV format that Excel can open
        content = 'Nombre,Email,Hora de Asistencia,Rol\n'
        attendances.forEach(attendance => {
          const time = new Date(attendance.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          content += `"${attendance.user.name || 'Sin nombre'}","${attendance.user.email}","${time}","${attendance.user.role === 'admin' ? 'Admin' : 'Usuario'}"\n`
        })
        filename = `asistencias_${date}.csv`
        mimeType = 'text/csv'
        break

      case 'word':
        // Simple HTML format that Word can open
        content = `<html><body><h1>Asistencias del ${date}</h1><table border="1"><tr><th>Nombre</th><th>Email</th><th>Hora de Asistencia</th><th>Rol</th></tr>`
        attendances.forEach(attendance => {
          const time = new Date(attendance.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          content += `<tr><td>${attendance.user.name || 'Sin nombre'}</td><td>${attendance.user.email}</td><td>${time}</td><td>${attendance.user.role === 'admin' ? 'Admin' : 'Usuario'}</td></tr>`
        })
        content += '</table></body></html>'
        filename = `asistencias_${date}.doc`
        mimeType = 'application/msword'
        break

      case 'txt':
      default:
        content = `ASISTENCIAS DEL ${date}\n\n`
        content += 'Nombre\t\t\tEmail\t\t\tHora\t\t\tRol\n'
        content += '='.repeat(80) + '\n'
        attendances.forEach(attendance => {
          const time = new Date(attendance.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          content += `${(attendance.user.name || 'Sin nombre').padEnd(20)}${(attendance.user.email).padEnd(25)}${time.padEnd(15)}${attendance.user.role === 'admin' ? 'Admin' : 'Usuario'}\n`
        })
        filename = `asistencias_${date}.txt`
        mimeType = 'text/plain'
        break
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error("Export attendances error:", error)
    return NextResponse.json("Internal server error", { status: 500 })
  }
}