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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    tags: [] as string[],
    calendarId: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const res = await fetch("/api/calendars");
      if (res.ok) {
        const data = await res.json();
        setCalendars(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
    } finally {
      setLoading(false);
    }
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

        <div className="flex gap-6">
          {/* Calendar Sidebar */}
          <div className="w-64 space-y-4">
            <div className="bg-[#2a4a48] rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Calendars</h3>
              {calendars.map((calendar) => (
                <div key={calendar.id} className="flex items-center gap-2 py-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">{calendar.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Calendar */}
          <div className="flex-1">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1
                    )
                  )
                }
                className="p-2 hover:bg-[#2a4a48] rounded-lg text-white"
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
              <h2 className="text-2xl font-semibold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1
                    )
                  )
                }
                className="p-2 hover:bg-[#2a4a48] rounded-lg text-white"
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

            {/* Calendar Grid */}
            <div className="bg-[#2a4a48] rounded-lg p-6">
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((day, index) => {
                  const events = day ? getEventsForDay(day) : [];
                  const isToday =
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 rounded-lg ${
                        day
                          ? isToday
                            ? "bg-orange-500/20 border-2 border-orange-500"
                            : "bg-[#1a3a38] hover:bg-[#233f3d]"
                          : ""
                      } transition-colors`}
                    >
                      {day && (
                        <>
                          <div
                            className={`text-sm mb-1 ${
                              isToday
                                ? "text-orange-400 font-bold"
                                : "text-white"
                            }`}
                          >
                            {day}
                          </div>
                          <div className="space-y-1">
                            {events.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs bg-teal-500/20 text-teal-300 rounded px-1 py-0.5 truncate"
                              >
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
          setError("");
        }}
        title="Create New Event"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
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
              className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
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
              className="w-full min-h-20 px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-300"
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
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-300"
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
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="calendarId"
              className="block text-sm font-medium text-gray-300"
            >
              Calendar *
            </label>
            <select
              id="calendarId"
              value={formData.calendarId}
              onChange={(e) =>
                setFormData({ ...formData, calendarId: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="block text-sm font-medium text-gray-300"
            >
              Tags
            </label>
            <select
              id="tags"
              multiple
              value={formData.tags}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setFormData({ ...formData, tags: selectedOptions });
              }}
              className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              size={4}
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Reminder</option>
              <option value="event">Event</option>
            </select>
            <p className="text-xs text-gray-400">
              Hold Ctrl/Cmd to select multiple tags
            </p>
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
                setError("");
              }}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
