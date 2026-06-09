'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Star, Mail, User, Phone, MessageSquare, Check, ArrowRight, Loader2, Building, Settings } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { parseBranding } from '@/lib/branding';

interface Business {
  id: string;
  name: string;
  slug: string;
  email: string;
  website_url?: string;
  logo_url?: string;
  cover_url?: string;
  services?: string[];
  promo_code?: string;
  gmb_url?: string;
}

function ConfettiEffect() {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#FFC800', '#FF3B30', '#34C759', '#007AFF', '#AF52DE', '#FF9500'];
    const shapes = ['square', 'circle', 'triangle'];
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    const newPieces = Array.from({ length: 150 }).map((_, i) => {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft ? -10 : width + 10;
      const startY = height + 10;
      const angle = fromLeft 
        ? (Math.random() * 45 - 75) * (Math.PI / 180)
        : (Math.random() * 45 - 150) * (Math.PI / 180);
      const velocity = Math.random() * 18 + 18;
      
      return {
        id: i,
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: Math.random() * 7 + 6,
        rotation: Math.random() * 360,
        rSpeed: Math.random() * 12 - 6,
        opacity: 1,
      };
    });
    setPieces(newPieces);

    let animationFrame: number;
    const startTime = Date.now();

    const update = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setPieces((prev) =>
        prev
          .map((p) => {
            const nextY = p.y + p.vy;
            const nextX = p.x + p.vx;
            const nextVy = p.vy + 0.45; // gravity
            const nextVx = p.vx * 0.98; // air resistance
            const nextOpacity = Math.max(0, 1 - elapsed / 3.5);
            return {
              ...p,
              x: nextX,
              y: nextY,
              vy: nextVy,
              vx: nextVx,
              rotation: p.rotation + p.rSpeed,
              opacity: nextOpacity,
            };
          })
          .filter((p) => p.opacity > 0 && p.y < height + 20)
      );

      if (elapsed < 3.5) {
        animationFrame = requestAnimationFrame(update);
      }
    };

    animationFrame = requestAnimationFrame(update);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.shape === 'circle' ? p.size : p.shape === 'triangle' ? 0 : p.size,
            backgroundColor: p.shape === 'triangle' ? 'transparent' : p.color,
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
            borderRadius: p.shape === 'circle' ? '50%' : undefined,
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            transition: 'opacity 0.1s linear',
          }}
        />
      ))}
    </div>
  );
}

export default function PublicReviewPage() {
  const { businessSlug } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  // localStorage cache key
  const CACHE_KEY = `rp_form_${businessSlug}`;

  // Form States
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [service, setService] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<number>(1);
  const [clickedGmb, setClickedGmb] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gmbClickedPending, setGmbClickedPending] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      if (gmbClickedPending) {
        setGmbClickedPending(false);
        setClickedGmb(true);
        setShowConfetti(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [gmbClickedPending]);

  const handleGmbClick = () => {
    if (business?.gmb_url) {
      if (submittedReview?.id) {
        api.post(`/public/reviews/${submittedReview.id}/gmb-click`).catch(console.error);
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(comment);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = comment;
          textArea.style.top = '0';
          textArea.style.left = '0';
          textArea.style.position = 'fixed';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error('Failed to copy comment:', err);
      }
      window.open(business.gmb_url, '_blank');
      setGmbClickedPending(true);
      // Fallback in case window focus event isn't captured
      setTimeout(() => {
        setClickedGmb((prev) => {
          if (!prev) {
            setShowConfetti(true);
            return true;
          }
          return prev;
        });
      }, 5000);
    }
  };

  // Load from cache on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.rating) setRating(cached.rating);
        if (cached.service) setService(cached.service);
        if (cached.selectedServices) setSelectedServices(cached.selectedServices);
        if (cached.name) setName(cached.name);
        if (cached.email) setEmail(cached.email);
        if (cached.phone) setPhone(cached.phone);
        if (cached.comment) setComment(cached.comment);
        if (cached.step) setStep(cached.step);
      }
    } catch {}
  }, [CACHE_KEY]);

  // Persist form state
  useEffect(() => {
    if (rating > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          rating, service, selectedServices, name, email, phone, comment, step
        }));
      } catch {}
    }
  }, [rating, service, selectedServices, name, email, phone, comment, step, CACHE_KEY]);

  // Fetch business details
  useEffect(() => {
    if (businessSlug) {
      api.get<Business>(`/public/businesses/${businessSlug}`)
        .then((biz) => {
          setBusiness(biz);
        })
        .catch((err) => {
          console.error('Failed to load business:', err);
        })
        .finally(() => {
          setLoadingBusiness(false);
        });
    }
  }, [businessSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating of at least 1 star to submit your review.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      if (!business) throw new Error('No active business session.');
      
      const createdReview = await api.post<any>('/reviews', {
        business_id: business.id,
        rating,
        comment: comment.trim(),
        reviewer_name: name.trim(),
        reviewer_email: email.trim().toLowerCase(),
        reviewer_phone: phone.trim(),
        service: selectedServices.length > 0 
          ? selectedServices.join(', ') 
          : (service.trim() || 'General Service'),
      });

      setSubmittedReview(createdReview);
      setStep(3);
      if (!business.gmb_url) {
        setShowConfetti(true);
      }
      try { localStorage.removeItem(CACHE_KEY); } catch {}
    } catch (err: any) {
      setError(err?.message || 'Failed to submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (score: number) => {
    if (!score) return 'Select a star to begin';
    switch (score) {
      case 1: return 'Terrible — We must improve.';
      case 2: return 'Poor — Some major issues.';
      case 3: return 'Average — Could be better.';
      case 4: return 'Very Good — Satisfied!';
      case 5: return 'Excellent — Loved it!';
      default: return 'Select a star to begin';
    }
  };

  const branding = parseBranding(business?.website_url);

  // Dynamic Google Font Injection
  useEffect(() => {
    if (!branding.fontFamily) return;
    const id = `gfont-${branding.fontFamily.replace(/\s/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${branding.fontFamily.replace(/ /g, '+')}&display=swap`;
    document.head.appendChild(link);
  }, [branding.fontFamily]);

  if (loadingBusiness) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C] text-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#d4af37] mx-auto" />
          <p className="text-xs font-semibold tracking-widest text-zinc-400 font-display">LOADING EXPERIENCE PORTAL...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0B0B0C] text-white px-4 antialiased">
        <div className="absolute inset-0 bg-linear-to-tr from-[#16161a]/30 to-[#0B0B0C] pointer-events-none" />

        <div className="max-w-md w-full rounded border border-white/5 bg-[#151518]/90 p-8 shadow-2xl text-center relative z-10 space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-white/5 text-[#fed65b] border border-white/10">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-tight">Portal Not Found</h2>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              We could not locate a review page for <code>/{businessSlug}</code>. The link may have changed or is misspelled.
            </p>
          </div>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-1.5 rounded bg-[#fed65b] py-3 text-xs font-bold uppercase tracking-widest text-[#241a00] hover:bg-[#ffe088] transition-all"
          >
            Return Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const headingAccentColor = branding.accentColor || '#FFC800';

  return (
    <main
      className="brand-font-override relative min-h-screen font-sans antialiased flex flex-col justify-between pb-12 transition-colors duration-300"
      style={{
        backgroundColor: branding.bgColor,
        color: branding.textColor,
        fontFamily: branding.fontFamily ? `'${branding.fontFamily}', sans-serif` : undefined,
      }}
    >
      <style>{`
        ${branding.fontFamily ? `
        @import url('https://fonts.googleapis.com/css2?family=${branding.fontFamily.replace(/ /g, '+')}&display=swap');
        .brand-font-override,
        .brand-font-override * {
          font-family: '${branding.fontFamily}', sans-serif !important;
        }
        ` : ''}
      `}</style>

      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      {/* Cover Image Banner */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden">
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt=""
            className="w-full h-full object-cover object-center filter brightness-[0.8]"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#16161a] to-[#2b221a] opacity-80" />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t to-transparent pointer-events-none" style={{ backgroundImage: `linear-gradient(to top, ${branding.bgColor}, transparent)` }} />
      </div>

      {/* Content Form Shell */}
      <div className="px-4 max-w-2xl mx-auto w-full relative z-10 -mt-22 sm:-mt-26 md:-mt-30 pb-16 flex-grow flex flex-col justify-start pt-6">
        
        {/* Floating Business Logo Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 bg-[#151518] shadow-2xl overflow-hidden flex items-center justify-center" style={{ borderColor: branding.bgColor }}>
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={`${business.name} Logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Building className="h-10 w-10" style={{ color: headingAccentColor }} />
            )}
          </div>
        </div>

        {/* Minimal Form Presentation */}
        <div className="w-full">
          {step < 3 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded">{error}</p>}

              {step === 1 ? (
                /* Step 1: Star Rating & Service dropdown selection */
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase text-center tracking-tighter leading-tight max-w-2xl mx-auto" style={{ color: branding.textColor }}>
                      How did your experience <br /> with <span style={{ color: headingAccentColor }}>{business.name}</span> go?
                    </h2>
                    
                    <div className="mt-4 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xs flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="cursor-pointer p-0.5 transition-colors duration-150"
                        >
                          <Star
                            strokeWidth={1.5}
                            className="h-12 w-12 shrink-0 transition-all duration-150"
                            style={{
                              color: star <= (hoverRating || rating) ? headingAccentColor : 'rgba(255, 255, 255, 0.2)',
                              fill: star <= (hoverRating || rating) ? headingAccentColor : 'none',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm sm:text-base font-bold uppercase tracking-normal mt-2 opacity-80" style={{ color: branding.textColor }}>
                      {getRatingLabel(hoverRating || rating)}
                    </p>
                  </div>

                  {rating > 0 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold uppercase tracking-wider text-white text-center">
                          Service Received
                        </label>
                        <div>
                          {business.services && business.services.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-2 pt-1">
                              {business.services.map((srv) => {
                                const isSelected = selectedServices.includes(srv);
                                return (
                                  <button
                                    key={srv}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedServices(selectedServices.filter((s) => s !== srv));
                                      } else {
                                        setSelectedServices([...selectedServices, srv]);
                                      }
                                    }}
                                    className="px-4 py-2.5 text-xs font-semibold tracking-wider rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                                    style={{
                                      backgroundColor: isSelected ? `${branding.accentColor}22` : 'rgba(255, 255, 255, 0.05)',
                                      borderColor: isSelected ? branding.accentColor : 'transparent',
                                      color: isSelected ? branding.textColor : 'rgba(255, 255, 255, 0.6)',
                                    }}
                                  >
                                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: branding.accentColor }} />}
                                    {srv}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="relative">
                              <Settings className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/40" />
                              <input
                                type="text"
                                placeholder="E.g. Kitchen Remodel, Consult, General Audit"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="w-full rounded border border-white/10 bg-[#1e1e22]/50 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          business.services && business.services.length > 0
                            ? selectedServices.length === 0
                            : !service.trim()
                        }
                        onClick={() => setStep(2)}
                        className="w-full py-3.5 font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer rounded-sm disabled:opacity-40"
                        style={{
                          backgroundColor: headingAccentColor,
                          color: branding.bgColor,
                        }}
                      >
                        Next <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Customer Personal Details & written comment */
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold opacity-80" style={{ color: branding.textColor }}>Full Name</label>
                      <div className="relative">
                        <User className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded border border-white/10 bg-[#1e1e22]/50 py-3 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold opacity-80" style={{ color: branding.textColor }}>Email Address</label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded border border-white/10 bg-[#1e1e22]/50 py-3 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold opacity-80" style={{ color: branding.textColor }}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#1e1e22]/50 py-3 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold opacity-80" style={{ color: branding.textColor }}>
                      Your Written Review
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-white/40" />
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us more about your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#1e1e22]/50 py-3.5 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
                    <p className="text-[10px] opacity-60 italic max-w-xs text-center md:text-left" style={{ color: branding.textColor }}>
                      By submitting this review, you agree to our terms of service regarding testimonials.
                    </p>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-4 bg-[#1e1e22]/60 border border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs transition-colors rounded-sm cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full md:w-auto px-12 py-4 font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer rounded-sm"
                        style={{
                          backgroundColor: headingAccentColor,
                          color: branding.bgColor,
                        }}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" style={{ color: branding.bgColor }} />
                        ) : (
                          <>
                            Submit Review <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Step 3: Success Screen (apology for 1-3, confetti/gift card for 4-5) */
            <div className="text-center space-y-8 py-8">
              {rating <= 3 ? (
                /* Apology screen */
                <div className="space-y-6">
                  <div className="text-6xl animate-bounce">😢</div>
                  <div className="space-y-3">
                    <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: branding.textColor }}>
                      We are truly sorry!
                    </h2>
                    <p className="text-sm opacity-85 leading-relaxed max-w-md mx-auto" style={{ color: branding.textColor }}>
                      We apologize that your experience with <span className="font-bold">{business.name}</span> did not meet expectations. We value your feedback and want to resolve any issues.
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                    <a
                      href={`mailto:${business.email || 'support@reviewpulse.com'}?subject=Disappointed client feedback&body=Hello ${business.name} Team,`}
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold uppercase tracking-wider text-xs transition-all rounded-sm flex items-center justify-center gap-2"
                    >
                      <Mail className="h-4 w-4" /> Write Email
                    </a>
                    <button
                      onClick={() => alert(`Contact support at: ${business.email}`)}
                      className="px-6 py-3.5 font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2 rounded-sm"
                      style={{
                        backgroundColor: headingAccentColor,
                        color: branding.bgColor,
                      }}
                    >
                      <Phone className="h-4 w-4" /> Contact Owner
                    </button>
                  </div>
                </div>
              ) : (
                /* Congratulation screen */
                <div className="space-y-6">
                  {showConfetti && <ConfettiEffect />}
                  <div className="text-6xl animate-bounce">🎉</div>
                  
                  {business.gmb_url && !clickedGmb ? (
                    /* Step 3a: Prompt to review on Google My Business */
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="space-y-3">
                        <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: branding.textColor }}>
                          One last step!
                        </h2>
                        <p className="text-sm opacity-85 leading-relaxed" style={{ color: branding.textColor }}>
                          Please give this review on Google, you will get a great gift!
                        </p>
                      </div>

                      {/* Display the review comment they wrote */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs italic text-left relative">
                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-50 block mb-1">Your Review:</span>
                        "{comment}"
                      </div>

                      <button
                        onClick={handleGmbClick}
                        className="w-full py-4 bg-[#4285F4] hover:bg-blue-600 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 rounded-sm cursor-pointer"
                      >
                        Copy Review & Post on Google
                      </button>

                      <button
                        onClick={() => setClickedGmb(true)}
                        className="text-xs opacity-60 hover:opacity-100 underline transition-all"
                      >
                        Skip and get promo code
                      </button>
                    </div>
                  ) : (
                    /* Step 3b: Show the dynamic business promo code */
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: branding.textColor }}>
                          Thank you so much!
                        </h2>
                        <p className="text-sm opacity-85 leading-relaxed max-w-md mx-auto" style={{ color: branding.textColor }}>
                          We are thrilled to hear you had a great experience with <span className="font-bold">{business.name}</span>. Your support means everything to us!
                        </p>
                      </div>

                      {/* Gift voucher box */}
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs p-6 max-w-sm mx-auto text-center space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-white inline-block">
                          Exclusive Gift Card
                        </span>
                        <div>
                          <p className="text-xs opacity-75 uppercase tracking-wider">Your Promo Code</p>
                          <p className="text-3xl font-black tracking-widest mt-1 font-display" style={{ color: headingAccentColor }}>
                            {business.promo_code ? business.promo_code.toUpperCase() : 'THANKYOU15'}
                          </p>
                        </div>
                        <p className="text-xs opacity-70 leading-relaxed">
                          Use this code at checkout to get a <span className="font-bold text-white">discount</span> on your next visit!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-8 border-t border-white/5 max-w-xs mx-auto">
                <button
                  onClick={() => {
                    setRating(0);
                    setComment('');
                    setService('');
                    setSelectedServices([]);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setClickedGmb(false);
                    setSubmittedReview(null);
                    setShowConfetti(false);
                    setGmbClickedPending(false);
                    setStep(1);
                  }}
                  className="w-full py-3 bg-[#1e1e22]/50 border border-white/10 hover:bg-white/5 rounded text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer"
                >
                  Submit Another Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-white/5 text-center max-w-xl mx-auto px-4 w-full mt-[10vh] space-y-4">
        <p className="text-xs opacity-70 leading-relaxed" style={{ color: branding.textColor }}>
          This experience feedback portal is verified by <span className="font-semibold" style={{ color: headingAccentColor }}>Pulse Review</span>. All client responses are delivered securely to {business.name} management.
        </p>
        <div className="pt-4 border-t border-white/5 text-center text-[10px] text-white/40 uppercase tracking-wider font-semibold">
          <p>© 2026 PulseReview.com. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
