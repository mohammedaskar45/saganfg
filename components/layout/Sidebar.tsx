"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Bot,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  Briefcase,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/documents/search", icon: FileText, label: "Documents" },
  { href: "/ai", icon: Bot, label: "AI Assistant" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "#0D1B4B",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 px-4 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#4F46E5" }}
        >
          <Briefcase size={16} color="white" />
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-sm leading-none">SaganFG</p>
            <p className="text-blue-300 text-xs mt-0.5">Tax Workflow</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex-shrink-0 p-1 rounded-lg transition-all"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
          }
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {!collapsed && (
          <p
            className="text-xs font-semibold uppercase tracking-wider px-3 mb-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Main Menu
          </p>
        )}

        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
              style={{
                background: active
                  ? "#4F46E5"
                  : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.65)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,0.65)";
                }
              }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* Super Admin Link */}
        {user?.isSuperAdmin && (
          <>
            {!collapsed && (
              <div
                className="border-t mt-4 pt-4"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider px-3 mb-3"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Admin
                </p>
              </div>
            )}
            {collapsed && <div className="border-t my-4" style={{ borderColor: "rgba(255,255,255,0.08)" }} />}
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: isActive("/admin") ? "#4F46E5" : "transparent",
                color: isActive("/admin") ? "white" : "rgba(255,255,255,0.65)",
              }}
              onMouseEnter={(e) => {
                if (!isActive("/admin")) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive("/admin")) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
                }
              }}
              title={collapsed ? "Super Admin" : undefined}
            >
              <Shield size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">Super Admin</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1"
            style={{
              color: isActive(item.href) ? "white" : "rgba(255,255,255,0.65)",
              background: isActive(item.href) ? "#4F46E5" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              }
            }}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}

        {/* User menu */}
        <div className="relative mt-2">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: "rgba(255,255,255,0.8)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ background: "#4F46E5" }}
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {user?.isSuperAdmin ? "Super Admin" : user?.role || "Member"}
                  </p>
                </div>
                <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
              </>
            )}
          </button>

          {userMenuOpen && (
            <div
              className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={14} />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
