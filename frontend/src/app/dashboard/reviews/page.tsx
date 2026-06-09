'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Star,
  Search,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Award,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { DashboardContext } from '../layout';
import { api } from '@/lib/api';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-slate-200'}`}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Voucher Sent') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
        <CheckCircle className="h-2.5 w-2.5" /> Voucher Sent
      </span>
    );
  }
  if (status === 'Alert Triggered') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="h-2.5 w-2.5" /> Alert Triggered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="h-2.5 w-2.5" /> Pending
    </span>
  );
}

export default function DashboardReviews() {
  const context = useContext(DashboardContext);
  const { reviews = [], refreshData } = context || {};
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  // Resolution reply states
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (refreshData) {
      refreshData();
      const interval = setInterval(refreshData, 15000);
      return () => clearInterval(interval);
    }
  }, [refreshData]);

  const handleSendReplyFromModal = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await api.post(`/reviews/${reviewId}/reply`, { reply_text: replyText.trim() });
      setReplyText('');
      if (refreshData) await refreshData();
      
      // Update selected review object locally to display the reply in the open modal
      setSelectedReview((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          admin_reply: replyText.trim(),
          replied_at: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      !search ||
      r.reviewer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer_email.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(search.toLowerCase())) ||
      (r.service && r.service.toLowerCase().includes(search.toLowerCase()));
    const matchRating =
      filterRating === 'all' || r.rating === Number(filterRating);
    const matchStatus =
      filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchRating && matchStatus;
  });

  const avgRating =
    filtered.length > 0
      ? (
          filtered.reduce((acc, r) => acc + r.rating, 0) / filtered.length
        ).toFixed(1)
      : '—';

  const positiveCount = filtered.filter((r) => r.rating >= 4).length;
  const negativeCount = filtered.filter((r) => r.rating <= 2).length;

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded border-l-4 border-l-[#d4af37] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Reviews
          </p>
          <h3 className="text-3xl font-bold text-[#0d1527] font-display mt-1">
            {filtered.length}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Feedback items</p>
        </div>
        <div className="bg-white p-6 rounded shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Avg. Rating
          </p>
          <h3 className="text-3xl font-bold text-[#0d1527] font-display mt-1 flex items-end gap-1">
            {avgRating}
            <span className="text-[#d4af37] text-xl">★</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Active customer average</p>
        </div>
        <div className="bg-white p-6 rounded border-l-4 border-l-green-500 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Positive (4–5★)
          </p>
          <h3 className="text-3xl font-bold text-green-600 font-display mt-1">
            {positiveCount}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Good ratings</p>
        </div>
        <div className="bg-white p-6 rounded border-l-4 border-l-rose-500 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Negative (1–2★)
          </p>
          <h3 className="text-3xl font-bold text-rose-600 font-display mt-1">
            {negativeCount}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Attention requested</p>
        </div>
      </div>

      {/* Reviews Table */}
      <section className="bg-white rounded shadow-xs overflow-hidden border border-slate-100">
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-lg">
              Customer Reviews
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and audit customer feedback items.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviewer, comment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
              />
            </div>
            {/* Rating filter */}
            <div className="relative w-full sm:w-36">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
            {/* Status filter */}
            <div className="relative w-full sm:w-40">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Voucher Sent">Voucher Sent</option>
                <option value="Alert Triggered">Alert Triggered</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#faf8f5] text-slate-500 font-display font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider"
                  >
                    No reviews matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isPositive = r.rating >= 4;
                  const isNegative = r.rating <= 2;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-display shrink-0 ${
                              isPositive
                                ? 'bg-green-600'
                                : isNegative
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          >
                            {r.reviewer_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 font-display leading-tight">
                              {r.reviewer_name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {r.reviewer_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StarDisplay rating={r.rating} />
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {r.service || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReview(r);
                            setReplyText('');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d4af37] bg-amber-500/5 hover:bg-amber-500/10 px-3 py-1.5 rounded transition-all cursor-pointer border border-amber-500/15"
                          id={`view-review-${r.id}`}
                        >
                          <Eye className="h-3 w-3" /> View & Reply
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedReview && (() => {
        const r = selectedReview;
        const isPositive = r.rating >= 4;
        const isNegative = r.rating <= 2;
        const sentimentColor = isPositive
          ? 'border-t-green-500'
          : isNegative
          ? 'border-t-rose-500'
          : 'border-t-amber-400';

        return (
          <div className="fixed inset-0 bg-[#0d1527]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div
              className={`bg-white w-full max-w-lg rounded border-t-4 ${sentimentColor} overflow-hidden shadow-xl max-h-[90vh] flex flex-col`}
            >
              {/* Modal Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-start shrink-0">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4af37] block mb-1">
                    Review Detail
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">
                    {r.reviewer_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submitted on {formatDate(r.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-1 hover:bg-slate-50 rounded transition-colors cursor-pointer border border-slate-100"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Rating + Status Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={r.rating} />
                      <span className="text-sm font-bold text-slate-900 font-display">
                        {r.rating} / 5.0
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                {/* Comment */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-[#d4af37]" />
                    Review Comment
                  </p>
                  <blockquote className="text-xs text-slate-800 leading-relaxed italic border-l-2 border-[#d4af37] pl-4 py-1.5 bg-slate-50/50 pr-2 rounded">
                    "{r.comment || 'No comment provided.'}"
                  </blockquote>
                </div>

                {/* Service */}
                {r.service && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Award className="h-4 w-4 text-[#d4af37] shrink-0" />
                    <span>
                      Service Selected:{' '}
                      <span className="font-bold text-slate-700">{r.service}</span>
                    </span>
                  </div>
                )}

                {/* Contact info */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Reviewer Contact
                  </p>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded text-xs border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{r.reviewer_email}</span>
                    </div>
                    {r.reviewer_phone && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{r.reviewer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Reply or Reply Form */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {r.admin_reply ? (
                    <div className="p-4 bg-slate-50 rounded border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-[#d4af37]" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Your Reply
                        </p>
                      </div>
                      <p className="text-xs text-slate-800 italic leading-relaxed">
                        "{r.admin_reply}"
                      </p>
                      {r.replied_at && (
                        <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{' '}
                          Replied: {formatDate(r.replied_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Send Resolution Reply
                      </p>
                      <textarea
                        rows={3}
                        placeholder="Write a message to this customer..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white py-2 px-3 text-xs text-slate-850 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all resize-none"
                      />
                      <button
                        onClick={() => handleSendReplyFromModal(r.id)}
                        disabled={replyLoading || !replyText.trim()}
                        className="w-full bg-[#0d1527] hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] py-2.5 rounded transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {replyLoading ? 'Sending Response...' : 'Send Reply'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="w-full py-2 border border-slate-200 rounded font-bold text-xs uppercase tracking-widest text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
