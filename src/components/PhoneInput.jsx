import React, { useState } from 'react';

const PhoneInput = ({ 
  onSubmit,
  onCancel,
  initialPhone = '',
  initialCountryCode = '+91'
}) => {
  const [phoneData, setPhoneData] = useState({
    countryCode: '+91', // Fixed to India (+91)
    phone: initialPhone.replace('+91', '') // Remove country code if present
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { value } = e.target;
    // Ensure only numbers are entered
    if (/^\d*$/.test(value)) {
      setPhoneData(prev => ({
        ...prev,
        phone: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        countryCode: '+91', // Always submit with +91
        phone: phoneData.phone
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Country Code
          </label>
          <div className="flex items-center h-10 px-3 rounded bg-gray-700 text-gray-300">
            +91 (India)
          </div>
        </div>
        <div className="col-span-9">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneData.phone}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="9876543210"
            required
            pattern="[0-9]{10}"
            maxLength="10"
            title="Please enter a 10-digit Indian phone number"
          />
        </div>
      </div>
      <div className="flex space-x-2 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PhoneInput;