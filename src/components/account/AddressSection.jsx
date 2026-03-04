"use client";

import React, { useState } from "react";

const AddressSection = ({ userData, updateUserProfile }) => {
  const [addresses, setAddresses] = useState(userData?.addresses || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isPrimary: false,
  });

  console.log('[ADDRESS] 📍 Component rendered with userData:', userData);
  console.log('[ADDRESS] 📍 Current addresses:', addresses);

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
    const requiredFields = ['name', 'phone', 'street', 'city', 'state', 'postalCode'];
    
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }

    if (!/^\d{6}$/.test(formData.postalCode)) {
      setError("Postal code must be 6 digits");
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be 10 digits");
      return false;
    }

    setError("");
    return true;
  };

  // Save address handler
  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);
    console.log('[ADDRESS] 💾 Saving address...');
    
    try {
      let updatedAddresses = [...addresses];
      
      if (editIndex !== null) {
        // Update existing address
        updatedAddresses[editIndex] = {
          ...formData,
          _key: updatedAddresses[editIndex]._key || `address-${Date.now()}`
        };
        console.log('[ADDRESS] 📝 Updating existing address at index:', editIndex);
      } else {
        // Add new address with unique _key
        updatedAddresses.push({
          ...formData,
          _key: `address-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        console.log('[ADDRESS] ➕ Adding new address');
      }

      // Handle primary address logic
      if (formData.isPrimary) {
        updatedAddresses = updatedAddresses.map((addr, idx) => ({
          ...addr,
          isPrimary: editIndex !== null ? idx === editIndex : idx === updatedAddresses.length - 1
        }));
      } else if (updatedAddresses.length === 1) {
        // If this is the only address, make it primary
        updatedAddresses[0].isPrimary = true;
      }

      // Update in Sanity
      await updateUserProfile({ addresses: updatedAddresses });
      console.log('[ADDRESS] ✅ Addresses updated in Sanity');
      
      setAddresses(updatedAddresses);
      resetForm();
    } catch (error) {
      console.error("[ADDRESS] ❌ Save error:", error);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete address handler
  const handleDeleteAddress = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    setLoading(true);
    console.log('[ADDRESS] 🗑️ Deleting address at index:', index);

    try {
      let updatedAddresses = addresses.filter((_, idx) => idx !== index);

      // If we deleted the primary address and there are others left, make the first one primary
      if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isPrimary)) {
        updatedAddresses[0].isPrimary = true;
      }

      await updateUserProfile({ addresses: updatedAddresses });
      console.log('[ADDRESS] ✅ Address deleted from Sanity');
      
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("[ADDRESS] ❌ Delete error:", error);
      setError("Failed to delete address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit existing address
  const handleEditAddress = (address, index) => {
    setEditIndex(index);
    setFormData({
      name: address.name || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      isPrimary: !!address.isPrimary,
      _key: address._key,
    });
    setIsEditing(true);
    console.log('[ADDRESS] ✏️ Editing address at index:', index);
  };

  // Add new address
  const handleAddNewAddress = () => {
    resetForm();
    setIsEditing(true);
    console.log('[ADDRESS] ➕ Adding new address');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isPrimary: false,
    });
    setIsEditing(false);
    setEditIndex(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-8 sm:p-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 uppercase tracking-[0.15em]">
            Addresses
          </h2>
          {!isEditing && (
            <button
              onClick={handleAddNewAddress}
              className="px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-wider"
            >
              Add New
            </button>
          )}
        </div>
      
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-5 rounded-xl mb-8">
            {error}
          </div>
        )}

        {isEditing && (
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-xl font-bold text-zinc-100 mb-8 uppercase tracking-wider">
              {editIndex !== null ? 'Edit Address' : 'New Address'}
            </h3>
          
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all text-lg"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-[0.2em]">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-zinc-400 cursor-not-allowed text-lg"
                    value={formData.country}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  name="isPrimary"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
                />
                <label htmlFor="isPrimary" className="text-sm text-zinc-300 font-semibold uppercase tracking-wider">
                  Set as primary
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveAddress}
                  className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-wider text-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!isEditing && addresses.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-lg mb-2">No addresses saved.</p>
            <p className="text-sm">Add your first delivery address.</p>
          </div>
        )}

        {!isEditing && addresses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 pt-8 border-t border-white/10">
            {addresses.map((address, index) => (
              <div
                key={index}
                className="relative p-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                {address.isPrimary && (
                  <span className="absolute top-6 right-6 bg-green-500/20 border border-green-500/30 text-green-300 text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider">
                    Primary
                  </span>
                )}
                <div className="space-y-3 pr-24">
                  <p className="font-bold text-zinc-100 text-xl mb-3">{address.name || 'N/A'}</p>
                  <p className="text-zinc-300 font-medium">📞 {address.phone || 'N/A'}</p>
                  <p className="text-zinc-200 text-lg leading-relaxed">{address.street}</p>
                  <p className="text-zinc-300">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-zinc-400">{address.country}</p>
                </div>
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => handleEditAddress(address, index)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-wider"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(index)}
                    className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all uppercase tracking-wider"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSection;
