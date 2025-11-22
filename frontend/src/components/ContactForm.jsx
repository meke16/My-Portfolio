import React, { useState } from "react";
import { sendContactForm } from "../services/api";

export default function ContactForm({ info }) {
  // console.log(info);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: "Sending your message...", type: "info" });

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      const res = await sendContactForm(data);
      if (res.success) {
        setStatus({
          message: "🎉 Message sent successfully! I'll get back to you soon.",
          type: "success",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({
          message: res.message || "❌ Error sending message. Please try again.",
          type: "error",
        });
      }
    } catch {
      setStatus({
        message:
          "❌ Error sending message. Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => setStatus({ message: "", type: "" }), 5000);
  };

  const getStatusColor = () => {
    switch (status.type) {
      case "success":
        return "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400";
      case "error":
        return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
      case "info":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
      default:
        return "";
    }
  };

  return (
    <section
      id="contact"
      className="py-20 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get In{" "}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Let's work together! Send me a message and I'll get back to you as
            soon as possible.
          </p>
          <div className="w-24 h-1 bg-linear-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Let's start a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  I'm always interested in new opportunities, creative projects,
                  and collaborating with amazing people. Whether you have a
                  question or just want to say hi, I'll do my best to get back
                  to you!
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {/* Email - Handle array or single string */}
                {info.email &&
                  (Array.isArray(info.email)
                    ? info.email.length > 0
                    : info.email) && (
                    <div className="flex items-start space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/20 hover:shadow-[0_0_30px_rgba(128,0,255,0.5)] hover:scale-101 ">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Email
                        </p>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {info.email}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Phones - Parse JSON string */}
                {info.phones && (
                  <div className="flex items-start space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/20 hover:shadow-[0_0_30px_rgba(128,0,255,0.5)] hover:scale-101">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Phone
                      </p>
                      {(() => {
                        try {
                          const phones =(info.phones);
                          return Array.isArray(phones) ? (
                            <div className="space-y-1">
                              {phones.map((phone, index) => (
                                <p
                                  key={index}
                                  className="text-gray-900 dark:text-white font-semibold"
                                >
                                  {phone}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {phones}
                            </p>
                          );
                        } catch {
                          return (
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {info.phones}
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
                {/* Locations - Parse JSON string */}
                {info.locations && (
                  <div className="flex items-start space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/20 hover:shadow-[0_0_30px_rgba(128,0,255,0.5)] hover:scale-101">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Location
                      </p>
                      {(() => {
                        try {
                          const locations = (info.locations);
                          return Array.isArray(locations) ? (
                            <div className="space-y-1">
                              {locations.map((location, index) => (
                                <p
                                  key={index}
                                  className="text-gray-900 dark:text-white font-semibold"
                                >
                                  {location}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {locations}
                            </p>
                          );
                        } catch {
                          return (
                            <p className="text-gray-900 dark:text-white font-semibold">
                              {info.locations}
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Response Time (Static) */}
                <div className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/20 hover:shadow-[0_0_30px_rgba(128,0,255,0.5)] hover:scale-101">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Response Time
                    </p>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      Usually within 12-18 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}


            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mt-40">
            
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                autoComplete="off"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    placeholder="Tell me about your project or just say hello..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-101 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {/* Status Message */}
                {status.message && (
                  <div
                    className={`p-4 rounded-lg border ${getStatusColor()} transition-all duration-300`}
                  >
                    <p className="text-sm font-medium">{status.message}</p>
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
