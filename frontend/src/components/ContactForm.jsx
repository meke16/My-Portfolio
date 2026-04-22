import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function ContactForm({ info }) {
  const firestoreReady = Boolean(db);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firestoreReady) {
      setStatus({
        message: "Contact form needs Firebase (configure .env).",
        type: "error",
      });
      return;
    }
    setIsLoading(true);
    setStatus({ message: "Sending...", type: "info" });

    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        read: false,
        createdAt: serverTimestamp(),
      });
      setStatus({ message: "Message sent successfully!", type: "success" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({ message: "Connection error. Try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => setStatus({ message: "", type: "" }), 4000);
  };

  const badgeColor = {
    success: "bg-[#ff4500]/15 border border-[#ff4500]/30 text-[#ff6a33]",
    error: "bg-red-500/15 border border-red-400/30 text-red-300",
    info: "bg-blue-500/15 border border-blue-400/30 text-blue-300",
  };

  return (
    <section id="contact" className="min-h-screen py-16 relative bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff4500]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-mono tracking-[0.2em] text-[#ff4500] uppercase mb-2">Get in touch</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Let&apos;s Stay in Touch
          </h2>
          <div className="mt-3 w-10 h-0.5 bg-[#ff4500]" />
          <p className="mt-4 text-[#999] text-base max-w-2xl">
            Interested in collaborating or have a question? Drop your message below and I&apos;ll respond shortly.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono text-[#a8a8a8]">
              Fast response
            </span>
            <span className="px-3 py-1 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 text-xs font-mono text-[#ff9a72]">
              Serious inquiries preferred
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-5 xl:gap-6 items-start justify-center">
          <div className="lg:col-span-5 rounded-2xl border border-white/[0.07] bg-[#111] p-5 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#ff4500]" />
                Contact Details
              </h3>
              <p className="text-[#888] text-sm leading-relaxed">
                Feel free to use the form or reach out through any alternatives below.
              </p>
            </div>

            <div className="rounded-lg border border-[#ff4500]/25 bg-[#ff4500]/10 px-3 py-2.5">
              <p className="text-sm text-[#ff6a33] font-medium">Typical response time</p>
              <p className="text-xs text-[#ff8c66]/80 mt-0.5">Within 24 hours for serious inquiries.</p>
            </div>

            <div className="space-y-4">
              {info?.email && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0a0a] border border-white/[0.07]">
                  <div className="w-10 h-10 rounded-md bg-[#ff4500]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#ff4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] font-mono uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white font-semibold break-all">
                      {Array.isArray(info.email) ? info.email.join(", ") : info.email}
                    </p>
                  </div>
                </div>
              )}

              {info?.phones && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0a0a] border border-white/[0.07]">
                  <div className="w-10 h-10 rounded-md bg-[#ff4500]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#ff4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] font-mono uppercase tracking-wider mb-1">Phone</p>
                    {Array.isArray(info.phones) ? (
                      <div className="space-y-1">
                        {info.phones.map((p, i) => (
                          <p key={i} className="text-white font-semibold">
                            {p}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white font-semibold">{info.phones}</p>
                    )}
                  </div>
                </div>
              )}

              {info?.locations && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0a0a] border border-white/[0.07]">
                  <div className="w-10 h-10 rounded-md bg-[#ff4500]/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#ff4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] font-mono uppercase tracking-wider mb-1">Location</p>
                    {Array.isArray(info.locations) ? (
                      info.locations.map((loc, i) => (
                        <p key={i} className="text-white font-semibold">
                          {loc}
                        </p>
                      ))
                    ) : (
                      <p className="text-white font-semibold">{info.locations}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl border border-white/[0.07] bg-[#111] shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-[#ff4500]" />
                  Send a message
                </h3>
                <p className="text-xs text-[#555] font-mono">Please include context, timeline, and goals for faster help.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#555] mb-1.5 block">Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg text-white bg-[#0a0a0a] border border-white/[0.07] focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] outline-none transition-all placeholder:text-[#444]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-[#555] mb-1.5 block">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 text-white rounded-lg bg-[#0a0a0a] border border-white/[0.07] focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] outline-none transition-all placeholder:text-[#444]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-[#555] mb-1.5 block">Subject *</label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3.5 py-2.5 text-white rounded-lg bg-[#0a0a0a] border border-white/[0.07] focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] outline-none transition-all placeholder:text-[#444]"
                  placeholder="Project inquiry, collaboration..."
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-[#555] mb-1.5 block">Message *</label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3.5 py-2.5 text-white rounded-lg bg-[#0a0a0a] border border-white/[0.07] focus:ring-2 focus:ring-[#ff4500] focus:border-[#ff4500] outline-none transition-all resize-none placeholder:text-[#444]"
                  placeholder="Tell me about your idea..."
                />
              </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-md font-semibold text-white bg-[#ff4500] hover:bg-[#cc3700] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(255,69,0,0.18)]"
                >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>

              {status.message && (
                <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${badgeColor[status.type]}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export { ContactForm };
export default ContactForm;
