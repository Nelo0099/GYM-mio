"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export function LayoutTextFlip({
  text,
  words,
}: {
  text: string;
  words: string[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 px-2 text-center sm:flex-row sm:px-6 md:pl-12">
      <span className="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight md:leading-none">
        {text}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 3 }}
          className="text-2xl md:text-4xl lg:text-6xl font-bold leading-tight md:leading-none text-primary sm:ml-0.5"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
