// loader.jsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center space-x-3">
      {/* Outer Container */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 opacity-40 rounded-full"></div>

        {/* Inner spinning circle */}
        <div className="w-16 h-16 border-t-4 border-white border-solid rounded-full animate-spin"></div>
      </div>

      {/* Premium Text */}
      <div className="text-white text-lg font-semibold uppercase tracking-wider">
        Please Wait...
      </div>
    </div>
  );
};

export default Loader;
