'use client';

import { useEffect, useState, createContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Star, LogOut, ArrowRight, Settings, QrCode, Loader2, Palette, Sliders, Copy, Check, Users } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';

export interface DashboardContextType {
  reviews: any[];
  campaigns: any[];
  businessDetail: any;
  setBusinessDetail: React.Dispatch<React.SetStateAction<any>>;
  refreshData: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | null>(null);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [businessDetail, setBusinessDetail] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const loadData = async (token: string) => {
    try {
      const me = await api.get<any>('/auth/me');
      setUser(me.user);

      if (me.role !== 'tenant_owner' || !me.business) {
        router.push('/login');
        return;
      }

      setBusinessDetail(me.business);

      // Fetch reviews and campaigns for this business owner
      const [reviewList, campaignList] = await Promise.all([
        api.get<any[]>('/dashboard/reviews'),
        api.get<any[]>('/dashboard/campaigns'),
      ]);
      setReviews(reviewList);
      setCampaigns(campaignList);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load user session:', err);
      handleLogout();
    }
  };

  const refreshData = async () => {
    try {
      const [reviewList, campaignList, profile] = await Promise.all([
        api.get<any[]>('/dashboard/reviews'),
        api.get<any[]>('/dashboard/campaigns'),
        api.get<any>('/auth/me'),
      ]);
      setReviews(reviewList);
      setCampaigns(campaignList);
      setBusinessDetail(profile.business);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('pulse_review_token');
    const role = localStorage.getItem('pulse_review_role');
    
    if (!token || role !== 'tenant_owner') {
      router.push('/login');
    } else {
      loadData(token);
    }
  }, [router]);

  const handleLogout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('pulse_review_token');
    localStorage.removeItem('pulse_review_role');
    localStorage.removeItem('pulse_review_user');
    localStorage.removeItem('pulse_review_business');
    router.push('/login');
  };

  const [copied, setCopied] = useState(false);

  if (loading) {
    return <Loader />;
  }

  const handleCopyLink = () => {
    if (!businessDetail) return;
    const url = `${window.location.origin}/${businessDetail.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLinkActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path);
  };

  const navLinkClass = (path: string, exact = false) => {
    const active = isLinkActive(path, exact);
    return `w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-all text-left ${
      active 
        ? 'bg-[#2563EB] text-white' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
    }`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-white border-r border-slate-100 flex flex-col justify-between py-8 shrink-0 z-50">
        <div className="space-y-8 flex-1 flex flex-col">
          {/* Brand Header */}
          <div className="px-6 flex items-center gap-2.5">
            <img src="/icon.svg" alt="ReviewPulse Icon" className="h-7 w-7" />
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] font-display tracking-tight leading-none">ReviewPulse</h1>
              <p className="text-[8px] font-bold text-[#2563EB] uppercase tracking-wider mt-0.5">Business Console</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 space-y-1.5">
            <Link href="/dashboard" className={navLinkClass('/dashboard', true)}>
              <Star className="h-4.5 w-4.5" />
              <span className="text-sm">Overview</span>
            </Link>
            <Link href="/dashboard/reviews" className={navLinkClass('/dashboard/reviews')}>
              <Star className="h-4.5 w-4.5" />
              <span className="text-sm">Reviews</span>
            </Link>
            <Link href="/dashboard/customers" className={navLinkClass('/dashboard/customers')}>
              <Users className="h-4.5 w-4.5" />
              <span className="text-sm">Customers</span>
            </Link>
            <Link href="/dashboard/services" className={navLinkClass('/dashboard/services')}>
              <Sliders className="h-4.5 w-4.5" />
              <span className="text-sm">Services</span>
            </Link>
            <Link href="/dashboard/qrcode" className={navLinkClass('/dashboard/qrcode')}>
              <QrCode className="h-4.5 w-4.5" />
              <span className="text-sm">QR Code Portal</span>
            </Link>
            <Link href="/dashboard/customize" className={navLinkClass('/dashboard/customize')}>
              <Palette className="h-4.5 w-4.5" />
              <span className="text-sm">Customize</span>
            </Link>
            <Link href="/dashboard/settings" className={navLinkClass('/dashboard/settings')}>
              <Settings className="h-4.5 w-4.5" />
              <span className="text-sm">Settings</span>
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <div className="px-6 mt-auto pt-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black hover:bg-slate-50 transition-all w-full text-left cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-grow min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full px-8 h-16 bg-white border-b border-slate-100 sticky top-0 z-40">
          <h2 className="font-display text-lg font-bold text-slate-800 tracking-tight">
            Dashboard
          </h2>
          <div className="flex items-center gap-6">
            {businessDetail?.slug && (
              <div className="flex items-center gap-4 border-r border-slate-200 pr-6 mr-1">
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600 animate-pulse" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard/qrcode"
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>QR Code</span>
                </Link>
                <a
                  href={`/${businessDetail.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors flex items-center gap-1.5"
                >
                  Open Portal <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-500 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dynamic Context Provider */}
        <div className="p-8 max-w-[1280px] w-full mx-auto space-y-8">
          <DashboardContext.Provider value={{ reviews, campaigns, businessDetail, setBusinessDetail, refreshData }}>
            {children}
          </DashboardContext.Provider>
        </div>
      </main>
    </div>
  );
}
