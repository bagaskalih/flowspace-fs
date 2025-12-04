"use client";

import { useState } from "react";

interface SidebarProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export default function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const mainMenuItems = [
    { name: "Home", icon: "home" },
    { name: "Issues Tracker", icon: "issues" },
    { name: "General Calendar", icon: "calendar" },
    { name: "Team Calendar", icon: "team" },
    { name: "Task List", icon: "tasks" },
  ];

  const bottomMenuItems = [
    { name: "Settings", icon: "settings" },
    { name: "Logout", icon: "logout" },
  ];

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = '/';
  };

  const handleMenuClick = (menuName: string) => {
    onMenuSelect(menuName);
    
    if (menuName === "Logout") {
      setShowLogoutModal(true);
      return;
    }
    
    if (menuName === "Issues Tracker") {
      window.location.href = '/issues';
      return;
    }
    
    if (menuName === "Home") {
      window.location.href = '/dashboard';
      return;
    }
    
    // For other menu items, show in progress message
    alert(`${menuName} is still in progress. Coming soon!`);
  };

  const renderMenuItem = (item: any, isActive: boolean) => {
    return (
      <button
        key={item.name}
        onClick={() => handleMenuClick(item.name)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
          isActive
            ? 'text-white'
            : 'hover:bg-black/10'
        }`}
        style={{
          backgroundColor: isActive ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
          color: '#E4E1B6'
        }}
      >
        {item.icon === 'home' && (
          <img src="/icon-home.png" alt="Home" className="w-5 h-5" />
        )}
        {item.icon === 'issues' && (
          <img src="/icon-issues.png" alt="Issues" className="w-5 h-5" />
        )}
        {item.icon === 'calendar' && (
          <img src="/icon-calendar.png" alt="Calendar" className="w-5 h-5" />
        )}
        {item.icon === 'team' && (
          <img src="/icon-team.png" alt="Team" className="w-5 h-5" />
        )}
        {item.icon === 'tasks' && (
          <img src="/icon-tasks.png" alt="Tasks" className="w-5 h-5" />
        )}
        {item.icon === 'settings' && (
          <img src="/icon-settings.png" alt="Settings" className="w-5 h-5" />
        )}
        {item.icon === 'logout' && (
          <img src="/icon-logout.png" alt="Logout" className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{item.name}</span>
      </button>
    );
  };

  return (
    <>
      <div className="w-64 flex flex-col h-full" style={{ backgroundColor: '#CD5B43' }}>
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
                color: '#E4E1B6'
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
          <div className="mb-3 opacity-90" style={{ color: '#E4E1B6' }}>
            <span className="text-sm font-medium">Menu</span>
          </div>
          
          {/* Main Menu Items */}
          <nav className="space-y-1 flex-1">
            {mainMenuItems.map((item) => {
              const isActive = selectedMenu === item.name;
              return renderMenuItem(item, isActive);
            })}
          </nav>

          {/* Bottom Menu Items */}
          <nav className="space-y-1 pb-4 border-t border-black/10 pt-4 mt-4">
            {bottomMenuItems.map((item) => {
              const isActive = selectedMenu === item.name;
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
              backgroundColor: '#0C2A28',
              borderColor: '#CD5B43'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#E4E1B6' }}>
              Confirm Logout
            </h3>
            <p className="text-sm mb-6 opacity-80" style={{ color: '#E4E1B6' }}>
              Are you sure you want to logout? You will be redirected to the login page.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border transition-colors"
                style={{ 
                  borderColor: '#CD5B43',
                  color: '#E4E1B6'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: '#CD5B43',
                  color: '#E4E1B6'
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