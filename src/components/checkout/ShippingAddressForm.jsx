"use client";

import React, { useState, useEffect } from "react";

const ShippingAddressForm = ({ user, updateAddress, onSubmit, initialAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize form state
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

  // Fetch user addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("shopifyAccessToken");
        
        if (!token && user) {
          setError("Please log in to manage addresses");
          setLoaded(true);
          return;
        }

        if (token) {
          const response = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Failed to fetch addresses");
          
          const userData = await response.json();
          if (userData.addresses) {
            setAddresses(userData.addresses);
            
            // Try to select initial address or primary address
            const addressToSelect = initialAddress || 
                                 userData.addresses.find(addr => addr.isPrimary) || 
                                 userData.addresses[0];
            if (addressToSelect) {
              setSelectedAddress(addressToSelect);
              onSubmit(addressToSelect);
            }

            // Only show form if there are no addresses
            setIsEditing(userData.addresses.length === 0);
          }
        }
      } catch (error) {
        console.error("Address fetch error:", error);
        setError("Failed to load addresses. Please try again.");
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };

    fetchAddresses();
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
      const addressToSave = {
        ...formData,
        phone: `+91 ${formData.phone}`,
        id: selectedAddress?.id || `temp-${Date.now()}`,
      };

      // Call onSubmit with the complete address object
      onSubmit({
        firstName: addressToSave.firstName,
        lastName: addressToSave.lastName,
        company: addressToSave.company,
        address1: addressToSave.address1,
        address2: addressToSave.address2,
        city: addressToSave.city,
        country: addressToSave.country,
        province: addressToSave.province,
        zip: addressToSave.zip,
        phone: formData.phone,
      });

      if (user) {
        let updatedAddresses;
        
        if (selectedAddress) {
          updatedAddresses = addresses.map(addr => 
            addr.id === selectedAddress.id ? addressToSave : addr
          );
        } else {
          updatedAddresses = [...addresses, addressToSave];
        }

        if (addressToSave.isPrimary) {
          updatedAddresses = updatedAddresses.map(addr => ({
            ...addr,
            isPrimary: addr.id === addressToSave.id
          }));
        }

        setAddresses(updatedAddresses);
        
        if (updateAddress) {
          await updateAddress(addressToSave);
        }
      }

      onSubmit(addressToSave);
      
      if (!selectedAddress) {
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
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Address save error:", error);
      setError("Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    onSubmit(address);
    setIsEditing(false);
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setFormData({
      ...address,
      phone: address.phone.replace(/^\+91\s/, "")
    });
    setIsEditing(true);
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
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

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
      <div className="bg-gray-900 p-6 rounded-lg">
        {loading && !loaded && <p className="text-green-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {user && loaded ? (
          <>
            {!isEditing && addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded ${
                      selectedAddress?.id === address.id 
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
                            e.preventDefault(); // Prevent default behavior
                            e.stopPropagation();
                            handleSelectAddress(address);
                          }}
                          className={`px-3 py-1 text-sm rounded ${
                            selectedAddress?.id === address.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          {selectedAddress?.id === address.id ? "Selected" : "Select"}
                        </button>
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="px-3 py-1 text-sm bg-gray-700 text-white rounded"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isEditing ? (
              <div className="mt-4 text-center">
                <button
                  onClick={handleAddNewAddress}
                  className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
                >
                  Add New Address
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {(isEditing || !user) && loaded && (
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
              {user && (
                <button
                  onClick={() => setIsEditing(false)}
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
                {loading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressForm;