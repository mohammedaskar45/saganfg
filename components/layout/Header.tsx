"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, Menu, LogOut, Settings, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  // Fetch mock or real notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/v1/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await fetch("/api/v1/notifications", { method: "PUT" });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Breadcrumb / Left Side */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          Home
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.href} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            <Link
              href={crumb.href}
              className={`font-medium transition-colors ${
                idx === breadcrumbs.length - 1
                  ? "text-gray-900 cursor-default pointer-events-none"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder="Search projects, clients..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl relative transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-sm text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-gray-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                        !n.isRead ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {session?.user?.name || "User"}
            </span>
          </button>

          {/* User Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {session?.user?.email}
                </p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={14} />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
