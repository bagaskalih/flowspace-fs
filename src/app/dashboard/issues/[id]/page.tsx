"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { ArrowLeft, AlertCircle, User, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
}

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
  comments: Comment[];
  createdAt: string;
}

export default function IssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedMenu, setSelectedMenu] = useState("Issues Tracker");
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchIssue();
    }
  }, [params.id]);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setIssue(data);
      }
    } catch (error) {
      console.error("Failed to fetch issue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (res.ok) {
        setComment("");
        fetchIssue();
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/issues/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchIssue();
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

  if (!issue) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a3a38]">
        <div className="text-lg text-white">Issue not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a3a38]">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <button
          onClick={() => router.push("/dashboard/issues")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Issues
        </button>

        {/* Issue Details Card */}
        <div className="bg-[#2a4a48] rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-400 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-3">
                {issue.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className={`px-3 py-1 rounded text-sm font-medium cursor-pointer transition-all ${getStatusColor(
                    issue.status
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
                    issue.priority
                  )}`}
                >
                  {issue.priority} priority
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-400 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-3">
                {issue.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                    issue.status
                  )}`}
                >
                  {issue.status.replace("_", " ")}
                </span>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${getPriorityColor(
                    issue.priority
                  )}`}
                >
                  {issue.priority} priority
                </span>
              </div>
            </div>
          </div>

          {issue.description && (
            <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
              {issue.description}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-400 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {issue.createdBy.name.charAt(0).toUpperCase()}
              </div>
              <span>
                Created by{" "}
                <span className="text-orange-400">{issue.createdBy.name}</span>
              </span>
            </div>
            {issue.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Assigned to{" "}
                  <span className="text-orange-400">
                    {issue.assignedTo.name}
                  </span>
                </span>
              </div>
            )}
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Comments ({issue.comments.length})
          </h2>

          {/* Comment List */}
          <div className="space-y-4">
            {issue.comments.map((comment) => (
              <div key={comment.id} className="bg-[#2a4a48] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-white">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <div className="bg-[#2a4a48] rounded-lg p-4 mt-4">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full min-h-[100px] px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
