'use client';

import { useState, useEffect, useContext } from 'react';
import { Settings, User, Building, Lock, Megaphone, Globe, Save, Loader2 } from 'lucide-react';
import { DashboardContext } from '../layout';
import { api } from '@/lib/api';

export default function DashboardSettings() {
  const context = useContext(DashboardContext);
  const { businessDetail, setBusinessDetail, refreshData } = context || {};

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [gmbUrl, setGmbUrl] = useState('');

  useEffect(() => {
    if (businessDetail) {
      setBusinessName(businessDetail.name || '');
      setPromoCode(businessDetail.promo_code || '');
      setGmbUrl(businessDetail.gmb_url || '');
    }
    
    // Fetch owner name from local storage or profile request
    const storedUser = localStorage.getItem('pulse_review_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setOwnerName(u.name || '');
      } catch {
        // Fallback
      }
    }
  }, [businessDetail]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessDetail) return;

    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const payload: any = {
        name: businessName.trim(),
        owner_name: ownerName.trim(),
        promo_code: promoCode.trim(),
        gmb_url: gmbUrl.trim(),
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const updated = await api.put<any>('/dashboard/profile', payload);

      if (setBusinessDetail) {
        setBusinessDetail(updated);
      }
      if (refreshData) {
        await refreshData();
      }

      // Update stored user name locally
      const storedUser = localStorage.getItem('pulse_review_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          u.name = ownerName.trim();
          localStorage.setItem('pulse_review_user', JSON.stringify(u));
        } catch {
          // Ignore
        }
      }

      setPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!businessDetail) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-xs border-t-4 border-t-[#2563EB] p-6 rounded">
        <span className="text-sm font-bold text-[#2563EB] uppercase tracking-widest block">System Preferences</span>
        <h3 className="font-display text-2xl font-bold text-[#0d1527] tracking-tight">Business Settings</h3>
        <p className="text-sm text-slate-500 mt-1">Configure profile details, integration endpoints, credentials, and review promotions.</p>
      </div>

      <div className="max-w-2xl bg-white shadow-xs p-6 rounded border border-slate-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="h-4.5 w-4.5 text-[#2563EB]" />
            <h4 className="font-display font-bold text-sm text-[#0d1527] uppercase tracking-wider">Configure Settings</h4>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-4 rounded font-medium animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 p-4 rounded font-medium animate-fade-in">
              Settings updated successfully! Changes will take effect immediately.
            </div>
          )}

          {/* Account Profile Section */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Account Profile
            </h5>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#2563EB]" /> Personal Name
              </label>
              <input
                type="text"
                required
                disabled={saving}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="E.g. John Doe"
                className="w-full rounded border border-slate-200 bg-white py-2.5 px-4 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-[#2563EB]" /> Business Name
              </label>
              <input
                type="text"
                required
                disabled={saving}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="E.g. Star Cafe"
                className="w-full rounded border border-slate-200 bg-white py-2.5 px-4 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 opacity-70">
                <Globe className="h-3.5 w-3.5 text-slate-400" /> Portal Slug (URL Route)
              </label>
              <input
                type="text"
                disabled={true}
                value={businessDetail?.slug || ''}
                className="w-full rounded border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-400 font-mono font-bold cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 italic">
                Only administrators can modify your custom URL slug.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#2563EB]" /> New Password (Optional)
              </label>
              <input
                type="password"
                disabled={saving}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                className="w-full rounded border border-slate-200 bg-white py-2.5 px-4 text-xs text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all font-semibold font-mono"
              />
            </div>
          </div>

          {/* Promotion Campaign Code */}
          <div className="space-y-4 pt-2">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Promotion Campaign Code
            </h5>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5 text-[#2563EB]" /> Promo Code for Good Reviews
              </label>
              <input
                type="text"
                disabled={saving}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="E.g. THANKYOU50, OFF20"
                className="w-full rounded border border-slate-200 bg-white py-2.5 px-4 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all font-semibold"
              />
              <p className="text-[10px] text-slate-400 italic">
                This promotional code will be automatically presented to customers who submit 4 or 5-star feedback.
              </p>
            </div>
          </div>

          {/* Google Integration */}
          <div className="space-y-4 pt-2">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Google Integration
            </h5>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#2563EB]" /> GMB (Google My Business) URL
              </label>
              <input
                type="url"
                disabled={saving}
                value={gmbUrl}
                onChange={(e) => setGmbUrl(e.target.value)}
                placeholder="https://g.page/r/your-gmb-profile-id/review"
                className="w-full rounded border border-slate-200 bg-white py-2.5 px-4 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all font-semibold"
              />
              <p className="text-[10px] text-slate-400 italic">
                Your Google reviews destination link. Customers giving positive ratings will be redirected here.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 px-6 rounded font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" /> Saving Settings...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-white" /> Save Settings Guidelines
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
