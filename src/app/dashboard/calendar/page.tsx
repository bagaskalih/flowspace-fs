"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";

interface Calendar {
  id: string;
  name: string;
  type: string;
  division?: { id: string; name: string };
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  tags: string[];
  calendarId: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("General Calendar");
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    tags: [] as string[],
    calendarId: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    // Force dummy data for testing since backend is not ready
    useDummyData();
    setLoading(false);
    
    /* Uncomment when backend is ready:
    try {
      const res = await fetch("/api/calendars");
      if (res.ok) {
        const data = await res.json();
        setCalendars(data);
      } else {
        useDummyData();
      }
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
      useDummyData();
    } finally {
      setLoading(false);
    }
    */
  };

  const useDummyData = () => {
    // Create dummy events for the current month
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const dummyCalendars: Calendar[] = [
      {
        id: "1",
        name: "Marketing",
        type: "division",
        events: [
          {
            id: "1",
            title: "Project Deadline",
            description: "Submit final project deliverables",
            startDate: new Date(currentYear, currentMonth, 5, 11, 30).toISOString(),
            endDate: new Date(currentYear, currentMonth, 5, 12, 30).toISOString(),
            tags: ["deadline"],
            calendarId: "1",
          },
          {
            id: "2",
            title: "Team Meeting",
            description: "Weekly sync with marketing team",
            startDate: new Date(currentYear, currentMonth, 8, 14, 0).toISOString(),
            endDate: new Date(currentYear, currentMonth, 8, 15, 0).toISOString(),
            tags: ["meeting"],
            calendarId: "1",
          },
          {
            id: "3",
            title: "Product Launch",
            description: "Launch new product campaign",
            startDate: new Date(currentYear, currentMonth, 15, 9, 0).toISOString(),
            endDate: new Date(currentYear, currentMonth, 15, 17, 0).toISOString(),
            tags: ["event"],
            calendarId: "1",
          },
          {
            id: "4",
            title: "Client Presentation",
            description: "Present Q1 results to client",
            startDate: new Date(currentYear, currentMonth, 22, 10, 0).toISOString(),
            endDate: new Date(currentYear, currentMonth, 22, 11, 30).toISOString(),
            tags: ["meeting"],
            calendarId: "1",
          },
        ],
      },
    ];

    setCalendars(dummyCalendars);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const res = await fetch(`/api/calendars/${formData.calendarId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          tags: formData.tags,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          tags: [],
          calendarId: "",
        });
        fetchCalendars();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create event");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add empty cells to complete the last row (make it a multiple of 7)
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const getEventsForDay = (day: number) => {
    const allEvents: CalendarEvent[] = [];
    calendars.forEach((cal) => {
      cal.events?.forEach((event) => {
        const eventDate = new Date(event.startDate);
        if (
          eventDate.getDate() === day &&
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear()
        ) {
          allEvents.push(event);
        }
      });
    });
    return allEvents;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a3a38]">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold text-white">Calendar</h1>
          
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setAnimationDirection('left');
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1
                      )
                    );
                    setIsAnimating(false);
                  }, 150);
                }}
                className="p-2 hover:bg-[#2a4a48] rounded-lg text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-white min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => {
                  setAnimationDirection('right');
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1
                      )
                    );
                    setIsAnimating(false);
                  }, 150);
                }}
                className="p-2 hover:bg-[#2a4a48] rounded-lg text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Event
            </button>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="w-full">
          {/* Calendar Grid */}
          <div className={`bg-[#1a3a38] rounded-lg overflow-hidden border-2 border-[#E4E1B6] transition-all duration-300 ${
            isAnimating
              ? animationDirection === 'left'
                ? 'opacity-0 -translate-x-8'
                : 'opacity-0 translate-x-8'
              : 'opacity-100 translate-x-0'
          }`}>
            {/* Day Names */}
            <div className="grid grid-cols-7 border-b-2 border-[#E4E1B6]">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-semibold text-gray-400 py-4 bg-[#1a3a38] ${
                    index < 6 ? "border-r-2 border-[#E4E1B6]" : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((day, index) => {
                const events = day ? getEventsForDay(day) : [];
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();
                
                const totalCells = getDaysInMonth(currentDate).length;
                const totalRows = Math.ceil(totalCells / 7);
                const currentRow = Math.floor(index / 7);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-3 bg-[#1a3a38] ${
                      index % 7 < 6 ? "border-r-2" : ""
                    } ${
                      currentRow < totalRows - 1 ? "border-b-2" : ""
                    } border-[#E4E1B6] ${day ? "hover:bg-[#233f3d]" : ""} transition-colors`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-start mb-2">
                          <div
                            className={`text-sm ${
                              isToday
                                ? "bg-orange-500 text-white px-2 py-1 rounded-md flex items-center justify-center font-bold"
                                : "text-white"
                            }`}
                          >
                            {day}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {events.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs bg-orange-500 text-white rounded px-2 py-1 truncate"
                            >
                              {new Date(event.startDate).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}{" "}
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{events.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            tags: [],
            calendarId: "",
          });
          setTagInput("");
          setError("");
        }}
        title="Create New Event"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter event title"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add event details"
              className="w-full min-h-20 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date *
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date *
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="calendarId"
              className="block text-sm font-medium text-gray-700"
            >
              Calendar *
            </label>
            <select
              id="calendarId"
              value={formData.calendarId}
              onChange={(e) =>
                setFormData({ ...formData, calendarId: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
              required
            >
              <option value="">Select a calendar</option>
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags
            </label>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                      setFormData({
                        ...formData,
                        tags: [...formData.tags, tagInput.trim()],
                      });
                      setTagInput("");
                    }
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                    setFormData({
                      ...formData,
                      tags: [...formData.tags, tagInput.trim()],
                    });
                    setTagInput("");
                  }
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#CD5B43] text-white rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          tags: formData.tags.filter((_, i) => i !== index),
                        });
                      }}
                      className="hover:bg-[#b54d37] rounded-full p-0.5 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setFormData({
                  title: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  tags: [],
                  calendarId: "",
                });
                setTagInput("");
                setError("");
              }}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-[#CD5B43] hover:bg-[#b54d37] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
