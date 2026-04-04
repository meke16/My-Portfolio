import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function displayNameFromInfo(info) {
  if (typeof info === "string") return info.trim() || "Portfolio";
  return info?.name?.trim() || "Portfolio";
}

function initialsFromName(name) {
  const n = name.trim();
  if (!n) return "?";
  const space = n.indexOf(" ");
  if (space === -1) return n.slice(0, 2).toUpperCase();
  const second = n[space + 1];
  return second ? (n[0] + second).toUpperCase() : n[0].toUpperCase();
}

export function Navbar({ info }) {
  const displayName = displayNameFromInfo(info);
  const logoInitials = initialsFromName(displayName);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/skills", label: "Skills" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
              <Link
                to="/"
                className="flex items-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {logoInitials}
                  </span>
                </div>
                <span className="text-white font-bold text-xl tracking-tight group-hover:text-blue-300 transition-colors duration-300">
                  {displayName}
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-white/10 relative ${
                      isActive ? "text-white" : "text-gray-300"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* CTA Button */}
              <Link
                to="/contact"
                className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Get In Touch
              </Link>
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
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:bg-white/10 border-l-4 ${
                      isActive
                        ? "bg-white/10 text-white border-blue-500"
                        : "text-gray-300 border-transparent hover:border-blue-500"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white block text-center px-3 py-3 rounded-md text-base font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
