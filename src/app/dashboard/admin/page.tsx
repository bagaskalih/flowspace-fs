"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import {
  Users,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  division: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface Division {
  id: string;
  name: string;
  description: string | null;
  _count?: {
    users: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [selectedMenu, setSelectedMenu] = useState("Admin");
  const [activeTab, setActiveTab] = useState<
    "users" | "invitations" | "divisions"
  >("users");
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user",
    divisionId: "",
  });

  // Division form state
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [divisionForm, setDivisionForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
    fetchDivisions();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await fetch("/api/divisions");
      if (res.ok) {
        const data = await res.json();
        setDivisions(data);
      }
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}/deactivate`, {
        method: "POST",
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      if (res.ok) {
        setShowInviteModal(false);
        setInviteForm({ email: "", role: "user", divisionId: "" });
        fetchInvitations();
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(divisionForm),
      });

      if (res.ok) {
        setShowDivisionModal(false);
        setDivisionForm({ name: "", description: "" });
        fetchDivisions();
      }
    } catch (error) {
      console.error("Failed to create division:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      inactive: "bg-gray-500/20 text-gray-400",
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      master: "bg-purple-500/20 text-purple-400",
      admin: "bg-blue-500/20 text-blue-400",
      user: "bg-gray-500/20 text-gray-400",
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="flex h-screen bg-[#1a3a38]">
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Manage users, invitations, and divisions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-600">
          {[
            { key: "users", label: "Users", icon: Users },
            { key: "invitations", label: "Invitations", icon: Mail },
            { key: "divisions", label: "Divisions", icon: Building2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 pb-3 px-1 font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-white border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-[#2a4a48] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                User Management
              </h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Invite User
              </button>
            </div>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-[#1a3a38] border border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{user.email}</p>
                    {user.division && (
                      <p className="text-sm text-gray-400">
                        Division: {user.division.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {user.status === "pending" && (
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                    {user.status === "active" && user.role !== "master" && (
                      <button
                        onClick={() => handleDeactivateUser(user.id)}
                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="bg-[#2a4a48] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Invitation Management
              </h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
              >
                <Send className="h-4 w-4" />
                Send Invitation
              </button>
            </div>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-[#1a3a38] border border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">
                        {invitation.email}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(
                          invitation.role
                        )}`}
                      >
                        {invitation.role}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          invitation.status
                        )}`}
                      >
                        {invitation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Expires:{" "}
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divisions Tab */}
        {activeTab === "divisions" && (
          <div className="bg-[#2a4a48] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                Division Management
              </h2>
              <button
                onClick={() => setShowDivisionModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                New Division
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {divisions.map((division) => (
                <div
                  key={division.id}
                  className="bg-[#1a3a38] border border-gray-700 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-white mb-2">
                    {division.name}
                  </h3>
                  {division.description && (
                    <p className="text-sm text-gray-300 mb-3">
                      {division.description}
                    </p>
                  )}
                  {division._count && (
                    <p className="text-sm text-gray-400">
                      {division._count.users} members
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Send Invitation"
        >
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role *
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Division
              </label>
              <select
                value={inviteForm.divisionId}
                onChange={(e) =>
                  setInviteForm({
                    ...inviteForm,
                    divisionId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">No division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </Modal>

        {/* Division Modal */}
        <Modal
          isOpen={showDivisionModal}
          onClose={() => setShowDivisionModal(false)}
          title="Create Division"
        >
          <form onSubmit={handleCreateDivision} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={divisionForm.name}
                onChange={(e) =>
                  setDivisionForm({
                    ...divisionForm,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={divisionForm.description}
                onChange={(e) =>
                  setDivisionForm({
                    ...divisionForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDivisionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
              >
                Create Division
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
