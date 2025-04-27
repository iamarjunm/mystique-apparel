// app/collection/[handle]/loading.js
export default function Loading() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-5 animate-pulse h-[400px]">
              <div className="bg-gray-700 rounded-xl w-full h-64 mb-4"></div>
              <div className="bg-gray-700 h-4 w-3/4 mb-2"></div>
              <div className="bg-gray-700 h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }