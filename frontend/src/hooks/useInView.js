import { useState, useEffect } from "react";

/**
 * Hook that returns whether the element is currently visible in the viewport.
 * Triggers once when the element enters view.
 */
export function useInView(options = {}) {
  const [inView, setInView] = useState(false);
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, options]);

  return [setNode, inView];
}
