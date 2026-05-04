
import { Smartphone, Target, Clock, Users } from "lucide-react"
import { CometCard } from "@/components/ui/comet-card"

const features = [
  {
    icon: Smartphone,
    title: "App Propia",
    description: "Gestiona tus clases, entrenamientos y pagos desde la palma de tu mano."
  },
  {
    icon: Target,
    title: "Seguimiento Nutricional",
    description: "Planes personalizados adaptados a tus objetivos específicos de salud."
  },
  {
    icon: Clock,
    title: "Acceso 24/7",
    description: "Libertad total para entrenar cuando tu ritmo lo exija, sin restricciones."
  },
  {
    icon: Users,
    title: "Comunidad Elite",
    description: "Únete a un grupo selecto de atletas y coaches de alto rendimiento."
  }
]

export function Features() {
  return (
    <section className="py-24 bg-secondary">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <CometCard key={i}>
              <div className="p-4 bg-card rounded-[16px]">
                <div className="relative w-full mb-3 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-[8px] bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-10 h-10 text-primary" strokeWidth={2} />
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="text-base font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CometCard>
          ))}
        </div>
      </div>
    </section>
  )
}
