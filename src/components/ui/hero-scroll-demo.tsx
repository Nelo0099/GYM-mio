"use client";
import React from "react";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { BackgroundRippleEffectDemo } from "../ui/background-ripple-effect-demo";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={<></>}
      >
        <BackgroundRippleEffectDemo />
      </ContainerScroll>
    </div>
  );
}