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
  tag: string | null;
  calendarId: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function CalendarPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("General Calendar");
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right" | null
  >(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    tags: [] as string[],
    divisionId: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarTypeFilter, setCalendarTypeFilter] =
    useState<string>("general");
  const [divisions, setDivisions] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendars();
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const res = await fetch("/api/divisions");
      if (res.ok) {
        const data = await res.json();
        setDivisions(data);
      }
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
    }
  };

  const fetchCalendars = async () => {
    try {
      const res = await fetch("/api/calendars");
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched calendars:", data);
        setCalendars(data);
      } else {
        console.error("Failed to fetch calendars");
      }
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // Find the calendar this event belongs to
    const eventCalendar = calendars.find((cal) => cal.id === event.calendarId);

    // Determine divisionId based on calendar type
    let divisionId = "";
    if (eventCalendar?.type === "general") {
      divisionId = "general";
    } else if (
      eventCalendar?.type === "division" &&
      eventCalendar.division?.id
    ) {
      divisionId = eventCalendar.division.id;
    }

    setFormData({
      title: event.title,
      description: event.description || "",
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      tags: event.tag ? event.tag.split(",").map((t) => t.trim()) : [],
      divisionId: divisionId,
    });
    setIsEditing(true);
    setEditingEventId(event.id);
    setShowEventModal(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      // If editing, update the event
      if (isEditing && editingEventId) {
        const res = await fetch(`/api/events/${editingEventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            tag: formData.tags.join(", "),
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
            divisionId: "",
          });
          setIsEditing(false);
          setEditingEventId(null);
          fetchCalendars();
        } else {
          const data = await res.json();
          setError(data.error || "Failed to update event");
        }
        setFormLoading(false);
        return;
      }

      // Creating new event
      // Find the appropriate calendar based on selection
      let targetCalendar;
      if (formData.divisionId === "general") {
        // Find general calendar
        targetCalendar = calendars.find((cal) => cal.type === "general");

        // Create general calendar if it doesn't exist
        if (!targetCalendar) {
          const createRes = await fetch("/api/calendars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "General Calendar",
              type: "general",
            }),
          });

          if (createRes.ok) {
            targetCalendar = await createRes.json();
          } else {
            setError("Failed to create general calendar");
            setFormLoading(false);
            return;
          }
        }
      } else if (formData.divisionId) {
        // Find division calendar
        targetCalendar = calendars.find(
          (cal) =>
            cal.type === "division" && cal.division?.id === formData.divisionId
        );

        // Create division calendar if it doesn't exist
        if (!targetCalendar) {
          const division = divisions.find((d) => d.id === formData.divisionId);
          const createRes = await fetch("/api/calendars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${division?.name || "Division"} Calendar`,
              type: "division",
              divisionId: formData.divisionId,
            }),
          });

          if (createRes.ok) {
            targetCalendar = await createRes.json();
          } else {
            setError("Failed to create division calendar");
            setFormLoading(false);
            return;
          }
        }
      }

      if (!targetCalendar) {
        setError("Please select a calendar type");
        setFormLoading(false);
        return;
      }

      const res = await fetch(`/api/calendars/${targetCalendar.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          tag: formData.tags.join(", "),
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
          divisionId: "",
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
    filteredCalendars.forEach((cal) => {
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

  // Filter calendars by type
  const filteredCalendars = calendars.filter((calendar) => {
    if (calendarTypeFilter === "all") return true;
    return calendar.type === calendarTypeFilter;
  });

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
          <div className="flex items-center gap-6">
            <h1 className="text-4xl font-semibold text-white">Calendar</h1>

            {/* Calendar Type Filter */}
            <div className="flex items-center gap-2 bg-[#2a5a55] rounded-lg p-1">
              <button
                onClick={() => setCalendarTypeFilter("general")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  calendarTypeFilter === "general"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setCalendarTypeFilter("division")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  calendarTypeFilter === "division"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Division
              </button>
              <button
                onClick={() => setCalendarTypeFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  calendarTypeFilter === "all"
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setAnimationDirection("left");
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
                  setAnimationDirection("right");
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
          <div
            className={`bg-[#1a3a38] rounded-lg overflow-hidden border-2 border-[#E4E1B6] transition-all duration-300 ${
              isAnimating
                ? animationDirection === "left"
                  ? "opacity-0 -translate-x-8"
                  : "opacity-0 translate-x-8"
                : "opacity-100 translate-x-0"
            }`}
          >
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
                    } border-[#E4E1B6] ${
                      day ? "hover:bg-[#233f3d]" : ""
                    } transition-colors`}
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
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowEventModal(true);
                              }}
                              className="text-xs bg-orange-500 text-white rounded px-2 py-1 truncate cursor-pointer hover:bg-orange-600 transition-colors"
                            >
                              {new Date(event.startDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}{" "}
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
            divisionId: "",
          });
          setTagInput("");
          setError("");
          setIsEditing(false);
          setEditingEventId(null);
        }}
        title={isEditing ? "Edit Event" : "Create New Event"}
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
              className="block text-sm font-semibold text-gray-900"
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
              className="block text-sm font-semibold text-gray-900"
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
                className="block text-sm font-semibold text-gray-900"
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
                className="block text-sm font-semibold text-gray-900"
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
              htmlFor="divisionId"
              className="block text-sm font-semibold text-gray-900"
            >
              Calendar Type *
            </label>
            <select
              id="divisionId"
              value={formData.divisionId}
              onChange={(e) =>
                setFormData({ ...formData, divisionId: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CD5B43] focus:border-transparent"
              required
            >
              <option value="">Select calendar type</option>
              <option value="general">General Calendar</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name} Division
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tags"
              className="block text-sm font-semibold text-gray-900"
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
                    if (
                      tagInput.trim() &&
                      !formData.tags.includes(tagInput.trim())
                    ) {
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
                  if (
                    tagInput.trim() &&
                    !formData.tags.includes(tagInput.trim())
                  ) {
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
                  divisionId: "",
                });
                setTagInput("");
                setError("");
                setIsEditing(false);
                setEditingEventId(null);
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
              {formLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Event"
                : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          title="Event Details"
        >
          <div className="space-y-6">
            {/* Event Title & Description */}
            <div className="border-b border-[#2a5a56] pb-4">
              <h3 className="text-2xl font-bold text-white mb-3">
                {selectedEvent.title}
              </h3>
              {selectedEvent.description && (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}
            </div>

            {/* Created By */}
            {selectedEvent.createdBy && (
              <div className="bg-[#0f2e2c]/50 rounded-lg p-4 border border-[#2a5a56]">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-300">
                      Created By
                    </p>
                    <p className="text-white font-medium">
                      {selectedEvent.createdBy.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {selectedEvent.createdBy.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time Info */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#0f2e2c]/50 rounded-lg p-4 border border-[#2a5a56]">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-gray-300">
                    Start Time
                  </p>
                </div>
                <p className="text-white font-medium ml-8">
                  {new Date(selectedEvent.startDate).toLocaleString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="bg-[#0f2e2c]/50 rounded-lg p-4 border border-[#2a5a56]">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-gray-300">
                    End Time
                  </p>
                </div>
                <p className="text-white font-medium ml-8">
                  {new Date(selectedEvent.endDate).toLocaleString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-[#1a3a38] rounded-lg p-4 border border-[#2a5a56]">
              <p className="text-sm text-gray-400 mb-1">Duration</p>
              <p className="text-white font-medium">
                {Math.round(
                  (new Date(selectedEvent.endDate).getTime() -
                    new Date(selectedEvent.startDate).getTime()) /
                    (1000 * 60)
                )}{" "}
                minutes
              </p>
            </div>

            {/* Tags */}
            {selectedEvent.tag && (
              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tag.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium shadow-md"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => handleEditEvent(selectedEvent)}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
