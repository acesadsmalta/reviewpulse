'use client';

import { useState, useContext, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  Printer,
  Settings,
  Eye,
  Star,
  QrCode,
} from 'lucide-react';
import { DashboardContext } from '../layout';

const PRESET_COLORS = [
  { name: 'Slate Dark', bg: '#0d1527', text: '#ffffff', accent: '#d4af37' },
  { name: 'Forest Green', bg: '#4b5e40', text: '#ffffff', accent: '#ffd700' },
  { name: 'Minimal Cream', bg: '#faf8f5', text: '#0d1527', accent: '#735c00' },
  { name: 'Royal Blue', bg: '#1e293b', text: '#ffffff', accent: '#ffd700' },
  { name: 'Burgundy', bg: '#45101a', text: '#ffffff', accent: '#ffd700' },
  { name: 'Soft Charcoal', bg: '#18181b', text: '#ffffff', accent: '#f43f5e' },
];

export default function DashboardQrCode() {
  const context = useContext(DashboardContext);
  const { businessDetail } = context || {};
  const business = businessDetail;
  const cardRef = useRef<HTMLDivElement>(null);

  const getProxiedUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.includes('qrserver.com')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseOrigin = apiBase.replace('/api', '');
    return `${baseOrigin}/api/proxy-image?url=${encodeURIComponent(url)}`;
  };
  
  // Resolve target portal URL dynamically based on where the app is hosted
  const host = typeof window !== 'undefined' ? window.location.host : 'reviewpulse.com';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const reviewUrl = `${host}/${business?.slug || 'modelfy'}`;
  const fullReviewUrl = `${protocol}//${reviewUrl}`;

  // Content Customization States
  const [title, setTitle] = useState('ENJOYED YOUR VISIT?');
  const [subtitle, setSubtitle] = useState('Scan the QR code to leave a review!');
  const [badgeText, setBadgeText] = useState('CUSTOMER FEEDBACK');
  
  // Custom Color States
  const [bgColor, setBgColor] = useState('#0d1527');
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#d4af37');

  // Cover Image Background States
  const [showCoverBg, setShowCoverBg] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);

  // Layout Option States
  const [showLogo, setShowLogo] = useState(true);
  const [showBusinessName, setShowBusinessName] = useState(true);
  const [showStars, setShowStars] = useState(true);
  const [showWebsite, setShowWebsite] = useState(true);
  const [showFooterTag, setShowFooterTag] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [qrLogoError, setQrLogoError] = useState(false);

  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullReviewUrl)}`;

  // Automatically calculate contrasting text and accent colors based on background color YIQ luminance
  const handleBgColorChange = (newBg: string) => {
    setBgColor(newBg);
    const cleaned = newBg.startsWith('#') ? newBg : `#${newBg}`;
    const hex = cleaned.replace('#', '');
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

  const handleApplyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setBgColor(preset.bg);
    setTextColor(preset.text);
    setAccentColor(preset.accent);
    setShowCoverBg(false); // Disable image bg if applying color preset
  };

  // Function to print/save flyer as PDF
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Use cover bg styling if enabled and url is present
    const hasCover = showCoverBg && business?.cover_url;
    const bgStyles = hasCover
      ? `background: linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url('${business.cover_url}'); background-size: cover; background-position: center; color: #ffffff;`
      : `background: ${bgColor}; color: ${textColor};`;

    const activeTextColor = hasCover ? '#ffffff' : textColor;
    const activeAccentColor = hasCover ? '#ffd700' : accentColor;

    printWindow.document.write(`
      <html>
        <head>
          <title>Review Card — ${business?.name || 'Client'}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 210mm;
              height: 297mm;
              ${bgStyles}
            }
            .card-container {
              width: 210mm;
              height: 297mm;
              padding: 24mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              text-align: center;
              position: relative;
            }
            .header {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 15px;
            }
            .logo {
              max-height: 50mm;
              max-width: 80mm;
              object-fit: contain;
              border-radius: 8px;
            }
            .business-name {
              font-size: 28px;
              font-weight: 800;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              color: ${activeTextColor};
            }
            .content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 30px;
              margin-top: auto;
              margin-bottom: auto;
            }
            .title {
              font-size: 46px;
              font-weight: 900;
              margin: 0;
              letter-spacing: -0.02em;
              line-height: 1.2;
              text-transform: uppercase;
            }
            .subtitle {
              font-size: 20px;
              opacity: 0.9;
              margin: 0;
              max-width: 80%;
              line-height: 1.5;
            }
            .stars-row {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin: 15px 0;
            }
            .star {
              width: 32px;
              height: 32px;
              fill: ${activeAccentColor};
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 24px;
              border-radius: 24px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
              display: inline-block;
              position: relative;
            }
            .qr-code-img {
              width: 180px;
              height: 180px;
              display: block;
            }
            .qr-center-logo {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: white;
              padding: 8px;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              width: 42px;
              height: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .qr-center-logo img {
              width: 30px;
              height: 30px;
              object-fit: contain;
              border-radius: 4px;
            }
            .qr-center-logo span {
              font-size: 16px;
              font-weight: 900;
              color: ${hasCover ? '#111827' : bgColor};
            }
            .badge-row {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-top: 10px;
            }
            .badge-row svg {
              width: 18px;
              height: 18px;
              fill: ${activeAccentColor};
            }
            .badge-row span {
              font-size: 13px;
              font-weight: 850;
              text-transform: uppercase;
              letter-spacing: 0.12em;
            }
            .footer {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid rgba(255,255,255,0.15);
              padding-top: 20px;
              font-size: 13px;
              opacity: 0.85;
            }
            .footer-left {
              font-weight: 700;
              color: ${activeTextColor};
            }
            .footer-right {
              text-align: right;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <div class="header">
              ${
                showLogo && business?.logo_url && !logoError
                  ? `<img class="logo" src="${business.logo_url}" alt="${business.name}" />`
                  : ''
              }
              ${
                showBusinessName
                  ? `<div class="business-name">${business?.name || 'YOUR BUSINESS'}</div>`
                  : ''
              }
            </div>
 
            <div class="content">
              <h1 class="title">${title}</h1>
              <p class="subtitle">${subtitle}</p>
 
              ${
                showStars
                  ? `
              <div class="stars-row">
                ${Array(5)
                  .fill(null)
                  .map(
                    () => `
                  <svg class="star" viewBox="0 0 24 24">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                `
                  )
                  .join('')}
              </div>
              `
                  : ''
              }
 
              <div class="qr-wrapper">
                <img class="qr-code-img" src="${qrCodeImgUrl}" />
                <div class="qr-center-logo">
                  ${
                    business?.logo_url && !qrLogoError
                      ? `<img src="${business.logo_url}" />`
                      : `<span>${business?.name?.[0]?.toUpperCase() || 'A'}</span>`
                  }
                </div>
              </div>
 
              ${
                badgeText
                  ? `
              <div class="badge-row">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span>${badgeText}</span>
              </div>
              `
                  : ''
              }
            </div>
 
            <div class="footer">
              <div class="footer-left">
                ${showWebsite ? reviewUrl : ''}
              </div>
              <div class="footer-right">
                ${showFooterTag ? `Designed by <strong>Review Pulse</strong><br/>reviewpulse.com` : ''}
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate PNG via high-res canvas drawing
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      // Use html-to-image to render the actual preview card element exactly as it is shown
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // High-res export multiplier
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: cardRef.current.offsetWidth + 'px',
          height: cardRef.current.offsetHeight + 'px',
        }
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${business?.slug || 'card'}-review-card.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export card image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasCoverBg = showCoverBg && business?.cover_url;
  const activeTextColor = hasCoverBg ? '#ffffff' : textColor;
  const activeAccentColor = hasCoverBg ? '#ffd700' : accentColor;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow-xs border-t-4 border-t-[#d4af37] p-6 rounded flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-[#d4af37] uppercase tracking-widest block">Custom QR Code & Card Generator</span>
          <h3 className="font-display text-2xl font-bold text-[#0d1527] tracking-tight">Review Card Studio</h3>
          <p className="text-sm text-slate-500 mt-1">Customize, print, or download beautifully tailored customer review cards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Editor */}
        <div className="lg:col-span-5 bg-white shadow-xs p-6 rounded space-y-6 border border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="h-4.5 w-4.5 text-[#d4af37]" />
            <h4 className="font-display font-bold text-sm text-[#0d1527] uppercase tracking-wider">Card Designer</h4>
          </div>

          {/* Background Customization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400 block">Background Style</label>
              <label className="flex items-center gap-2 text-sm text-[#0d1527] font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCoverBg}
                  onChange={(e) => setShowCoverBg(e.target.checked)}
                  disabled={!business?.cover_url}
                  className="rounded border-slate-200 text-amber-600 focus:ring-amber-500 h-4 w-4 disabled:opacity-50"
                />
                Use Cover Image
              </label>
            </div>

            {showCoverBg && business?.cover_url ? (
              <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-sm font-bold uppercase text-slate-500">Overlay Darkness (Opacity)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.10"
                    max="0.90"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                  />
                  <span className="text-sm font-mono text-slate-800 font-bold">{Math.round(overlayOpacity * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset)}
                      title={preset.name}
                      className="w-7 h-7 rounded-full border border-slate-200 shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-all shrink-0"
                      style={{ backgroundColor: preset.bg }}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-sm text-slate-400 font-semibold uppercase">Background Hex</span>
                    <div className="flex items-center gap-1.5 border border-slate-200 rounded px-2 py-1 bg-slate-50">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => handleBgColorChange(e.target.value)}
                        className="w-5 h-5 border-0 rounded cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        maxLength={7}
                        onChange={(e) => handleBgColorChange(e.target.value)}
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
                    <span className="text-sm text-slate-400 font-semibold uppercase">Accent Color</span>
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
            )}
          </div>

          {/* Typography Content Controls */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Primary Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ENJOYED YOUR VISIT?"
                className="w-full rounded border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Subtitle Instruction</label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Scan the QR code to leave a review!"
                rows={2}
                className="w-full rounded border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Verification Badge Text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="CUSTOMER FEEDBACK"
                className="w-full rounded border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-[#d4af37] transition-all"
              />
            </div>
          </div>

          {/* Feature toggles */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1.5">Layout Options</label>
            
            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="rounded border-slate-200 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              Show Business Logo Graphic
            </label>

            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showBusinessName}
                onChange={(e) => setShowBusinessName(e.target.checked)}
                className="rounded border-slate-200 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              Show Business Name Text
            </label>

            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showStars}
                onChange={(e) => setShowStars(e.target.checked)}
                className="rounded border-slate-200 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              Include Star Rating Graphics
            </label>

            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showWebsite}
                onChange={(e) => setShowWebsite(e.target.checked)}
                className="rounded border-slate-200 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              Show Website Link in Footer
            </label>

            <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showFooterTag}
                onChange={(e) => setShowFooterTag(e.target.checked)}
                className="rounded border-slate-200 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              Include branding tag
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="w-full bg-[#0d1527] hover:bg-slate-800 text-white py-2.5 px-6 rounded font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-sm uppercase tracking-wider"
            >
              <Printer className="h-4 w-4 text-[#d4af37]" /> Print / Save PDF
            </button>
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-6 rounded font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-sm uppercase tracking-wider disabled:opacity-50"
            >
              <QrCode className="h-4 w-4 text-[#d4af37]" /> {isGenerating ? 'Generating...' : 'Download High-Res PNG'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Live Review Card Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest self-start px-2">
            <Eye className="h-4.5 w-4.5 text-[#d4af37]" /> Review Card Preview
          </div>

          {/* Review Card frame */}
          <div
            ref={cardRef}
            className="relative w-full max-w-[440px] aspect-[1/1.414] rounded shadow-2xl overflow-hidden border border-slate-100 select-none group transition-all hover:scale-[1.01]"
            style={{
              backgroundImage: hasCoverBg ? `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url(${getProxiedUrl(business.cover_url)})` : undefined,
              backgroundColor: hasCoverBg ? undefined : bgColor,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-full h-full p-8 flex flex-col justify-between items-center text-center relative" style={{ color: activeTextColor }}>
              
              {/* Header section with Logo & Name */}
              <div className="flex flex-col items-center gap-2 pt-4">
                {showLogo && business?.logo_url && !logoError && (
                  <img
                    src={getProxiedUrl(business.logo_url)}
                    crossOrigin="anonymous"
                    onError={() => setLogoError(true)}
                    alt={business.name}
                    className="max-h-[60px] max-w-[160px] object-contain rounded-md animate-fade-in bg-white/10 p-1"
                  />
                )}
                {showBusinessName && (
                  <div className="font-display text-sm font-black uppercase tracking-wider" style={{ color: activeTextColor }}>
                    {business?.name || 'YOUR BUSINESS'}
                  </div>
                )}
              </div>

              {/* Middle Section */}
              <div className="flex flex-col items-center gap-4 my-auto w-full">
                <h2 className="font-display text-2xl font-black tracking-tight leading-tight uppercase max-w-[85%]" style={{ color: activeTextColor }}>
                  {title || 'ENJOYED YOUR VISIT?'}
                </h2>
                <p className="text-sm max-w-[75%] leading-relaxed opacity-90" style={{ color: activeTextColor }}>
                  {subtitle || 'Scan the QR code to leave a review!'}
                </p>

                {/* Star Row */}
                {showStars && (
                  <div className="flex justify-center gap-1.5 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-6 w-6" style={{ color: activeAccentColor, fill: activeAccentColor }} />
                    ))}
                  </div>
                )}

                {/* QR Code Container with Company logo overlay */}
                <div className="bg-white p-3.5 rounded shadow-lg border border-slate-100 mt-3 relative inline-block">
                  <img
                    src={qrCodeImgUrl}
                    crossOrigin="anonymous"
                    alt="Scan Review Page"
                    className="w-36 h-36 rounded-lg"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md w-9 h-9 flex items-center justify-center border border-slate-100 overflow-hidden">
                    {business?.logo_url && !qrLogoError ? (
                      <img
                        src={getProxiedUrl(business.logo_url)}
                        crossOrigin="anonymous"
                        onError={() => setQrLogoError(true)}
                        alt={business.name}
                        className="w-7 h-7 object-contain rounded-xs"
                      />
                    ) : (
                      <span className="text-sm font-black text-[#0d1527]">
                        {business?.name?.[0]?.toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Row */}
                {badgeText && (
                  <div className="flex items-center gap-1.5 mt-2 opacity-90">
                    <svg className="w-4 h-4" style={{ fill: activeAccentColor }} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <span className="text-sm font-extrabold uppercase tracking-widest" style={{ color: activeTextColor }}>
                      {badgeText}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="w-full flex justify-between items-end border-t border-white/10 pt-4 text-sm opacity-90">
                <div className="font-semibold" style={{ color: activeTextColor }}>
                  {showWebsite ? reviewUrl : ''}
                </div>
                <div className="text-right opacity-80" style={{ color: activeTextColor }}>
                  {showFooterTag && (
                    <>
                      Designed by <strong>Review Pulse</strong>
                      <br />
                      reviewpulse.com
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
