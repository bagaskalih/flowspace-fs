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
  Search,
  Filter,
  Edit,
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
  const [activeTab, setActiveTab] = useState<"users" | "divisions">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState("");

  // Edit user state
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "",
    divisionId: "",
    status: "",
  });

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
  });

  // Edit division state
  const [showEditDivisionModal, setShowEditDivisionModal] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [editDivisionForm, setEditDivisionForm] = useState({
    name: "",
  });

  useEffect(() => {
    fetchUsers();
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      divisionId: user.division?.id || "",
      status: user.status,
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/auth/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editUserForm.name,
          email: editUserForm.email,
          role: editUserForm.role,
          divisionId: editUserForm.divisionId || null,
          status: editUserForm.status,
        }),
      });

      if (res.ok) {
        setShowEditUserModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user");
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
        fetchUsers();
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
        setDivisionForm({ name: "" });
        fetchDivisions();
      }
    } catch (error) {
      console.error("Failed to create division:", error);
    }
  };

  const handleEditDivision = (division: Division) => {
    setEditingDivision(division);
    setEditDivisionForm({
      name: division.name,
    });
    setShowEditDivisionModal(true);
  };

  const handleUpdateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDivision) return;

    try {
      const res = await fetch(`/api/divisions/${editingDivision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editDivisionForm.name,
        }),
      });

      if (res.ok) {
        setShowEditDivisionModal(false);
        setEditingDivision(null);
        fetchDivisions();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update division");
      }
    } catch (error) {
      console.error("Failed to update division:", error);
      alert("Failed to update division");
    }
  };

  // Filter users based on search and division
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision =
      selectedDivisionFilter === "" ||
      (selectedDivisionFilter === "none" && !user.division) ||
      user.division?.id === selectedDivisionFilter;

    return matchesSearch && matchesDivision;
  });

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
          <p className="text-gray-300 mt-1">Manage users and divisions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-600">
          {[
            { key: "users", label: "Users", icon: Users },
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

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedDivisionFilter}
                  onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a3a38] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Divisions</option>
                  <option value="none">No Division</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* User List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-[#1a3a38] border border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {user.name}
                        </h3>
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
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
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
                ))
              )}
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
                  className="bg-[#1a3a38] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">
                      {division.name}
                    </h3>
                    <button
                      onClick={() => handleEditDivision(division)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit division"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
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
          <form onSubmit={handleSendInvitation} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70"
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Role *
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
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
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer"
              >
                <option value="">No division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium border border-white/10 hover:border-white/20 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
          <form onSubmit={handleCreateDivision} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
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
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70"
                placeholder="Enter division name"
                required
              />
            </div>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowDivisionModal(false)}
                className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium border border-white/10 hover:border-white/20 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Create Division
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Division Modal */}
        <Modal
          isOpen={showEditDivisionModal}
          onClose={() => {
            setShowEditDivisionModal(false);
            setEditingDivision(null);
          }}
          title="Edit Division"
        >
          <form onSubmit={handleUpdateDivision} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={editDivisionForm.name}
                onChange={(e) =>
                  setEditDivisionForm({
                    ...editDivisionForm,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70"
                placeholder="Enter division name"
                required
              />
            </div>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditDivisionModal(false);
                  setEditingDivision(null);
                }}
                className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium border border-white/10 hover:border-white/20 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Update Division
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditUserModal}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
          title="Edit User"
        >
          <form onSubmit={handleUpdateUser} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={editUserForm.name}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={editUserForm.email}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70"
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Role *
              </label>
              <select
                value={editUserForm.role}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, role: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={editingUser?.role === "master"}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                {editingUser?.role === "master" && (
                  <option value="master">Master</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Division
              </label>
              <select
                value={editUserForm.divisionId}
                onChange={(e) =>
                  setEditUserForm({
                    ...editUserForm,
                    divisionId: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer"
              >
                <option value="">No division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Status *
              </label>
              <select
                value={editUserForm.status}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, status: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#0f2e2c]/50 border border-[#2a5a56] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all shadow-sm hover:bg-[#0f2e2c]/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={editingUser?.role === "master"}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium border border-white/10 hover:border-white/20 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Update User
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
