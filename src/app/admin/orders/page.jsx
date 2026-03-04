"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import Modal from "../components/Modal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "order"] | order(createdAt desc) {
            _id,
            orderNumber,
            email,
            totalPrice,
            status,
            createdAt,
            items[] {
              productName,
              quantity,
              price
            }
          }`
        );
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async () => {
    try {
      await client.patch(selectedOrder._id).set({ status: newStatus }).commit();
      handleCloseModal();
      const data = await client.fetch(
        `*[_type == "order"] | order(createdAt desc) {
          _id,
          orderNumber,
          email,
          totalPrice,
          status,
          createdAt,
          items[] {
            productName,
            quantity,
            price
          }
        }`
      );
      setOrders(data);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "cancelled":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
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
          <ShoppingCart className="w-8 h-8 text-blue-400" />
          Order Management
        </h1>
        <p className="text-gray-400">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs sm:text-sm">Total Orders</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-400">{orders.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">
            {orders.filter((o) => o.status === "completed").length}
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
          <p className="text-gray-400 text-xs sm:text-sm">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Customer Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Total
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
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-mono">#{order.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-300">{order.email}</td>
                    <td className="px-6 py-4 text-gray-300">{order.items?.length || 0}</td>
                    <td className="px-6 py-4 text-white font-semibold">
                      ₹{(order.totalPrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenModal(order)}
                        className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
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
        title={selectedOrder ? `Order #${selectedOrder.orderNumber}` : "Order Details"}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-gray-400 text-sm">Customer Email</p>
                <p className="text-white font-semibold">{selectedOrder.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-white font-semibold">
                  ₹{(selectedOrder.totalPrice || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Items</p>
                <p className="text-white font-semibold">{selectedOrder.items?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Order Date</p>
                <p className="text-white font-semibold">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
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
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
