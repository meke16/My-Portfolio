import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export function Navbar() {
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
      scrolled ? "pt-3" : "pt-5"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end lg:justify-center h-12">

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-2 rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/75 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#ffd8c8] bg-[#ff4500]/18 shadow-[inset_0_0_0_1px_rgba(255,69,0,0.28)]"
                      : "text-[#9a9a9a] hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="ml-2 px-5 py-2 bg-[#ff4500] text-white text-sm font-semibold rounded-xl hover:bg-[#cc3700] transition-colors duration-200"
            >
              Get In Touch
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2.5 rounded-xl border border-white/[0.08] bg-[#0f0f0f]/75 text-[#b0b0b0] hover:text-white hover:border-[#ff4500]/35 transition-colors"
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
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80 pb-2 mt-3" : "max-h-0"}`}>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f]/92 backdrop-blur-xl p-3 space-y-1.5 shadow-[0_14px_35px_rgba(0,0,0,0.4)]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#ffd8c8] bg-[#ff4500]/18"
                      : "text-[#9a9a9a] hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="block mt-2 px-4 py-2.5 bg-[#ff4500] text-white text-sm font-semibold rounded-xl text-center hover:bg-[#cc3700] transition-colors"
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
