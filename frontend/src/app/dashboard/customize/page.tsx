'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  Loader2,
  Star,
  Eye,
  Upload,
  Building,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DashboardContext } from '../layout';
import { api } from '@/lib/api';
import { parseBranding, serializeBranding } from '@/lib/branding';

const FONTS_LIST = [
  // Clean Sans-Serif
  'Outfit',
  'Inter',
  'Poppins',
  'Montserrat',
  'Open Sans',
  'Roboto',
  'Lato',
  'Raleway',
  'Nunito',
  'Rubik',
  'Ubuntu',
  'Work Sans',
  'DM Sans',
  'Quicksand',
  'Kanit',
  'Plus Jakarta Sans',
  'Space Grotesk',
  'Oswald',
  // Elegant Serifs
  'Playfair Display',
  'Lora',
  'Merriweather',
  'PT Serif',
  'Crimson Text',
  'Libre Baskerville',
  'EB Garamond',
  'Cormorant Garamond',
  'Cinzel',
  'Prata',
  'Fraunces',
  'DM Serif Display',
  'Arvo',
  // Fancy Decorative, Display & Scripts
  'Cinzel Decorative',
  'Dancing Script',
  'Pacifico',
  'Sacramento',
  'Great Vibes',
  'Lobster',
  'Alex Brush',
  'Satisfy',
  'Pinyon Script',
  'Bebas Neue',
  'Abril Fatface',
  'Righteous',
  'Syne',
  'Lexend',
];

export default function DashboardCustomize() {
  const context = useContext(DashboardContext);
  const { businessDetail, setBusinessDetail, refreshData } = context || {};

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Branding Fields
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [bgColor, setBgColor] = useState('#0d1527');
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#d4af37');
  const [fontFamily, setFontFamily] = useState('Outfit');
  const [logoError, setLogoError] = useState(false);
  const [mockSelectedServices, setMockSelectedServices] = useState<string[]>([]);

  // Load business values on mount/load
  useEffect(() => {
    if (businessDetail) {
      setLogoUrl(businessDetail.logo_url || '');
      setCoverUrl(businessDetail.cover_url || '');
      
      const parsed = parseBranding(businessDetail.website_url);
      setWebsiteInput(parsed.websiteOnlyUrl);
      setBgColor(parsed.bgColor);
      setTextColor(parsed.textColor);
      setAccentColor(parsed.accentColor);
      setFontFamily(parsed.fontFamily);
    }
  }, [businessDetail]);

  const handleBgChange = (newBg: string) => {
    setBgColor(newBg);
    const hex = newBg.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      if (yiq >= 128) {
        setTextColor('#0d1527');
        setAccentColor('#735c00');
      } else {
        setTextColor('#ffffff');
        setAccentColor('#d4af37');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessDetail) return;

    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      const finalWebsiteUrl = serializeBranding(websiteInput, {
        bgColor,
        textColor,
        accentColor,
        fontFamily,
      });

      const updated = await api.put<any>('/dashboard/profile', {
        logo_url: logoUrl.trim(),
        cover_url: coverUrl.trim(),
        website_url: finalWebsiteUrl,
      });

      if (setBusinessDetail) {
        setBusinessDetail(updated);
      }
      if (refreshData) {
        await refreshData();
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update branding details.');
    } finally {
      setSaving(false);
    }
  };

  if (!businessDetail) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-xs border-t-4 border-t-[#d4af37] p-6 rounded">
        <span className="text-sm font-bold text-[#d4af37] uppercase tracking-widest block">Tenant Branding System</span>
        <h3 className="font-display text-2xl font-bold text-[#0d1527] tracking-tight">Customize Identity</h3>
        <p className="text-sm text-slate-500 mt-1">Modify brand logos, covers, colors, and Google Fonts to style your client portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Editor */}
        <form onSubmit={handleSave} className="lg:col-span-6 bg-white shadow-xs p-6 rounded space-y-6 border border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Palette className="h-4.5 w-4.5 text-[#d4af37]" />
            <h4 className="font-display font-bold text-sm text-[#0d1527] uppercase tracking-wider">Brand Configuration</h4>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-4 rounded font-medium">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 p-4 rounded font-medium">
              Branding guidelines updated successfully! Settings will apply instantly.
            </div>
          )}

          {/* Logo & Cover Inputs */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#d4af37]" /> Brand Logo URL
              </label>
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <div className="relative w-12 h-12 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-1 group overflow-hidden shrink-0">
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl('');
                        setLogoError(false);
                      }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm text-white font-bold transition-opacity"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-200 hover:border-[#d4af37] rounded text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-500 hover:text-slate-800 transition-all font-semibold whitespace-nowrap select-none">
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await api.post<{ url: string }>('/upload', formData);
                            setLogoUrl(res.url);
                            setLogoError(false);
                          } catch (err: any) {
                            setError(err?.message || 'Failed to upload logo.');
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={logoUrl.startsWith('data:') ? '' : logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setLogoError(false);
                    }}
                    placeholder={logoUrl.startsWith('data:') ? 'Uploaded image data' : 'Or paste image URL here...'}
                    className="flex-1 rounded border border-slate-200 bg-white py-2 px-3 text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#d4af37]" /> Cover Image URL
              </label>
              <div className="flex items-center gap-3">
                {coverUrl && (
                  <div className="relative w-12 h-12 rounded border border-slate-200 bg-slate-50 flex items-center justify-center p-1 group overflow-hidden shrink-0">
                    <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm text-white font-bold transition-opacity"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border border-dashed border-slate-200 hover:border-[#d4af37] rounded text-sm bg-slate-50 hover:bg-slate-100/50 text-slate-500 hover:text-slate-800 transition-all font-semibold whitespace-nowrap select-none">
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await api.post<{ url: string }>('/upload', formData);
                            setCoverUrl(res.url);
                          } catch (err: any) {
                            setError(err?.message || 'Failed to upload cover image.');
                          }
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={coverUrl.startsWith('data:') ? '' : coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder={coverUrl.startsWith('data:') ? 'Uploaded image data' : 'Or paste image URL here...'}
                    className="flex-1 rounded border border-slate-200 bg-white py-2 px-3 text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-[#d4af37]" /> Company Website URL
              </label>
              <input
                type="text"
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                placeholder="tesla.com"
                className="w-full rounded border border-slate-200 bg-white py-2 px-3 text-sm text-slate-850 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
              />
            </div>
          </div>

          {/* Color pickers */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1.5">Colors Guidelines</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-slate-400 font-semibold uppercase">Background</span>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleBgChange(e.target.value)}
                    className="w-5 h-5 border-0 rounded cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    maxLength={7}
                    onChange={(e) => handleBgChange(e.target.value)}
                    className="w-full text-sm bg-transparent outline-hidden text-slate-800 font-bold uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-slate-400 font-semibold uppercase">Text Color</span>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-5 h-5 border-0 rounded cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={textColor}
                    maxLength={7}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full text-sm bg-transparent outline-hidden text-slate-800 font-bold uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-slate-400 font-semibold uppercase">Accent</span>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-5 h-5 border-0 rounded cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    maxLength={7}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full text-sm bg-transparent outline-hidden text-slate-800 font-bold uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography selector */}
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Typography Font (Google Fonts)</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full rounded border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all cursor-pointer"
            >
              {FONTS_LIST.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#0d1527] hover:bg-slate-800 text-white py-2.5 px-6 rounded font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#d4af37]" /> Saving Guidelines...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#d4af37]" /> Save Brand Guidelines
                </>
              )}
            </button>
          </div>
        </form>

        {/* RIGHT PANEL: Live Public Portal Mockup Preview */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest self-start px-2">
            <Eye className="h-4 w-4 text-[#d4af37]" /> Live Review Portal Preview
          </div>

          {/* Mockup Frame browser window */}
          <div className="w-full border border-slate-200 rounded overflow-hidden shadow-xl bg-white select-none">
            {/* Top browser bar */}
            <div className="bg-[#faf8f5] h-9 px-4 flex items-center gap-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div className="bg-slate-50 text-[9px] text-slate-400 text-center py-0.5 rounded px-8 font-mono truncate flex-1 max-w-[280px] mx-auto border border-slate-100">
                reviewpulse.com/{businessDetail.slug}
              </div>
            </div>

            {/* Dynamic style block to override font-display and heading specificities in preview */}
            {fontFamily && (
              <>
                <link
                  rel="stylesheet"
                  href={`https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700;900&display=swap`}
                />
                <style>{`
                  .preview-font-override-${businessDetail.id},
                  .preview-font-override-${businessDetail.id} h1,
                  .preview-font-override-${businessDetail.id} h2,
                  .preview-font-override-${businessDetail.id} h3,
                  .preview-font-override-${businessDetail.id} h4,
                  .preview-font-override-${businessDetail.id} h5,
                  .preview-font-override-${businessDetail.id} h6,
                  .preview-font-override-${businessDetail.id} .font-display,
                  .preview-font-override-${businessDetail.id} select,
                  .preview-font-override-${businessDetail.id} input,
                  .preview-font-override-${businessDetail.id} button {
                    font-family: '${fontFamily}', sans-serif !important;
                  }
                `}</style>
              </>
            )}
            <div
              className={`preview-font-override-${businessDetail.id} min-h-[500px] flex flex-col justify-between`}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                fontFamily: `'${fontFamily}', sans-serif`,
              }}
            >
              {/* Cover Image Hero Banner */}
              <div className="relative w-full h-32 overflow-hidden bg-slate-900">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="w-full h-full object-cover object-center filter brightness-[0.75]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#16161a] to-[#2b221a] opacity-80" />
                )}
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t to-transparent pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(to top, ${bgColor}, transparent)` }}
                />
              </div>

              {/* Floating Center Business Logo */}
              <div className="flex justify-center -mt-10 relative z-10 px-4">
                <div
                  className="relative w-20 h-20 rounded-full border-4 bg-[#151518] shadow-xl overflow-hidden flex items-center justify-center shrink-0"
                  style={{ borderColor: bgColor }}
                >
                  {logoUrl && !logoError ? (
                    <img
                      src={logoUrl}
                      onError={() => setLogoError(true)}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="h-7 w-7" style={{ color: accentColor }} />
                  )}
                </div>
              </div>

              {/* Central Content */}
              <div className="px-6 flex-grow flex flex-col justify-start pt-4 space-y-4">
                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-3">
                  <h4 className="font-display text-xs sm:text-base font-black uppercase text-center tracking-tight leading-tight max-w-[280px]">
                    How did your experience <br /> with <span style={{ color: accentColor }}>{businessDetail.name}</span> go?
                  </h4>
                  
                  {/* Stars */}
                  <div className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-xs flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        strokeWidth={1.5}
                        className="h-7 w-7 shrink-0 transition-all duration-150"
                        style={{
                          color: star <= 4 ? accentColor : 'rgba(255, 255, 255, 0.2)',
                          fill: star <= 4 ? accentColor : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                    Very Good — Satisfied!
                  </p>
                </div>

                {/* Form Elements */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase tracking-wider opacity-75 text-center">
                      Service Received
                    </label>
                    <div>
                      {businessDetail.services && businessDetail.services.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1 pt-0.5">
                          {businessDetail.services.map((srv: string) => {
                            const isSelected = mockSelectedServices.includes(srv);
                            return (
                              <button
                                key={srv}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setMockSelectedServices(mockSelectedServices.filter((s) => s !== srv));
                                  } else {
                                    setMockSelectedServices([...mockSelectedServices, srv]);
                                  }
                                }}
                                className="px-2.5 py-1 text-[8px] font-semibold tracking-wider rounded border transition-all duration-200 cursor-pointer flex items-center gap-1 select-none"
                                style={{
                                  backgroundColor: isSelected ? `${accentColor}22` : 'rgba(255, 255, 255, 0.05)',
                                  borderColor: isSelected ? accentColor : 'transparent',
                                  color: isSelected ? textColor : 'rgba(255, 255, 255, 0.6)',
                                }}
                              >
                                {isSelected && <Check className="h-2 w-2 shrink-0" style={{ color: accentColor }} />}
                                {srv}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-[9px] text-slate-400 py-1 italic">
                          No specific services tags configured yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full py-2 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1 rounded-sm opacity-90"
                    style={{
                      backgroundColor: accentColor,
                      color: bgColor,
                    }}
                  >
                    Next <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Mock footer copyright and info section */}
              <footer className="py-4 border-t border-white/5 text-center px-4 w-full mt-6 space-y-2 select-none">
                <p className="text-[8px] opacity-60 leading-normal">
                  This experience feedback portal is verified by <span className="font-semibold" style={{ color: accentColor }}>ReviewPulse</span>. All responses are delivered securely to {businessDetail.name} management.
                </p>
                <div className="pt-2 border-t border-white/5 text-center text-[8px] text-white/40 uppercase tracking-wider font-semibold">
                  <p>© 2026 ReviewPulse.com. All rights reserved.</p>
                </div>
              </footer>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
