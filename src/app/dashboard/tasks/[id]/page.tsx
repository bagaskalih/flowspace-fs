"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Modal from "../../../components/Modal";
import {
  ArrowLeft,
  CheckSquare,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  tags: string[];
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
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedMenu, setSelectedMenu] = useState("Tasks");
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [divisionUsers, setDivisionUsers] = useState<any[]>([]);
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
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchTask();
      fetchDivisions();
    }
  }, [params.id]);

  useEffect(() => {
    if (formData.divisionId) {
      fetchDivisionUsers(formData.divisionId);
    } else {
      setDivisionUsers([]);
    }
  }, [formData.divisionId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAssigneeDropdown(false);
      }
    };

    if (showAssigneeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAssigneeDropdown]);

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

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tasks/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTask();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditTask = () => {
    if (!task) return;

    // Determine divisionId based on board type
    let divisionId = "";
    if (task.board.type === "general") {
      divisionId = "general";
    } else if (task.board.type === "division" && task.board.division?.id) {
      divisionId = task.board.division.id;
    }

    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      divisionId: divisionId,
      assigneeId: task.assignedTo?.id || "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });

    // Set initial assignee search value
    setAssigneeSearch(task.assignedTo?.name || "Unassigned");

    // Fetch division users immediately
    if (divisionId) {
      fetchDivisionUsers(divisionId);
    }

    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          status: formData.status,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate
            ? new Date(formData.dueDate).toISOString()
            : null,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchTask();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update task");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard/tasks");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete task");
      }
    } catch (err) {
      alert("An error occurred while deleting the task");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "text-gray-300 bg-gray-500/20";
      case "in_progress":
        return "text-blue-400 bg-blue-500/20";
      case "review":
        return "text-purple-400 bg-purple-500/20";
      case "done":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-gray-300 bg-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-white">Task not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a3a38]">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/dashboard/tasks")}
            className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEditTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Task
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="bg-[#2a4a48] rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <CheckSquare className="h-6 w-6 text-orange-400 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-3">
                {task.title}
              </h1>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className={`px-3 py-1 rounded text-sm font-medium cursor-pointer transition-all ${getStatusColor(
                    task.status
                  )} border-none outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50`}
                  style={{
                    appearance: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.5rem center",
                    paddingRight: "2rem",
                  }}
                >
                  <option value="todo" className="bg-[#2a4a48] text-white">
                    To Do
                  </option>
                  <option
                    value="in_progress"
                    className="bg-[#2a4a48] text-white"
                  >
                    In Progress
                  </option>
                  <option value="review" className="bg-[#2a4a48] text-white">
                    Review
                  </option>
                  <option value="done" className="bg-[#2a4a48] text-white">
                    Done
                  </option>
                  <option value="closed" className="bg-[#2a4a48] text-white">
                    Closed
                  </option>
                </select>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority} priority
                </span>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4 text-gray-400" />
                    {task.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckSquare className="h-4 w-4" />
              <span>
                Board:{" "}
                <span className="text-orange-400">{task.board.name}</span>
              </span>
            </div>

            {task.assignedTo && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="h-4 w-4" />
                <span>
                  Assigned to:{" "}
                  <span className="text-orange-400">
                    {task.assignedTo.name}
                  </span>
                </span>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Due:{" "}
                  <span className="text-orange-400">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-[#2a4a48] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Task Information
          </h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Status</span>
              <span className="font-medium capitalize">
                {task.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Priority</span>
              <span className="font-medium capitalize">{task.priority}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Board</span>
              <span className="font-medium">{task.board.name}</span>
            </div>
            {task.assignedTo && (
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Assignee</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{task.assignedTo.name}</span>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">Due Date</span>
                <span className="font-medium">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Created At</span>
              <span className="font-medium">
                {new Date(task.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-900">
            Are you sure you want to delete this task? This action cannot be
            undone.
          </p>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteTask}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setError("");
        }}
        title="Edit Task"
      >
        <form onSubmit={handleUpdateTask} className="space-y-5">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative" ref={assigneeDropdownRef}>
              <label
                htmlFor="assigneeId"
                className="block text-sm font-semibold text-gray-900"
              >
                Assign To
              </label>
              <input
                type="text"
                placeholder="Search or select assignee..."
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                onFocus={() => {
                  setAssigneeSearch("");
                  setShowAssigneeDropdown(true);
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {showAssigneeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, assigneeId: "" });
                      setAssigneeSearch("Unassigned");
                      setShowAssigneeDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                  >
                    Unassigned
                  </div>
                  {divisionUsers
                    .filter((user) =>
                      user.name
                        .toLowerCase()
                        .includes(assigneeSearch.toLowerCase())
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setFormData({ ...formData, assigneeId: user.id });
                          setAssigneeSearch(user.name);
                          setShowAssigneeDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                      >
                        {user.name}
                      </div>
                    ))}
                  {divisionUsers.filter((user) =>
                    user.name
                      .toLowerCase()
                      .includes(assigneeSearch.toLowerCase())
                  ).length === 0 &&
                    assigneeSearch && (
                      <div className="px-3 py-2 text-gray-500 italic">
                        No members found
                      </div>
                    )}
                </div>
              )}
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
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
              {formLoading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
