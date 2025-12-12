"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { ArrowLeft, CheckSquare, User, Calendar, Tag } from "lucide-react";

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

  useEffect(() => {
    if (params.id) {
      fetchTask();
    }
  }, [params.id]);

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
        <button
          onClick={() => router.push("/dashboard/tasks")}
          className="cursor-pointer flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </button>

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
    </div>
  );
}
