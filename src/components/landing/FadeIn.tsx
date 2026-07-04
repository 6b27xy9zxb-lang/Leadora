import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "transition"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}

export function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, ...rest }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
