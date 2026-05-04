
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp, CheckCircle2 } from "lucide-react"
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from "recharts"

const data = [
  { name: "Lun", value: 45 },
  { name: "Mar", value: 52 },
  { name: "Mie", value: 38 },
  { name: "Jue", value: 65 },
  { name: "Vie", value: 48 },
  { name: "Sab", value: 58 },
  { name: "Dom", value: 20 },
]

export function DashboardPreview() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-[1.1]">
              Tu progreso, <br /><span className="text-primary">bajo control.</span>
            </h2>
            <p className="text-muted-foreground text-[1.125rem] leading-relaxed max-w-lg">
              Nuestra plataforma te permite visualizar cada paso de tu evolución. Datos precisos para resultados reales.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
              <CheckCircle2 className="text-foreground w-5 h-5" />
              <span className="font-medium text-foreground">Métricas de rendimiento en tiempo real</span>
              </div>
              <div className="flex items-center gap-3">
              <CheckCircle2 className="text-foreground w-5 h-5" />
                <span className="font-medium text-foreground">Calendario inteligente de clases</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Next Class Card */}
              <Card className="rounded-[12px] shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Próxima Clase</CardTitle>
                  <Calendar className="w-4 h-4 text-foreground" />
                </CardHeader>
                <CardContent>
              <div className="text-2xl font-extrabold text-foreground">CrossFit WOD</div>
                  <p className="text-sm text-muted-foreground mt-1">Hoy, 18:30 • Coach Alex</p>
                  <div className="mt-4 p-3 bg-secondary rounded-[6px] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Lugar Reservado</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="rounded-[12px] shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Progreso Semanal</CardTitle>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                   <div className="text-2xl font-extrabold text-foreground">+12.5%</div>
                  <p className="text-sm text-muted-foreground mt-1">vs. semana pasada</p>
                </CardContent>
              </Card>

              {/* Chart Area */}
              <Card className="md:col-span-2 rounded-[12px] shadow-lg border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground">Actividad Física (minutos)</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] w-full pt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <Bar dataKey="value" fill="#635BFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
