import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  BookText,
  Wrench,
  Mail,
  BookOpenText,
  BriefcaseBusiness,
  MessageCircle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  BarChart3,
} from "lucide-react";

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/about", label: "About page", icon: BookOpenText },
  { to: "/admin/experience", label: "Work & Experience", icon: BriefcaseBusiness },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/blogs", label: "Blogs", icon: BookText },
  { to: "/admin/skills", label: "Skills", icon: Wrench },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageCircle },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

const quickActionItems = [
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, end: true },
];

export default function AdminLayout({ onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const activeItem =
    [...menuItems, ...quickActionItems].find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) || menuItems[0];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-blue-500/20 text-blue-100 border border-blue-400/30 shadow-lg shadow-blue-900/20"
        : "text-gray-400 border border-transparent hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.1),transparent_32%)]" />
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/10 bg-gray-900/90 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <NavLink
            to="/admin"
            className="font-semibold text-lg tracking-tight text-white inline-flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold">
              AP
            </span>
            Admin Panel
          </NavLink>
          <p className="text-xs text-gray-500 mt-1">Portfolio workspace</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Navigation
          </p>
          {menuItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-5 h-5 shrink-0 opacity-90 transition-transform group-hover:scale-105" />
              {label}
            </NavLink>
          ))}

          <p className="px-3 py-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Quick actions
          </p>
          {quickActionItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-5 h-5 shrink-0 opacity-90 transition-transform group-hover:scale-105" />
              {label}
            </NavLink>
          ))}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-transparent hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            View site
          </a>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-gray-900/55 px-4 backdrop-blur-sm lg:px-8">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Admin</p>
            <h1 className="text-sm sm:text-base font-semibold text-white truncate">
              {activeItem.label}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-white/10 px-3 py-1.5 text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              View public site
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-transparent p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
