"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { initiateRazorpayPayment } from "@/lib/razorpay";
import { createCheckout } from "@/lib/shopify";
import { toast } from "react-toastify";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data (existing code)
  const fetchUserData = async (token) => {
    try {
      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      return {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || {},
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Initialize user (existing code)
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("shopifyAccessToken");

      if (token) {
        const userData = await fetchUserData(token);
        if (userData) {
          setUser({ token, ...userData });
        }
      }

      setLoading(false);
    };

    initializeUser();
  }, []);

  // Login (existing code)
  const login = (token, userData) => {
    localStorage.setItem("shopifyAccessToken", token);
    setUser({ token, ...userData });
    toast.success("Logged in successfully!");
  };

  // Logout (existing code)
  const logout = () => {
    localStorage.removeItem("shopifyAccessToken");
    setUser(null);
    toast.success("Logged out successfully!");
  };

  // Update address (existing code)
  const updateAddress = async (newAddress) => {
    if (!user) return;
    if (!newAddress || typeof newAddress !== "object") {
      console.error("Invalid address provided:", newAddress);
      toast.error("Invalid address provided.");
      return;
    }

    try {
      const response = await fetch("/api/update-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          token: user.token,
          addressId: newAddress.id && typeof newAddress.id === "string"
            ? (newAddress.id.startsWith("temp-") ? null : newAddress.id)
            : null, // Ensure 'null' is sent for new addresses
          address: newAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error("Failed to update address");
      }

      const updatedUser = { ...user, address: newAddress };
      setUser(updatedUser);
      toast.success("Address updated successfully!");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address. Please try again.");
    }
  };

  const deleteAddress = async (addressId) => {
    if (!user) {
      console.error("User not logged in");
      toast.error("User not logged in.");
      return;
    }

    try {
      const response = await fetch("/api/delete-address", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ token: user.token, addressId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete address:", errorData);
        throw new Error(errorData.message || "Failed to delete address");
      }

      const data = await response.json();
      console.log("Deleted address ID:", data.deletedAddressId);

      // Ensure user.address is always an array
      const updatedAddresses = Array.isArray(user.address)
        ? user.address.filter((addr) => addr.id !== addressId)
        : [];

      setUser({ ...user, address: updatedAddresses });

      toast.success("Address deleted successfully!");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };

  // Update name (existing code)
  const updateName = async (firstName, lastName) => {
    if (!user) return;

    try {
      const response = await fetch("/api/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update name");
      }

      const updatedUser = { ...user, firstName, lastName };
      setUser(updatedUser);
      toast.success("Name updated successfully!");
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name. Please try again.");
    }
  };

  // Update password (existing code)
  const updatePassword = async (currentPassword, newPassword) => {
    if (!user) return;

    try {
      const response = await fetch("/api/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again.");
    }
  };

  // Update phone (existing code)
  const updatePhone = async (phoneData) => {
    if (!user) return;
    
    // Validate phone number structure
    if (!phoneData || typeof phoneData !== 'object') {
      toast.error("Invalid phone data format");
      return;
    }
    
    const { phone, countryCode } = phoneData;
    
    if (!phone?.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    if (!/^\d+$/.test(phone)) {
      toast.error("Phone number should contain only digits");
      return;
    }

    try {
      const response = await fetch("/api/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          phone: phoneData.phone,
          countryCode: phoneData.countryCode
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        const errorMsg = result.errors?.[0]?.message || result.message || "Failed to update phone";
        throw new Error(errorMsg);
      }

      // Update both state and localStorage
      const updatedUser = { 
        ...user, 
        phone: result.phone || `${phoneData.countryCode || ''}${phoneData.phone}`,
        countryCode: phoneData.countryCode 
      };
      
      setUser(updatedUser);
      
      // Update localStorage if exists
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      if (userData) {
        localStorage.setItem("userData", JSON.stringify({
          ...userData,
          phone: updatedUser.phone,
          countryCode: updatedUser.countryCode
        }));
      }

      toast.success("Phone number updated successfully!");
      return result;
    } catch (error) {
      console.error("Phone update error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // New function: Handle checkout
  const handleCheckout = async (cart, email, shippingAddress) => {
    try {
      // Create Shopify checkout
      const lineItems = cart.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      }));

      const checkout = await createCheckout(lineItems, email, shippingAddress);

      // Initiate Razorpay payment
      const orderDetails = {
        id: checkout.id,
        amount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        user: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email || email,
          phone: user?.phone || "",
        },
      };

      const paymentResponse = await initiateRazorpayPayment(orderDetails);
      console.log("Payment successful:", paymentResponse);

      // Redirect to order confirmation page
      window.location.href = `/order-confirmation?checkoutId=${checkout.id}`;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateAddress,
        updatePhone,
        updateName,
        updatePassword,
        deleteAddress,
        handleCheckout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};