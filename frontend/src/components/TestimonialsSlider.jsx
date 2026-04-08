import React from "react";
import { Quote } from "lucide-react";

function TestimonialsSlider({ testimonials }) {
  if (!testimonials?.length) return null;

  const loopedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="min-h-full flex items-center justify-center py-10 bg-[#0a0a0a] relative overflow-hidden border-t border-white/[0.05]">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-[#ff4500]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl w-full">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">What people say</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Testimonials</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500] mx-auto" />
          <p className="mt-4 text-sm md:text-base text-[#8f8f8f] leading-relaxed">
            A few words from people I’ve worked with, centered here in a smooth horizontal flow.
          </p>
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
                <article
                  key={`${testimonial.name}-${idx}`}
                  className="group w-[280px] sm:w-[320px] md:w-[360px] shrink-0 rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4500]/30 hover:shadow-[0_12px_30px_rgba(255,69,0,0.10)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Quote className="w-6 h-6 text-[#ff4500]/30 group-hover:text-[#ff4500]/60 transition-colors duration-300" />
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#ff4500]/10 border border-[#ff4500]/20 flex items-center justify-center">
                        <span className="text-[#ff4500] text-xs font-bold">
                          {testimonial.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                    )}
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
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { TestimonialsSlider };
export default TestimonialsSlider;
