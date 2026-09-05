"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

/* ── Preset animation variants ── */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.0 } },
};

/* ── ScrollReveal wrapper ── */
interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number | "some" | "all";
}

export default function ScrollReveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
  once = true,
  amount = 0.15,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
