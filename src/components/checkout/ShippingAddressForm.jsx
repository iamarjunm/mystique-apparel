// components/checkout/ShippingAddressForm.jsx

"use client";

import React, { useState, useEffect } from "react";

const ShippingAddressForm = ({ user, updateAddress, onSubmit, initialAddress, initialAddresses = [] }) => {
  const [availableAddresses, setAvailableAddresses] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    country: "India",
    province: "",
    zip: "",
    phone: user?.phone || "",
    isPrimary: false,
  });

  const normalizePhone = (value = "") =>
    String(value || "").replace(/^\+91\s?/, "").replace(/\D/g, "").slice(-10);

  const parseName = (name = "") => {
    const trimmed = String(name || "").trim();
    if (!trimmed) return { firstName: "", lastName: "" };
    const parts = trimmed.split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const normalizeAddress = (address = {}) => {
    const parsedName = parseName(address.name || "");
    return {
      ...address,
      id: address.id || address._key,
      firstName: address.firstName || parsedName.firstName || "",
      lastName: address.lastName || parsedName.lastName || "",
      company: address.company || "",
      address1: address.address1 || address.street || "",
      address2: address.address2 || "",
      city: address.city || "",
      country: address.country || "India",
      province: address.province || address.state || "",
      zip: address.zip || address.postalCode || "",
      phone: normalizePhone(address.phone),
      isPrimary: !!address.isPrimary,
      _key: address._key,
    };
  };

  // Fetch user addresses on mount for LOGGED-IN users only
  useEffect(() => {
    const fetchAddresses = async () => {
      const fallbackAddresses = Array.isArray(initialAddresses)
        ? initialAddresses.map(normalizeAddress)
        : [];

      // Only attempt to fetch addresses if a user is logged in
      if (!user) {
        setLoaded(true); // Treat as loaded for guests
        setIsFormVisible(true); // Always show form for guests
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("shopifyAccessToken");

        let fetchedAddresses = [];
        if (token) {
          const response = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            fetchedAddresses = Array.isArray(userData.addresses)
              ? userData.addresses.map(normalizeAddress)
              : [];
          }
        }

        const sourceAddresses = fetchedAddresses.length > 0 ? fetchedAddresses : fallbackAddresses;
        setAvailableAddresses(sourceAddresses);

        // Select initial address, primary, or first if available
        const normalizedInitialAddress = initialAddress ? normalizeAddress(initialAddress) : null;
        const addressToPreSelect =
          normalizedInitialAddress ||
          sourceAddresses.find((addr) => addr.isPrimary) ||
          sourceAddresses[0];

        if (addressToPreSelect) {
          setCurrentSelectedAddress(addressToPreSelect);
          setFormData((prev) => ({ ...prev, ...addressToPreSelect }));
          onSubmit(addressToPreSelect); // Notify parent immediately
          setIsFormVisible(false);
        } else {
          setIsFormVisible(true); // If no addresses, show the form to add one
        }
      } catch (error) {
        console.error("Address fetch error:", error);
        const fallbackAddresses = Array.isArray(initialAddresses)
          ? initialAddresses.map(normalizeAddress)
          : [];
        setAvailableAddresses(fallbackAddresses);

        const normalizedInitialAddress = initialAddress ? normalizeAddress(initialAddress) : null;
        const addressToPreSelect =
          normalizedInitialAddress ||
          fallbackAddresses.find((addr) => addr.isPrimary) ||
          fallbackAddresses[0];

        if (addressToPreSelect) {
          setCurrentSelectedAddress(addressToPreSelect);
          setFormData((prev) => ({ ...prev, ...addressToPreSelect }));
          onSubmit(addressToPreSelect);
          setIsFormVisible(false);
        } else {
          setIsFormVisible(true);
          setError("Failed to load addresses. Please try again.");
        }
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };

    fetchAddresses();
  }, [user, initialAddress, initialAddresses]);

  // Sync formData with user data if user becomes available (e.g., after login on checkout page)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || parseName(user.displayName || "").firstName || prev.firstName,
        lastName: user.lastName || parseName(user.displayName || "").lastName || prev.lastName,
        phone: normalizePhone(user.phone || user.phoneNumber || "") || prev.phone,
        // Don't prefill address lines from user.address directly if the user might want to add a new address
        // The fetchAddresses useEffect handles pre-selecting existing addresses.
      }));
    }
  }, [user]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'address1',
      'city', 'province', 'zip', 'phone'
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits");
      return false;
    }

    if (!/^\d{6}$/.test(formData.zip)) {
      setError("ZIP code must be 6 digits");
      return false;
    }

    setError("");
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const addressToUse = normalizeAddress({
        ...formData,
        phone: `+91 ${normalizePhone(formData.phone)}`,
        // Only include ID if it's an existing address for a logged-in user
        id: user ? currentSelectedAddress?.id : undefined, 
      });

      if (user) {
        // For logged-in users, attempt to save/update the address on the backend
        const token = localStorage.getItem("shopifyAccessToken");
        if (token && updateAddress) {
          await updateAddress(token, addressToUse.id, addressToUse);
          // After successful update for logged-in user, re-fetch addresses to ensure state is consistent
          const response = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            if (userData.addresses) {
              const normalizedAddresses = userData.addresses.map(normalizeAddress);
              setAvailableAddresses(normalizedAddresses);
            // Try to find the newly added/updated address from the fetched list
            const updatedOrNewAddress = normalizedAddresses.find(
              (addr) => addr.address1 === addressToUse.address1 && addr.phone === addressToUse.phone
            ) || normalizedAddresses.find(addr => addr.id === addressToUse.id);
            if (updatedOrNewAddress) {
              setCurrentSelectedAddress(updatedOrNewAddress);
              onSubmit(updatedOrNewAddress);
            } else {
              // Fallback if we can't find the exact one, just use the form data for now
              setCurrentSelectedAddress(addressToUse);
              onSubmit(addressToUse);
            }
          }
        }
        } else {
          // Fallback when token-based address API is unavailable
          setCurrentSelectedAddress(addressToUse);
          setAvailableAddresses((prev) => {
            if (addressToUse.id) {
              return prev.map((addr) => (addr.id === addressToUse.id ? addressToUse : addr));
            }
            return [...prev, { ...addressToUse, id: addressToUse.id || addressToUse._key }];
          });
          onSubmit(addressToUse);
        }
      } else {
        // For guest users, just use the form data directly
        setCurrentSelectedAddress(addressToUse);
        onSubmit(addressToUse);
      }
      
      setIsFormVisible(false); // Hide the form after saving/selecting
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Address save error:", error);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    const normalizedAddress = normalizeAddress(address);
    setCurrentSelectedAddress(normalizedAddress);
    // Populate form data with selected address
    setFormData({
      firstName: normalizedAddress.firstName || "",
      lastName: normalizedAddress.lastName || "",
      company: normalizedAddress.company || "",
      address1: normalizedAddress.address1 || "",
      address2: normalizedAddress.address2 || "",
      city: normalizedAddress.city || "",
      country: normalizedAddress.country || "India",
      province: normalizedAddress.province || "",
      zip: normalizedAddress.zip || "",
      phone: normalizedAddress.phone || "",
      isPrimary: normalizedAddress.isPrimary || false,
    });
    onSubmit(normalizedAddress); // Notify parent immediately when an address is selected
    setIsFormVisible(false); // Hide form and show list
    setError(""); // Clear errors
  };

  const handleEditAddress = (address) => {
    const normalizedAddress = normalizeAddress(address);
    setCurrentSelectedAddress(normalizedAddress);
    setFormData({
      ...normalizedAddress,
      phone: normalizePhone(normalizedAddress.phone) // Remove country code for editing
    });
    setIsFormVisible(true); // Show the form for editing
    setError(""); // Clear errors
  };

  const handleAddNewAddress = () => {
    setCurrentSelectedAddress(null); // No address selected when adding new
    setFormData({ // Reset form for new address
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      country: "India",
      province: "",
      zip: "",
      phone: user?.phone || "",
      isPrimary: false,
    });
    setIsFormVisible(true); // Show the form
    setError(""); // Clear errors
  };

  const handleCancelForm = () => {
    setIsFormVisible(false); // Hide the form
    // If there were previously selected addresses, revert to showing them
    if (availableAddresses.length > 0) {
      setCurrentSelectedAddress(currentSelectedAddress || availableAddresses.find(addr => addr.isPrimary) || availableAddresses[0]);
    } else {
      // If no addresses and cancelled, clear current selection
      setCurrentSelectedAddress(null);
    }
    setError(""); // Clear any form errors
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black p-4 sm:p-5 md:p-6 rounded-xl border border-gray-700/50 backdrop-blur shadow-xl">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 text-white">📍 Shipping Address</h2>
      
      {loading && !loaded && (
        <div className="flex items-center gap-2 text-gray-400 mb-3 text-xs sm:text-sm">
          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your saved addresses...
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-2.5 sm:p-3 rounded-lg mb-3 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {loaded && user ? ( // Show address options if user is logged in and data is loaded
        <>
          {!isFormVisible && availableAddresses.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-gray-400 text-xs sm:text-sm mb-3">Select a saved address or add a new one</p>
              {availableAddresses.map((address) => (
                <div
                  className={`p-3 sm:p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    currentSelectedAddress?.id === address.id
                      ? "border-white bg-gray-800"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => handleSelectAddress(address)}
                  key={address.id}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm sm:text-base">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.isPrimary && (
                          <span className="text-[10px] sm:text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Primary</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
                        {address.address1}
                        {address.address2 && `, ${address.address2}`}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {address.city}, {address.province} {address.zip}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        📱 {address.phone}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:gap-2 ml-3 sm:ml-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectAddress(address);
                        }}
                        className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                          currentSelectedAddress?.id === address.id
                            ? "bg-white text-black"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                      >
                        {currentSelectedAddress?.id === address.id ? "✓ Selected" : "Select"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditAddress(address);
                        }}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddNewAddress}
                className="w-full mt-4 bg-gray-800 border-2 border-dashed border-gray-600 hover:border-gray-500 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm"
              >
                + Add New Address
              </button>
            </div>
          ) : ( // Show form if isFormVisible is true OR if no addresses are available for logged-in user
            <AddressFormContent
              formData={formData}
              handleInputChange={handleInputChange}
              handleSaveAddress={handleSaveAddress}
              handleCancelForm={handleCancelForm}
              loading={loading}
              isEditing={!!currentSelectedAddress}
            />
          )}
        </>
      ) : ( // If user is not logged in, or still loading for guests, show just the form
        loaded && !user && ( // Only show form for guests once loaded
          <AddressFormContent
            formData={formData}
            handleInputChange={handleInputChange}
            handleSaveAddress={handleSaveAddress}
            loading={loading}
            // No cancel button for guests when initially filling out, as there's no previous state to revert to.
          />
        )
      )}
    </div>
  );
};

// Extracted form content into a separate component for reusability
const AddressFormContent = ({ formData, handleInputChange, handleSaveAddress, handleCancelForm, loading, isEditing }) => (
  <div className="space-y-3 sm:space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">First Name *</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Last Name *</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
          required
        />
      </div>
    </div>
    
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Company (Optional)</label>
      <input
        type="text"
        name="company"
        value={formData.company}
        onChange={handleInputChange}
        className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
      />
    </div>
    
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Street Address *</label>
      <input
        type="text"
        name="address1"
        value={formData.address1}
        onChange={handleInputChange}
        placeholder="House number and street name"
        className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
        required
      />
    </div>
    
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Apartment, Suite, etc. (Optional)</label>
      <input
        type="text"
        name="address2"
        value={formData.address2}
        onChange={handleInputChange}
        placeholder="Apartment, floor, etc."
        className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
      />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">City *</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">State/Province *</label>
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">PIN Code *</label>
        <input
          type="text"
          name="zip"
          value={formData.zip}
          onChange={handleInputChange}
          placeholder="6 digits"
          className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-800/60 text-white border border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
          required
          maxLength={6}
        />
      </div>
    </div>
    
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Phone Number *</label>
      <div className="flex">
        <div className="w-16 sm:w-20">
          <input
            type="text"
            value="+91"
            readOnly
            className="w-full p-2.5 sm:p-3 rounded-l-lg bg-gray-700 text-white border border-gray-700 text-center font-medium text-xs sm:text-sm"
          />
        </div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="10 digits"
          className="flex-1 p-2.5 sm:p-3 rounded-r-lg bg-gray-800/60 text-white border border-l-0 border-gray-700 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all text-xs sm:text-sm"
          required
          maxLength={10}
        />
      </div>
    </div>
    
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5">Country</label>
      <input
        type="text"
        name="country"
        value="India"
        readOnly
        className="w-full p-2.5 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-700 text-xs sm:text-sm"
      />
    </div>

    <div className="flex justify-end gap-2 sm:gap-3 pt-4 sm:pt-5 border-t border-gray-700">
      {handleCancelForm && (
        <button
          type="button"
          onClick={handleCancelForm}
          className="px-4 sm:px-5 py-2 border-2 border-gray-600 text-white rounded-lg hover:border-gray-500 transition-colors font-medium text-xs sm:text-sm"
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        onClick={handleSaveAddress}
        className="px-4 sm:px-5 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Saving..." : isEditing ? "Update Address" : "Save & Use Address"}
      </button>
    </div>
  </div>
);

export default ShippingAddressForm;