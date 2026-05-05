"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.role || session.user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
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

  if (status === 'loading') return <div>Loading...</div>

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

        <Card>
          <CardHeader>
            <CardTitle>Gestionar Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{user.name || 'Sin nombre'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-primary">Rol: {user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={user.role === 'admin' ? 'default' : 'outline'}
                      onClick={() => updateRole(user.id, 'admin')}
                    >
                      Admin
                    </Button>
                    <Button
                      size="sm"
                      variant={user.role === 'user' ? 'default' : 'outline'}
                      onClick={() => updateRole(user.id, 'user')}
                    >
                      User
                    </Button>
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