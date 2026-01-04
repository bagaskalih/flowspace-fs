"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import { ChevronDown, Plus } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  dueDate?: string;
  _count?: {
    comments: number;
  };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: "not_started", label: "Not Started", color: "bg-gray-500" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { value: "in_review", label: "In Review", color: "bg-yellow-500" },
  { value: "done", label: "Done", color: "bg-green-500" },
  { value: "closed", label: "Closed", color: "bg-red-500" },
];

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

export default function IssuesPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Issues Tracker");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Filter states
  const [hideClosed, setHideClosed] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  // Create issue modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedToId: "",
  });

  useEffect(() => {
    fetchIssues();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter((u: any) => u.status === "active"));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchIssueDetails = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedIssue(data);
      }
    } catch (error) {
      console.error("Failed to fetch issue details:", error);
    }
  };

  const handleUpdateIssue = async (
    issueId: string,
    updates: Partial<Issue> | { assignedToId?: string | null }
  ) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedIssue = await res.json();

        // Preserve existing comments if they exist
        const currentIssue = issues.find((issue) => issue.id === issueId);
        if (currentIssue?.comments) {
          updatedIssue.comments = currentIssue.comments;
        }

        setIssues(
          issues.map((issue) => (issue.id === issueId ? updatedIssue : issue))
        );
        if (selectedIssue?.id === issueId) {
          // Preserve comments from selectedIssue
          if (selectedIssue.comments) {
            updatedIssue.comments = selectedIssue.comments;
          }
          setSelectedIssue(updatedIssue);
        }
      }
    } catch (error) {
      console.error("Failed to update issue:", error);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.title.trim()) return;

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description || null,
          priority: createForm.priority,
          assignedToId: createForm.assignedToId || null,
        }),
      });

      if (res.ok) {
        const newIssue = await res.json();
        setIssues([newIssue, ...issues]);
        setShowCreateModal(false);
        setCreateForm({
          title: "",
          description: "",
          priority: "medium",
          assignedToId: "",
        });
        setSelectedIssue(newIssue);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create issue");
      }
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert("Failed to create issue");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedIssue) return;

    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageInput }),
      });

      if (res.ok) {
        const newComment = await res.json();

        const updatedIssue = {
          ...selectedIssue,
          comments: [...(selectedIssue.comments || []), newComment],
          _count: {
            comments: (selectedIssue._count?.comments || 0) + 1,
          },
        };

        setSelectedIssue(updatedIssue);
        setIssues(
          issues.map((issue) =>
            issue.id === selectedIssue.id ? updatedIssue : issue
          )
        );
        setMessageInput("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return option?.color || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const option = priorityOptions.find((p) => p.value === priority);
    return option?.color || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return option?.label || status;
  };

  const getPriorityLabel = (priority: string) => {
    const option = priorityOptions.find((p) => p.value === priority);
    return option?.label || priority;
  };

  // Filter issues based on filter states
  const filteredIssues = issues.filter((issue) => {
    if (hideClosed && issue.status === "closed") return false;
    if (filterStatus !== "all" && issue.status !== filterStatus) return false;
    if (filterPriority !== "all" && issue.priority !== filterPriority)
      return false;
    if (filterAssignee !== "all") {
      if (filterAssignee === "unassigned" && issue.assignedTo) return false;
      if (
        filterAssignee !== "unassigned" &&
        issue.assignedTo?.id !== filterAssignee
      )
        return false;
    }
    return true;
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

      <div className="flex-1 overflow-hidden flex gap-6 p-8">
        {/* Left Panel - Issues List */}
        <div className="w-[450px] flex flex-col">
          <div className="bg-[#2a5a55] rounded-lg p-6 flex-1 flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Issues & Problems
                </h2>
                <p className="text-sm text-gray-300">
                  {filteredIssues.length} of {issues.length} issues
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Issue
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideClosed}
                    onChange={(e) => setHideClosed(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2a5a56] bg-[#1a3a38] text-orange-500 focus:ring-2 focus:ring-orange-400 cursor-pointer"
                  />
                  Hide Closed Issues
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1a3a38] border border-[#2a5a56] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1a3a38] border border-[#2a5a56] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer"
                  >
                    <option value="all">All Priority</option>
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1a3a38] border border-[#2a5a56] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer"
                  >
                    <option value="all">All Users</option>
                    <option value="unassigned">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => fetchIssueDetails(issue.id)}
                  className={`p-4 cursor-pointer transition-all rounded-lg border ${
                    selectedIssue?.id === issue.id
                      ? "border-[#CD5B43] bg-[#1a3a38]/50"
                      : "border-transparent hover:border-[#3a5a55] hover:bg-[#1a3a38]/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium flex-1 pr-3">
                      {issue.title}
                    </h3>
                    <span
                      className={`px-2 py-1 ${getPriorityColor(
                        issue.priority
                      )} text-white text-xs rounded-md whitespace-nowrap font-medium`}
                    >
                      {getPriorityLabel(issue.priority)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 ${getStatusColor(
                          issue.status
                        )} text-white rounded`}
                      >
                        {getStatusLabel(issue.status)}
                      </span>
                      <span>by {issue.createdBy.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(issue.createdAt)}</span>
                    <div className="flex items-center gap-1">
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
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      {issue._count?.comments || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Issue Details & Discussion */}
        <div className="flex-1 flex flex-col">
          {selectedIssue ? (
            <div className="bg-[#2a5a55] rounded-lg p-6 flex-1 flex flex-col">
              {/* Issue Header */}
              <div className="mb-6 pb-6 border-b border-[#1a3a38]">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-white flex-1">
                    {selectedIssue.title}
                  </h2>
                  <span
                    className={`px-3 py-1 ${getPriorityColor(
                      selectedIssue.priority
                    )} text-white text-sm rounded-md font-medium`}
                  >
                    {getPriorityLabel(selectedIssue.priority)}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  {selectedIssue.description}
                </p>

                {/* Issue Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Status</p>
                    <div className="relative">
                      <select
                        value={selectedIssue.status}
                        onChange={(e) =>
                          handleUpdateIssue(selectedIssue.id, {
                            status: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 ${getStatusColor(
                          selectedIssue.status
                        )} text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer font-medium`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Assigned To</p>
                    <div className="relative">
                      <input
                        type="text"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        onFocus={() => setShowAssigneeDropdown(true)}
                        placeholder={
                          selectedIssue.assignedTo?.name ||
                          "Search or select user..."
                        }
                        className="w-full px-3 py-2 bg-[#1a3a38] border border-[#2a5a56] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      {showAssigneeDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                              setShowAssigneeDropdown(false);
                              setAssigneeSearch("");
                            }}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-[#1a3a38] border border-[#2a5a56] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div
                              onClick={() => {
                                handleUpdateIssue(selectedIssue.id, {
                                  assignedToId: null,
                                });
                                setShowAssigneeDropdown(false);
                                setAssigneeSearch("");
                              }}
                              className="px-3 py-2 hover:bg-[#2a5a55] cursor-pointer text-gray-300 transition-colors"
                            >
                              Unassigned
                            </div>
                            {users
                              .filter((user) =>
                                user.name
                                  .toLowerCase()
                                  .includes(assigneeSearch.toLowerCase())
                              )
                              .map((user) => (
                                <div
                                  key={user.id}
                                  onClick={() => {
                                    handleUpdateIssue(selectedIssue.id, {
                                      assignedToId: user.id,
                                    });
                                    setShowAssigneeDropdown(false);
                                    setAssigneeSearch("");
                                  }}
                                  className={`px-3 py-2 hover:bg-[#2a5a55] cursor-pointer transition-colors ${
                                    selectedIssue.assignedTo?.id === user.id
                                      ? "bg-[#2a5a55] text-orange-400"
                                      : "text-white"
                                  }`}
                                >
                                  {user.name}
                                  {user.email && (
                                    <span className="text-xs text-gray-400 ml-2">
                                      ({user.email})
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Created by</p>
                    <p className="text-white font-medium">
                      {selectedIssue.createdBy.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created at</p>
                    <p className="text-white font-medium">
                      {formatDate(selectedIssue.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Discussion Section */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Discussion
                </h3>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {selectedIssue.comments &&
                  selectedIssue.comments.length > 0 ? (
                    selectedIssue.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#CD5B43] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="bg-[#1a3a38] rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-white">
                                {comment.user.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatTime(comment.createdAt)}
                              </p>
                            </div>
                            <p className="text-white text-sm">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No comments yet. Start the discussion!
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-[#1a3a38] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CD5B43]"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-6 py-3 bg-[#CD5B43] hover:bg-[#b54d37] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5 rotate-90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-[#2a5a55] rounded-lg p-6 flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#1a3a38] rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-lg text-white font-medium">
                Select an issue to view details and comments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm({
            title: "",
            description: "",
            priority: "medium",
            assignedToId: "",
          });
        }}
        title="Create New Issue"
      >
        <form onSubmit={handleCreateIssue} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm({ ...createForm, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70"
              placeholder="Enter issue title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 resize-none"
              placeholder="Describe the issue (optional)"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Priority *
            </label>
            <div className="relative">
              <select
                value={createForm.priority}
                onChange={(e) =>
                  setCreateForm({ ...createForm, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer appearance-none"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Assign To
            </label>
            <div className="relative">
              <select
                value={createForm.assignedToId}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    assignedToId: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer appearance-none"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({
                  title: "",
                  description: "",
                  priority: "medium",
                  assignedToId: "",
                });
              }}
              className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium border border-white/10 hover:border-white/20 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Create Issue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
