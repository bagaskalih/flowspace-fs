"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building2, User, MoreVertical } from "lucide-react";

interface Board {
  id: string;
  name: string;
  description: string | null;
  type: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  division?: {
    id: string;
    name: string;
  };
  _count: {
    tasks: number;
  };
  createdAt: string;
}

export default function BoardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "all" | "general" | "division" | "personal"
  >("all");
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, [activeTab]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const url =
        activeTab === "all" ? "/api/boards" : `/api/boards?type=${activeTab}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "general":
        return <Users className="h-4 w-4" />;
      case "division":
        return <Building2 className="h-4 w-4" />;
      case "personal":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-blue-100 text-blue-700";
      case "division":
        return "bg-purple-100 text-purple-700";
      case "personal":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
            <p className="text-gray-600 mt-1">Organize your work with boards</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/boards/new")}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {[
            { key: "all", label: "All Boards" },
            { key: "general", label: "General" },
            { key: "division", label: "Division" },
            { key: "personal", label: "Personal" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No boards found</p>
            <Button
              onClick={() => router.push("/dashboard/boards/new")}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Create your first board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/boards/${board.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-2 rounded-lg ${getTypeColor(board.type)}`}
                      >
                        {getTypeIcon(board.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {board.name}
                        </h3>
                        <span className="text-xs text-gray-500 capitalize">
                          {board.type}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {board.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {board.description}
                    </p>
                  )}
                  {board.division && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Building2 className="h-3 w-3 mr-1" />
                      {board.division.name}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {board._count.tasks} tasks
                    </span>
                    <span className="text-xs text-gray-400">
                      by {board.createdBy.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
