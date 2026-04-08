import React, { useEffect, useState } from "react";
import { Quote, X, Sparkles } from "lucide-react";

function TestimonialsSlider({ testimonials }) {
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  useEffect(() => {
    if (!selectedTestimonial) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedTestimonial(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedTestimonial]);

  if (!testimonials?.length) return null;

  const loopedTestimonials = [...testimonials, ...testimonials];
  const testimonialCount = testimonials.length;

  const renderAvatar = (testimonial, size = "w-10 h-10") => {
    if (testimonial.avatar) {
      return (
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className={`${size} rounded-full object-cover border border-white/10`}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      );
    }

    return (
      <div className={`${size} rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center`}>
        <span className="text-[#ff4500] text-xs font-bold">
          {testimonial.name.split(" ").map((n) => n[0]).join("")}
        </span>
      </div>
    );
  };

  return (
    <section className="min-h-full flex items-center justify-center py-14 bg-[#0a0a0a] relative overflow-hidden border-t border-white/[0.05]">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-[#ff4500]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl w-full">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">What people say</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Testimonials</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500] mx-auto" />
          <p className="mt-4 text-sm md:text-base text-[#8f8f8f] leading-relaxed">
            Short notes from people I’ve worked with. Tap any card to open a focused view, or hover to pause the flow.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-[#a8a8a8]">
              {testimonialCount} testimonials
            </span>
            <span className="px-3 py-1 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 text-xs font-mono text-[#ff9a72]">
              Click to expand
            </span>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <div
              className="flex w-max gap-5 py-6 px-5 testimonial-marquee"
              style={{ animationDuration: `${Math.max(testimonials.length * 10, 28)}s` }}
            >
              {loopedTestimonials.map((testimonial, idx) => (
                <button
                  key={`${testimonial.name}-${idx}`}
                  type="button"
                  onClick={() => setSelectedTestimonial(testimonial)}
                  className="group w-[280px] sm:w-[320px] md:w-[360px] shrink-0 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:bg-[#131313] hover:border-[#ff4500]/30 hover:shadow-[0_12px_30px_rgba(255,69,0,0.10)] focus:outline-none focus:ring-2 focus:ring-[#ff4500]/40"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Quote className="w-6 h-6 text-[#ff4500]/35 group-hover:text-[#ff4500]/70 transition-colors duration-300" />
                    {renderAvatar(testimonial)}
                  </div>

                  <p className="text-[#aaa] text-sm leading-relaxed mb-6 min-h-[112px]">
                    {testimonial.quote}
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                    {!testimonial.avatar && (
                      <div className="w-9 h-9 rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                        <span className="text-[#ff4500] text-xs font-bold">
                          {testimonial.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-[#666] text-xs font-mono">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#777]">
                    <span>Tap to view</span>
                    <Sparkles className="w-4 h-4 text-[#ff4500]/60" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedTestimonial && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 testimonial-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTestimonial(null);
          }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm pointer-events-none" />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="testimonial-modal-title"
            className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/[0.10] bg-[#101010] shadow-[0_25px_100px_rgba(0,0,0,0.55)] testimonial-modal-panel"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff4500] to-transparent opacity-60" />

            <button
              type="button"
              onClick={() => setSelectedTestimonial(null)}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#bbb] transition-colors hover:bg-white/[0.08] hover:text-white"
              aria-label="Close testimonial"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-[#ff9a72]">
                  Featured testimonial
                </span>
                <span className="text-xs text-[#666]">Click outside or press Esc to close</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {renderAvatar(selectedTestimonial, "w-16 h-16")}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 id="testimonial-modal-title" className="text-2xl font-black text-white">
                    {selectedTestimonial.name}
                  </h3>
                  <p className="mt-1 text-sm font-mono text-[#888]">
                    {selectedTestimonial.role}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-white/[0.06] bg-[#0b0b0b] p-5 sm:p-6">
                <Quote className="w-8 h-8 text-[#ff4500]/35 mb-4" />
                <p className="text-base sm:text-lg leading-relaxed text-[#e2e2e2] italic">
                  {selectedTestimonial.quote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export { TestimonialsSlider };
export default TestimonialsSlider;
