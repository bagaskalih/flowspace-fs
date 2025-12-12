"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Modal from "../../../components/Modal";
import { ArrowLeft, Plus, User, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  type: string;
  division?: {
    id: string;
    name: string;
  };
  tasks: Task[];
}

const STATUS_COLUMNS = [
  { key: "todo", title: "To Do" },
  { key: "in_progress", title: "In Progress" },
  { key: "review", title: "In Review" },
  { key: "done", title: "Done" },
];

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedMenu, setSelectedMenu] = useState("Boards");
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchBoard();
    }
  }, [params.id]);

  const fetchBoard = async () => {
    try {
      const res = await fetch(`/api/boards/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
      }
    } catch (error) {
      console.error("Failed to fetch board:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          boardId: params.id,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
        });
        fetchBoard();
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

  const getTasksByStatus = (status: string) => {
    return board?.tasks.filter((task) => task.status === status) || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-white">Board not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a3a38]">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <button
          onClick={() => router.push("/dashboard/boards")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Boards
        </button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold text-white mb-2">
              {board.name}
            </h1>
            {board.description && (
              <p className="text-gray-300 mb-3">{board.description}</p>
            )}
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-sm bg-orange-500/20 text-orange-300 rounded capitalize">
                {board.type} Board
              </span>
              {board.division && (
                <span className="text-sm text-gray-400">
                  {board.division.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.key);

            return (
              <div key={column.key} className="flex flex-col">
                {/* Column Header */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {column.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {columnTasks.length}{" "}
                    {columnTasks.length === 1 ? "task" : "tasks"}
                  </p>
                </div>

                {/* Add New Button */}
                <button
                  onClick={() => {
                    setFormData({ ...formData, status: column.key });
                    setShowModal(true);
                  }}
                  className="mb-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add new
                </button>

                {/* Task Cards */}
                <div className="space-y-3 flex-1">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      className="bg-[#2a4a48] hover:bg-[#355856] rounded-lg p-4 cursor-pointer transition-colors"
                    >
                      {/* Task Title */}
                      <h3 className="text-white font-medium mb-2 line-clamp-2">
                        {task.title}
                      </h3>

                      {/* Priority Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-xs font-semibold ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(task.createdAt)}
                        </span>
                      </div>

                      {/* Assignee */}
                      {task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {task.assignedTo.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-orange-400">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
          });
          setError("");
        }}
        title="Create New Task"
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
              placeholder="Add more details about this task"
              className="w-full min-h-[100px] px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-300"
            >
              Priority *
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
              {formLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
