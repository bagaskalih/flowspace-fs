"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
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
  } | null;
  dueDate: string;
  _count?: {
    comments: number;
  };
  comments?: Comment[];
  createdAt: string;
}

export default function IssuesPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Issues Tracker");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    // Use dummy data for testing since backend is not ready
    useDummyData();
    setLoading(false);
    
    /* Uncomment when backend is ready:
    try {
      setLoading(true);
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      } else {
        useDummyData();
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error);
      useDummyData();
    } finally {
      setLoading(false);
    }
    */
  };

  const useDummyData = () => {
    const dummyIssues: Issue[] = [
      {
        id: "1",
        title: "Implement user authentication",
        description: "Set up secure user authentication system with JWT tokens",
        status: "In Progress",
        priority: "High",
        assignedTo: { id: "1", name: "John Doe" },
        dueDate: "30/12/2024",
        _count: { comments: 2 },
        comments: [
          {
            id: "1",
            message: "Lorem ipsum dolor sit amet",
            createdAt: "2024-12-30T19:20:00Z",
            user: { id: "1", name: "John Doe" },
          },
          {
            id: "2",
            message: "Lorem ipsum dolor sit amet",
            createdAt: "2024-12-30T18:20:00Z",
            user: { id: "2", name: "Jane Smith" },
          },
        ],
        createdAt: "2024-12-25T10:00:00Z",
      },
      {
        id: "2",
        title: "Fix critical bug in payment module",
        description: "Payment processing failing for certain card types",
        status: "High",
        priority: "High",
        assignedTo: { id: "2", name: "Jane Smith" },
        dueDate: "27/12/2024",
        _count: { comments: 2 },
        comments: [
          {
            id: "3",
            message: "Investigating the issue",
            createdAt: "2024-12-26T14:30:00Z",
            user: { id: "2", name: "Jane Smith" },
          },
          {
            id: "4",
            message: "Found the root cause",
            createdAt: "2024-12-26T16:00:00Z",
            user: { id: "2", name: "Jane Smith" },
          },
        ],
        createdAt: "2024-12-20T14:30:00Z",
      },
    ];

    setIssues(dummyIssues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedIssue) return;

    // Add message to dummy data
    const newComment: Comment = {
      id: Date.now().toString(),
      message: messageInput,
      createdAt: new Date().toISOString(),
      user: { id: "current", name: "Current User" },
    };

    const updatedIssue = {
      ...selectedIssue,
      comments: [...(selectedIssue.comments || []), newComment],
      _count: {
        comments: (selectedIssue._count?.comments || 0) + 1,
      },
    };

    setSelectedIssue(updatedIssue);
    setIssues(issues.map(issue => 
      issue.id === selectedIssue.id ? updatedIssue : issue
    ));
    setMessageInput("");

    /* Uncomment when backend is ready:
    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageInput }),
      });

      if (res.ok) {
        const comment = await res.json();
        // Update local state
        setMessageInput("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
    */
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

      <div className="flex-1 overflow-hidden flex gap-6 p-8">
        {/* Left Panel - Issues List */}
        <div className="w-[450px] flex flex-col">
          <div className="bg-[#2a5a55] rounded-lg p-6 flex-1 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Issues & Problems
              </h2>
              <p className="text-sm text-gray-300">
                {issues.length} active issues
              </p>
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 cursor-pointer transition-all rounded-lg ${
                    selectedIssue?.id === issue.id
                      ? "outline outline-2 outline-[#CD5B43] outline-offset-[-2px] bg-[#2a5a55]/30"
                      : "hover:bg-[#2a5a55]/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium flex-1 pr-3">
                      {issue.title}
                    </h3>
                    <span className="px-2 py-1 bg-[#CD5B43] text-white text-xs rounded-full whitespace-nowrap">
                      {issue.priority}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {issue.dueDate}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
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
                  <span className="px-3 py-1 bg-[#CD5B43] text-white text-sm rounded-full">
                    {selectedIssue.priority}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  {selectedIssue.description}
                </p>

                {/* Issue Metadata */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <p className="text-white font-medium">
                      {selectedIssue.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Assigned To</p>
                    <p className="text-white font-medium">
                      {selectedIssue.assignedTo?.name || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Due Date</p>
                    <p className="text-white font-medium">
                      {selectedIssue.dueDate}
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
                  {selectedIssue.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex ${
                        comment.user.name === "Current User"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          comment.user.name === "Current User"
                            ? "bg-[#3a5a55]"
                            : "bg-[#4a6a65]"
                        }`}
                      >
                        <p className="text-white text-sm">{comment.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
