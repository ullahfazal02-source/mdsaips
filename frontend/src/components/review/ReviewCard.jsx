import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, MessageSquare, CornerDownRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import useReview from '../../hooks/useReview';

/**
 * ReviewCard Component
 * Displays customer review, verified badge, rating, tags, helpful counter, and vendor reply.
 */
export const ReviewCard = ({ review, isVendorView = false, onReplySubmitted, className = '' }) => {
  const { markHelpful, postReply } = useReview();
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  if (!review) return null;

  const {
    _id,
    customer = {},
    rating = 5,
    title,
    comment,
    tags = [],
    isVerified,
    helpfulCount = 0,
    vendorReply,
    createdAt,
  } = review;

  const handleHelpfulClick = async () => {
    try {
      const res = await markHelpful(_id);
      if (res && res.message) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Failed to register helpful vote');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await postReply({ reviewId: _id, message: replyMessage });
      if (res && res.success) {
        toast.success('Vendor reply posted successfully!');
        setShowReplyInput(false);
        setReplyMessage('');
        if (onReplySubmitted) onReplySubmitted(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post vendor reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const tagLabels = {
    on_time: 'Punctual / On Time',
    professional: 'Professional',
    good_value: 'Great Value',
    great_quality: 'Great Quality',
    would_recommend: 'Would Recommend',
  };

  return (
    <div className={`glass-card p-6 rounded-2xl border border-slate-800 space-y-4 ${className}`}>
      {/* Top Row: Customer Info & Rating */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-sm">
            {customer.avatar ? (
              <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              (customer.name || 'C').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white">{customer.name || 'Verified Customer'}</h4>
              {isVerified && (
                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Purchase</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Star Rating Display */}
        <div className="flex items-center space-x-1 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-extrabold text-amber-300">{rating}.0</span>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        {title && <h5 className="text-sm font-bold text-white leading-snug">{title}</h5>}
        {comment && <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{comment}</p>}
      </div>

      {/* Tags List */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tagKey) => (
            <span
              key={tagKey}
              className="px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-semibold"
            >
              #{tagLabels[tagKey] || tagKey}
            </span>
          ))}
        </div>
      )}

      {/* Actions & Helpful Counter */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
        <button
          onClick={handleHelpfulClick}
          className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-brand-400 transition-colors font-medium"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Helpful ({helpfulCount})</span>
        </button>

        {isVendorView && !vendorReply?.message && (
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="inline-flex items-center space-x-1.5 text-brand-400 hover:text-brand-300 font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply to Review</span>
          </button>
        )}
      </div>

      {/* Vendor Reply Display */}
      {vendorReply && vendorReply.message && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 mt-2 text-xs">
          <div className="flex items-center justify-between text-brand-400 font-bold text-[11px]">
            <span className="flex items-center space-x-1">
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Vendor Response</span>
            </span>
            <span className="text-slate-500 font-normal">
              {new Date(vendorReply.repliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed pl-4">{vendorReply.message}</p>
        </div>
      )}

      {/* Inline Vendor Reply Input Form */}
      {isVendorView && showReplyInput && !vendorReply?.message && (
        <form onSubmit={handlePostReply} className="pt-3 space-y-2 border-t border-slate-800">
          <textarea
            rows={3}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Write an official response to your customer's review..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowReplyInput(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={submittingReply || !replyMessage.trim()}
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Post Reply</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewCard;
