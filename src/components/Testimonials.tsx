
import Image from "next/image"
import { Star } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const testimonials = [
  {
    name: "Carolina Méndez",
    role: "Atleta Amateur",
    content: "La mejor decisión que he tomado para mi salud. El sistema de seguimiento me mantiene motivada cada día.",
    photo: PlaceHolderImages.find(img => img.id === 'member-2')?.imageUrl || ""
  },
  {
    name: "Javier Ruiz",
    role: "Emprendedor",
    content: "Poder entrenar 24/7 se adapta perfectamente a mi agenda. La app de Impulso es simplemente superior.",
    photo: PlaceHolderImages.find(img => img.id === 'member-1')?.imageUrl || ""
  },
  {
    name: "Sofía Vargas",
    role: "Yoga Practitioner",
    content: "Las instalaciones son de primer nivel y la comunidad es increíblemente acogedora. 100% recomendado.",
    photo: PlaceHolderImages.find(img => img.id === 'member-3')?.imageUrl || ""
  }
]

export function Testimonials() {
  return (
    <section className="py-24 bg-secondary">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-foreground mb-4">Lo que dicen nuestros socios</h2>
          <p className="text-muted-foreground text-lg">Más que un gimnasio, una familia que impulsa tus límites.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-[12px] shadow-sm border border-border/40">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-foreground" />
                ))}
              </div>
                <p className="text-foreground text-[1.125rem] leading-relaxed mb-8 italic">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border">
                  <Image src={t.photo} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
