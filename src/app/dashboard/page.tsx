"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState("Home");

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-white mb-2">Welcome Jatson</h1>
            </div>

            {/* Recently Visited Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400 font-medium">Recently Visited</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-teal-700 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-60 transition-colors cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-lg mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium">New Page</h3>
                </div>

                <div className="bg-teal-700 bg-opacity-50 rounded-lg p-6 hover:bg-opacity-60 transition-colors cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-lg mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium">Getting Started</h3>
                </div>
              </div>
            </div>

            {/* Upcoming Events and Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sync Work Schedule */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 font-medium">Upcoming Events</span>
                </div>
                
                <div className="bg-teal-700 bg-opacity-30 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-8 h-8 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="text-white font-medium">Sync Your Work Schedule</h3>
                      <p className="text-gray-300 text-sm mt-1">
                        See all tasks and team events in one place — plan smarter, work better.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Events */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">Today</div>
                      <div className="text-gray-400 text-sm">Nov 6</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">Team Standup</div>
                      <div className="text-gray-400 text-sm">10 AM • Online</div>
                      <div className="mt-1">
                        <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded">Join standup notes</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-medium">Fri</div>
                        <div className="text-gray-400 text-sm">Nov 7</div>
                      </div>
                      <div>
                        <div className="text-white font-medium">Sprint Review</div>
                        <div className="text-gray-400 text-sm">10 AM • Office</div>
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