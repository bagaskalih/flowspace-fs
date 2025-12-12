"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  assignee: {
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
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        fetchIssue(); // Refresh to show new comment
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-purple-100 text-purple-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Issue not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-gray-400 mt-1" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {issue.title}
                  </h1>
                  <div className="flex items-center space-x-2">
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
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {issue.description}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 border-t">
                <span>Created by {issue.createdBy.name}</span>
                {issue.assignee && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Assigned to {issue.assignee.name}
                  </div>
                )}
                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Comments ({issue.comments.length})
          </h2>

          {/* Comment List */}
          <div className="space-y-4">
            {issue.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Comment Form */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
