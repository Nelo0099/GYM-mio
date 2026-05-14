
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with face-api.js
const FaceIdDialog = dynamic(() => import("@/components/FaceIdDialog").then(mod => ({ default: mod.FaceIdDialog })), {
  ssr: false,
  loading: () => null
})

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [faceIdOpen, setFaceIdOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isRegister) {
      // Register
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        toast({
          title: "Registro exitoso",
          description: "Ahora puedes iniciar sesión",
        })
        setIsRegister(false)
      } else {
        const error = await response.text()
        toast({
          title: "Error en registro",
          description: error,
          variant: "destructive",
        })
      }
    } else {
      // Login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error al iniciar sesión",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido!",
        })

        // Redirect based on user role - check result for user info
        // Since signIn doesn't return user data, we'll let the dashboard handle redirection
        router.push("/dashboard")
      }
    }
    setLoading(false)
  }

  const handleFaceIdLogin = async (user: any) => {
    // For demo purposes, assume successful login
    // In production, this would validate the recognized user
    toast({
      title: "Login facial exitoso",
      description: "Bienvenido de vuelta",
    })

    // Simple role check for demo
    const isAdmin = user.email && user.email.includes('admin')
    router.push(isAdmin ? "/admin/dashboard" : "/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-[450px] space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-foreground">
            IMPULSO<span className="text-primary">FITNESS</span>
          </Link>
        </div>

        <Card className="rounded-[12px] border-border shadow-lg bg-white overflow-hidden">
          <CardHeader className="pt-6 sm:pt-10 pb-4 sm:pb-6 px-4 sm:px-10 text-center">
            <CardTitle className="text-xl sm:text-3xl font-extrabold text-foreground">
              {isRegister ? "Únete a Impulso Fitness" : "Bienvenido de nuevo"}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-lg mt-2">
              {isRegister ? "Crea tu cuenta para comenzar tu transformación." : "Ingresa tus credenciales para acceder."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-10 pb-6 sm:pb-10 space-y-4 sm:space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-foreground">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-[6px] h-10 sm:h-12 bg-white border-border focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-foreground">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-[6px] h-10 sm:h-12 bg-white border-border focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <Label htmlFor="password" className="text-sm font-bold text-foreground">Contraseña</Label>
                  {!isRegister && <a href="#" className="text-xs font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</a>}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-[6px] h-10 sm:h-12 bg-white border-border focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-[8px] text-sm sm:text-base">
                {loading ? "Cargando..." : (isRegister ? "Registrarse" : "Iniciar Sesión")}
              </Button>
            </form>

            {!isRegister && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setFaceIdOpen(true)}
                className="w-full h-10 sm:h-12 rounded-[8px] text-sm sm:text-base"
              >
                Iniciar con Face ID
              </Button>
            )}

          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes una cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-bold text-primary hover:underline"
          >
            {isRegister ? "Inicia sesión" : "Únete ahora"}
          </button>
        </p>

        <FaceIdDialog
          isOpen={faceIdOpen}
          onClose={() => setFaceIdOpen(false)}
          onLogin={handleFaceIdLogin}
        />
      </div>
    </div>
  )
}
