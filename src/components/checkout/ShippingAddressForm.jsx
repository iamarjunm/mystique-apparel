// components/checkout/ShippingAddressForm.jsx

"use client";

import React, { useState, useEffect } from "react";

const ShippingAddressForm = ({ user, updateAddress, onSubmit, initialAddress }) => {
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

  // Fetch user addresses on mount for LOGGED-IN users only
  useEffect(() => {
    const fetchAddresses = async () => {
      // Only attempt to fetch addresses if a user is logged in
      if (!user) {
        setLoaded(true); // Treat as loaded for guests
        setIsFormVisible(true); // Always show form for guests
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("shopifyAccessToken");

        if (!token) {
          setError("Authentication token missing. Please log in to manage addresses.");
          setLoaded(true);
          setIsFormVisible(true); // Show form if no token for logged-in user
          return;
        }

        const response = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }

        const userData = await response.json();
        if (userData.addresses) {
          setAvailableAddresses(userData.addresses);

          // Select initial address, primary, or first if available
          const addressToPreSelect = initialAddress ||
                                     userData.addresses.find(addr => addr.isPrimary) ||
                                     userData.addresses[0];

          if (addressToPreSelect) {
            setCurrentSelectedAddress(addressToPreSelect);
            onSubmit(addressToPreSelect); // Notify parent immediately
          } else {
            setIsFormVisible(true); // If no addresses, show the form to add one
          }
        }
      } catch (error) {
        console.error("Address fetch error:", error);
        setError("Failed to load addresses. Please try again.");
        setIsFormVisible(true); // Fallback to showing the form on error
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };

    fetchAddresses();
  }, [user, initialAddress, onSubmit]); // Added onSubmit to dependency array

  // Sync formData with user data if user becomes available (e.g., after login on checkout page)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
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
      const addressToUse = {
        ...formData,
        phone: `+91 ${formData.phone}`,
        // Only include ID if it's an existing address for a logged-in user
        id: user ? currentSelectedAddress?.id : undefined, 
      };

      if (user) {
        // For logged-in users, attempt to save/update the address on the backend
        const token = localStorage.getItem("shopifyAccessToken");
        if (!token) {
          setError("Authentication token missing. Please log in again.");
          setLoading(false);
          return;
        }
        if (updateAddress) {
          await updateAddress(token, addressToUse.id, addressToUse);
        }
        // After successful update for logged-in user, re-fetch addresses to ensure state is consistent
        const response = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData.addresses) {
            setAvailableAddresses(userData.addresses);
            // Try to find the newly added/updated address from the fetched list
            const updatedOrNewAddress = userData.addresses.find(
              (addr) => addr.address1 === addressToUse.address1 && addr.phone === addressToUse.phone
            ) || userData.addresses.find(addr => addr.id === addressToUse.id);
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
    setCurrentSelectedAddress(address);
    onSubmit(address); // Notify parent immediately when an address is selected
    setIsFormVisible(false); // Hide form and show list
    setError(""); // Clear errors
  };

  const handleEditAddress = (address) => {
    setCurrentSelectedAddress(address);
    setFormData({
      ...address,
      phone: address.phone.replace(/^\+91\s/, "") // Remove country code for editing
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
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {loading && !loaded && <p className="text-green-500">Loading addresses...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {loaded && user ? ( // Show address options if user is logged in and data is loaded
          <>
            {!isFormVisible && availableAddresses.length > 0 ? (
              <div className="space-y-4">
                {availableAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded ${
                      currentSelectedAddress?.id === address.id
                        ? "border-green-500 bg-gray-800"
                        : "border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                          {address.isPrimary && (
                            <span className="text-green-400 ml-2">(Primary)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400">
                          {address.address1}, {address.address2 && `${address.address2}, `}
                          {address.city}, {address.province}, {address.zip}
                        </p>
                        <p className="text-sm text-gray-400">Phone: {address.phone}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectAddress(address);
                          }}
                          className={`px-3 py-1 text-sm rounded ${
                            currentSelectedAddress?.id === address.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          {currentSelectedAddress?.id === address.id ? "Selected" : "Select"}
                        </button>
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleAddNewAddress}
                    className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
                  >
                    Add New Address
                  </button>
                </div>
              </div>
            ) : ( // Show form if isFormVisible is true OR if no addresses are available for logged-in user
              <AddressFormContent
                formData={formData}
                handleInputChange={handleInputChange}
                handleSaveAddress={handleSaveAddress}
                handleCancelForm={handleCancelForm}
                loading={loading}
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
    </div>
  );
};

// Extracted form content into a separate component for reusability
const AddressFormContent = ({ formData, handleInputChange, handleSaveAddress, handleCancelForm, loading }) => (
  <div className="space-y-4 mt-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-400 mb-1">First Name *</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-1">Last Name *</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
    </div>
    <div>
      <label className="block text-gray-400 mb-1">Company (Optional)</label>
      <input
        type="text"
        name="company"
        value={formData.company}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-gray-800 text-white"
      />
    </div>
    <div>
      <label className="block text-gray-400 mb-1">Address *</label>
      <input
        type="text"
        name="address1"
        value={formData.address1}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-gray-800 text-white"
        required
      />
    </div>
    <div>
      <label className="block text-gray-400 mb-1">Apartment, Suite, etc. (Optional)</label>
      <input
        type="text"
        name="address2"
        value={formData.address2}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-gray-800 text-white"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-gray-400 mb-1">City *</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-1">State *</label>
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-gray-400 mb-1">ZIP Code *</label>
        <input
          type="text"
          name="zip"
          value={formData.zip}
          onChange={handleInputChange}
          className="w-full p-2 rounded bg-gray-800 text-white"
          required
          maxLength={6}
        />
      </div>
    </div>
    <div>
      <label className="block text-gray-400 mb-1">Phone *</label>
      <div className="flex">
        <div className="w-1/4">
          <input
            type="text"
            value="+91"
            readOnly
            className="w-full p-2 rounded-l bg-gray-700 text-white"
          />
        </div>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-3/4 p-2 rounded-r bg-gray-800 text-white"
          required
          maxLength={10}
        />
      </div>
    </div>
    <div>
      <label className="block text-gray-400 mb-1">Country *</label>
      <input
        type="text"
        name="country"
        value="India"
        readOnly
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
    </div>

    <div className="flex justify-end gap-2 pt-4">
      {handleCancelForm && ( // Only show cancel if prop is provided (i.e., for logged-in users who can switch back to selecting)
        <button
          onClick={handleCancelForm}
          className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-800 transition"
        >
          Cancel
        </button>
      )}
      <button
        onClick={handleSaveAddress}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Use Address"}
      </button>
    </div>
  </div>
);

export default ShippingAddressForm;