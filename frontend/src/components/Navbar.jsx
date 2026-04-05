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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#ff4500] rounded-md flex items-center justify-center">
              <span className="text-white font-black text-sm tracking-tight">{logoInitials}</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-[#ff4500] transition-colors duration-200">
              {displayName}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#ff4500] bg-[#ff4500]/10"
                      : "text-[#888] hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="ml-4 px-5 py-2 bg-[#ff4500] text-white text-sm font-semibold rounded-md hover:bg-[#cc3700] transition-colors duration-200"
            >
              Hire me
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-[#888] hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? "-rotate-45 -translate-y-[9px]" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80 pb-4" : "max-h-0"}`}>
          <div className="border-t border-white/[0.06] pt-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "text-[#ff4500] bg-[#ff4500]/10" : "text-[#888] hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="block mt-2 px-4 py-2.5 bg-[#ff4500] text-white text-sm font-semibold rounded-md text-center hover:bg-[#cc3700] transition-colors"
            >
              Hire me
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
