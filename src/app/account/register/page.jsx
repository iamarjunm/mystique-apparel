"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; // Import useUser
import { motion } from "framer-motion"; // Import motion for animations
import Loader from "@/components/Loader"; // Import your loader component

const Register = () => {
  const router = useRouter();
  const { login } = useUser(); // Use the login function from UserContext

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      // Store token and expiration time in localStorage
      localStorage.setItem("shopifyAccessToken", data.token);
      localStorage.setItem("expiresAt", data.expiresAt);

      // Fetch user data after successful registration
      const userData = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      }).then((res) => res.json());

      // Call the login function from UserContext to update the user state
      login(data.token, userData);

      // Redirect to the account page
      router.push("/account");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white relative">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/50 opacity-100"></div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-full max-w-sm p-4 md:p-6 z-10 flex flex-col justify-center items-center text-center space-y-4"
      >
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-4">
          Create an Account
        </h1>

        {loading && <Loader />} {/* Show loader when loading */}
        
        {error && (
          <p className="text-red-500 mb-4">{error}</p> // Error message
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              required
            />
          </div>

          <motion.button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-white to-gray-400 text-black font-semibold text-sm transition-all hover:bg-gray-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          Already have an account?{" "}
          <a href="/account/login" className="text-white underline">
            Log in here
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
