import React, { useState, useEffect } from "react";

export default function Navbar({ info }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      // 1. Handle Navbar Background
      setScrolled(window.scrollY > 50);

      // 2. Handle Active Link Highlighting
      const sections = ["hero", "skills", "projects","contact"];
      
      // We add roughly 100px offset to account for the fixed navbar height
      // so the link becomes active slightly before the section hits the very top
      const scrollPosition = window.scrollY + 100; 

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking on a link
  const handleLinkClick = (section) => {
    setActiveSection(section); // Set active immediately for better UX
    setOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-lg shadow-lg"
          : "bg-gray-600"
      }`}
    >
      {/* Gradient border bottom */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="shrink-0">
              <a
                href="#hero"
                className="flex items-center space-x-2 group"
                onClick={() => handleLinkClick("hero")}
              >
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {info.substring(0, 1) +
                      info.substring(
                        info.indexOf(" "),
                        info.indexOf(" ") + 2
                      )}
                  </span>
                </div>
                <span className="text-white font-bold text-xl tracking-tight group-hover:text-blue-300 transition-colors duration-300">
                  {info}
                </span>
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="#hero"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group ${
                  activeSection === "hero" ? "text-white" : "text-gray-300"
                }`}
              >
                Home
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${
                    activeSection === "hero" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#skills"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group ${
                  activeSection === "skills" ? "text-white" : "text-gray-300"
                }`}
              >
                Skills
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-green-500 transition-all duration-300 ${
                    activeSection === "skills" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              <a
                href="#projects"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group ${
                  activeSection === "projects" ? "text-white" : "text-gray-300"
                }`}
              >
                Projects
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-purple-500 transition-all duration-300 ${
                    activeSection === "projects" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>
              
              <a
                href="#contact"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 relative group ${
                  activeSection === "contact" ? "text-white" : "text-gray-300"
                }`}
              >
                Contact
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${
                    activeSection === "contact" ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </a>

              {/* CTA Button */}
              <a
                href="#contact"
                className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                onClick={() => handleLinkClick("contact")}
              >
                Get In Touch
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-300"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <div className="w-6 h-6 relative">
                  <span
                    className={`absolute left-0 top-1 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      open ? "rotate-45 top-3" : "rotate-0"
                    }`}
                  ></span>
                  <span
                    className={`absolute left-0 top-3 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      open ? "opacity-0" : "opacity-100"
                    }`}
                  ></span>
                  <span
                    className={`absolute left-0 top-5 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      open ? "-rotate-45 top-3" : "rotate-0"
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-lg rounded-lg mt-2 shadow-xl border border-white/10">
              <a
                href="#hero"
                className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-white/10 border-l-4 ${
                  activeSection === "hero"
                    ? "bg-white/10 text-white border-blue-500"
                    : "text-gray-300 border-transparent hover:border-blue-500"
                }`}
                onClick={() => handleLinkClick("hero")}
              >
                🏠 Home
              </a>
              <a
                href="#skills"
                className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-white/10 border-l-4 ${
                  activeSection === "skills"
                    ? "bg-white/10 text-white border-green-500"
                    : "text-gray-300 border-transparent hover:border-green-500"
                }`}
                onClick={() => handleLinkClick("skills")}
              >
                💡 Skills
              </a>
              <a
                href="#projects"
                className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-white/10 border-l-4 ${
                  activeSection === "projects"
                    ? "bg-white/10 text-white border-purple-500"
                    : "text-gray-300 border-transparent hover:border-purple-500"
                }`}
                onClick={() => handleLinkClick("projects")}
              >
                🚀 Projects
              </a>
              <a
                href="#contact"
                className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-white/10 border-l-4 ${
                  activeSection === "contact"
                    ? "bg-white/10 text-white border-orange-500"
                    : "text-gray-300 border-transparent hover:border-orange-500"
                }`}
                onClick={() => handleLinkClick("contact")}
              >
                📞 Contact
              </a>
              <div className="pt-2">
                <a
                  href="#contact"
                  className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white block text-center px-3 py-3 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  onClick={() => handleLinkClick("contact")}
                >
                  Get In Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}