"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone, Plus, Check, Loader2 } from "lucide-react";

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

      if (!user) {
        setLoaded(true);
        setIsFormVisible(true);
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

        const normalizedInitialAddress = initialAddress ? normalizeAddress(initialAddress) : null;
        const addressToPreSelect =
          normalizedInitialAddress ||
          sourceAddresses.find((addr) => addr.isPrimary) ||
          sourceAddresses[0];

        if (addressToPreSelect) {
          setCurrentSelectedAddress(addressToPreSelect);
          setFormData((prev) => ({ ...prev, ...addressToPreSelect }));
          onSubmit(addressToPreSelect);
          setIsFormVisible(false);
        } else {
          setIsFormVisible(true);
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

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || parseName(user.displayName || "").firstName || prev.firstName,
        lastName: user.lastName || parseName(user.displayName || "").lastName || prev.lastName,
        phone: normalizePhone(user.phone || user.phoneNumber || "") || prev.phone,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "address1",
      "city",
      "province",
      "zip",
      "phone",
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
      setError("PIN code must be 6 digits");
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
        id: user ? currentSelectedAddress?.id : undefined,
      });

      if (user) {
        const token = localStorage.getItem("shopifyAccessToken");
        if (token && updateAddress) {
          await updateAddress(token, addressToUse.id, addressToUse);
          const response = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            if (userData.addresses) {
              const normalizedAddresses = userData.addresses.map(normalizeAddress);
              setAvailableAddresses(normalizedAddresses);
              const updatedOrNewAddress =
                normalizedAddresses.find(
                  (addr) => addr.address1 === addressToUse.address1 && addr.phone === addressToUse.phone
                ) || normalizedAddresses.find((addr) => addr.id === addressToUse.id);
              if (updatedOrNewAddress) {
                setCurrentSelectedAddress(updatedOrNewAddress);
                onSubmit(updatedOrNewAddress);
              } else {
                setCurrentSelectedAddress(addressToUse);
                onSubmit(addressToUse);
              }
            }
          }
        } else {
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
        setCurrentSelectedAddress(addressToUse);
        onSubmit(addressToUse);
      }

      setIsFormVisible(false);
      setError("");
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
    onSubmit(normalizedAddress);
    setIsFormVisible(false);
    setError("");
  };

  const handleEditAddress = (address) => {
    const normalizedAddress = normalizeAddress(address);
    setCurrentSelectedAddress(normalizedAddress);
    setFormData({
      ...normalizedAddress,
      phone: normalizePhone(normalizedAddress.phone),
    });
    setIsFormVisible(true);
    setError("");
  };

  const handleAddNewAddress = () => {
    setCurrentSelectedAddress(null);
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
    setIsFormVisible(true);
    setError("");
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    if (availableAddresses.length > 0) {
      setCurrentSelectedAddress(
        currentSelectedAddress || availableAddresses.find((addr) => addr.isPrimary) || availableAddresses[0]
      );
    } else {
      setCurrentSelectedAddress(null);
    }
    setError("");
  };

  return (
    <div className="bg-white border border-[#0D0D0D]/12 p-5 sm:p-6 rounded-[2px] space-y-4">
      <div className="flex items-center gap-2.5 border-b border-[#0D0D0D]/10 pb-4">
        <MapPin className="w-4 h-4 text-[#0D0D0D]" />
        <h2 className="font-display italic text-xl sm:text-2xl text-[#0D0D0D]">
          Shipping Address
        </h2>
      </div>

      {loading && !loaded && (
        <div className="flex items-center gap-2.5 text-[#64625C] py-2 text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-[#0D0D0D]" />
          <span>Loading your saved addresses...</span>
        </div>
      )}

      {error && (
        <div className="bg-[#991B1B]/6 border border-[#991B1B]/25 text-[#991B1B] p-3.5 rounded-[2px] text-xs">
          {error}
        </div>
      )}

      {loaded && user ? (
        <>
          {!isFormVisible && availableAddresses.length > 0 ? (
            <div className="space-y-3">
              <p className="font-mono-tech text-[10px] tracking-[0.18em] uppercase text-[#64625C]">
                Select a saved address or add a new one
              </p>
              {availableAddresses.map((address) => {
                const isSelected = currentSelectedAddress?.id === address.id;
                return (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-[2px] transition-colors cursor-pointer ${
                      isSelected
                        ? "border-[#0D0D0D] bg-[#F6F5F1]"
                        : "border-[#0D0D0D]/12 bg-white hover:border-[#0D0D0D]/35"
                    }`}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-body font-semibold text-[#0D0D0D] text-sm">
                            {address.firstName} {address.lastName}
                          </p>
                          {address.isPrimary && (
                            <span className="font-mono-tech text-[9px] uppercase tracking-[0.16em] bg-[#EAE8E2] border border-[#0D0D0D]/12 text-[#0D0D0D] px-2 py-0.5 rounded-[2px]">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64625C] mt-1.5 leading-relaxed">
                          {address.address1}
                          {address.address2 && `, ${address.address2}`}
                        </p>
                        <p className="text-xs text-[#64625C]">
                          {address.city}, {address.province} {address.zip}
                        </p>
                        <p className="text-xs text-[#64625C] flex items-center gap-1.5 mt-1.5 font-mono-tech">
                          <Phone className="w-3 h-3 text-[#0D0D0D]" />
                          <span>{address.phone}</span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectAddress(address);
                          }}
                          className={`inline-flex items-center justify-center gap-1 px-3.5 py-1.5 text-[10px] font-mono-tech uppercase tracking-[0.16em] rounded-[2px] transition-colors ${
                            isSelected
                              ? "bg-[#0D0D0D] text-[#F6F5F1]"
                              : "border border-[#0D0D0D]/25 text-[#0D0D0D] hover:border-[#0D0D0D]"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Select</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="px-3.5 py-1.5 text-[10px] font-mono-tech uppercase tracking-[0.16em] border border-[#0D0D0D]/18 text-[#64625C] hover:text-[#0D0D0D] hover:border-[#0D0D0D] rounded-[2px] transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={handleAddNewAddress}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#F6F5F1] border border-dashed border-[#0D0D0D]/30 hover:border-[#0D0D0D] text-[#0D0D0D] px-4 py-3 rounded-[2px] transition-colors font-mono-tech text-[10px] uppercase tracking-[0.2em]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>
          ) : (
            <AddressFormContent
              formData={formData}
              handleInputChange={handleInputChange}
              handleSaveAddress={handleSaveAddress}
              handleCancelForm={availableAddresses.length > 0 ? handleCancelForm : undefined}
              loading={loading}
              isEditing={!!currentSelectedAddress}
            />
          )}
        </>
      ) : (
        loaded &&
        !user && (
          <AddressFormContent
            formData={formData}
            handleInputChange={handleInputChange}
            handleSaveAddress={handleSaveAddress}
            loading={loading}
          />
        )
      )}
    </div>
  );
};

const AddressFormContent = ({
  formData,
  handleInputChange,
  handleSaveAddress,
  handleCancelForm,
  loading,
  isEditing,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          First Name *
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
          required
        />
      </div>
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          Last Name *
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
          required
        />
      </div>
    </div>

    <div>
      <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
        Company (Optional)
      </label>
      <input
        type="text"
        name="company"
        value={formData.company}
        onChange={handleInputChange}
        className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
      />
    </div>

    <div>
      <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
        Street Address *
      </label>
      <input
        type="text"
        name="address1"
        value={formData.address1}
        onChange={handleInputChange}
        placeholder="House number and street name"
        className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
        required
      />
    </div>

    <div>
      <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
        Apartment, Suite, etc. (Optional)
      </label>
      <input
        type="text"
        name="address2"
        value={formData.address2}
        onChange={handleInputChange}
        placeholder="Apartment, floor, landmark"
        className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          City *
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
          required
        />
      </div>
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          State / Province *
        </label>
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm"
          required
        />
      </div>
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          PIN Code *
        </label>
        <input
          type="text"
          name="zip"
          value={formData.zip}
          onChange={handleInputChange}
          placeholder="6 digits"
          className="input-atelier w-full px-4 py-3 rounded-[2px] text-sm font-mono-tech"
          required
          maxLength={6}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          Phone Number *
        </label>
        <div className="flex">
          <div className="w-16 flex-shrink-0">
            <input
              type="text"
              value="+91"
              readOnly
              className="w-full px-3 py-3 rounded-l-[2px] bg-[#EAE8E2] text-[#0D0D0D] border border-[#0D0D0D]/16 text-center font-mono-tech text-xs"
            />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="10 digits"
            className="input-atelier flex-1 px-4 py-3 rounded-r-[2px] border-l-0 text-sm font-mono-tech"
            required
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <label className="block font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mb-2">
          Country
        </label>
        <input
          type="text"
          name="country"
          value="India"
          readOnly
          className="w-full px-4 py-3 rounded-[2px] bg-[#EAE8E2] text-[#64625C] border border-[#0D0D0D]/12 text-sm cursor-not-allowed"
        />
      </div>
    </div>

    <div className="flex justify-end gap-3 pt-4 border-t border-[#0D0D0D]/10">
      {handleCancelForm && (
        <button
          type="button"
          onClick={handleCancelForm}
          className="px-5 py-2.5 border border-[#0D0D0D]/25 text-[#0D0D0D] rounded-[2px] hover:border-[#0D0D0D] transition-colors font-body text-[11px] font-semibold uppercase tracking-[0.2em]"
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        onClick={handleSaveAddress}
        className="px-6 py-2.5 bg-[#0D0D0D] text-[#F6F5F1] rounded-[2px] hover:bg-[#262626] transition-colors font-body text-[11px] font-semibold uppercase tracking-[0.2em] disabled:opacity-45 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Saving..." : isEditing ? "Update Address" : "Save & Use Address"}
      </button>
    </div>
  </div>
);

export default ShippingAddressForm;
