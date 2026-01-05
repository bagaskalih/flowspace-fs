"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  board: {
    id: string;
    name: string;
    type: string;
    division?: {
      id: string;
      name: string;
    } | null;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  dueDate: string | null;
}

export default function TasksPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Task List");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [divisionUsers, setDivisionUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterView, setFilterView] = useState<"all" | "my">("all");
  const [hideClosed, setHideClosed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    divisionId: "",
    assigneeId: "",
    dueDate: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentUser();
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [filterView, divisionFilter, currentUser]);

  useEffect(() => {
    if (formData.divisionId) {
      fetchDivisionUsers(formData.divisionId);
    } else {
      setDivisionUsers([]);
    }
  }, [formData.divisionId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchDivisionUsers = async (divisionId: string) => {
    try {
      const res = await fetch(`/api/auth/users?divisionId=${divisionId}`);
      if (res.ok) {
        const data = await res.json();
        setDivisionUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch division users:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = "/api/tasks";
      const params = new URLSearchParams();

      if (filterView === "my") {
        params.append("filter", "my");
      }

      if (currentUser?.role === "admin" && divisionFilter !== "all") {
        params.append("divisionFilter", divisionFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      // Find or create board for the division
      let boardId = "";

      if (formData.divisionId === "general") {
        // Find or create general board
        const boardsRes = await fetch("/api/boards");
        if (boardsRes.ok) {
          const boards = await boardsRes.json();
          const generalBoard = boards.find((b: any) => b.type === "general");

          if (generalBoard) {
            boardId = generalBoard.id;
          } else {
            // Create general board
            const createRes = await fetch("/api/boards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "General Board",
                type: "general",
              }),
            });
            if (createRes.ok) {
              const newBoard = await createRes.json();
              boardId = newBoard.id;
            }
          }
        }
      } else if (formData.divisionId) {
        // Find or create division board
        const boardsRes = await fetch("/api/boards");
        if (boardsRes.ok) {
          const boards = await boardsRes.json();
          const divisionBoard = boards.find(
            (b: any) =>
              b.type === "division" && b.divisionId === formData.divisionId
          );

          if (divisionBoard) {
            boardId = divisionBoard.id;
          } else {
            // Create division board
            const division = divisions.find(
              (d) => d.id === formData.divisionId
            );
            const createRes = await fetch("/api/boards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: `${division?.name || "Division"} Board`,
                type: "division",
                divisionId: formData.divisionId,
              }),
            });
            if (createRes.ok) {
              const newBoard = await createRes.json();
              boardId = newBoard.id;
            }
          }
        }
      }

      if (!boardId) {
        setError("Failed to find or create board");
        setFormLoading(false);
        return;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          status: formData.status,
          boardId: boardId,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          divisionId: "",
          assigneeId: "",
          dueDate: "",
        });
        fetchTasks();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create task");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/20 text-green-400";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400";
      case "review":
        return "bg-yellow-500/20 text-yellow-400";
      case "closed":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return (
          <svg
            className="w-5 h-5 text-green-400"
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
        );
      case "in_progress":
        return (
          <svg
            className="w-5 h-5 text-blue-400"
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
        );
      default:
        return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          colors[priority as keyof typeof colors] || colors.medium
        }`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDivisionName = (task: Task) => {
    if (task.board.type === "general") return "General";
    if (task.board.type === "division" && task.board.division) {
      return task.board.division.name;
    }
    return task.board.name;
  };

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
          <div>
            <h1 className="text-4xl font-semibold text-white mb-2">
              Task List
            </h1>
            <p className="text-gray-400">
              {filterView === "all" ? "All Tasks" : "My Tasks"} • {tasks.length}{" "}
              Total
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.role === "admin" && (
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="px-4 py-2 bg-[#2a4a48] text-gray-300 rounded-lg border border-[#2a5a55] focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Divisions</option>
                <option value="general">General</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setFilterView("all")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filterView === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-[#2a4a48] text-gray-300 hover:bg-[#355856]"
              }`}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              All Tasks
            </button>

            <button
              onClick={() => setFilterView("my")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filterView === "my"
                  ? "bg-orange-500 text-white"
                  : "bg-[#2a4a48] text-gray-300 hover:bg-[#355856]"
              }`}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              My Tasks
            </button>

            <button
              onClick={() => setHideClosed(!hideClosed)}
              className={`rounded-lg py-2 px-4 flex items-center gap-2 transition-colors ${
                hideClosed
                  ? "bg-orange-500 text-white"
                  : "bg-[#2a4a48] text-gray-300 hover:bg-[#355856]"
              }`}
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              Hide Closed
            </button>

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
              New Tasks
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-[#0f2e2c] rounded-lg overflow-hidden border border-[#2a5a55]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a5a55]">
                <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm w-16">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">
                  Task
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">
                  Priority
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">
                  Division
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">
                  Assigned To
                </th>
                <th className="text-left py-4 px-6 text-gray-300 font-semibold text-sm">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks
                  .filter((task) => !hideClosed || task.status !== "closed")
                  .map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      className="border-b border-[#2a5a55] hover:bg-[#1a3a38] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6">
                        <select
                          value={task.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(task.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all ${getStatusColorClass(
                            task.status
                          )} border-none outline-none focus:ring-2 focus:ring-orange-500`}
                          style={{
                            appearance: "none",
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.3rem center",
                            paddingRight: "1.5rem",
                          }}
                        >
                          <option
                            value="todo"
                            className="bg-[#0f2e2c] text-white"
                          >
                            To Do
                          </option>
                          <option
                            value="in_progress"
                            className="bg-[#0f2e2c] text-white"
                          >
                            In Progress
                          </option>
                          <option
                            value="review"
                            className="bg-[#0f2e2c] text-white"
                          >
                            In Review
                          </option>
                          <option
                            value="done"
                            className="bg-[#0f2e2c] text-white"
                          >
                            Done
                          </option>
                          <option
                            value="closed"
                            className="bg-[#0f2e2c] text-white"
                          >
                            Closed
                          </option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-400 text-sm line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">
                          {getDivisionName(task)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">
                          {task.assignedTo?.name || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">
                          {formatDate(task.dueDate)}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({
            title: "",
            description: "",
            priority: "medium",
            status: "todo",
            divisionId: "",
            assigneeId: "",
            dueDate: "",
          });
          setError("");
        }}
        title="Create New Task"
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
              Task Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              placeholder="Add more details about this task"
              className="w-full min-h-20 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="divisionId"
                className="block text-sm font-semibold text-gray-900"
              >
                Division *
              </label>
              <select
                id="divisionId"
                value={formData.divisionId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    divisionId: e.target.value,
                    assigneeId: "",
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select division</option>
                <option value="general">General</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="priority"
                className="block text-sm font-semibold text-gray-900"
              >
                Priority *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="assigneeId"
                className="block text-sm font-semibold text-gray-900"
              >
                Assign To
              </label>
              <select
                id="assigneeId"
                value={formData.assigneeId}
                onChange={(e) =>
                  setFormData({ ...formData, assigneeId: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={!formData.divisionId}
              >
                {!formData.divisionId ? (
                  <option value="">Please choose division</option>
                ) : (
                  <>
                    <option value="">Unassigned</option>
                    {divisionUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dueDate"
                className="block text-sm font-semibold text-gray-900"
              >
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-gray-900"
            >
              Status *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setFormData({
                  title: "",
                  description: "",
                  priority: "medium",
                  status: "todo",
                  divisionId: "",
                  assigneeId: "",
                  dueDate: "",
                });
                setError("");
              }}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
