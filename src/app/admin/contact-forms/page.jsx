"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Mail, Archive, Trash2, Eye } from "lucide-react";
import Modal from "../components/Modal";

export default function ContactFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "contactForm"] | order(submittedAt desc) {
            _id,
            email,
            message,
            status,
            submittedAt
          }`
        );
        setForms(data);
      } catch (error) {
        console.error("Error fetching contact forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleOpenModal = (form) => {
    setSelectedForm(form);
    setNewStatus(form.status || "new");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedForm(null);
  };

  const handleStatusUpdate = async () => {
    try {
      await client.patch(selectedForm._id).set({ status: newStatus }).commit();
      handleCloseModal();
      const data = await client.fetch(
        `*[_type == "contactForm"] | order(submittedAt desc) {
          _id,
          email,
          message,
          status,
          submittedAt
        }`
      );
      setForms(data);
    } catch (error) {
      console.error("Error updating form status:", error);
      alert("Error updating form status");
    }
  };

  const handleDelete = async (formId) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      try {
        await client.delete(formId);
        const data = await client.fetch(
          `*[_type == "contactForm"] | order(submittedAt desc) {
            _id,
            email,
            message,
            status,
            submittedAt
          }`
        );
        setForms(data);
      } catch (error) {
        console.error("Error deleting form:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "read":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "responded":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "archived":
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
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
          <Mail className="w-8 h-8 text-blue-400" />
          Contact Form Submissions
        </h1>
        <p className="text-gray-400">Review and respond to customer inquiries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-400">{forms.length}</p>
        </div>
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">New</p>
          <p className="text-3xl font-bold text-blue-300">
            {forms.filter((f) => f.status === "new").length}
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Read</p>
          <p className="text-3xl font-bold text-yellow-400">
            {forms.filter((f) => f.status === "read").length}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Responded</p>
          <p className="text-3xl font-bold text-green-400">
            {forms.filter((f) => f.status === "responded").length}
          </p>
        </div>
      </div>

      {/* Forms Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Date
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
                    Loading submissions...
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No contact form submissions
                  </td>
                </tr>
              ) : (
                forms.map((form) => (
                  <tr
                    key={form._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <a href={`mailto:${form.email}`} className="text-white hover:text-blue-400">
                        {form.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                      {form.message}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          form.status
                        )}`}
                      >
                        {form.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {form.submittedAt
                        ? new Date(form.submittedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(form)}
                        className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(form._id)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
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
        title={selectedForm ? selectedForm.email : "Contact Form"}
        size="lg"
      >
        {selectedForm && (
          <div className="space-y-4">
            <div className="pb-4 border-b border-white/10">
              <p className="text-gray-400 text-sm mb-2">Email</p>
              <p className="text-white font-semibold">{selectedForm.email}</p>
            </div>

            <div className="pb-4 border-b border-white/10">
              <p className="text-gray-400 text-sm mb-2">Message</p>
              <p className="text-white whitespace-pre-wrap bg-black/40 p-4 rounded border border-white/10 max-h-48 overflow-y-auto">
                {selectedForm.message}
              </p>
            </div>

            <div className="pb-4 border-b border-white/10">
              <p className="text-gray-400 text-sm mb-2">Submitted</p>
              <p className="text-white font-semibold">
                {selectedForm.submittedAt
                  ? new Date(selectedForm.submittedAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Update Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleStatusUpdate}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
