import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function PageTransition({ children, className = "", as: Component = "div" }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageTransitionFade({ children, className = "", as: Component = "div" }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}