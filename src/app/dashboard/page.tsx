"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import {
  CheckSquare,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

interface Division {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Home");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  useEffect(() => {
    fetchUser();
    fetchTasks();
    fetchDivisions();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await fetch("/api/divisions");
      if (!res.ok) return;

      const divisionsData = await res.json();

      // Fetch tasks for each division to calculate completion
      const tasksRes = await fetch("/api/tasks");
      if (!tasksRes.ok) return;

      const allTasks = await tasksRes.json();

      const divisionStats = divisionsData.map((div: any) => {
        const divTasks = allTasks.filter(
          (task: any) =>
            task.board?.type === "division" &&
            task.board?.division?.id === div.id
        );
        const completed = divTasks.filter(
          (task: any) => task.status === "done" || task.status === "closed"
        ).length;

        return {
          id: div.id,
          name: div.name,
          totalTasks: divTasks.length,
          completedTasks: completed,
        };
      });

      // Add General
      const generalTasks = allTasks.filter(
        (task: any) => task.board?.type === "general"
      );
      const generalCompleted = generalTasks.filter(
        (task: any) => task.status === "done" || task.status === "closed"
      ).length;

      setDivisions([
        ...divisionStats,
        {
          id: "general",
          name: "General",
          totalTasks: generalTasks.length,
          completedTasks: generalCompleted,
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
    }
  };

  const totalTasks = tasks.length;
  const myTasks = tasks.filter(
    (task) => task.assignedTo?.id === user?.id
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "done" || task.status === "closed"
  ).length;
  const urgentTasks = tasks.filter((task) => task.priority === "urgent").length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "done" &&
      task.status !== "closed"
  ).length;

  const recentTasks = tasks.slice(0, 3);

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: "bg-red-500/20 text-red-400",
      high: "bg-orange-500/20 text-orange-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      low: "bg-gray-500/20 text-gray-400",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return "bg-gray-500";
    if (percentage < 50) return "bg-blue-500";
    if (percentage < 100) return "bg-yellow-500";
    return "bg-green-500";
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
        {/* Welcome Header */}
        <h1 className="text-4xl font-semibold text-white mb-8">
          Welcome {user?.name || "User"}
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Tasks */}
          <div className="bg-[#2a4a48] rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Tasks</p>
              <p className="text-4xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-lg">
              <CheckSquare className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-[#2a4a48] rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">My Tasks</p>
              <p className="text-4xl font-bold text-white">{myTasks}</p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-lg">
              <User className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-[#2a4a48] rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">In Progress</p>
              <p className="text-4xl font-bold text-white">{inProgressTasks}</p>
            </div>
            <div className="bg-yellow-500/20 p-4 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-[#2a4a48] rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Completed</p>
              <p className="text-4xl font-bold text-white">{completedTasks}</p>
            </div>
            <div className="bg-green-500/20 p-4 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          {/* Urgent */}
          <div className="bg-[#2a4a48] rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Urgent</p>
              <p className="text-4xl font-bold text-white">{urgentTasks}</p>
            </div>
            <div className="bg-red-500/20 p-4 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-[#2a4a48] rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Overdue</p>
              <p className="text-4xl font-bold text-white">{overdueTasks}</p>
            </div>
            <div className="bg-orange-500/20 p-4 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Bottom Section - Recent Tasks and Division Overview */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-[#2a4a48] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Recent Tasks
            </h2>
            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tasks yet</p>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#1a3a38] rounded-lg p-4 hover:bg-[#234543] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                  >
                    <h3 className="text-white font-medium mb-2">
                      {task.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        Assigned to {task.assignedTo?.name || "Unassigned"}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Division Overview */}
          <div className="bg-[#2a4a48] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Division Overview
            </h2>
            <div className="space-y-6">
              {divisions.map((division) => {
                const percentage =
                  division.totalTasks > 0
                    ? Math.round(
                        (division.completedTasks / division.totalTasks) * 100
                      )
                    : 0;

                return (
                  <div key={division.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {division.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        {division.completedTasks}/{division.totalTasks}{" "}
                        Completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(
                          percentage
                        )}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
