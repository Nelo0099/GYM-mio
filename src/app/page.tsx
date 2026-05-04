
import { Navbar } from "@/components/Navbar"
import { SocialProof } from "@/components/SocialProof"
import { Features } from "@/components/Features"
import { DashboardPreview } from "@/components/DashboardPreview"
import { Testimonials } from "@/components/Testimonials"
import { WorkoutAI } from "@/components/WorkoutAI"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HeroScrollDemo } from "@/components/ui/hero-scroll-demo"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"

const testimonials = [
  {
    quote: "Un día a la vez, pero sin fallar",
    name: "Motivación",
    title: "Disciplina",
  },
  {
    quote: "Hazlo por ti, no por nadie más",
    name: "Motivación",
    title: "Constancia",
  },
  {
    quote: "El cuerpo logra lo que la mente cree",
    name: "Motivación",
    title: "Mentalidad",
  },
  {
    quote: "No tienes que ser el mejor, solo ser constante",
    name: "Motivación",
    title: "Progreso",
  },
  {
    quote: "La disciplina es el puente entre metas y logros",
    name: "Motivación",
    title: "Determinación",
  },
  {
    quote: "Cada paso cuenta, no importa cuán pequeño sea",
    name: "Motivación",
    title: "Persistencia",
  },
  {
    quote: "La constancia vence al talento cuando el talento no es constante",
    name: "Motivación",
    title: "Esfuerzo",
  },
  {
    quote: "Sueña en grande, trabaja duro, persevera",
    name: "Motivación",
    title: "Ambición",
  },
  {
    quote: "Tu único límite es tú mismo",
    name: "Motivación",
    title: "Libertad",
  },
  {
    quote: "La motivación te pone en marcha, el hábito te mantiene",
    name: "Motivación",
    title: "Hábitos",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen pt-20 bg-background text-foreground">
      <Navbar />

      {/* Hero Section - reemplazado por componente con scroll animation */}
      <section className="relative pt-24 pb-32 md:pt-40 md:pb-52 overflow-hidden">
        <HeroScrollDemo />
      </section>

      {/* Infinite Moving Cards */}
      <section className="py-16">
        <div className="h-[40rem] rounded-md flex flex-col antialiased bg-transparent items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </section>

      <Features />
      <DashboardPreview />
      <WorkoutAI />
      <Testimonials />

      <footer className="py-12 border-t border-border bg-background">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-extrabold tracking-tighter text-[#1A1A1A]">
            IMPULSO<span className="text-primary">FITNESS</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Impulso Fitness. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
