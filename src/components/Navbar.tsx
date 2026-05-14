
"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/60 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-6 lg:gap-12">
          <Link href="/" className="shrink-0 text-xl sm:text-2xl font-extrabold tracking-tighter text-foreground">
            IMPULSO<span className="text-primary">FITNESS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                {session.user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Panel Admin</Link>
                )}
              </>
            ) : (
              <>
                <Link href="#clases" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Clases</Link>
                <Link href="#planes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planes</Link>
                <Link href="#coach" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Coach</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {session ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Hola, {session.user.name}
              </span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary rounded-[8px] font-semibold px-3 sm:px-6"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary rounded-[8px] font-semibold px-3 sm:px-6">
                  Login
                </Button>
              </Link>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-[8px] font-semibold px-4 sm:px-6">
                  Unirme ahora
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
