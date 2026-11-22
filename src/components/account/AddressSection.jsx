"use client";

import React, { useState } from "react";
import { Phone, Plus, MapPin } from "lucide-react";
import { toast } from "react-toastify";

const AddressSection = ({ userData, updateUserProfile }) => {
  const [addresses, setAddresses] = useState(userData?.addresses || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ["name", "phone", "street", "city", "state", "postalCode"];

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

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let updatedAddresses = [...addresses];

      if (editIndex !== null) {
        updatedAddresses[editIndex] = {
          ...formData,
          _key: updatedAddresses[editIndex]._key || `address-${Date.now()}`,
        };
      } else {
        updatedAddresses.push({
          ...formData,
          _key: `address-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      }

      if (formData.isPrimary) {
        updatedAddresses = updatedAddresses.map((addr, idx) => ({
          ...addr,
          isPrimary: editIndex !== null ? idx === editIndex : idx === updatedAddresses.length - 1,
        }));
      } else if (updatedAddresses.length === 1) {
        updatedAddresses[0].isPrimary = true;
      }

      await updateUserProfile({ addresses: updatedAddresses });

      setAddresses(updatedAddresses);
      resetForm();
      toast.success(editIndex !== null ? "Address updated." : "Address saved.");
    } catch (error) {
      console.error("[ADDRESS] Save error:", error);
      setError("Failed to save address. Please try again.");
      toast.error("Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (index) => {
    setLoading(true);

    try {
      let updatedAddresses = addresses.filter((_, idx) => idx !== index);

      if (updatedAddresses.length > 0 && !updatedAddresses.some((addr) => addr.isPrimary)) {
        updatedAddresses[0].isPrimary = true;
      }

      await updateUserProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setConfirmDeleteIndex(null);
      toast.success("Address removed.");
    } catch (error) {
      console.error("[ADDRESS] Delete error:", error);
      setError("Failed to delete address. Please try again.");
      toast.error("Failed to delete address.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address, index) => {
    setEditIndex(index);
    setConfirmDeleteIndex(null);
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
  };

  const handleAddNewAddress = () => {
    resetForm();
    setIsEditing(true);
  };

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
    <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0D0D0D]/10 pb-5 mb-8">
        <div>
          <span className="font-mono-tech text-[10px] tracking-[0.26em] uppercase text-[#64625C] block mb-1">
            02 // Dispatch Book
          </span>
          <h2 className="font-display italic text-3xl text-[#0D0D0D]">
            Saved Addresses
          </h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleAddNewAddress}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D0D0D] text-[#F6F5F1] text-[10px] font-mono-tech font-semibold rounded-[2px] hover:bg-[#262626] transition-colors uppercase tracking-[0.2em]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-[#991B1B]/6 border border-[#991B1B]/25 text-[#991B1B] p-4 rounded-[2px] mb-6 text-xs">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="space-y-5">
          <h3 className="font-mono-tech text-[11px] font-semibold text-[#0D0D0D] uppercase tracking-[0.22em]">
            {editIndex !== null ? "Edit Address" : "New Delivery Address"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm font-mono-tech"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit number"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="street"
              className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="House no., street, landmark"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                PIN Code *
              </label>
              <input
                type="text"
                name="postalCode"
                className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm font-mono-tech"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="400001"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                className="w-full px-4 py-3 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/12 text-[#64625C] cursor-not-allowed text-sm"
                value={formData.country}
                onChange={handleInputChange}
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              name="isPrimary"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={handleInputChange}
              className="w-4 h-4 accent-[#0D0D0D] rounded-[2px]"
            />
            <label
              htmlFor="isPrimary"
              className="font-mono-tech text-[10px] text-[#0D0D0D] uppercase tracking-[0.2em] cursor-pointer"
            >
              Set as primary address
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#0D0D0D]/10">
            <button
              type="button"
              onClick={handleSaveAddress}
              className="px-7 py-3 bg-[#0D0D0D] text-[#F6F5F1] font-body text-[11px] font-semibold rounded-[2px] hover:bg-[#262626] transition-colors disabled:opacity-50 uppercase tracking-[0.22em]"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-7 py-3 border border-[#0D0D0D]/25 text-[#0D0D0D] font-body text-[11px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.22em]"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isEditing && addresses.length === 0 && (
        <div className="text-center py-14 bg-[#F6F5F1] border border-[#0D0D0D]/10 rounded-[2px]">
          <MapPin className="w-6 h-6 text-[#64625C] mx-auto mb-3" />
          <p className="font-display italic text-xl text-[#0D0D0D] mb-1">No Addresses Saved</p>
          <p className="font-body text-xs text-[#64625C]">
            Add your primary delivery address for faster checkout.
          </p>
        </div>
      )}

      {!isEditing && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((address, index) => (
            <div
              key={address._key || index}
              className="relative p-6 rounded-[2px] bg-[#F6F5F1] border border-[#0D0D0D]/12 hover:border-[#0D0D0D]/30 transition-colors"
            >
              {address.isPrimary && (
                <span className="absolute top-6 right-6 bg-[#0D0D0D] text-[#F6F5F1] font-mono-tech text-[9px] px-2.5 py-1 rounded-[2px] uppercase tracking-[0.2em]">
                  Primary
                </span>
              )}
              <div className="space-y-1.5 pr-24">
                <p className="font-body font-semibold text-[#0D0D0D] text-base mb-2">
                  {address.name || "N/A"}
                </p>
                <p className="font-mono-tech text-xs text-[#64625C] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0D0D0D]" />
                  <span>{address.phone || "N/A"}</span>
                </p>
                <p className="font-body text-sm text-[#0D0D0D] pt-1 leading-relaxed">
                  {address.street}
                </p>
                <p className="font-body text-xs text-[#64625C]">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="font-body text-xs text-[#64625C]">{address.country}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#0D0D0D]/10 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleEditAddress(address, index)}
                  className="px-4 py-2 border border-[#0D0D0D]/25 text-[#0D0D0D] font-mono-tech text-[10px] font-semibold rounded-[2px] hover:border-[#0D0D0D] transition-colors uppercase tracking-[0.18em]"
                >
                  Edit
                </button>
                {confirmDeleteIndex === index ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(index)}
                      disabled={loading}
                      className="px-4 py-2 bg-[#991B1B] text-[#F6F5F1] font-mono-tech text-[10px] font-semibold rounded-[2px] hover:opacity-90 transition-opacity uppercase tracking-[0.18em]"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteIndex(null)}
                      className="px-4 py-2 border border-[#0D0D0D]/20 text-[#64625C] font-mono-tech text-[10px] rounded-[2px] hover:text-[#0D0D0D] uppercase tracking-[0.18em]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteIndex(index)}
                    className="px-4 py-2 border border-[#991B1B]/25 text-[#991B1B] font-mono-tech text-[10px] font-semibold rounded-[2px] hover:bg-[#991B1B]/6 transition-colors uppercase tracking-[0.18em]"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSection;
