"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Search } from "lucide-react";

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState("Home");

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0C2A28' }}>
      {/* Sidebar */}
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: '#E4E1B6' }}>Welcome Jatson</h1>
            </div>

            {/* Recently Visited Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="#E4E1B6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium" style={{ color: '#E4E1B6' }}>Recently Visited</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#0C2A28' }}>
                    <img src="/icon-plus.png" alt="New Page" className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium" style={{ color: '#E4E1B6' }}>New Page</h3>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#0C2A28' }}>
                    <img src="/icon-plus.png" alt="Getting Started" className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium" style={{ color: '#E4E1B6' }}>Getting Started</h3>
                </div>
              </div>
            </div>

            {/* Upcoming Events and Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sync Work Schedule */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="#E4E1B6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium" style={{ color: '#E4E1B6' }}>Upcoming Events</span>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-start mb-4">
                    <img src="/icon-calendar.png" alt="Calendar" className="w-8 h-8 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1" style={{ color: '#E4E1B6' }}>Sync Your Work Schedule</h3>
                      <p className="text-sm opacity-80" style={{ color: '#E4E1B6' }}>
                        See all tasks and team events in one place — plan smarter, work better.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Events */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium" style={{ color: '#E4E1B6' }}>Today</div>
                      <div className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>Nov 6</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" style={{ color: '#E4E1B6' }}>Team Standup</div>
                      <div className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>10 AM • Online</div>
                      <div className="mt-1">
                        <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: '#0C2A28' }}>Join standup notes</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: '#E4E1B6', opacity: 0.2 }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium" style={{ color: '#E4E1B6' }}>Fri</div>
                        <div className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>Nov 7</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium" style={{ color: '#E4E1B6' }}>Sprint Review</div>
                        <div className="text-sm opacity-70" style={{ color: '#E4E1B6' }}>10 AM • Office</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}