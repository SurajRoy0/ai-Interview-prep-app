"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function FadeIn({ children, delay = 0, className }: { children: ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
