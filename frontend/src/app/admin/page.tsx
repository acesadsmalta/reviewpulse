'use client';

import { useEffect, useState, useContext } from 'react';
import {
  Building,
  Plus,
  Mail,
  Lock,
  Globe,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AdminContext } from './layout';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';

export default function AdminBusinesses() {
  const context = useContext(AdminContext);
  const { businesses = [], refreshData, loading } = context || {};

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [fetchingBranding, setFetchingBranding] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Auto-generate slug from name (only for new businesses)
  useEffect(() => {
    if (!editingBusiness) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  }, [name, editingBusiness]);

  const handleFetchBranding = async () => {
    if (!websiteUrl) {
      setFormError('Please enter a website URL first.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setFetchingBranding(true);
    try {
      const res = await api.post<any>('/public/scrape-branding', { website_url: websiteUrl });
      if (res.logo_url) setLogoUrl(res.logo_url);
      if (res.cover_url) setCoverUrl(res.cover_url);
      setFormSuccess('Successfully fetched branding from website!');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err: any) {
      setFormError('Failed to fetch branding. You can still enter URLs manually.');
    } finally {
      setFetchingBranding(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);
    try {
      if (editingBusiness) {
        await api.put(`/admin/businesses/${editingBusiness.id}`, {
          name,
          slug,
          email,
          password: password || undefined,
          website_url: websiteUrl.trim() || undefined,
          logo_url: logoUrl.trim() || undefined,
          cover_url: coverUrl.trim() || undefined,
        });
        setFormSuccess(`Successfully updated '${name}'!`);
      } else {
        await api.post('/admin/businesses', {
          name,
          slug,
          email,
          password,
          website_url: websiteUrl.trim() || undefined,
          logo_url: logoUrl.trim() || undefined,
          cover_url: coverUrl.trim() || undefined,
        });
        setFormSuccess(`Successfully registered '${name}'!`);
      }
      
      setName('');
      setSlug('');
      setEmail('');
      setPassword('');
      setWebsiteUrl('');
      setLogoUrl('');
      setCoverUrl('');
      setEditingBusiness(null);
      
      if (refreshData) await refreshData();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save business. Slug or email may be taken.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBusiness(null);
    setName('');
    setSlug('');
    setEmail('');
    setPassword('');
    setWebsiteUrl('');
    setLogoUrl('');
    setCoverUrl('');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: any) => {
    setEditingBusiness(b);
    setName(b.name);
    setSlug(b.slug);
    setEmail(b.owner_email || b.email);
    setPassword(''); // Leave password blank on edit unless modifying
    setWebsiteUrl(b.website_url || '');
    setLogoUrl(b.logo_url || '');
    setCoverUrl(b.cover_url || '');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleDeleteBusiness = async (b: any) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${b.name}"? This will delete all campaigns and reviews associated with it and cannot be undone.`
      )
    ) {
      try {
        await api.delete(`/admin/businesses/${b.id}`);
        if (refreshData) await refreshData();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete business.');
      }
    }
  };

  const handleCopyLink = (businessSlug: string) => {
    const url = `${window.location.origin}/${businessSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(businessSlug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const totalReviews = businesses.reduce((acc, curr) => acc + (curr.reviews_count || 0), 0);

  if (loading) {
    return <Loader fullScreen={false} size={40} />;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded border-l-4 border-l-[#2563EB] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Businesses</span>
          <h3 className="text-4xl font-bold text-[#0F172A] font-display mt-2">{businesses.length}</h3>
          <p className="text-xs text-slate-400 mt-2">Registered enterprise entities</p>
        </div>
        <div className="bg-white p-6 rounded shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Reviews Collected</span>
          <h3 className="text-4xl font-bold text-[#0F172A] font-display mt-2">{totalReviews}</h3>
          <p className="text-xs text-slate-400 mt-2">Active client testimonials</p>
        </div>
      </div>

      {/* Businesses Table */}
      <section className="bg-white rounded shadow-xs overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-lg">Registered Businesses</h4>
            <p className="text-xs text-slate-500 mt-0.5">Manage and monitor active platform tenants.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-white" /> Onboard Tenant
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-display font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Portal URL</th>
                <th className="px-6 py-4">Manager Password</th>
                <th className="px-6 py-4">Reviews Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-450 uppercase tracking-widest font-semibold">
                    No businesses registered yet. Click "Onboard Tenant" to add one.
                  </td>
                </tr>
              ) : (
                businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-slate-50 text-[#0F172A] font-bold flex items-center justify-center font-display text-xs overflow-hidden border border-slate-100 shrink-0">
                          {b.logo_url ? (
                            <img src={b.logo_url} alt="" className="w-full h-full object-contain p-1" />
                          ) : (
                            b.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-slate-800 text-sm font-display">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-650 font-semibold">{b.owner_email || b.email}</td>
                    <td className="px-6 py-4 text-xs font-mono text-blue-600 font-bold">
                      <a href={`/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        /{b.slug} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 font-semibold">{b.password_raw || '[Secure]'}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2.5 py-0.5 rounded bg-slate-50 border border-slate-150 font-bold text-slate-700">
                        {b.reviews_count ?? 0} Reviews
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100/50 px-3 py-1.5 rounded transition-all cursor-pointer border border-blue-200/50"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(b)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded transition-all cursor-pointer border border-rose-200/30"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                      <button
                        onClick={() => handleCopyLink(b.slug)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedSlug === b.slug ? <><Check className="h-3 w-3 text-green-650" /> Copied</> : 'Copy Link'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded border-t-4 border-t-[#2563EB] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col my-auto">
            <div className="p-6 flex flex-col flex-1 overflow-hidden space-y-4">
              <div className="flex justify-between items-start shrink-0">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0F172A]">
                    {editingBusiness ? 'Edit Tenant Details' : 'Register New Tenant'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingBusiness ? 'Modify active platform tenant brand and access configurations.' : 'Onboard a new enterprise tenant to the Pulse Review platform.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError('');
                    setFormSuccess('');
                  }}
                  className="p-1 hover:bg-slate-50 rounded transition-colors cursor-pointer border border-slate-100"
                >
                  <X className="h-4.5 w-4.5 text-slate-500" />
                </button>
              </div>

              {formError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded shrink-0 font-medium">{formError}</p>}
              {formSuccess && <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-3 rounded shrink-0 font-medium">{formSuccess}</p>}

              <form onSubmit={handleSaveBusiness} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tesla Inc."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Portal Slug Link</label>
                    <div className="relative">
                      <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="tesla"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase())}
                        className="w-full rounded border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Live link route: <code>/{slug || '[slug]'}</code></p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">Website URL</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                           placeholder="e.g. tesla.com"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={fetchingBranding || !websiteUrl}
                        onClick={handleFetchBranding}
                        className="bg-[#2563EB] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1 shrink-0"
                      >
                        {fetchingBranding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Fetch Brand'}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400">Extracts brand logo and cover image URLs via API.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Logo Image URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Cover Banner URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com/cover.jpg"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                  </div>

                  {(logoUrl || coverUrl) && (
                    <div className="p-4 bg-slate-50 rounded border border-slate-100 space-y-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#2563EB] block">Design Preview</span>
                      <div className="relative h-24 w-full rounded overflow-hidden bg-slate-900 border border-slate-100">
                        {coverUrl ? (
                          <img src={coverUrl} alt="" className="w-full h-full object-cover filter brightness-75" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#0F172A] to-blue-900/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {logoUrl && (
                          <div className="absolute bottom-2 left-3 w-10 h-10 rounded-full border border-slate-200 bg-white overflow-hidden shadow flex items-center justify-center">
                            <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-15 text-white">
                          <p className="text-[10px] font-bold tracking-wider font-display drop-shadow-sm uppercase">{name || 'Company Name'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">Manager Email</label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="manager@tesla.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      {editingBusiness ? 'New Password (Optional)' : 'Manager Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required={!editingBusiness}
                        placeholder={editingBusiness ? 'Leave empty to keep current password' : '••••••••'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormError('');
                      setFormSuccess('');
                    }}
                    type="button"
                    className="flex-1 py-3 border border-slate-200 rounded font-bold text-xs uppercase tracking-widest text-slate-500 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-xs"
                  >
                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingBusiness ? 'Save Changes' : 'Onboard Tenant')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
