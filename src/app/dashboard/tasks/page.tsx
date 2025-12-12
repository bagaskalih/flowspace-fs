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
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  dueDate: string | null;
}

const STATUS_COLUMNS = [
  { key: "todo", title: "To Do", color: "bg-[#2a4a48]" },
  { key: "in_progress", title: "In Progress", color: "bg-[#2a4a48]" },
  { key: "review", title: "In Review", color: "bg-[#2a4a48]" },
  { key: "done", title: "Done", color: "bg-[#2a4a48]" },
];

export default function TasksPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Task List");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    boardId: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchBoards();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
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

  const fetchBoards = async () => {
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
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
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const task = await res.json();
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          boardId: "",
        });
        setActiveColumn(null);
        fetchTasks();
        router.push(`/dashboard/tasks/${task.id}`);
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
    return tasks.filter((task) => task.status === status);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 2592000)}mo ago`;
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
        <h1 className="text-4xl font-semibold text-white mb-8">Task List</h1>

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
                    {columnTasks.length === 1 ? "task" : "tasks"} available
                  </p>
                </div>

                {/* Add New Button */}
                <button
                  onClick={() => {
                    setActiveColumn(column.key);
                    setFormData({ ...formData, status: column.key });
                    setShowModal(true);
                  }}
                  className="cursor-pointer mb-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-colors"
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
                  Add new
                </button>

                {/* Tasks Cards */}
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

                      {/* Assignee Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignedTo?.name.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm text-orange-400">
                          {task.assignedTo?.name || "Unassigned"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(task.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Board Name */}
                      <div className="text-xs text-gray-400">
                        {task.board.name}
                      </div>
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
            boardId: "",
          });
          setActiveColumn(null);
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
              htmlFor="boardId"
              className="block text-sm font-medium text-gray-300"
            >
              Board *
            </label>
            <select
              id="boardId"
              value={formData.boardId}
              onChange={(e) =>
                setFormData({ ...formData, boardId: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select a board</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
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
                  boardId: "",
                });
                setActiveColumn(null);
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
