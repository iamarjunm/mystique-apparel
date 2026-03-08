"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle, Clock, XCircle, Eye, Download, Filter, Search, Truck, IndianRupee } from "lucide-react";
import Modal from "../components/Modal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "order"] | order(createdAt desc) {
            _id,
            orderNumber,
            customerEmail,
            customerName,
            customerPhone,
            total,
            subtotal,
            shippingCost,
            tax,
            status,
            paymentMethod,
            paymentId,
            trackingNumber,
            createdAt,
            shippingAddress {
              street,
              city,
              state,
              postalCode,
              country
            },
            items[] {
              productTitle,
              variantSize,
              variantColor,
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
    setTrackingNumber(order.trackingNumber || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setTrackingNumber("");
  };

  const handleStatusUpdate = async () => {
    try {
      const updateData = { status: newStatus };
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
      await client.patch(selectedOrder._id).set(updateData).commit();
      handleCloseModal();
      const data = await client.fetch(
        `*[_type == "order"] | order(createdAt desc) {
          _id,
          orderNumber,
          customerEmail,
          customerName,
          customerPhone,
          total,
          subtotal,
          shippingCost,
          tax,
          status,
          paymentMethod,
          paymentId,
          trackingNumber,
          createdAt,
          shippingAddress {
            street,
            city,
            state,
            postalCode,
            country
          },
          items[] {
            productTitle,
            variantSize,
            variantColor,
            quantity,
            price
          }
        }`
      );
      setOrders(data);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "processing":
      case "pending":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "shipped":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
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
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "processing":
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

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
        <p className="text-gray-400">Track and manage customer orders with detailed information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Total Orders</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{filteredOrders.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {filteredOrders.filter((o) => o.status === "completed").length}
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Processing</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {filteredOrders.filter((o) => o.status === "processing" || o.status === "pending").length}
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Total Revenue</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order #, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Order #</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Customer</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Items</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Amount</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Payment</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 text-white font-mono font-bold">{order.orderNumber}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-semibold">{order.customerName}</p>
                        <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-sm">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-4 text-white font-semibold">
                      ₹{(order.total || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                        {order.paymentMethod === "cod" ? "COD" : "Razorpay"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleOpenModal(order)}
                        className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400 hover:text-blue-300"
                        title="View details"
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

      {/* Modal - Detailed Order View */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Order Details"}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Full Name</p>
                  <p className="text-white font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-semibold break-all">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">{selectedOrder.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Order Date</p>
                  <p className="text-white font-semibold">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                <div className="bg-black/40 rounded-lg p-4 space-y-2">
                  <p className="text-white">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-white">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-white">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="bg-black/40 rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{item.productTitle}</p>
                      <p className="text-gray-400 text-sm">
                        Qty: {item.quantity} {item.variantSize && `| Size: ${item.variantSize}`} {item.variantColor && `| Color: ${item.variantColor}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      <p className="text-gray-400 text-sm">₹{item.price.toLocaleString("en-IN")} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
              <div className="bg-black/40 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>₹{(selectedOrder.subtotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping Cost:</span>
                  <span>₹{(selectedOrder.shippingCost || 0).toLocaleString("en-IN")}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tax:</span>
                    <span>₹{(selectedOrder.tax || 0).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between text-white font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{(selectedOrder.total || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Payment & Tracking */}
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white mb-3">Payment & Tracking</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Payment Method</p>
                  <p className="text-white font-semibold">{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payment ID</p>
                  <p className="text-white font-semibold font-mono text-sm">{selectedOrder.paymentId || "-"}</p>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="space-y-4">
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
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter tracking number..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleStatusUpdate}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Save Changes
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
