"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const mainMenuItems = [
    { name: "Home", icon: "home", path: "/dashboard" },
    { name: "Boards", icon: "board", path: "/dashboard/boards" },
    { name: "Tasks", icon: "tasks", path: "/dashboard/tasks" },
    { name: "Issues", icon: "issues", path: "/dashboard/issues" },
    { name: "Calendar", icon: "calendar", path: "/dashboard/calendar" },
  ];

  // Add admin menu for admin and master users
  if (session?.user?.role === "admin" || session?.user?.role === "master") {
    mainMenuItems.push({
      name: "Admin",
      icon: "admin",
      path: "/dashboard/admin",
    });
  }

  const bottomMenuItems = [
    { name: "Settings", icon: "settings", path: "/dashboard/settings" },
    { name: "Logout", icon: "logout", path: "" },
  ];

  const handleLogout = async () => {
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();

    // Sign out using NextAuth
    await signOut({ callbackUrl: "/login", redirect: true });
  };

  const handleMenuClick = (menuName: string, path: string) => {
    onMenuSelect(menuName);

    if (menuName === "Logout") {
      setShowLogoutModal(true);
      return;
    }

    if (path) {
      router.push(path);
      return;
    }

    // For other menu items, show in progress message
    alert(`${menuName} is still in progress. Coming soon!`);
  };

  const renderMenuItem = (item: any, isActive: boolean) => {
    return (
      <button
        key={item.name}
        onClick={() => handleMenuClick(item.name, item.path)}
        className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
          isActive ? "text-white" : "hover:bg-black/10 hover:translate-x-1"
        }`}
        style={{
          backgroundColor: isActive ? "rgba(0, 0, 0, 0.2)" : "transparent",
          color: "#E4E1B6",
        }}
      >
        {item.icon === "home" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        )}
        {item.icon === "board" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h12V6H4zm2 2h2v4H6V8zm4 0h4v4h-4V8z" />
          </svg>
        )}
        {item.icon === "tasks" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {item.icon === "issues" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {item.icon === "calendar" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {item.icon === "admin" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        )}
        {item.icon === "settings" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {item.icon === "logout" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="text-sm font-medium">{item.name}</span>
      </button>
    );
  };

  return (
    <>
      <div
        className="w-64 flex flex-col h-full"
        style={{ backgroundColor: "#CD5B43" }}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <img
              src="/logo_fs.png"
              alt="Flowspace"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-black/20 placeholder-white/70 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 border-0"
              style={{
                color: "#E4E1B6",
              }}
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4"
              fill="none"
              stroke="#E4E1B6"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex-1 flex flex-col px-4">
          <div className="mb-3 opacity-90" style={{ color: "#E4E1B6" }}>
            <span className="text-sm font-medium">Menu</span>
          </div>

          {/* Main Menu Items */}
          <nav className="space-y-1 flex-1">
            {mainMenuItems.map((item) => {
              const isActive =
                pathname === item.path ||
                (item.path !== "/dashboard" &&
                  pathname.startsWith(item.path + "/"));
              return renderMenuItem(item, isActive);
            })}
          </nav>

          {/* Bottom Menu Items */}
          <nav className="space-y-1 pb-4 border-t border-black/10 pt-4 mt-4">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return renderMenuItem(item, isActive);
            })}
          </nav>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-sm mx-4 border"
            style={{
              backgroundColor: "#0C2A28",
              borderColor: "#CD5B43",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#E4E1B6" }}
            >
              Confirm Logout
            </h3>
            <p className="text-sm mb-6 opacity-80" style={{ color: "#E4E1B6" }}>
              Are you sure you want to logout? You will be redirected to the
              login page.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border transition-colors"
                style={{
                  borderColor: "#CD5B43",
                  color: "#E4E1B6",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: "#CD5B43",
                  color: "#E4E1B6",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
