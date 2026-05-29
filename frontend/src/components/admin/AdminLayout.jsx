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
  ChevronLeft,
  ChevronRight,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const activeItem =
    [...menuItems, ...quickActionItems].find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) || menuItems[0];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-3 border-[2px] transition-all ${isActive
      ? "bg-white text-black border-white shadow-brutalist-accent translate-x-[2px] translate-y-[2px] shadow-none"
      : "text-gray-400 border-transparent hover:border-white hover:bg-white/5 active:bg-white/10"
    } font-bold uppercase text-[11px] tracking-wider ${sidebarCollapsed ? "justify-center px-0" : ""}`;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Grid Pattern Background for Main Area */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      ></div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r-[3px] border-white/20 bg-[#111111] transition-all duration-300 lg:static lg:translate-x-0 ${sidebarCollapsed ? "w-20" : "w-72"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className={`p-6 border-b-[3px] border-white/10 bg-[#111111] ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <NavLink
            to="/admin"
            className="font-black text-xl tracking-tighter text-white inline-flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center border-[2.5px] border-white bg-accent text-white text-sm font-black shadow-brutalist-white-sm shrink-0">
              CP
            </span>
            {!sidebarCollapsed && <span>ADMIN</span>}
          </NavLink>
          {!sidebarCollapsed && <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-[0.2em]">Meke V1</p>}
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            {!sidebarCollapsed && (
              <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Navigation
              </p>
            )}
            <div className="space-y-1">
              {menuItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                  title={sidebarCollapsed ? label : ""}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                  {!sidebarCollapsed && label}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Quick actions
              </p>
            )}
            <div className="space-y-1">
              {quickActionItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                  title={sidebarCollapsed ? label : ""}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                  {!sidebarCollapsed && label}
                </NavLink>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-3 px-4 py-3 border-[2px] border-transparent text-gray-400 hover:border-white hover:bg-white/5 font-bold uppercase text-[11px] tracking-wider transition-all ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? "View site" : ""}
              >
                <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                {!sidebarCollapsed && "View site"}
              </a>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t-[3px] border-white/10 bg-[#111111]">
          <button
            type="button"
            onClick={onLogout}
            className={`flex w-full items-center gap-3 px-4 py-4 border-[2.5px] border-white bg-red-500/10 text-red-500 font-black uppercase text-[11px] tracking-widest hover:bg-red-500 hover:text-white shadow-brutalist-white-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${sidebarCollapsed ? "justify-center px-0" : ""}`}
            title={sidebarCollapsed ? "Logout System" : ""}
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={3} />
            {!sidebarCollapsed && "Logout System"}
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden transition-all duration-300">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b-[3px] border-white/10 bg-[#111111] px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 border-[2px] border-white bg-[#111111] shadow-brutalist-white-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={2.5} /> : <Menu className="w-5 h-5" strokeWidth={2.5} />}
            </button>
            <button
              type="button"
              className="hidden lg:flex p-2 border-[2px] border-white bg-[#111111] shadow-brutalist-white-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px] hover:bg-white hover:text-black transition-all"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" strokeWidth={2.5} /> : <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Protocol</p>
              <h1 className="text-lg font-black text-white uppercase tracking-tight truncate italic">
                {activeItem.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 border-[2.5px] border-white px-5 py-2.5 bg-accent text-white font-black text-[11px] uppercase tracking-widest shadow-brutalist-white-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutalist-white transition-all"
            >
              Public Uplink <ExternalLink className="w-3.5 h-3.5" strokeWidth={3} />
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative scrollbar-custom">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>

  );
}
