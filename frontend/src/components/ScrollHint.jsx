import React, { useEffect, useRef } from "react";

function ScrollHint({ nextPath, label = "Scroll to continue" }) {
  const ref = useRef(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!ref.current || !nextPath) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasNavigated.current) {
            hasNavigated.current = true;
            // Dispatch custom event to handle navigation with scroll state
            window.dispatchEvent(
              new CustomEvent("scrollNavigate", { detail: { path: nextPath } })
            );
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [nextPath]);

  useEffect(() => {
    // Reset navigation state when path changes
    hasNavigated.current = false;
  }, [nextPath]);

  if (!nextPath) return null;

  return (
    <div
      ref={ref}
      className="relative py-20 bg-gray-950 overflow-hidden"
    >
      {/* Background decorations matching existing UI */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        <p className="text-gray-400 text-sm font-medium tracking-wide">
          {label}
        </p>
        
        {/* Animated scroll indicator with gradient */}
        <div className="relative">
          <div className="w-10 h-16 border-2 border-white/20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-sm">
            <div className="w-1.5 h-3 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mt-2 animate-bounce" />
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
        </div>
        
        {/* Next page preview hint */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" />
          <span className="text-xs text-gray-300">Next: {nextPath.replace('/', '').charAt(0).toUpperCase() + nextPath.slice(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default ScrollHint;
