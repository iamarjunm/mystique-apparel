"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Star, ShieldCheck, User, X, Camera } from "lucide-react";

export default function Reviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });
  const [images, setImages] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      setSubmitMessage({
        text: "You can upload up to 3 photos per review.",
        type: "error",
      });
      return;
    }

    setSubmitMessage({ text: "", type: "" });
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          })
      )
    ).then((base64Images) => {
      setImages((prev) => [...prev, ...base64Images].slice(0, 3));
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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

  const ratingBreakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      return { star, count, pct };
    });
  }, [reviews, stats.total]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitMessage({ text: "Please select a star rating.", type: "error" });
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
          name:
            user.displayName ||
            (user.email ? user.email.split("@")[0] : "Anonymous"),
          image: user.photoURL,
          rating,
          title,
          comment,
          images,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitMessage({
          text: "Review submitted. It will appear once approved by our atelier team.",
          type: "success",
        });
        setIsFormOpen(false);
        setRating(0);
        setTitle("");
        setComment("");
        setImages([]);
        fetchReviews();
      } else {
        setSubmitMessage({
          text: data.error || "Failed to submit review.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitMessage({
        text: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (ratingValue, size = 14) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= ratingValue
              ? "fill-[#0D0D0D] text-[#0D0D0D]"
              : "fill-transparent text-[#0D0D0D]/20"
          }
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <section className="py-16 border-t border-[#0D0D0D]/12 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-36 skeleton-shimmer" />
          <div className="h-36 skeleton-shimmer" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 border-t border-[#0D0D0D]/12 mt-16 text-[#0D0D0D]">
      {/* Editorial Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-center">
        <div className="lg:col-span-5 space-y-3">
          <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block">
            Verified Impressions
          </span>
          <h2 className="font-display italic text-3xl sm:text-4xl font-normal text-[#0D0D0D]">
            Client Reviews
          </h2>
          <div className="flex items-center gap-4 pt-2">
            <span className="font-display text-5xl font-normal text-[#0D0D0D] leading-none">
              {stats.average.toFixed(1)}
            </span>
            <div>
              {renderStars(Math.round(stats.average), 16)}
              <p className="font-mono-tech text-[10px] tracking-[0.22em] uppercase text-[#64625C] mt-1.5">
                Based on {stats.total} {stats.total === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>

        {/* Monochrome 5-Star Breakdown Bars */}
        <div className="lg:col-span-4 space-y-2.5">
          {ratingBreakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-3 text-xs">
              <span className="font-mono-tech text-[11px] text-[#64625C] w-7">
                {row.star}★
              </span>
              <div className="flex-1 h-1.5 bg-[#EAE8E2] overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D] transition-all duration-500"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="font-mono-tech text-[10px] text-[#64625C] w-8 text-right">
                {row.count}
              </span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 flex lg:justify-end">
          {user ? (
            <button
              type="button"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-7 py-3.5 rounded-none bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] font-mono-tech text-[11px] tracking-[0.22em] uppercase transition-colors"
            >
              {isFormOpen ? "Cancel" : "Write A Review"}
            </button>
          ) : (
            <Link
              href="/account/login"
              className="px-7 py-3.5 rounded-none border border-[#0D0D0D]/25 text-[#0D0D0D] hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-[#F6F5F1] font-mono-tech text-[11px] tracking-[0.22em] uppercase transition-colors"
            >
              Sign In To Review
            </Link>
          )}
        </div>
      </div>

      {/* Global Submission Status Banner */}
      {submitMessage.text && !isFormOpen && (
        <div
          className={`mb-8 p-4 rounded-none text-xs font-body border ${
            submitMessage.type === "error"
              ? "bg-white border-[#0D0D0D] text-[#0D0D0D]"
              : "bg-white border-[#0D0D0D]/25 text-[#0D0D0D]"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      {/* Sharp Write-A-Review Form */}
      {isFormOpen && user && (
        <div className="mb-12 p-6 sm:p-8 bg-white border border-[#0D0D0D]/12 rounded-none">
          <div className="border-b border-[#0D0D0D]/10 pb-4 mb-6">
            <span className="font-mono-tech text-[9px] tracking-[0.3em] uppercase text-[#64625C] block">
              Client Ledger
            </span>
            <h3 className="font-display italic text-2xl text-[#0D0D0D] mt-0.5">
              Share Your Experience
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.25em] uppercase text-[#64625C] mb-2">
                Overall Rating *
              </label>
              <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={24}
                      className={
                        star <= (hoverRating || rating)
                          ? "fill-[#0D0D0D] text-[#0D0D0D]"
                          : "fill-transparent text-[#0D0D0D]/25"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.25em] uppercase text-[#64625C] mb-2">
                Review Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Heavyweight drape and structured shoulder..."
                className="input-atelier w-full rounded-none px-4 py-3 text-sm font-body"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.25em] uppercase text-[#64625C] mb-2">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="Share notes on fit, fabric density, and finish..."
                rows={4}
                className="input-atelier w-full rounded-none px-4 py-3 text-sm font-body resize-y"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block font-mono-tech text-[10px] tracking-[0.25em] uppercase text-[#64625C] mb-2">
                Attach Fit Photos (Max 3)
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none bg-[#F6F5F1] border border-[#0D0D0D]/20 hover:border-[#0D0D0D] font-mono-tech text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D] cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="flex gap-3 mt-4">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-none overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/15"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 bg-[#0D0D0D] text-[#F6F5F1] w-5 h-5 flex items-center justify-center text-xs hover:bg-[#262626] transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submitMessage.text && (
              <p className="font-mono-tech text-[11px] text-[#0D0D0D]">
                {submitMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-none bg-[#0D0D0D] text-[#F6F5F1] hover:bg-[#262626] font-mono-tech text-[11px] tracking-[0.24em] uppercase transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Publish Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews Grid or Empty State */}
      {reviews.length === 0 ? (
        <div className="py-14 px-6 text-center bg-white border border-[#0D0D0D]/12 rounded-none">
          <p className="font-display italic text-2xl text-[#0D0D0D] mb-1.5">
            No Reviews Yet
          </p>
          <p className="font-body text-xs text-[#64625C]">
            Be the first to share your impressions of this garment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="p-6 bg-white border border-[#0D0D0D]/12 rounded-none flex flex-col h-full"
            >
              <div className="flex justify-between items-start gap-3 mb-4 pb-4 border-b border-[#0D0D0D]/8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center text-[#64625C] overflow-hidden flex-shrink-0">
                    {review.user?.image ? (
                      <img
                        src={review.user.image}
                        alt={review.user?.displayName || "Reviewer"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0D0D0D] flex items-center gap-2 flex-wrap">
                      <span>{review.user?.displayName || "Anonymous"}</span>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center text-[#0D0D0D] font-mono-tech text-[9px] uppercase tracking-[0.16em] bg-[#F6F5F1] border border-[#0D0D0D]/20 px-2 py-0.5">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="font-mono-tech text-[10px] text-[#64625C] mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating, 13)}
              </div>

              <div className="flex-grow">
                {review.title && (
                  <h4 className="font-body text-sm font-semibold text-[#0D0D0D] mb-1.5">
                    {review.title}
                  </h4>
                )}
                <p className="font-body text-xs sm:text-sm text-[#64625C] leading-relaxed mb-4">
                  {review.comment}
                </p>

                {review.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {review.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxPhoto(img?.asset?.url)}
                        className="w-16 h-16 rounded-none overflow-hidden bg-[#EAE8E2] border border-[#0D0D0D]/15 hover:border-[#0D0D0D] transition-colors"
                      >
                        <img
                          src={img?.asset?.url}
                          alt={`Review photo ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {review.adminResponse && (
                <div className="mt-4 p-4 bg-[#F6F5F1] border-l-2 border-[#0D0D0D]">
                  <p className="font-mono-tech text-[9px] tracking-[0.26em] uppercase text-[#0D0D0D] mb-1">
                    Mystique Atelier Response
                  </p>
                  <p className="font-body text-xs text-[#64625C] leading-relaxed">
                    {review.adminResponse}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Noir Photo Lightbox */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-[90] bg-[#0A0A0A]/95 flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            aria-label="Close photo"
            className="absolute top-6 right-6 w-11 h-11 rounded-none bg-[#141414] border border-[#F4F2ED]/20 flex items-center justify-center text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Customer review photo"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-none object-contain border border-[#F4F2ED]/15"
          />
        </div>
      )}
    </section>
  );
}
