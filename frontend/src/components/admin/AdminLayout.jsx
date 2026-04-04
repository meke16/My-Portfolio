import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Wrench,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Wrench },
  { to: "/admin/messages", label: "Messages", icon: Mail },
];

export default function AdminLayout({ onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "text-gray-400 hover:text-white hover:bg-gray-800/80"
    }`;

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100 overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-800 bg-gray-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-gray-800">
          <NavLink
            to="/admin"
            className="font-semibold text-lg tracking-tight text-white"
            onClick={() => setMobileOpen(false)}
          >
            Admin Panel
          </NavLink>
          <p className="text-xs text-gray-500 mt-1">Portfolio CMS</p>
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
              <Icon className="w-5 h-5 shrink-0 opacity-90" />
              {label}
            </NavLink>
          ))}

          <p className="px-3 py-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Quick actions
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            View site
          </a>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800/80 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-gray-800 bg-gray-900/80 px-4 backdrop-blur-sm lg:px-6">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-blue-400 transition-colors ml-auto"
          >
            View public site →
          </a>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-950/50 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
