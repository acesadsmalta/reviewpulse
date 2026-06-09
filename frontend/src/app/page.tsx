'use client';

import { Star, ArrowRight, ShieldCheck, BarChart3, Bot, Compass, Bell, ShieldAlert, Share2, Play, CheckCircle2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Portal {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  cover_url?: string;
}

export default function Index() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    api.get<Portal[]>('/public/portals')
      .then((data) => {
        setPortals(data);
      })
      .catch((err) => {
        console.error('Failed to load portals:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const faqs = [
    {
      q: "What is Review Pulse?",
      a: "Review Pulse is a platform where businesses can register to get a dedicated review collection portal. It helps businesses gather authentic customer reviews, automatically routing positive ones to Google My Business while filtering out bad feedback."
    },
    {
      q: "How does the review filtering work?",
      a: "When a customer submits feedback, our system checks the rating. Dissatisfied or negative reviewers are filtered privately so you can address their concerns directly. Satisfied or positive reviewers are immediately prompted with the option to post their review on Google My Business (GMB)."
    },
    {
      q: "Can I reward my customers for reviews?",
      a: "Yes. You can configure the system to reward good reviewers with custom coupon codes or incentives automatically once they complete the feedback flow, driving repeat business and positive engagement."
    },
    {
      q: "How does lead collection work?",
      a: "Our portal collects the reviewer's phone number and email address. This allows your business to build a clean customer database of real, verified buyers."
    },
    {
      q: "How do targeted marketing campaigns work?",
      a: "Using the collected contact list, businesses can run targeted email or SMS campaigns. You can filter your database to target only satisfied and highly potential customers, maximizing conversion rates and GMB profile rating growth."
    }
  ];

  return (
    <main className="relative min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Review Pulse" className="h-12 w-auto" />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="/#features" className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Features</a>
            <a href="/#demo" className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Testimonials</a>
            <a href="/#pricing" className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">Pricing</a>
            <a href="/#faq" className="text-sm font-semibold text-slate-500 hover:text-black transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-premium-primary rounded-md py-2.5 px-5 text-sm inline-flex items-center gap-2"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-24">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-tight">
              Get Authentic Reviews & Boost Your Google My Business Rating
            </h1>
            <p className="text-xl text-slate-600 font-sans max-w-2xl leading-relaxed">
              Register your business, get a dedicated custom review portal, and automatically route positive reviews to Google while filtering out bad feedback. Collect contacts to run targeted campaigns.
            </p>

            <div className="flex flex-wrap gap-5 items-center pt-2">
              <Link
                href="/signup"
                className="btn-premium-primary rounded-md text-base py-3.5 px-7 inline-flex items-center gap-2.5"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Check bullets - Now using the bright yellow accent */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm font-semibold text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#FBBF24]" strokeWidth={1.5} />
                Filter bad reviews before they hit Google
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#FBBF24]" strokeWidth={1.5} />
                Reward positive reviewers with coupons
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-6 md:p-8">
              {/* Top stats row */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Reviews growth */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-blue-600 tracking-tight">+85%</span>
                    <span className="text-xl font-bold text-emerald-500">↑</span>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Reviews</div>
                  <div className="text-sm font-semibold text-emerald-500">+2,150 New Reviews</div>
                </div>

                {/* Rating average */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">4.9</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-[#FBBF24] text-[#FBBF24]" />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Star Average</div>
                  <div className="text-sm font-medium text-slate-500">Based on 4,680 Reviews</div>
                </div>
              </div>

              {/* Monthly Growth Chart Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600">Review Filtering Flow</h4>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-2.5 w-2.5 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-400 mb-6">Direct positive reviews to Google My Business</p>

                {/* Chart body */}
                <div className="relative h-48 flex flex-col justify-between">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[5, 4, 3, 2, 1, 0].map((val) => (
                      <div key={val} className="w-full flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-400 w-4 text-right">{val}k</span>
                        <div className="flex-1 border-t border-slate-100 border-dashed" />
                      </div>
                    ))}
                  </div>

                  {/* SVG Line & Area */}
                  <div className="absolute inset-y-0 left-7 right-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Area */}
                      <path 
                        d="M 5 76 L 25 58 L 50 42 L 73 26 L 90 10 L 90 100 L 5 100 Z" 
                        fill="url(#chartGrad)" 
                      />
                      {/* Line */}
                      <path 
                        d="M 5 76 L 25 58 L 50 42 L 73 26 L 90 10" 
                        fill="none" 
                        stroke="#3B82F6" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Data Points and Stars */}
                    {/* Jan (5, 76) */}
                    <div className="absolute" style={{ left: '5%', bottom: '24%' }}>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <span className="absolute top-4 text-sm font-bold text-slate-800 bg-white/95 px-1.5 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          1.2k
                        </span>
                      </div>
                    </div>

                    {/* Mar (25, 58) */}
                    <div className="absolute" style={{ left: '25%', bottom: '42%' }}>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute bottom-4 flex gap-px bg-white/90 px-1 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-1.5 w-1.5 fill-[#FBBF24] text-[#FBBF24]" />
                          ))}
                        </div>
                        <div className="absolute h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <span className="absolute top-4 text-sm font-bold text-slate-800 bg-white/95 px-1.5 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          2.1k
                        </span>
                      </div>
                    </div>

                    {/* Jun (50, 42) */}
                    <div className="absolute" style={{ left: '50%', bottom: '58%' }}>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute bottom-4 flex gap-px bg-white/90 px-1 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-1.5 w-1.5 fill-[#FBBF24] text-[#FBBF24]" />
                          ))}
                        </div>
                        <div className="absolute h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <span className="absolute top-4 text-sm font-bold text-slate-800 bg-white/95 px-1.5 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          2.9k
                        </span>
                      </div>
                    </div>

                    {/* Sep (73, 26) */}
                    <div className="absolute" style={{ left: '73%', bottom: '74%' }}>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute bottom-4 flex gap-px bg-white/90 px-1 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-1.5 w-1.5 fill-[#FBBF24] text-[#FBBF24]" />
                          ))}
                        </div>
                        <div className="absolute h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <span className="absolute top-4 text-sm font-bold text-slate-800 bg-white/95 px-1.5 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          3.7k
                        </span>
                      </div>
                    </div>

                    {/* Dec (90, 10) */}
                    <div className="absolute" style={{ left: '90%', bottom: '90%' }}>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute bottom-4 flex gap-px bg-white/90 px-1 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-1.5 w-1.5 fill-[#FBBF24] text-[#FBBF24]" />
                          ))}
                        </div>
                        <div className="absolute h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        <span className="absolute top-4 text-sm font-bold text-slate-800 bg-white/95 px-1.5 py-0.5 rounded border border-slate-100 shadow-xs whitespace-nowrap">
                          4.7k
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between pl-7 mt-4 text-sm font-bold text-slate-400">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>Jun</span>
                  <span>Sep</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Ticker */}
      <section className="bg-white py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-8">
            Trusted by progressive enterprises worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 text-lg font-bold tracking-tight text-slate-600">
            <span>Charles Clinkard</span>
            <span>Teesside University</span>
            <span>Visualsoft</span>
            <span>Bang & Olufsen</span>
            <span>Costa Coffee</span>
            <span>Domino's</span>
          </div>
        </div>
      </section>

      {/* How it Works Module */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            How Review Pulse Optimizes Your GMB Profile
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">Our feedback collection flow is designed to maximize positive ratings and build a customer database.</p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div className="card-premium rounded-lg p-10 space-y-6">
            <div className="text-sm font-bold text-[#2563EB] uppercase tracking-widest">Phase 01</div>
            <h3 className="text-xl font-bold text-foreground">Dedicated Custom Portal</h3>
            <p className="text-base text-slate-500 leading-relaxed">
              Register your business to set up a dedicated custom-branded landing page for capturing authentic feedback.
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-6">
            <div className="text-sm font-bold text-[#2563EB] uppercase tracking-widest">Phase 02</div>
            <h3 className="text-xl font-bold text-foreground">Smart Review Filtering</h3>
            <p className="text-base text-slate-500 leading-relaxed">
              Happy users get routed to Google to post positive feedback. Unhappy users submit feedback privately with no Google My Business redirect.
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-6">
            <div className="text-sm font-bold text-[#2563EB] uppercase tracking-widest">Phase 03</div>
            <h3 className="text-xl font-bold text-foreground">Reward & Build CRM</h3>
            <p className="text-base text-slate-500 leading-relaxed">
              Incentivize good reviews with coupon codes, collect emails/phones, and launch targeted campaigns targeting positive, potential clients.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Designed for Star Rating Optimization
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">Everything you need to capture positive ratings, filter negative reviews, and reward loyalty.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="card-premium rounded-lg p-10 space-y-5">
            <div className="text-[#2563EB]"><Compass className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-foreground">Dedicated Review Portals</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              A dedicated, custom-branded review page for each business to collect authentic reviews.
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-5">
            <div className="text-[#2563EB]"><ShieldAlert className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-foreground">Review Filtering Engine</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Filters reviews dynamically. Dissatisfied users are blocked from sending reviews to Google My Business (GMB).
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-5">
            <div className="text-[#2563EB]"><CheckCircle2 className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-foreground">Smart GMB Routing</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Automatically provides highly satisfied customers with a direct button to publish reviews to your GMB profile.
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-5">
            <div className="text-[#2563EB]"><Star className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-foreground">Coupon Code Rewards</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Reward positive reviewers with coupon codes or custom voucher incentives instantly to build loyalty.
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-5">
            <div className="text-[#2563EB]"><BarChart3 className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-foreground">Customer Database</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Collect user phone numbers and emails inside the feedback pipeline to build a clean customer base.
            </p>
          </div>
          <div className="card-premium rounded-lg p-10 space-y-5">
            <div className="text-[#2563EB]"><Share2 className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-foreground">Targeted User Campaigns</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Run marketing and follow-up campaigns targeting only your good and highly potential users.
            </p>
          </div>
        </div>
      </section>

      {/* QR Code Card Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 border-t border-slate-100 bg-slate-50/20">
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-sm font-bold uppercase tracking-widest text-[#2563EB]">Offline Reviews Engagement</span>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-tight">
              Get Your Custom Printable QR Code Cards
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed font-sans">
              Bridge the gap between physical customer visits and digital feedback. Generate high-resolution, print-ready review cards customized to match your exact brand identity.
            </p>
            <ul className="space-y-3 text-slate-600 text-sm md:text-base font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                100% Customizable background patterns, branding, and text
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                High-resolution, print-ready layout templates
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                Instant scan-to-review automation directly to your business page
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                Real-time layout editor and style preview in your console dashboard
              </li>
            </ul>
            <div className="pt-4">
              <Link 
                href="/signup" 
                className="btn-premium-primary rounded-md text-base py-3.5 px-7 inline-flex items-center gap-2.5"
              >
                Customize Your Card <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Right Preview Card Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <img 
                src="/cafe-review-card.png" 
                alt="Custom Printable QR Code Card" 
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customizable Experience Page Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 border-t border-slate-100 bg-white">
        <div className="text-center mb-16 space-y-4">
          <span className="text-sm font-bold uppercase tracking-widest text-[#2563EB]">Customer Portal Design</span>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Fully Customizable Review Experience Page
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
            Tailor every single element of the feedback collection flow to match your brand's unique style and identity.
          </p>
        </div>

        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-100 shadow-xl">
            <img 
              src="/review-customizer-preview.png" 
              alt="Customize Your Experience Page Preview" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Live Portals List */}
      <section id="demo" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <span className="text-sm font-bold uppercase tracking-widest text-[#2563EB]">Try It Out</span>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Give a Review to These Businesses
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base">
            Select one of the live test channels below to experience the beautiful, brand-customized review pages.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-left">
            {loading ? (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12 space-y-4">
                <span className="text-sm text-slate-400 uppercase tracking-widest block animate-pulse">Loading channels...</span>
              </div>
            ) : portals.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 text-center py-12 border border-premium bg-white p-8 rounded-lg">
                <p className="text-base font-semibold text-slate-700">No active channels registered</p>
              </div>
            ) : (
              portals.map((p, idx) => (
                <div key={p.id} className="group relative overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[340px]">
                  {/* Card Cover Background */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ 
                        backgroundImage: p.cover_url 
                          ? `url(${p.cover_url})` 
                          : `linear-gradient(to right, #2563EB, #4F46E5)` 
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Card Content Area */}
                  <div className="relative px-6 pb-6 pt-12 flex-1 flex flex-col justify-between">
                    {/* Floating Logo overlay */}
                    <div className="absolute -top-10 left-6 h-20 w-20 rounded-xl bg-white p-1 shadow-md border border-slate-50 flex items-center justify-center overflow-hidden">
                      {p.logo_url ? (
                        <img 
                          src={p.logo_url} 
                          alt={p.name} 
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center font-bold text-white text-xl rounded-lg">
                          {p.name[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Business Details */}
                    <div className="space-y-1 mt-2">
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{p.name}</h3>
                      <p className="text-sm font-medium text-slate-500 line-clamp-2">
                        Submit customer experience reviews directly to {p.name}.
                      </p>
                    </div>

                    {/* Link Button */}
                    <div className="pt-4">
                      <Link
                        href={`/${p.slug}`}
                        className="w-full justify-center btn-premium-primary text-white py-2.5 px-4 rounded-lg font-bold text-sm inline-flex items-center gap-2 transition-all hover:bg-opacity-95 shadow-xs"
                      >
                        Write a Review <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">Choose the plan that matches your business scale.</p>
        </div>

        <div className="grid gap-10 max-w-4xl mx-auto md:grid-cols-2">
          {/* Lite Plan */}
          <div className="card-premium rounded-lg p-10 bg-white flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Lite Plan</span>
              <div className="flex items-baseline">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="text-slate-500 text-sm font-medium ml-1">/ forever</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Essential feedback collection and review filtering.</p>
              <ul className="space-y-3 pt-6 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">✔ 1 Active Portal</li>
                <li className="flex items-center gap-2.5">✔ Basic GMB review filtering</li>
                <li className="flex items-center gap-2.5">✔ Collect customer email & phone</li>
                <li className="flex items-center gap-2.5">✔ Static QR code cards</li>
              </ul>
            </div>
            <Link href="/signup" className="btn-premium-secondary rounded-md text-center w-full mt-10 block py-3.5">
              Sign Up Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="card-premium rounded-lg p-10 bg-white border-2 border-[#2563EB] flex flex-col justify-between relative">
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#FBBF24] text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
              RECOMMENDED
            </div>
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] block">Pro Plan</span>
              <div className="flex items-baseline">
                <span className="text-5xl font-extrabold tracking-tight">$49.99</span>
                <span className="text-slate-500 text-sm font-medium ml-1">/ month</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Complete customer campaign engine and rewards system.</p>
              <ul className="space-y-3 pt-6 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">✔ Unlimited Active Portals</li>
                <li className="flex items-center gap-2.5">✔ Smart review filtering & GMB routing</li>
                <li className="flex items-center gap-2.5">✔ Coupon code reward system</li>
                <li className="flex items-center gap-2.5">✔ Collect names, emails, & phone numbers</li>
                <li className="flex items-center gap-2.5">✔ Target marketing campaigns to positive users</li>
              </ul>
            </div>
            <Link href="/signup" className="btn-premium-primary rounded-md text-center w-full mt-10 block py-3.5">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm md:text-base">Quick answers to common questions about the Review Pulse platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className={`transition-all duration-300 rounded-xl border ${
                  isOpen 
                    ? 'border-blue-100 bg-blue-50/10' 
                    : 'border-slate-100 bg-white hover:border-slate-200/60'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left p-6 font-bold text-base md:text-lg text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`} 
                  />
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-slate-600 text-sm md:text-base leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-premium bg-white pt-10 pb-6 text-slate-500 text-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-6 border-b border-slate-100">
            {/* Logo and product notice */}
            <div className="space-y-4 max-w-xs">
              <Link href="/">
                <img src="/logo.svg" alt="Review Pulse Logo" className="h-14 w-auto" />
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed">
                Elevate customer trust, orchestrate platform-wide feedback collection, and safeguard your brand's digital reputation.
              </p>
              <div className="text-sm text-slate-500 font-medium">
                A product of{' '}
                <a 
                  href="https://acesads.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  AcesAds
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-800">Legal Policies</span>
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-black transition-colors font-medium">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-black transition-colors font-medium">Terms of Service</Link>
              <Link href="/cookies" className="text-sm text-slate-500 hover:text-black transition-colors font-medium">Cookie Policy</Link>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Review Pulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
