"use client";

import React, { useState, useEffect } from "react";

const AddressSection = ({ user, updateAddress, deleteAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
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

  // Fetch addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("shopifyAccessToken");
        
        if (!token) {
          console.error("No access token found");
          return;
        }

        const response = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch addresses");
        
        const userData = await response.json();
        if (userData.addresses) {
          setAddresses(userData.addresses);
        }
      } catch (error) {
        console.error("Address fetch error:", error);
        setError("Failed to load addresses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate form data
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

  // Save address handler
  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const addressToSave = {
        ...formData,
        phone: `+91 ${formData.phone}`,
        id: editId || `temp-${Date.now()}`,
      };

      let updatedAddresses;
      if (editId) {
        // Update existing address
        updatedAddresses = addresses.map(addr => 
          addr.id === editId ? addressToSave : addr
        );
      } else {
        // Add new address
        updatedAddresses = [...addresses, addressToSave];
      }

      // Handle primary address logic
      if (addressToSave.isPrimary) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isPrimary: addr.id === addressToSave.id
        }));
      } else if (updatedAddresses.length === 1) {
        // If this is the only address, make it primary
        updatedAddresses[0].isPrimary = true;
        addressToSave.isPrimary = true;
      }

      setAddresses(updatedAddresses);
      
      // Call update API
      if (updateAddress) {
        await updateAddress(addressToSave);
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Address save error:", error);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete address handler
  const handleDeleteAddress = async (addressId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    try {
      await deleteAddress(addressId);
      
      // Remove from local state
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);

      // If we deleted the primary address and there are others left, make the first one primary
      if (updatedAddresses.length > 0 && 
          !updatedAddresses.some(addr => addr.isPrimary)) {
        const newAddresses = [...updatedAddresses];
        newAddresses[0].isPrimary = true;
        setAddresses(newAddresses);
        
        // Update in backend
        if (updateAddress) {
          await updateAddress(newAddresses[0]);
        }
      }
    } catch (error) {
      console.error("Address delete error:", error);
      setError("Failed to delete address. Please try again.");
    }
  };

  // Edit existing address
  const handleEditAddress = (address) => {
    setEditId(address.id);
    setFormData({
      ...address,
      phone: address.phone.replace(/^\+91\s/, "") // Remove country code
    });
    setIsEditing(true);
  };

  // Add new address
  const handleAddNewAddress = () => {
    setEditId(null);
    setFormData({
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
    setIsEditing(true);
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
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
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Address Management</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {loading && <p className="text-green-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isEditing && (
          <>
            {addresses.length > 0 ? (
              <div className="space-y-4">
                {[...addresses].sort((a, b) => b.isPrimary - a.isPrimary).map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded ${
                      address.isPrimary 
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
                          onClick={() => handleEditAddress(address)}
                          className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No addresses found.</p>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={handleAddNewAddress}
                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                Add New Address
              </button>
            </div>
          </>
        )}

        {isEditing && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
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

              {/* Last Name */}
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

            {/* Company */}
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

            {/* Address Line 1 */}
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

            {/* Address Line 2 */}
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
              {/* City */}
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

              {/* State */}
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

              {/* ZIP Code */}
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

            {/* Phone */}
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

            {/* Country */}
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="isPrimary" className="text-gray-300">
                Set as primary address
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSection;