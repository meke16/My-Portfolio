import React from "react";
import { Quote } from "lucide-react";

function TestimonialsSection({ testimonials }) {
  if (!testimonials?.length) return null;

  return (
    <section className="py-16 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#ff4500]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">What people say</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Testimonials</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group rounded-xl border border-white/[0.07] bg-[#111] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4500]/30 hover:shadow-[0_12px_30px_rgba(255,69,0,0.10)]"
            >
              {/* Quote icon */}
              <div className="flex items-start justify-between mb-4">
                <Quote className="w-6 h-6 text-[#ff4500]/30 group-hover:text-[#ff4500]/60 transition-colors duration-300" />
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>

              {/* Quote text */}
              <p className="text-[#aaa] text-sm leading-relaxed mb-6">
                {testimonial.quote}
              </p>

              {/* Author */}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { TestimonialsSection };
export default TestimonialsSection;
