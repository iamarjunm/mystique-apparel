"use client";

import { useState } from "react";
import { loginCustomer } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; // Import useUser
import { motion } from "framer-motion"; // Import motion for animations
import Loader from "@/components/Loader"; // Import your loader component

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [successMessage, setSuccessMessage] = useState(null); // Success message
  const router = useRouter();
  const { login } = useUser(); // Use the login function from UserContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Set loading to true when submitting the form

    const result = await loginCustomer(email, password);

    if (result) {
      // Store token and expiration time in localStorage
      localStorage.setItem("shopifyAccessToken", result.token);
      localStorage.setItem("expiresAt", result.expiresAt);

      // Fetch user data after successful login
      const userData = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${result.token}`,
        },
      }).then((res) => res.json());

      // Call the login function from UserContext to update the user state
      login(result.token, userData);

      setLoading(false); // Stop loading
      setSuccessMessage("Login successful! Redirecting to your account...");

      // Redirect to the account page after a short delay
      setTimeout(() => {
        router.push("/account");
      }, 1500);
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white relative">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/50 opacity-100"></div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-full max-w-xl p-6 md:p-8 z-10 flex flex-col justify-center items-center text-center space-y-5"
      >
        <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-5">
          Welcome Back to <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Mystique Apparel</span>
        </h1>

        {loading && <Loader />} {/* Show loader when loading */}
        
        {successMessage && !loading && (
          <div className="mb-4 text-lg text-green-500">{successMessage}</div> // Success message
        )}

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-white to-gray-400 text-black font-semibold text-lg transition-all hover:bg-gray-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Login
          </motion.button>
        </form>

        <p className="mt-5 text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/account/register" className="text-white underline">
            Sign up here
          </a>
        </p>
      </motion.div>
    </div>
  );
}
