"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Star, ShieldCheck, User } from "lucide-react";

export default function Reviews({ productId, productVariants = [] }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });
  const [images, setImages] = useState([]); // Base64 strings for preview and upload

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      setSubmitMessage({ text: "You can only upload up to 3 images.", type: "error" });
      return;
    }
    
    setSubmitMessage({ text: "", type: "" });
    
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    })).then(base64Images => {
      setImages(prev => [...prev, ...base64Images].slice(0, 3));
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitMessage({ text: "Please select a star rating", type: "error" });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          firebaseUid: user.uid,
          email: user.email,
          name: user.displayName || (user.email ? user.email.split('@')[0] : "Anonymous"),
          image: user.photoURL,
          rating,
          title,
          comment,
          images,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitMessage({ text: "Review submitted successfully! It will appear once approved by our team.", type: "success" });
        setIsFormOpen(false);
        setRating(0);
        setTitle("");
        setComment("");
        setImages([]);
        // Refresh reviews
        fetchReviews();
      } else {
        setSubmitMessage({ text: data.error || "Failed to submit review", type: "error" });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitMessage({ text: "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (ratingValue, size = 16) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= ratingValue
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-10 border-t border-white/10 mt-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">{stats.average.toFixed(1)}</span>
              {renderStars(Math.round(stats.average), 20)}
            </div>
            <p className="text-sm text-gray-400">Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}</p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-6 py-3 bg-white text-black font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gray-200 transition-colors"
            >
              {isFormOpen ? "Cancel Review" : "Write a Review"}
            </button>
          ) : (
            <p className="text-sm text-gray-400">Log in to write a review</p>
          )}
        </div>
      </div>

      {isFormOpen && user && (
        <div className="mb-12 p-6 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Write your review</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overall Rating *</label>
              <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={`${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-transparent text-gray-600"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full bg-black/50 border border-gray-700 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Review *</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="What did you like or dislike? How was the fit?"
                rows={4}
                className="w-full bg-black/50 border border-gray-700 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors resize-y"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attach Images (Max 3)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors"
              />
              {images.length > 0 && (
                <div className="flex gap-4 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-white/10">
                      <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submitMessage.text && (
              <p className={`text-sm ${submitMessage.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
                {submitMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-white text-black font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gray-200 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 py-8 text-center border border-white/5 rounded-lg bg-white/[0.02]">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                      {review.user?.image ? (
                        <img src={review.user.image} alt="User" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        {review.user?.displayName || "Anonymous"}
                        {review.verifiedPurchase && (
                          <span className="flex items-center text-emerald-400 text-[10px] uppercase tracking-wider font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            <ShieldCheck size={12} className="mr-1" />
                            Verified
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating, 14)}
                </div>

                <div className="flex-grow">
                  {review.title && <h4 className="text-sm font-bold text-white mb-2">{review.title}</h4>}
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">{review.comment}</p>
                  
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {review.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-white/10 group cursor-pointer">
                          <img src={img?.asset?.url} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {review.adminResponse && (
                  <div className="mt-5 p-4 bg-white/5 border-l-2 border-gray-400 rounded-r-md">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Mystique Apparel Response</p>
                    <p className="text-sm text-gray-300">{review.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
