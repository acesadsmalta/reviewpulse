'use client';

import { useState, useEffect, useContext } from 'react';
import { Search, ChevronDown, Copy, Check, Users, ShieldAlert, Award, Star, UserCheck } from 'lucide-react';
import { DashboardContext } from '../layout';

export default function DashboardCustomers() {
  const context = useContext(DashboardContext);
  const { reviews = [], refreshData } = context || {};

  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState<'all' | 'Good/Loyal' | 'Critical/Detractor' | 'Neutral'>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (refreshData) {
      refreshData();
      const interval = setInterval(refreshData, 15000);
      return () => clearInterval(interval);
    }
  }, [refreshData]);

  // Aggregate reviews into unique customer profiles (grouped by email)
  const customersMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    reviewsCount: number;
    avgRating: number;
    gmbClicksCount: number;
    segment: 'Good/Loyal' | 'Critical/Detractor' | 'Neutral';
  }>();

  reviews.forEach((r) => {
    const emailKey = r.reviewer_email?.toLowerCase().trim() || 'no-email';
    const rating = r.rating || 0;
    const gmbClickVal = r.gmb_clicked ? 1 : 0;
    const existing = customersMap.get(emailKey);

    if (existing) {
      existing.reviewsCount += 1;
      existing.avgRating = (existing.avgRating * (existing.reviewsCount - 1) + rating) / existing.reviewsCount;
      existing.gmbClicksCount += gmbClickVal;
      if (r.reviewer_phone && (!existing.phone || existing.phone === '—')) {
        existing.phone = r.reviewer_phone;
      }
    } else {
      customersMap.set(emailKey, {
        name: r.reviewer_name || 'Anonymous User',
        email: r.reviewer_email || '—',
        phone: r.reviewer_phone || '—',
        reviewsCount: 1,
        avgRating: rating,
        gmbClicksCount: gmbClickVal,
        segment: 'Neutral',
      });
    }
  });

  const rawCustomersList = Array.from(customersMap.values()).map((c) => {
    c.avgRating = Number(c.avgRating.toFixed(1));
    if (c.avgRating >= 4.0) {
      c.segment = 'Good/Loyal';
    } else if (c.avgRating <= 2.0) {
      c.segment = 'Critical/Detractor';
    } else {
      c.segment = 'Neutral';
    }
    return c;
  });

  // Filter and search customers
  const filteredCustomers = rawCustomersList.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());
    const matchSegment = filterSegment === 'all' || c.segment === filterSegment;
    return matchSearch && matchSegment;
  });

  const handleCopyInfo = (customer: any) => {
    const text = `Name: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(customer.email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const segmentCounts = {
    all: rawCustomersList.length,
    loyal: rawCustomersList.filter((c) => c.segment === 'Good/Loyal').length,
    critical: rawCustomersList.filter((c) => c.segment === 'Critical/Detractor').length,
    neutral: rawCustomersList.filter((c) => c.segment === 'Neutral').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded border-l-4 border-l-blue-600 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Contacts</p>
          <h3 className="text-3xl font-bold text-[#0F172A] font-display mt-1">{segmentCounts.all}</h3>
          <p className="text-xs text-slate-400 mt-1">Unique customer profiles</p>
        </div>
        <div className="bg-white p-6 rounded border-l-4 border-l-green-500 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Good & Loyal</p>
          <h3 className="text-3xl font-bold text-green-600 font-display mt-1">{segmentCounts.loyal}</h3>
          <p className="text-xs text-slate-400 mt-1">Avg Rating ≥ 4.0 ★</p>
        </div>
        <div className="bg-white p-6 rounded border-l-4 border-l-amber-500 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Neutral Clients</p>
          <h3 className="text-3xl font-bold text-amber-500 font-display mt-1">{segmentCounts.neutral}</h3>
          <p className="text-xs text-slate-400 mt-1">Avg Rating 3.0 ★</p>
        </div>
        <div className="bg-white p-6 rounded border-l-4 border-l-rose-500 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Critical Detractors</p>
          <h3 className="text-3xl font-bold text-rose-600 font-display mt-1">{segmentCounts.critical}</h3>
          <p className="text-xs text-slate-400 mt-1">Avg Rating ≤ 2.0 ★</p>
        </div>
      </div>

      {/* Main Table Segment */}
      <section className="bg-white rounded shadow-xs overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" /> Customer Contacts
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Filter, extract, and copy customer credentials for promotional outreach.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
              />
            </div>
            {/* Filter by segment */}
            <div className="relative w-full sm:w-48">
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value as any)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Segments ({segmentCounts.all})</option>
                <option value="Good/Loyal">Good/Loyal ({segmentCounts.loyal})</option>
                <option value="Neutral">Neutral ({segmentCounts.neutral})</option>
                <option value="Critical/Detractor">Critical/Detractor ({segmentCounts.critical})</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-display font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Segment Status</th>
                <th className="px-6 py-4">Engagement Metrics</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    No customers found matching the search/filter parameters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isLoyal = c.segment === 'Good/Loyal';
                  const isCritical = c.segment === 'Critical/Detractor';
                  return (
                    <tr key={c.email} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-display shrink-0 ${
                            isLoyal ? 'bg-green-600' : isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs font-bold text-slate-800 font-display leading-tight">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">{c.email}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">{c.phone}</td>
                      <td className="px-6 py-4">
                        {isLoyal ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                            <Award className="h-2.5 w-2.5" /> Good/Loyal
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="h-2.5 w-2.5" /> Critical
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            Neutral
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500">
                            Feedbacks: <strong className="text-slate-800">{c.reviewsCount}</strong>
                          </span>
                          <span className="text-slate-500 flex items-center gap-0.5">
                            Avg: <strong className="text-slate-800">{c.avgRating}</strong>
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          </span>
                          {c.gmbClicksCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1 rounded-sm text-[8px] bg-blue-50 text-blue-700 font-bold border border-blue-150 uppercase tracking-widest">
                              {c.gmbClicksCount} GMB Click{c.gmbClicksCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCopyInfo(c)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-all cursor-pointer border border-blue-200/50"
                        >
                          {copiedEmail === c.email ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Info</span>
                            </>
                          )}
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
    </div>
  );
}
