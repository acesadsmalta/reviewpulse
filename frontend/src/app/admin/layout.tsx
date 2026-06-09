'use client';

import { useEffect, useState, createContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, ArrowRight, Loader2, Building, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';

export interface AdminContextType {
  businesses: any[];
  reviews: any[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

export const AdminContext = createContext<AdminContextType | null>(null);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const me = await api.get<any>('/auth/me');
      setUser(me.user);

      if (me.role !== 'superadmin') {
        router.push('/login');
        return;
      }

      // Fetch admin data
      const [bizList, reviewList] = await Promise.all([
        api.get<any[]>('/admin/businesses'),
        api.get<any[]>('/admin/reviews'),
      ]);
      setBusinesses(bizList);
      setReviews(reviewList);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin session:', err);
      handleLogout();
    }
  };

  const refreshData = async () => {
    try {
      const [bizList, reviewList] = await Promise.all([
        api.get<any[]>('/admin/businesses'),
        api.get<any[]>('/admin/reviews'),
      ]);
      setBusinesses(bizList);
      setReviews(reviewList);
    } catch (err) {
      console.error('Failed to refresh admin data:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('pulse_review_token');
    const role = localStorage.getItem('pulse_review_role');
    
    if (!token || role !== 'superadmin') {
      router.push('/login');
    } else {
      loadData();
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

  if (loading) {
    return <Loader />;
  }

  const isLinkActive = (path: string, exact = false) => {
    return exact ? pathname === path : pathname.startsWith(path);
  };

  const navLinkClass = (path: string, exact = false) => {
    const active = isLinkActive(path, exact);
    return `w-full flex items-center gap-3 px-4 py-3 rounded font-bold transition-all text-left border-l-2 ${
      active 
        ? 'border-[#2563EB] bg-slate-50 text-slate-900' 
        : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
    }`;
  };

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Businesses';
    if (pathname.startsWith('/admin/reviews')) return 'Global Reviews';
    return 'Admin Console';
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
              <p className="text-[8px] font-bold text-[#2563EB] uppercase tracking-wider mt-0.5">Super Admin Console</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 space-y-1.5">
            <Link href="/admin" className={navLinkClass('/admin', true)}>
              <Building className="h-4.5 w-4.5" />
              <span className="text-sm">Businesses</span>
            </Link>
            <Link href="/admin/reviews" className={navLinkClass('/admin/reviews')}>
              <Star className="h-4.5 w-4.5" />
              <span className="text-sm">Global Reviews</span>
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
            Pulse Review — {getPageTitle()}
          </h2>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-slate-500 hover:text-black transition-colors flex items-center gap-1"
          >
            Sign Out <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Dynamic Context Provider */}
        <div className="p-8 max-w-[1280px] w-full mx-auto space-y-8">
          <AdminContext.Provider value={{ businesses, reviews, refreshData, loading }}>
            {children}
          </AdminContext.Provider>
        </div>
      </main>
    </div>
  );
}
