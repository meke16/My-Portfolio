// ————————————
// PRO CONTACT SECTION
// Sleek + Premium UI Version
// ————————————

import React, { useState } from "react";
import { sendContactForm } from "../services/api";

export default function ContactForm({ info }) {
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
    setIsLoading(true);
    setStatus({ message: "Sending...", type: "info" });

    const data = new FormData();
    Object.keys(formData).forEach((k) => data.append(k, formData[k]));

    try {
      const res = await sendContactForm(data);
      if (res.success) {
        setStatus({
          message: "Message sent successfully!",
          type: "success",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({
          message: res.message || "Something went wrong.",
          type: "error",
        });
      }
    } catch {
      setStatus({
        message: "Connection error. Try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => setStatus({ message: "", type: "" }), 4000);
  };

  const badgeColor = {
    success:
      "bg-green-50 dark:bg-green-700/20 border border-green-300 text-green-700 dark:text-green-300",
    error:
      "bg-red-50 dark:bg-red-700/20 border border-red-300 text-red-700 dark:text-red-300",
    info:
      "bg-blue-50 dark:bg-blue-700/20 border border-blue-300 text-blue-700 dark:text-blue-300",
  };

  return (
    <section id="contact" className="py-24 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Subtle gradient circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Let’s Stay in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Touch
            </span>
          </h2>

          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Interested in collaborating or have a question? Drop your message below and I’ll respond shortly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* LEFT — Contact Info */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Contact Details
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Feel free to use the form or reach out through any of the alternatives below.
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              {/* EMAIL */}
              {info.email && (
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/50 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Array.isArray(info.email)
                        ? info.email.join(", ")
                        : info.email}
                    </p>
                  </div>
                </div>
              )}

              {/* PHONE */}
              {info.phones && (
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/50 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    {Array.isArray(info.phones) ? (
                      <div className="space-y-1">
                        {info.phones.map((p, i) => (
                          <p
                            key={i}
                            className="font-medium text-gray-900 dark:text-white"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {info.phones}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* LOCATION */}
              {info.locations && (
                <div className="flex items-start gap-4 p-5 rounded-xl bg-white/70 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/50 backdrop-blur-md">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    {Array.isArray(info.locations) ? (
                      info.locations.map((loc, i) => (
                        <p
                          key={i}
                          className="font-medium text-gray-900 dark:text-white"
                        >
                          {loc}
                        </p>
                      ))
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {info.locations}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="p-10 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-white/40 dark:border-gray-700/50 backdrop-blur-xl shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject *
                </label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Project inquiry, collaboration..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Tell me about your idea..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {status.message && (
                <div
                  className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${badgeColor[status.type]}`}
                >
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
