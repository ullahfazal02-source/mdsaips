import React, { useState } from 'react';
import { Star, Send, Tag, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useReview from '../../hooks/useReview';

/**
 * ReviewForm Component
 * Renders interactive Star Selector (1-5), Title, Comment, and Tag pills.
 */
export const ReviewForm = ({ booking, onReviewSubmitted, className = '' }) => {
  const { submitNewReview, submitting } = useReview();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['professional', 'would_recommend']);

  if (!booking) return null;

  const allowedTags = [
    { key: 'on_time', label: 'Punctual / On Time' },
    { key: 'professional', label: 'Professional Service' },
    { key: 'good_value', label: 'Great Value' },
    { key: 'great_quality', label: 'Exceptional Quality' },
    { key: 'would_recommend', label: 'Highly Recommend' },
  ];

  const toggleTag = (key) => {
    if (selectedTags.includes(key)) {
      setSelectedTags(selectedTags.filter((t) => t !== key));
    } else {
      setSelectedTags([...selectedTags, key]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating between 1 and 5');
      return;
    }

    try {
      const payload = {
        bookingId: booking._id,
        serviceId: booking.serviceId?._id || booking.serviceId,
        rating,
        title,
        comment,
        tags: selectedTags,
      };

      const res = await submitNewReview(payload);
      if (res && res.success) {
        toast.success('Thank you! Your verified review has been published.');
        if (onReviewSubmitted) onReviewSubmitted(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`glass-card p-6 rounded-3xl border border-slate-800 space-y-6 ${className}`}>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Write a Verified Service Review</span>
        </h3>
        <p className="text-xs text-slate-400">Share your genuine experience with the community for this completed service.</p>
      </div>

      {/* Star Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
          Rating (1 to 5 Stars) *
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating || rating) >= star;
            return (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                  }`}
                />
              </button>
            );
          })}
          <span className="text-sm font-extrabold text-amber-300 ml-2">{rating}.0 / 5.0</span>
        </div>
      </div>

      {/* Review Title */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-300 block">Headline / Title (Optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Breathtaking decorations & punctual team!"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Review Comment */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-300 block">Detailed Review & Experience</label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you love about this service? How was the provider's communication and quality?"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors resize-none"
        />
      </div>

      {/* Review Tags Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block flex items-center space-x-1">
          <Tag className="w-3.5 h-3.5 text-brand-400" />
          <span>Select Key Tags</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {allowedTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.key);
            return (
              <button
                type="button"
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white font-bold border border-brand-500 shadow-md shadow-brand-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                + {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        disabled={submitting}
        type="submit"
        className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? 'Publishing Review...' : 'Submit Verified Review'}</span>
      </button>
    </form>
  );
};

export default ReviewForm;
