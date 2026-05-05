"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Settings, BarChart3 } from "lucide-react"

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
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentUsers: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
      calculateStats(data)
    }
  }

  const calculateStats = (userData: User[]) => {
    const total = userData.length
    const admins = userData.filter(u => u.role === 'admin').length
    const regulars = total - admins
    const recent = userData.filter(u => {
      const createdAt = new Date(u.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdAt > weekAgo
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
      body: JSON.stringify({ userId, role }),
    })
    if (response.ok) {
      fetchUsers() // Refresh list
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">Bienvenido, {session?.user?.name}</p>
          <Badge variant="secondary" className="mt-2">Administrador</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{user.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRole(user.id, 'admin')}
                      >
                        Hacer Admin
                      </Button>
                    )}
                    {user.role === 'admin' && user.email !== 'rojonelov@gmail.com' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRole(user.id, 'user')}
                      >
                        Quitar Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}