'use client';

import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="flex justify-between items-center pb-6 border-b border-premium">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-black transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-foreground text-white rounded-none">
              <Star className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground font-sans">PULSE REVIEW</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: June 8, 2026</p>
          
          <div className="space-y-6 text-slate-600 leading-relaxed text-base">
            <p>
              At Pulse Review, accessible from pulsereview.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Pulse Review and how we use it.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you register a business profile, configure your integration channels, or communicate with our support team. This includes your business name, email address, custom logo URL, website URL, and connection tokens for Google Business Profile or other review platforms.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">2. How We Use Your Information</h2>
            <p>
              We use the collected information in various ways, including to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our review management services.</li>
              <li>Improve, personalize, and expand our platform functionality.</li>
              <li>Analyze your usage pattern to improve your calculated Pulse Score.</li>
              <li>Develop new features, services, and integrations.</li>
              <li>Send transaction emails, support responses, and alert notifications.</li>
            </ul>
            <h2 className="text-2xl font-bold text-foreground pt-4">3. Database and Session Security</h2>
            <p>
              We utilize secure MySQL database configurations to maintain isolation boundaries between different tenants. All session tokens are protected using standard token hashes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
