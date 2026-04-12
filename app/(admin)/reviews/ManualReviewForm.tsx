"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

interface Worker {
  user_id: string;
  name: string;
  email: string;
}

interface ShiftOption {
  id: string;
  title: string;
  start_time: string;
  business_name: string;
  worker_id: string | null;
}

export default function ManualReviewForm({
  workers,
  shifts,
}: {
  workers: Worker[];
  shifts: ShiftOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerType, setReviewerType] = useState<"BUSINESS" | "WORKER">(
    "BUSINESS"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker_id: selectedWorkerId,
        shift_id: selectedShiftId || null,
        rating,
        comment,
        reviewer_type: reviewerType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setComment("");
    setRating(5);
    setSelectedWorkerId("");
    setSelectedShiftId("");
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          ✓ Review added successfully
        </div>
      )}

      {/* Worker */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Worker <span className="text-error">*</span>
        </label>
        <select
          value={selectedWorkerId}
          onChange={(e) => setSelectedWorkerId(e.target.value)}
          required
          className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Select a barista…</option>
          {workers.map((w) => (
            <option key={w.user_id} value={w.user_id}>
              {w.name} ({w.email})
            </option>
          ))}
        </select>
      </div>

      {/* Shift (optional) */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Link to shift (optional)
        </label>
        <select
          value={selectedShiftId}
          onChange={(e) => setSelectedShiftId(e.target.value)}
          className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">No shift linked (external review)</option>
          {shifts
            .filter(
              (s) =>
                !selectedWorkerId || s.worker_id === selectedWorkerId
            )
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.business_name} · {s.title} ·{" "}
                {new Date(s.start_time).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                })}
              </option>
            ))}
        </select>
        <p className="text-xs text-muted mt-1">
          Required if the review is for a Cuppa shift. Leave blank for reviews
          imported from other platforms.
        </p>
      </div>

      {/* Reviewer type */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Review type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["BUSINESS", "WORKER"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setReviewerType(type)}
              className={cn(
                "px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                reviewerType === type
                  ? "border-brand bg-brand-light text-brand"
                  : "border-border text-muted hover:border-brand/40"
              )}
            >
              {type === "BUSINESS" ? "Business → Worker" : "Worker → Business"}
            </button>
          ))}
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">
          Rating <span className="text-error">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={cn(
                "text-2xl transition-all",
                star <= rating ? "text-brand" : "text-border"
              )}
            >
              ★
            </button>
          ))}
          <span className="self-center text-sm text-muted ml-1">
            {rating}/5
          </span>
        </div>
      </div>

      {/* Comment */}
      <Textarea
        label="Review comment (optional)"
        placeholder="e.g. Excellent espresso skills, punctual, great attitude under pressure."
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button type="submit" loading={loading} size="lg">
        Add review
      </Button>
    </form>
  );
}
