'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Search, Filter, AlertCircle, Megaphone, UserCheck, CornerDownRight, ArrowRight } from 'lucide-react';
import { DashboardContext } from './layout';
import { api } from '@/lib/api';

export default function DashboardOverview() {
  const router = useRouter();
  const context = useContext(DashboardContext);

  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({});

  const {
    reviews = [],
    campaigns = [],
    businessDetail,
    refreshData,
  } = context || {};

  // Auto-refresh updates
  useEffect(() => {
    if (refreshData) {
      refreshData();
      const interval = setInterval(refreshData, 20000);
      return () => clearInterval(interval);
    }
  }, [refreshData]);

  const handleSendReply = async (reviewId: string) => {
    const text = replyTexts[reviewId]?.trim();
    if (!text) return;
    setReplyLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await api.post(`/reviews/${reviewId}/reply`, { reply_text: text });
      setReplyTexts((prev) => ({ ...prev, [reviewId]: '' }));
      if (refreshData) await refreshData();
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setReplyLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

  const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalPending = campaigns.reduce((acc, c) => acc + c.pending, 0);
  const clientsContacted = totalSent + totalPending || 0;
  const responseRate = clientsContacted > 0 ? Math.round((totalReviews / clientsContacted) * 100) : 0;

  const negativeReviews = reviews.filter((r) => r.rating <= 2);
  const unresolvedAlerts = negativeReviews.filter((r) => !r.admin_reply);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.reviewer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer_email.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(search.toLowerCase())) ||
      (r.service && r.service.toLowerCase().includes(search.toLowerCase()));
    const matchesStar = starFilter === 'all' || r.rating === starFilter;
    return matchesSearch && matchesStar;
  });

  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <section className="grid gap-6 md:grid-cols-4">
        <div className="bg-white p-6 rounded shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clients Contacted</span>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">+28 this week</span>
          </div>
          <h3 className="text-3xl font-bold text-[#0F172A] font-display mt-4">{clientsContacted}</h3>
        </div>
        <div className="bg-white p-6 rounded border-l-4 border-l-[#2563EB] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg. Rating</span>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">+0.2 vs last mo</span>
          </div>
          <h3 className="text-3xl font-bold text-[#0F172A] font-display mt-4">
            {averageRating} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
          </h3>
        </div>
        <div className="bg-white p-6 rounded shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Response Rate</span>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">+5%</span>
          </div>
          <h3 className="text-3xl font-bold text-[#0F172A] font-display mt-4">{responseRate}%</h3>
        </div>
        <div className="bg-white p-6 rounded shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Negative Alerts</span>
            {unresolvedAlerts.length > 0 && (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">{unresolvedAlerts.length} unresolved</span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-[#0F172A] font-display mt-4">{negativeReviews.length}</h3>
        </div>
      </section>

      {/* Campaigns Table */}
      <section className="bg-white rounded shadow-sm overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
            <Megaphone className="h-4.5 w-4.5 text-[#2563EB]" /> Active Outreach Campaigns
          </h4>
          <p className="text-xs text-slate-500">Track communication templates and response averages.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-display font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sent</th>
                <th className="px-6 py-4">Pending</th>
                <th className="px-6 py-4">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-xs text-slate-500">
                    No active campaigns seeded.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 font-display">{c.name}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                        c.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200'
                          : c.status === 'Complete' ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">{c.sent}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.pending}</td>
                    <td className="px-6 py-4 text-xs font-bold text-[#FBBF24] flex items-center gap-0.5">
                      {c.status === 'Paused' ? '3.9' : c.status === 'Complete' ? '4.6' : '4.3'}
                      <Star className="h-3.5 w-3.5 fill-[#FBBF24] text-[#FBBF24] inline" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Negative Alerts Inbox */}
      {negativeReviews.length > 0 && (
        <section className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-500/5">
            <div>
              <h4 className="font-display font-bold text-rose-800 text-sm flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-rose-700 animate-bounce" /> Negative Alerts Dashboard Inbox
              </h4>
              <p className="text-xs text-rose-700/80">Immediate resolution center for feedback rated 2 stars or below.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
              {unresolvedAlerts.length} Action Needed
            </span>
          </div>
          <div className="p-6 divide-y divide-slate-100 space-y-4">
            {negativeReviews.map((alert) => (
              <div key={alert.id} className="pt-4 first:pt-0 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 font-display">{alert.reviewer_name}</h5>
                    <p className="text-[10px] text-slate-500">{alert.reviewer_email} | Service: <span className="font-semibold text-slate-700">{alert.service}</span></p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-50 border border-rose-100 uppercase tracking-widest">{alert.rating} Star Review</span>
                    <span className="text-[10px] text-slate-500 mt-1">{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-xs italic text-slate-800 leading-relaxed bg-rose-500/5 p-4 rounded border border-rose-200/20">
                  "{alert.comment || 'No comment left.'}"
                </p>
                {alert.admin_reply ? (
                  <div className="pl-6 flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded">
                    <CornerDownRight className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-800 block">Your Resolution Reply:</span>
                      <p className="italic mt-1">"{alert.admin_reply}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pl-4">
                    <input
                      type="text"
                      placeholder="Type your resolution reply to customer..."
                      value={replyTexts[alert.id] || ''}
                      onChange={(e) => setReplyTexts((prev) => ({ ...prev, [alert.id]: e.target.value }))}
                      className="flex-1 rounded border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                    />
                    <button
                      onClick={() => handleSendReply(alert.id)}
                      disabled={replyLoading[alert.id]}
                      className="bg-[#2563EB] text-white font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded hover:bg-blue-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {replyLoading[alert.id] ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Client Sentiment Feed */}
      <section className="bg-white rounded shadow-sm overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-[#2563EB]" /> Client Sentiment Log
            </h4>
            <p className="text-xs text-slate-500">Monitor customer feedback metrics and automated reward codes.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search client name, service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
              />
            </div>
            <div className="relative w-full sm:w-40 flex items-center">
              <Filter className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={starFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setStarFilter(val === 'all' ? 'all' : Number(val));
                }}
                className="w-full rounded border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-display font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Automated Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-xs text-slate-500">
                    No sentiment records match the search parameters.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-850 block font-display text-xs">{r.reviewer_name}</span>
                      <span className="text-[10px] text-slate-400">{r.reviewer_email}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">{r.service || 'General Service'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                        r.status === 'Voucher Sent' ? 'bg-green-50 text-green-700 border border-green-200'
                          : r.status === 'Alert Triggered' ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
