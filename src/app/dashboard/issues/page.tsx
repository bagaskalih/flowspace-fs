"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    comments: number;
  };
  createdAt: string;
}

const STATUS_COLUMNS = [
  { key: "todo", title: "To Do", color: "bg-[#2a4a48]" },
  { key: "in_progress", title: "In Progress", color: "bg-[#2a4a48]" },
  { key: "review", title: "In Review", color: "bg-[#2a4a48]" },
  { key: "done", title: "Done", color: "bg-[#2a4a48]" },
];

export default function IssuesPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Issues Tracker");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const issue = await res.json();
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
        });
        setActiveColumn(null);
        fetchIssues();
        router.push(`/dashboard/issues/${issue.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create issue");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status);
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
        <h1 className="text-4xl font-semibold text-white mb-8">
          Issues Tracker
        </h1>

        {/* Kanban Board */}
        <div className="grid grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((column) => {
            const columnIssues = getIssuesByStatus(column.key);

            return (
              <div key={column.key} className="flex flex-col">
                {/* Column Header */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {column.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {columnIssues.length} tasks available
                  </p>
                </div>

                {/* Add New Button */}
                <button
                  onClick={() => {
                    setActiveColumn(column.key);
                    setFormData({ ...formData, status: column.key });
                    setShowModal(true);
                  }}
                  className="mb-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-colors"
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

                {/* Issues Cards */}
                <div className="space-y-3 flex-1">
                  {columnIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() =>
                        router.push(`/dashboard/issues/${issue.id}`)
                      }
                      className="bg-[#2a4a48] hover:bg-[#355856] rounded-lg p-4 cursor-pointer transition-colors"
                    >
                      {/* Issue Title */}
                      <h3 className="text-white font-medium mb-2 line-clamp-2">
                        {issue.title}
                      </h3>

                      {/* Creator Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {issue.createdBy.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-orange-400">
                          {issue.createdBy.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getTimeAgo(issue.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      {issue.description && (
                        <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                          {issue.description}
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

      {/* Create Issue Modal */}
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
          setActiveColumn(null);
          setError("");
        }}
        title="Create New Issue"
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
              Issue Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed information about the issue"
              className="w-full min-h-[150px] px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={6}
              required
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
              <option value="low">Low - Can wait</option>
              <option value="medium">Medium - Normal priority</option>
              <option value="high">High - Urgent attention needed</option>
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
              {formLoading ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
