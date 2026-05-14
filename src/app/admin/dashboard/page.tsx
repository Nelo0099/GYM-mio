"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Users, UserCheck, Settings, BarChart3, Plus, Trash2, LogOut, Mail, User, Calendar, QrCode, Download, FileText, FileSpreadsheet } from "lucide-react"
import { Calendar as CalendarComponent } from 'react-calendar'
import QRCode from 'qrcode'
import 'react-calendar/dist/Calendar.css'

type CalendarValue = Date | [Date | null, Date | null] | null

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

interface Stats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  recentUsers: number
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [attendances, setAttendances] = useState<any[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentUsers: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }
    if (!session?.user?.role || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    console.log('Admin dashboard: Session authenticated, initializing...')

    // Add a small delay to ensure session is fully loaded
    setTimeout(() => {
      fetchUsers()
      generateQRCode()
      // Don't auto-call handleDateChange on load - wait for user click
    }, 100)
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        calculateStats(data)
      } else {
        const errorText = await response.text()
        console.error("Error fetching users:", errorText)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Network error:", error)
      toast({
        title: "Error de conexión",
        description: "Verifica tu conexión a internet",
        variant: "destructive",
      })
    }
  }

  const calculateStats = (userData: User[]) => {
    const total = userData.length
    const admins = userData.filter(u => u.role === 'admin').length
    const regulars = total - admins

    // Calculate users created in the current week (Havana timezone UTC-4)
    const now = new Date()
    const havanaNow = new Date(now.getTime() - (4 * 60 * 60 * 1000)) // UTC-4
    const startOfWeek = new Date(havanaNow)
    startOfWeek.setDate(havanaNow.getDate() - havanaNow.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    const recent = userData.filter(u => {
      const createdAt = new Date(u.createdAt)
      return createdAt >= startOfWeek
    }).length

    setStats({
      totalUsers: total,
      adminUsers: admins,
      regularUsers: regulars,
      recentUsers: recent
    })
  }

  const updateRole = async (userId: string, role: string) => {
    const response = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, role }),
    })
    if (response.ok) {
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente",
      })
      fetchUsers() // Refresh list
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      })
    }
  }

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newUser),
    })

    if (response.ok) {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      })
      setIsCreateDialogOpen(false)
      setNewUser({ name: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } else {
      const error = await response.text()
      toast({
        title: "Error",
        description: error || "No se pudo crear el usuario",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    if (userToDelete.email === 'rojonelov@gmail.com') {
      toast({
        title: "Error",
        description: "No se puede eliminar al administrador principal",
        variant: "destructive",
      })
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      return
    }

    const response = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: userToDelete.id }),
    })

    if (response.ok) {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      })
      fetchUsers()
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }

    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleDateChange = async (value: CalendarValue) => {
    if (!(value instanceof Date)) {
      return
    }

    const date = value
    console.log('handleDateChange called with date:', date)
    console.log('Current session status:', status)
    console.log('Current session user:', session?.user)

    setSelectedDate(date)

    // Send date as-is, let server handle timezone conversion
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

    console.log('Calendar date selected:', date.toISOString())
    console.log('Requesting attendances for date:', dateStr)

    try {
      const response = await fetch(`/api/attendance?date=${dateStr}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAttendances(data.attendances || [])
        console.log('Fetched attendances:', data.attendances?.length || 0)
        console.log('Attendance details:', data.attendances)
      }
    } catch (error) {
      console.error("Error fetching attendances:", error)
      setAttendances([])
    }
  }

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        type: 'attendance',
        timestamp: Date.now()
      })

      console.log('Generating QR code with data:', qrData)

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      console.log('QR code generated successfully')
      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      })
    }
  }

  const exportAttendances = async (format: string) => {
    if (!selectedDate) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/admin/export-attendances?date=${dateStr}&format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `asistencias_${dateStr}.${format === 'excel' ? 'csv' : format === 'word' ? 'doc' : 'txt'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Exportación exitosa",
          description: `Archivo descargado como ${format.toUpperCase()}`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo exportar las asistencias",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Error al exportar asistencias",
        variant: "destructive",
      })
    }
  }

  if (status === 'loading') return (
    <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando panel de administración...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Bienvenido, {session?.user?.name}</p>
            <Badge variant="secondary" className="mt-2 text-xs">Administrador</Badge>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-sm">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.regularUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Esta Semana</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create User Button */}
        <div className="mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full sm:w-auto text-sm">
                <Plus className="h-4 w-4" />
                Crear Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-4 p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="name" className="sm:text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="sm:col-span-3"
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="email" className="sm:text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="sm:col-span-3"
                    placeholder="usuario@email.com"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="password" className="sm:text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="sm:col-span-3"
                    placeholder="Contraseña segura"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="role" className="sm:text-right">
                    Rol
                  </Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="sm:col-span-3 px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createUser} disabled={!newUser.name || !newUser.email || !newUser.password}>
                  Crear Usuario
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{user.name || 'Sin nombre'}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="self-start text-xs">
                      {user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </Badge>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRole(user.id, 'admin')}
                        className="text-xs px-2 py-1"
                      >
                        Hacer Admin
                      </Button>
                    )}
                    {user.role === 'admin' && user.email !== 'rojonelov@gmail.com' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRole(user.id, 'user')}
                        className="text-xs px-2 py-1"
                      >
                        Quitar Admin
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user)}
                      className="text-xs px-2 py-1"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR de Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 sm:p-6">
              {qrCodeUrl ? (
                <div className="space-y-3 sm:space-y-4">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code para asistencia"
                    className="mx-auto border rounded-lg w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground px-2">
                    Los usuarios pueden escanear este código para registrar su asistencia
                  </p>
                  <Button onClick={generateQRCode} variant="outline" size="sm" className="text-xs sm:text-sm">
                    Regenerar QR
                  </Button>
                </div>
              ) : (
                <Button onClick={generateQRCode} className="text-sm">
                  Generar Código QR
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendario de Asistencias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="calendar-container overflow-x-auto">
                <CalendarComponent
                  onChange={handleDateChange}
                  value={selectedDate}
                  className="w-full border-none text-sm"
                  locale="es-ES"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        {selectedDate && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <CardTitle>
                    Asistencias del {selectedDate.toLocaleDateString('es-ES')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total de asistencias: {attendances.length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => exportAttendances('excel')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => exportAttendances('word')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Word
                  </Button>
                  <Button
                    onClick={() => exportAttendances('txt')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    TXT
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {attendances.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay asistencias registradas para este día</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-xs sm:text-sm">Usuario</th>
                        <th className="text-left p-2 text-xs sm:text-sm hidden sm:table-cell">Email</th>
                        <th className="text-left p-2 text-xs sm:text-sm">Hora</th>
                        <th className="text-left p-2 text-xs sm:text-sm">Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.map((attendance: any) => (
                        <tr key={attendance.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                              </div>
                              <span className="text-xs sm:text-sm font-medium">{attendance.user.name || 'Sin nombre'}</span>
                            </div>
                          </td>
                          <td className="p-2 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{attendance.user.email}</td>
                          <td className="p-2 text-xs sm:text-sm">
                            {new Date(attendance.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-2">
                            <Badge variant={attendance.user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {attendance.user.role === 'admin' ? 'Admin' : 'Usuario'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta
                del usuario <strong>{userToDelete?.name || userToDelete?.email}</strong> y
                removerá todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false)
                setUserToDelete(null)
              }}>
                No, cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sí, eliminar usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
