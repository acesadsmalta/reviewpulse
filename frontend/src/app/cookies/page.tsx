'use client';

import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';

export default function CookiesPage() {
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
          <h1 className="text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
          <p className="text-sm text-slate-400">Last updated: June 8, 2026</p>
          
          <div className="space-y-6 text-slate-600 leading-relaxed text-base">
            <p>
              This is the Cookie Policy for Pulse Review, accessible from pulsereview.com.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">1. What Are Cookies</h2>
            <p>
              As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
            </p>
            <h2 className="text-2xl font-bold text-foreground pt-4">2. How We Use Cookies</h2>
            <p>
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account related cookies:</strong> If you create an account with us, we will use cookies for the management of the signup process and general administration.</li>
              <li><strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
              <li><strong>Security cookies:</strong> We use cookies to verify identity and maintain safety checks on active sessions.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
