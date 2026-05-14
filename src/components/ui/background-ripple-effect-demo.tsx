"use client";
import React from "react";
import { SparklesCore } from "../ui/sparkles";
import { LayoutTextFlip } from "../ui/layout-text-flip";

export function BackgroundRippleEffectDemo() {
  return (
    <div className="relative flex w-full flex-col items-start justify-start">
      <div className="h-full min-h-[22rem] md:min-h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md px-4">
        <LayoutTextFlip
          text="Transforma tu cuerpo, "
          words={["lidera tu ritmo", "inspira tu fuerza", "domina tu potencial", "fortalece tu mente", "alcanza tus metas", "supera tus límites"]}
        />
        <div className="w-full max-w-[40rem] h-32 sm:h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
      </div>


    </div>
  );
}

