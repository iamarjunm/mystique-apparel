"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Users, Mail, UserCheck, Edit, Download } from "lucide-react";
import Modal from "../components/Modal";
import { exportAndDownloadUsers } from "@/lib/csvExport";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ isAdmin: false });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "userProfile"] | order(createdAt desc) {
            _id,
            displayName,
            email,
            isAdmin,
            createdAt,
            phone
          }`
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setEditingUser(user);
    setFormData({ isAdmin: user.isAdmin || false });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = async () => {
    try {
      await client
        .patch(editingUser._id)
        .set({ isAdmin: formData.isAdmin })
        .commit();
      handleCloseModal();
      const data = await client.fetch(
        `*[_type == "userProfile"] | order(createdAt desc) {
          _id,
          displayName,
          email,
          isAdmin,
          createdAt,
          phone
        }`
      );
      setUsers(data);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const handleExportToBrevo = async () => {
    if (users.length === 0) {
      alert("No users to export");
      return;
    }

    try {
      setExporting(true);
      console.log(`[EXPORT] Starting export of ${users.length} users to CSV`);

      // Format users for export
      const formattedUsers = users.map((user) => ({
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phone,
        createdAt: user.createdAt,
      }));

      exportAndDownloadUsers(
        formattedUsers,
        `mystique-users-${new Date().toISOString().split("T")[0]}.csv`
      );

      alert(`✅ Successfully exported ${users.length} users!`);
    } catch (err) {
      console.error("[EXPORT] Error during export:", err);
      alert("Failed to export users. Check console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          User Management
        </h1>
        <p className="text-gray-400">Manage all registered users and their permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-blue-400">{users.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Admins</p>
          <p className="text-3xl font-bold text-green-400">
            {users.filter((u) => u.isAdmin).length}
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportToBrevo}
          disabled={loading || exporting || users.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Exporting..." : `📥 Export to Brevo (${users.length})`}
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-white font-medium">{user.displayName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{user.phone || "-"}</td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-xs text-green-300">
                          <UserCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-gray-500/20 border border-gray-500/30 px-3 py-1 rounded-full text-xs text-gray-300">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? `Edit ${editingUser.displayName}` : "Edit User"}
        size="md"
      >
        {editingUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-semibold">{editingUser.displayName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold text-sm">{editingUser.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-semibold">{editingUser.phone || "-"}</p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-white font-semibold">Make Admin</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
