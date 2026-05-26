"use client";

import Link from "next/link";
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  PenTool,
  Workflow,
  Sparkles,
  Layers,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#090D1F] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Background glowing nodes */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-[#090D1F]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Workflow size={20} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">Sagan<span className="text-indigo-400">FG</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Core Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow Stages</a>
            <a href="#security" className="hover:text-white transition-colors">Compliance</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all"
            >
              Firm Login
            </Link>
            <Link
              href="/portal/demo-magic-token-john-smith-2024"
              className="text-xs font-bold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center gap-1"
            >
              Client Demo Link
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-extrabold tracking-wider uppercase">
          <Sparkles size={12} />
          Now Active: SaganFG Phase 1 Workflow Suite
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">Modern Tax Firms</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Minimize friction with secure passwordless client portals. Automatically split multi-form PDFs, stamp compliant Form 8879 signatures, settle billing paywalls, and run AI RAG document research.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            Launch Firm Dashboard
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
          >
            Explore Core Capabilities
          </a>
        </div>

        {/* Floating Mockup Dashboard */}
        <div className="pt-12 relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl pointer-events-none" />
          <div className="border border-slate-800 bg-[#0c122a] rounded-2xl p-6 shadow-2xl relative">
            {/* Window controls */}
            <div className="flex gap-1.5 border-b border-slate-800/80 pb-4 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-slate-500 font-bold ml-2">SaganFG Tax Portal — Project Workspace</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider">Stage 1: Intake</span>
                <h4 className="font-bold text-xs text-white">Frictionless checklisting</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Automatic Prior-Year return parsing matches documents to required items dynamically.
                </p>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider">Stage 2: Workpaper</span>
                <h4 className="font-bold text-xs text-white">10-Key Annotation Tools</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  CPA tick marks, highlight controls, and floating calculator tapes stamp logs straight onto the database.
                </p>
              </div>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider">Stage 4: Delivery</span>
                <h4 className="font-bold text-xs text-white">Held Invoice Paywalls</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Automatic Stripe ACH gateways lock final PDF downloads until invoicing shows PAID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-950/20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Full-Suite SaaS Operations</h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">
              Everything required to scale a multi-tenant CPA firm modeled directly after the industry-leading Truss.io clone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="p-6 border border-slate-800 bg-[#0c122a]/40 rounded-2xl hover:border-indigo-500/30 transition-all space-y-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-max">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-sm text-white">Smart Split & OCR rename</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Server-side parser scans pages, identifies Form boundary headers (W2, 1099, 1098), slices composite uploads, and matches items.
              </p>
            </div>
            {/* Box 2 */}
            <div className="p-6 border border-slate-800 bg-[#0c122a]/40 rounded-2xl hover:border-indigo-500/30 transition-all space-y-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-max">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-sm text-white">Max AI Document RAG</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                OpenAI GPT-4o scans uploaded tax sheets and acts as a contextual source database for precise, cited Natural Language Q&A.
              </p>
            </div>
            {/* Box 3 */}
            <div className="p-6 border border-slate-800 bg-[#0c122a]/40 rounded-2xl hover:border-indigo-500/30 transition-all space-y-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-max">
                <PenTool size={20} />
              </div>
              <h3 className="font-bold text-sm text-white">Cryptographic PDF signing</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Form 8879 compliance stamp seals. Overlays taxpayers' cursive signatures with IP logs, timestamps, and browsers audit certificates.
              </p>
            </div>
            {/* Box 4 */}
            <div className="p-6 border border-slate-800 bg-[#0c122a]/40 rounded-2xl hover:border-indigo-500/30 transition-all space-y-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-max">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold text-sm text-white">Stripe Elements Billing</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dynamic invoice pay gateways redirecting clients to Stripe checkout panels and checking payments using verified secure webhooks.
              </p>
            </div>
            {/* Box 5 */}
            <div className="p-6 border border-slate-800 bg-[#0c122a]/40 rounded-2xl hover:border-indigo-500/30 transition-all space-y-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-max">
                <Layers size={20} />
              </div>
              <h3 className="font-bold text-sm text-white">Multi-Tenant RBAC grid</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Customize operational parameters across the 6 firm categories using an active dynamic check-grid database settings table.
              </p>
            </div>
            {/* Box 6 */}
            <div className="p-6 border border-slate-800 bg-[#0c122a]/40 rounded-2xl hover:border-indigo-500/30 transition-all space-y-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-max">
                <Lock size={20} />
              </div>
              <h3 className="font-bold text-sm text-white">AES-256 GCM security</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Secure cryptographical keys encrypt highly sensitive taxpayer credentials (SSN, EIN, bank records) at rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance / Security Banner */}
      <section id="security" className="py-16 border-t border-slate-800 bg-slate-900/10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <Shield className="mx-auto text-indigo-500" size={32} />
          <h2 className="text-xl md:text-2xl font-extrabold text-white">Security & Regulation Compliance</h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mx-auto">
            SaganFG is engineered to support strict vertical regulatory environments. Designed to facilitate SOC 2 Type II controls, IRS Publication 4557 safeguards for taxpayer data protection, IRS §7216 compliance protocols, and GLBA Safeguards for financial information privacy.
          </p>
          <div className="flex justify-center gap-6 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
            <span>SOC 2 Ready</span>
            <span>IRS §7216</span>
            <span>AES-256 Encryption</span>
            <span>US Residency</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Workflow size={16} className="text-indigo-500" />
            <span className="font-bold text-white">SaganFG</span>
            <span>© 2026 Sagan Financial Group. All Rights Reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
