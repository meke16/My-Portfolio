import React from "react";
import { ExternalLink, BookOpen } from "lucide-react";

function BlogSection({ blogs }) {
  if (!blogs?.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <BookOpen className="w-12 h-12 text-[#333]" />
        <p className="text-[#555] font-mono">No blog posts yet.</p>
      </div>
    );

  return (
    <section className="min-h-screen py-16 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff4500]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">Insights & articles</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Blog</h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog, idx) => (
            <a
              key={blog.id || idx}
              href={blog.externalUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/[0.07] bg-[#111] p-6 flex flex-col hover:border-[#ff4500]/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(255,69,0,0.10)] transition-all duration-300"
            >
              {blog.coverImage && (
                <div className="h-40 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-xl">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => { e.target.parentElement.style.display = "none"; }}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                {blog.category && (
                  <span className="text-xs px-2.5 py-1 bg-[#ff4500]/10 text-[#ff4500] rounded font-mono">
                    {blog.category}
                  </span>
                )}
                {blog.readTime && (
                  <span className="text-xs text-[#555] font-mono">{blog.readTime}</span>
                )}
              </div>

              <h3 className="text-white font-bold text-lg mb-3 group-hover:text-[#ff4500] transition-colors duration-200">
                {blog.title}
              </h3>

              <p className="text-[#777] text-sm leading-relaxed flex-grow mb-4 line-clamp-3">
                {blog.excerpt || blog.content?.slice(0, 150)}
              </p>

              <div className="flex items-center gap-2 text-[#ff4500] text-sm font-medium mt-auto pt-4 border-t border-white/[0.05]">
                <ExternalLink size={14} />
                <span>Read more</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export { BlogSection };
export default BlogSection;
