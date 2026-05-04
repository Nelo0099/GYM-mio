
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function SocialProof() {
  const brands = PlaceHolderImages.filter(img => img.id.startsWith('brand-logo'))

  return (
    <section className="py-12 border-y border-border/40 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-10">
          CONFIADO POR LÍDERES EN LA INDUSTRIA
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
          {brands.map((brand, i) => (
            <div key={i} className="relative w-32 h-12">
              <Image 
                src={brand.imageUrl} 
                alt={brand.description}
                fill
                className="object-contain"
                data-ai-hint={brand.imageHint}
              />
            </div>
          ))}
          <div className="text-xl font-bold text-muted-foreground">FITCORE</div>
          <div className="text-xl font-bold text-muted-foreground">GYMFLOW</div>
        </div>
      </div>
    </section>
  )
}
