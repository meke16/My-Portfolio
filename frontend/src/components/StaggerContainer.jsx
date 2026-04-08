import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Wraps children with staggered entrance animations.
 * Each child fades/slides in one after another.
 */
export function StaggerContainer({ children, staggerDelay = 0.08, className = "", as: Component = "div" }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: i * staggerDelay, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </Component>
  );
}
