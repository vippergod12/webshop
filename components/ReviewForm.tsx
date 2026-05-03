"use client";

import { useState } from "react";
import StarRatingEditable from "./StarRatingEditable";
import { apiFetch } from "@/lib/api-client";

type Props = { productId: number };

export default function ReviewForm({ productId }: Props) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !comment.trim()) {
      setError("Vui lòng điền tên và nội dung đánh giá.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Nội dung đánh giá phải dài tối thiểu 10 ký tự.");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          customer_name: name.trim(),
          customer_email: email.trim() || null,
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        }),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setTitle("");
      setComment("");
      setRating(5);
    } catch (err: any) {
      setError(err?.message || "Không gửi được đánh giá");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="review-form review-form--success">
        <h4>Cảm ơn bạn đã đánh giá! ✨</h4>
        <p>
          Đánh giá của bạn đã được gửi và đang chờ admin duyệt. Bài viết sẽ
          xuất hiện công khai trong thời gian sớm nhất.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setSuccess(false)}
        >
          Viết đánh giá khác
        </button>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={onSubmit}>
      <h3>Viết đánh giá của bạn</h3>

      <div className="review-form__rating">
        <span className="review-form__label">Đánh giá tổng:</span>
        <StarRatingEditable value={rating} size={26} onChange={setRating} />
        <span className="review-form__rating-num">{rating}/5</span>
      </div>

      <div className="review-form__row">
        <label className="field">
          <span>Họ và tên *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            required
          />
        </label>
        <label className="field">
          <span>Email (không bắt buộc)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </label>
      </div>

      <label className="field">
        <span>Tiêu đề</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cảm nghĩ chung về sản phẩm"
        />
      </label>

      <label className="field">
        <span>Nội dung đánh giá *</span>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          required
        />
      </label>

      {error ? <div className="form-error">{error}</div> : null}

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}
