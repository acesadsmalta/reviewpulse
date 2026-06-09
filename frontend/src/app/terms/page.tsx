'use client';

import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-400">Last updated: June 8, 2026</p>
          
          <div className="space-y-6 text-slate-600 leading-relaxed text-base">
            <p>
              By accessing the website at pulsereview.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">1. Use License</h2>
            <p>
              Permission is granted to temporarily access the dashboard materials on Pulse Review's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the system scripts or dashboard templates;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial) outside of your own business settings;</li>
              <li>Attempt to decompile or reverse engineer any software contained on Pulse Review's website;</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <h2 className="text-2xl font-bold text-foreground pt-4">2. Disclaimer</h2>
            <p>
              The materials on Pulse Review's website are provided on an 'as is' basis. Pulse Review makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
