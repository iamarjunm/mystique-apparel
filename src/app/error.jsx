'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("An error occurred:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-6">{error?.message || "Unexpected error occurred."}</p>
      <button
        onClick={() => reset()}
        className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition"
      >
        Try again
      </button>
    </div>
  );
}
