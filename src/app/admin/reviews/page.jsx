"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Trash2, Search, MessageSquare } from "lucide-react";
import Toast from "@/components/Toast";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      showToastMessage("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: !currentStatus } : r));
        showToastMessage(!currentStatus ? "Review approved!" : "Review hidden!");
      } else {
        showToastMessage(data.error || "Failed to update review status");
      }
    } catch (error) {
      console.error("Update error:", error);
      showToastMessage("An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => r._id !== id));
        showToastMessage("Review deleted successfully!");
      } else {
        showToastMessage(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToastMessage("An error occurred");
    }
  };

  const handleSaveReply = async (id) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminResponse: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r._id === id ? { ...r, adminResponse: replyText } : r));
        setReplyingTo(null);
        showToastMessage("Reply saved successfully!");
      } else {
        showToastMessage(data.error || "Failed to save reply");
      }
    } catch (error) {
      console.error("Reply error:", error);
      showToastMessage("An error occurred");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase();
    return (
      review.title?.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query) ||
      review.user?.displayName?.toLowerCase().includes(query) ||
      review.user?.email?.toLowerCase().includes(query) ||
      review.product?.title?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {showToast && (
        <Toast
          message={toastMessage}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Star className="w-6 h-6 text-blue-400" />
            Product Reviews
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage, approve, and reply to customer reviews.
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No reviews found</h3>
            <p className="text-sm text-gray-400">
              {searchQuery ? "Try adjusting your search terms." : "No reviews have been submitted yet."}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} className={`bg-white/5 border ${review.isApproved ? 'border-white/10' : 'border-yellow-500/30'} rounded-2xl p-6 backdrop-blur-sm transition-colors`}>
              <div className="flex flex-col md:flex-row gap-6 justify-between">
                
                {/* Left Side: Review Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={`${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-transparent text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        {!review.isApproved && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded">
                            Pending Approval
                          </span>
                        )}
                        {review.verifiedPurchase && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{review.title || "No Title"}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 bg-black/30 p-4 rounded-lg border border-white/5 leading-relaxed">
                    "{review.comment}"
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {review.images.map((img, i) => (
                        <a key={i} href={img?.asset?.url} target="_blank" rel="noopener noreferrer" className="relative w-16 h-16 rounded-md overflow-hidden border border-white/10 group cursor-pointer block">
                          <img src={img?.asset?.url} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400 mt-4">
                    <p><span className="font-semibold text-gray-300">Customer:</span> {review.user?.displayName || "Unknown"} ({review.user?.email || "No email"})</p>
                    <p><span className="font-semibold text-gray-300">Product:</span> <Link href={`/product/${review.product?.slug?.current || review.product?._id}`} className="text-blue-400 hover:underline">{review.product?.title || "Unknown Product"}</Link></p>
                    <p><span className="font-semibold text-gray-300">Date:</span> {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>

                  {/* Admin Reply Section */}
                  {replyingTo === review._id ? (
                    <div className="mt-4 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your official response..."
                        className="w-full bg-black/50 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-y"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveReply(review._id)}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                        >
                          Save Reply
                        </button>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-2 bg-white/10 text-white text-xs font-semibold rounded hover:bg-white/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : review.adminResponse ? (
                    <div className="mt-4 p-4 bg-blue-900/20 border-l-2 border-blue-500 rounded-r-lg">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Your Response</p>
                      <p className="text-sm text-gray-300">{review.adminResponse}</p>
                    </div>
                  ) : null}
                </div>

                {/* Right Side: Actions */}
                <div className="flex md:flex-col gap-2 md:w-40 shrink-0">
                  <button
                    onClick={() => handleToggleApproval(review._id, review.isApproved)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                      review.isApproved
                        ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                    }`}
                  >
                    {review.isApproved ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {review.isApproved ? "Unapprove" : "Approve"}
                  </button>

                  <button
                    onClick={() => {
                      setReplyingTo(review._id);
                      setReplyText(review.adminResponse || "");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/10 text-xs font-semibold rounded-lg hover:bg-white/10 transition-all"
                  >
                    <MessageSquare size={14} />
                    {review.adminResponse ? "Edit Reply" : "Reply"}
                  </button>

                  <button
                    onClick={() => handleDelete(review._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
