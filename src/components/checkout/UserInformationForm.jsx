import React, { useEffect, useState } from "react";

const UserInformationForm = ({ formData, handleChange, user }) => {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
  });

  // Fetch user information when the component mounts or when the user changes
  useEffect(() => {
    if (user) {
      // If the user is logged in, fetch their information
      setUserInfo({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email || "",
      });
    } else {
      // If no user is logged in, reset the form
      setUserInfo({
        fullName: "",
        email: "",
      });
    }
  }, [user]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Information</h2>
      <div className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={user ? userInfo.fullName : formData.fullName}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800 text-white"
          required
          readOnly={!!user} // Make read-only if user is logged in
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email (Optional)"
          value={user ? userInfo.email : formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800 text-white"
          readOnly={!!user} // Make read-only if user is logged in
        />
      </div>
    </div>
  );
};

export default UserInformationForm;