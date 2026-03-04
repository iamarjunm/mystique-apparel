"use client";

import StatsOverview from "./components/StatsOverview";
import { motion } from "framer-motion";

export default function AdminOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome to your admin dashboard. Monitor your store metrics below.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsOverview />

      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10 border border-blue-500/30 rounded-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-3">Getting Started</h2>
        <p className="text-gray-300 mb-4">
          Use the navigation on the left to manage different aspects of your store:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Manage users and their permissions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>View and process customer orders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Add, edit, or remove products</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Review customer contact messages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Create and manage discount codes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Customize site content and settings</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
