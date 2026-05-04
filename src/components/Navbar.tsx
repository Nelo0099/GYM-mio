
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/60 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-foreground">
            IMPULSO<span className="text-primary">FITNESS</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#clases" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Clases</Link>
            <Link href="#planes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Planes</Link>
            <Link href="#coach" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Coach</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary rounded-[8px] font-semibold px-6">
              Login
            </Button>
          </Link>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-[8px] font-semibold px-6">
            Unirme ahora
          </Button>
        </div>
      </div>
    </nav>
  )
}
