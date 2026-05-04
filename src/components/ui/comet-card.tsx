"use client";
import React from "react";
import { motion } from "motion/react";

export function CometCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        className="relative bg-card border border-border rounded-[16px] overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          rotateX: 10,
          rotateY: 10,
          scale: 1.05,
          transition: { duration: 0.3 },
        }}
        initial={{ rotateX: 0, rotateY: 0, scale: 1 }}
      >
        <div
          className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-[16px] blur opacity-25"
          style={{
            transform: "translateZ(-1px)",
          }}
        />
        <div
          className="relative z-10"
          style={{
            transform: "translateZ(0)",
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}