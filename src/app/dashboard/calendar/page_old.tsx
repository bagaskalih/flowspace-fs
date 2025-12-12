"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  tag: string | null;
  calendarId: string;
}

interface Calendar {
  id: string;
  name: string;
  description: string | null;
  type: string;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    tag: "",
  });

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const res = await fetch("/api/calendars");
      if (res.ok) {
        const data = await res.json();
        setCalendars(data);
        if (data.length > 0 && !selectedCalendar) {
          setSelectedCalendar(data[0].id);
          fetchEvents(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (calendarId: string) => {
    try {
      const res = await fetch(`/api/calendars/${calendarId}/events`);
      if (res.ok) {
        const events = await res.json();
        setCalendars((prev) =>
          prev.map((cal) => (cal.id === calendarId ? { ...cal, events } : cal))
        );
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendar) return;

    try {
      const res = await fetch(`/api/calendars/${selectedCalendar}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (res.ok) {
        setShowEventModal(false);
        setNewEvent({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          tag: "",
        });
        fetchEvents(selectedCalendar);
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date || !selectedCalendar) return [];
    const calendar = calendars.find((c) => c.id === selectedCalendar);
    if (!calendar) return [];

    return calendar.events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const getTagColor = (tag: string | null) => {
    if (!tag) return "bg-gray-100 text-gray-700";
    const colors: { [key: string]: string } = {
      meeting: "bg-blue-100 text-blue-700",
      deadline: "bg-red-100 text-red-700",
      reminder: "bg-yellow-100 text-yellow-700",
      event: "bg-purple-100 text-purple-700",
    };
    return colors[tag.toLowerCase()] || "bg-gray-100 text-gray-700";
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

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">
              Manage your events and schedules
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowEventModal(true)}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={!selectedCalendar}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Calendar List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold text-gray-900 mb-4">
                  My Calendars
                </h2>
                <div className="space-y-2">
                  {calendars.map((calendar) => (
                    <button
                      key={calendar.id}
                      onClick={() => {
                        setSelectedCalendar(calendar.id);
                        fetchEvents(calendar.id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCalendar === calendar.id
                          ? "bg-orange-100 text-orange-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">{calendar.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {calendar.type}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Calendar View */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Calendar Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={previousMonth}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {monthNames[currentDate.getMonth()]}{" "}
                      {currentDate.getFullYear()}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={view === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("month")}
                    >
                      Month
                    </Button>
                    <Button
                      variant={view === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("week")}
                    >
                      Week
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-gray-700 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar Days */}
                  {days.map((day, index) => {
                    const events = getEventsForDay(day);
                    const isToday =
                      day &&
                      day.getDate() === new Date().getDate() &&
                      day.getMonth() === new Date().getMonth() &&
                      day.getFullYear() === new Date().getFullYear();

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] border rounded-lg p-2 ${
                          day ? "bg-white" : "bg-gray-50"
                        } ${
                          isToday
                            ? "border-orange-500 border-2"
                            : "border-gray-200"
                        }`}
                      >
                        {day && (
                          <>
                            <div
                              className={`text-sm font-medium mb-1 ${
                                isToday ? "text-orange-600" : "text-gray-900"
                              }`}
                            >
                              {day.getDate()}
                            </div>
                            <div className="space-y-1">
                              {events.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-2 py-1 rounded truncate ${getTagColor(
                                    event.tag
                                  )}`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {events.length > 2 && (
                                <div className="text-xs text-gray-500 px-2">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Create New Event</h2>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tag
                    </label>
                    <select
                      value={newEvent.tag}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, tag: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">No tag</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="reminder">Reminder</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEventModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      Create Event
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
