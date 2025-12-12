"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Home");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });

    // Fetch upcoming events
    fetch("/api/calendars")
      .then((res) => res.json())
      .then((calendars) => {
        if (!Array.isArray(calendars)) return;

        const allEvents: any[] = [];
        calendars.forEach((cal: any) => {
          if (cal.events) {
            cal.events.forEach((event: any) => {
              allEvents.push({
                ...event,
                calendarName: cal.name,
              });
            });
          }
        });

        // Sort by date and take next 5 events
        const upcoming = allEvents
          .filter((e) => new Date(e.startDate) >= new Date())
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          .slice(0, 5);

        setUpcomingEvents(upcoming);
      })
      .catch(console.error);
  }, [router]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const dayNum = date.getDate();
    return { day, month, dayNum };
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-[#E4E1B6]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a3a38]">
      {/* Sidebar */}
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Welcome Header */}
        <h1 className="text-4xl font-semibold text-white mb-8">
          Welcome {user?.name || "User"}
        </h1>

        {/* Upcoming Events Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-sm text-gray-400">Upcoming Events</h2>
          </div>

          <div className="bg-[#2a4a48] rounded-lg p-8">
            <div className="flex gap-8">
              {/* Left side - Illustration */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#1a3a38] rounded-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Sync Your Work Schedule
                </h3>
                <p className="text-gray-400 text-sm max-w-md">
                  See all tasks and team events in one place — plan smarter,
                  work better.
                </p>
              </div>

              {/* Right side - Events list */}
              <div className="w-80 space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-8">
                    No upcoming events
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const { day, month, dayNum } = formatEventDate(
                      event.startDate
                    );
                    const time = formatEventTime(event.startDate);
                    const isToday =
                      new Date(event.startDate).toDateString() ===
                      new Date().toDateString();

                    return (
                      <div
                        key={event.id}
                        className="border-b border-[#355856] last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-left">
                            <div className="text-xs text-gray-400">
                              {isToday ? "Today" : day}
                            </div>
                            <div className="text-sm text-white">
                              {month} {dayNum}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {time}
                              </span>
                              {event.tags && event.tags[0] && (
                                <span className="px-2 py-0.5 text-xs bg-teal-500/20 text-teal-300 rounded">
                                  {event.tags[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
