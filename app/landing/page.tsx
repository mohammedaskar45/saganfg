"use client";

import Link from "next/link";
import { useState } from "react";
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
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Info,
  FileText,
  Send,
  Clock,
  UserCheck,
  X,
  Menu,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"home" | "services" | "about" | "contact">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactService, setContactService] = useState("TAX_RESOLUTION");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast("Please fill out all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast("Thank you! Your message has been received. A SaganFG advisor will contact you shortly.", "success");
      // Reset form
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactCompany("");
      setContactMessage("");
    }, 1500);
  };

  return (
    <div className="bg-[#05040e] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Space Ambient Glowing Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Space Dots Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Floating Toast Notification System */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-[0_0_35px_rgba(99,102,241,0.25)] transition-all animate-bounce ${
          toast.type === "success" 
            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-emerald-950/30" 
            : "bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-rose-950/30"
        }`}>
          <div className="p-1 rounded-lg bg-white/5">
            <CheckCircle size={16} className={toast.type === "success" ? "text-emerald-400" : "text-rose-400"} />
          </div>
          <span className="text-xs font-bold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}

      <div>
        {/* White-Label Header */}
        <header className="border-b border-white/5 bg-[#05040e]/70 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/25">
                <Workflow size={18} />
              </div>
              <span className="font-black text-xl tracking-tight text-white">Sagan<span className="text-indigo-400">FG</span></span>
            </div>

            {/* Nav Menu */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold tracking-wider uppercase">
              <button
                onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
                className={`transition-colors hover:text-white cursor-pointer ${activeTab === "home" ? "text-indigo-400 font-black" : "text-slate-400"}`}
              >
                Home OS
              </button>
              <button
                onClick={() => { setActiveTab("services"); setMobileMenuOpen(false); }}
                className={`transition-colors hover:text-white cursor-pointer ${activeTab === "services" ? "text-indigo-400 font-black" : "text-slate-400"}`}
              >
                Services
              </button>
              <button
                onClick={() => { setActiveTab("about"); setMobileMenuOpen(false); }}
                className={`transition-colors hover:text-white cursor-pointer ${activeTab === "about" ? "text-indigo-400 font-black" : "text-slate-400"}`}
              >
                About Us
              </button>
              <button
                onClick={() => { setActiveTab("contact"); setMobileMenuOpen(false); }}
                className={`transition-colors hover:text-white cursor-pointer ${activeTab === "contact" ? "text-indigo-400 font-black" : "text-slate-400"}`}
              >
                Contact
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold px-4 py-2.5 border border-slate-800 hover:border-indigo-500/30 hover:bg-[#0c0926]/40 rounded-xl text-slate-300 hover:text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                Firm Login
              </Link>
              <Link
                href="/portal/demo-magic-token-john-smith-2024"
                className="text-xs font-bold px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center gap-1.5"
              >
                Client Demo Link
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Mobile Burger Menu */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-all"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Open */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-white/5 bg-[#05040e] px-6 py-4 space-y-4 text-xs font-extrabold uppercase tracking-widest text-left">
              <button
                onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
                className={`w-full block py-2 text-left ${activeTab === "home" ? "text-indigo-400" : "text-slate-400"}`}
              >
                Home OS
              </button>
              <button
                onClick={() => { setActiveTab("services"); setMobileMenuOpen(false); }}
                className={`w-full block py-2 text-left ${activeTab === "services" ? "text-indigo-400" : "text-slate-400"}`}
              >
                Services
              </button>
              <button
                onClick={() => { setActiveTab("about"); setMobileMenuOpen(false); }}
                className={`w-full block py-2 text-left ${activeTab === "about" ? "text-indigo-400" : "text-slate-400"}`}
              >
                About Us
              </button>
              <button
                onClick={() => { setActiveTab("contact"); setMobileMenuOpen(false); }}
                className={`w-full block py-2 text-left ${activeTab === "contact" ? "text-indigo-400" : "text-slate-400"}`}
              >
                Contact
              </button>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 border border-slate-800 rounded-xl text-slate-300 block hover:text-white hover:bg-white/5 transition-all"
                >
                  Firm Login
                </Link>
                <Link
                  href="/portal/demo-magic-token-john-smith-2024"
                  className="w-full text-center py-2.5 bg-indigo-600 rounded-xl text-white block font-bold transition-all shadow-sm"
                >
                  Client Demo Link
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Viewport Render Box */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          
          {/* TAB 1: HOME PLATFORM OVERVIEW */}
          {activeTab === "home" && (
            <div className="space-y-16 animate-fade-in">
              {/* Hero Area */}
              <div className="text-center space-y-8 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <Sparkles size={12} className="animate-pulse" />
                  SaganFG Phase 1 Active Suite
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">Modern Tax Firms</span>
                </h1>

                <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  Minimize operational friction with passwordless client portals. Automatically ingest and split multi-form PDFs, stamp compliant Form 8879 signatures, settle billing paywalls, and run local AI-RAG document research.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    Launch Firm Dashboard
                    <ArrowRight size={15} />
                  </Link>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="w-full sm:w-auto px-8 py-4 border border-slate-800 hover:border-slate-500 hover:bg-slate-900/40 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Explore Firm Services
                  </button>
                </div>
              </div>

              {/* Glowing Mockup Visualizer */}
              <div className="relative max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-3xl pointer-events-none" />
                <div className="border border-white/5 bg-[#09071c]/70 rounded-2xl p-6 shadow-2xl relative backdrop-blur-xl">
                  {/* Window Controls */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      SaganFG Workflow Suite
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-3 hover:border-indigo-500/20 transition-all group">
                      <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">Stage 1: Intake</span>
                      <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">Frictionless Checklist Ingestion</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Automatic Prior-Year return parsing classifies files (W2, 1099, 1098) and updates checklists dynamically.
                      </p>
                    </div>
                    
                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-3 hover:border-purple-500/20 transition-all group">
                      <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">Stage 2: Preparation</span>
                      <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">10-Key OCR Workspace</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Live PDF annotation marks, tick grids, and floating tapes log directly to SQLite, speeding up data verification.
                      </p>
                    </div>

                    <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-3 hover:border-cyan-500/20 transition-all group">
                      <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">Stage 3: Delivery</span>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">Invoice-Locked Releases</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        Secure Stripe elements Paywall blocks taxpayer document downloads until checkout webhook marks invoice as PAID.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brief Technical Features Section */}
              <div className="space-y-6 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-white tracking-tight">IRS Security Safeguard Compliance</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineered to meet the absolute highest standards of taxpayer data security, SOC 2 protocols, IRS Publication 4557 safeguards, IRS §7216 non-disclosure consents, and GLBA data privacy frameworks.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED SERVICES COMPONENT */}
          {activeTab === "services" && (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-white bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  Comprehensive Client Financial Services
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sagan Financial Group provides state-of-the-art tax, accounting, and operational advisory services to empower small businesses and individuals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Service 1: Tax Resolution */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 w-max shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                    <Shield size={22} />
                  </div>
                  <h3 className="font-extrabold text-lg text-white">Tax Resolution Services</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Struggling with unfiled returns or IRS notifications? Our expert CPAs provide aggressive, legally compliant tax resolution pathways. We handle audit representation, unfiled back taxes, penalty abatement, and structural negotiations to relieve collection stresses.
                  </p>
                  <ul className="text-[11px] text-indigo-300 font-bold space-y-1.5">
                    <li className="flex items-center gap-1.5">&bull; Professional IRS Representation & Audits</li>
                    <li className="flex items-center gap-1.5">&bull; Back Taxes Settlement & Penalty Abatement</li>
                    <li className="flex items-center gap-1.5">&bull; Levy and Lien Release Support</li>
                  </ul>
                </div>

                {/* Service 2: Bookkeeping */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 hover:border-purple-500/30 hover:bg-white/[0.03] transition-all">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 w-max shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                    <TrendingUp size={22} />
                  </div>
                  <h3 className="font-extrabold text-lg text-white">Advanced Bookkeeping & Reporting</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gain absolute financial clarity. We offer precise monthly bookkeeping, detailed bank and credit ledger reconciliations, balance sheets, and real-time cash flow monitoring to keep your business operating in maximum health.
                  </p>
                  <ul className="text-[11px] text-purple-300 font-bold space-y-1.5">
                    <li className="flex items-center gap-1.5">&bull; Real-time Ledger & Bank Reconciliations</li>
                    <li className="flex items-center gap-1.5">&bull; Balance Sheet & P&L Statement Compilation</li>
                    <li className="flex items-center gap-1.5">&bull; Year-End Closing Packages & Tax-Ready Books</li>
                  </ul>
                </div>

                {/* Service 3: Payroll & HR */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 hover:border-cyan-500/30 hover:bg-white/[0.03] transition-all">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 w-max shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                    <UserCheck size={22} />
                  </div>
                  <h3 className="font-extrabold text-lg text-white">Full-Service Payroll & HR Systems</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automate employee compensation smoothly. We manage comprehensive payroll calculations, federal/state payroll tax filings, direct deposits, secure employee onboarding checklisting, and HR compliance support.
                  </p>
                  <ul className="text-[11px] text-cyan-300 font-bold space-y-1.5">
                    <li className="flex items-center gap-1.5">&bull; Direct Deposit & Quarterly/Annual Tax Filings</li>
                    <li className="flex items-center gap-1.5">&bull; Annual W-2 and 1099 Contractor Issuances</li>
                    <li className="flex items-center gap-1.5">&bull; Onboarding Systems & Employee Data Security</li>
                  </ul>
                </div>

                {/* Service 4: Tax Prep & Planning */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 w-max shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                    <Zap size={22} />
                  </div>
                  <h3 className="font-extrabold text-lg text-white">Tax Preparation & Strategic Planning</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Optimize tax burdens year-round. We provide strategic tax planning, quarterly estimate tuning, individual tax filing (Form 1040), corporate filings (Form 1120/1120S, Partnership Form 1065), and state returns.
                  </p>
                  <ul className="text-[11px] text-indigo-300 font-bold space-y-1.5">
                    <li className="flex items-center gap-1.5">&bull; Form 1040, 1065, 1120, and 1120S Ingestion</li>
                    <li className="flex items-center gap-1.5">&bull; Proactive Year-Round Liability Reduction Strategies</li>
                    <li className="flex items-center gap-1.5">&bull; Quarterly Estimate Calculations & Compliance</li>
                  </ul>
                </div>
              </div>

              {/* Consultation CTA */}
              <div className="p-8 border border-white/5 bg-[#09071c]/50 rounded-2xl backdrop-blur-xl text-center space-y-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.08),transparent_60%)]" />
                <h4 className="font-extrabold text-base text-white relative z-10">Need a Custom Financial Consultation?</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl mx-auto relative z-10">
                  Connect with our credentialed CPAs to audit your books, structure business payroll, or file complex mult-state business returns.
                </p>
                <button
                  onClick={() => setActiveTab("contact")}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer relative z-10 uppercase tracking-wider"
                >
                  Schedule Free Advisory Call
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT US COMPONENT */}
          {activeTab === "about" && (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-white bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  About Sagan Financial Group
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Partnering with small businesses, family operations, and forward-thinking enterprises across the United States.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Column 1: Core Mission */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded w-max block">Our Mission</span>
                    <h3 className="font-bold text-base text-white">Your Financial Co-Pilot</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      At Sagan Financial Group, we believe small businesses deserve the absolute highest tier of financial planning, bookkeeping, and tax preparation without executive pricing. We act as your fractional CFO and accounting partner, structuring secure pipelines so you can concentrate solely on scaling operations.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[10px] text-indigo-300 font-bold">
                    <CheckCircle size={14} />
                    <span>Credentialed CPAs & Advisory Staff</span>
                  </div>
                </div>

                {/* Column 2: Security First */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded w-max block">IRS Data Security</span>
                    <h3 className="font-bold text-base text-white">Pub 4557 & §7216 Protocols</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      We protect financial identities rigorously. SaganFG leverages bank-grade AES-256 GCM encryption, strict multi-factor authentication access matrices, and physical/digital system monitoring to meet SOC 2, IRS §7216 data privacy standards, and federal financial safeguards.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[10px] text-purple-300 font-bold">
                    <Lock size={14} />
                    <span>AES-256 GCM Encrypted at Rest</span>
                  </div>
                </div>

                {/* Column 3: The Advantage */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded w-max block">Modern Tech</span>
                    <h3 className="font-bold text-base text-white">SaaS Integrated Experience</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Skip standard, clunky tax filing back-and-forths. Our custom platform provides secure magic links, automatic PDF data extraction, cryptographic signature overlays, and payment portals so you can fulfill requests in single clicks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[10px] text-cyan-300 font-bold">
                    <Zap size={14} />
                    <span>Integrated Client Portals & Webhooks</span>
                  </div>
                </div>
              </div>

              {/* Values Quote */}
              <div className="border-l-4 border-indigo-600 bg-white/[0.01] p-6 rounded-r-2xl space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Sagan Financial Group was founded to provide transparent white-label bookkeeping and automated tax filings. We combine credentialed accounting expertise with cutting-edge tech structures to act as the primary financial engine for small businesses nationwide."
                </p>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">&mdash; Corporate Board of SaganFG</span>
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE CONTACT US COMPONENT */}
          {activeTab === "contact" && (
            <div className="space-y-12 animate-fade-in">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-white bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  Connect With a Financial Advisor
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Have questions about bookkeeping, payroll setup, or complex corporate tax returns? Submit your inquiry below to connect with a CPA.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-5">
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wider pb-2 border-b border-white/5">Corporate Office</h3>
                    
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                        <a href="mailto:Info@SaganFG.com" className="text-xs font-bold text-white hover:text-indigo-400 transition-colors block mt-0.5">Info@SaganFG.com</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
                        <a href="tel:423-607-2464" className="text-xs font-bold text-white hover:text-indigo-400 transition-colors block mt-0.5">423-607-2464</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Location</span>
                        <p className="text-xs font-bold text-white mt-0.5">United States Operations</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-300 leading-relaxed font-semibold">
                    <Info size={14} className="inline mr-1.5 -mt-0.5 text-indigo-400" />
                    <strong>Note:</strong> Standard business consultation hours are Monday through Friday, 9:00 AM - 5:00 PM EST. All client communications are protected under strict CPA non-disclosure protocols.
                  </div>
                </div>

                {/* Interactive Consultation Form */}
                <div className="lg:col-span-2 p-6 bg-white/[0.01] border border-white/5 rounded-2xl backdrop-blur-xl relative">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-3.5 py-3 bg-[#0c0926]/80 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="john@company.com"
                          className="w-full px-3.5 py-3 bg-[#0c0926]/80 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="(123) 456-7890"
                          className="w-full px-3.5 py-3 bg-[#0c0926]/80 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-1.5">Company Name</label>
                        <input
                          type="text"
                          value={contactCompany}
                          onChange={(e) => setContactCompany(e.target.value)}
                          placeholder="Acme Corp LLC"
                          className="w-full px-3.5 py-3 bg-[#0c0926]/80 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-1.5">Service of Interest *</label>
                      <select
                        value={contactService}
                        onChange={(e) => setContactService(e.target.value)}
                        className="w-full px-3.5 py-3 bg-[#0c0926]/80 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold transition-all cursor-pointer"
                      >
                        <option value="TAX_RESOLUTION" className="bg-[#05040e]">Tax Resolution & Audit Defense</option>
                        <option value="BOOKKEEPING" className="bg-[#05040e]">Monthly Bookkeeping & Reporting</option>
                        <option value="PAYROLL" className="bg-[#05040e]">Payroll & HR Compliance</option>
                        <option value="TAX_PREP" className="bg-[#05040e]">Tax Preparation & Planning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-1.5">Message / Inquiry Details *</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Briefly describe your tax situation or accounting requirements..."
                        className="w-full px-3.5 py-3 bg-[#0c0926]/80 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-1.5 animate-pulse">
                          Sending Request...
                        </span>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Submit Advisory Request</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Corporate Footers & Privacy Links */}
      <footer className="border-t border-white/5 bg-[#030209] py-12 text-slate-500 text-xs mt-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-2 rounded-xl text-indigo-400 border border-white/5">
                <Workflow size={16} />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block">Sagan Financial Group</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Corporate WHITE-LABEL Portal Suite</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-extrabold uppercase tracking-widest">
              <button onClick={() => { setActiveTab("home"); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">Home OS</button>
              <button onClick={() => { setActiveTab("services"); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">Services</button>
              <button onClick={() => { setActiveTab("about"); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">About Us</button>
              <button onClick={() => { setActiveTab("contact"); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">Contact Us</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold">
            <p className="text-slate-500">
              &copy; 2026 Sagan Financial Group. All Rights Reserved. Protected by SOC 2, GLBA, and IRS Pub 4557 Safeguards.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowPrivacyModal(true)} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
              <span>&bull;</span>
              <button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {/* COMPLIANCE OVERLAYS */}
      
      {/* 1. Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b081e] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 flex flex-col justify-between max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Shield size={16} className="text-indigo-400" />
                IRS-Compliant Privacy Policy
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto text-[11px] text-slate-300 space-y-4 pr-1 leading-relaxed text-left font-medium">
              <p><strong>Effective Date:</strong> January 1, 2026</p>
              <p>
                Sagan Financial Group ("SaganFG") respects the absolute confidentiality of your tax and financial information. This Privacy Policy details how we collect, store, encrypt, and disclose taxpayer data in compliance with the **Gramm-Leach-Bliley Act (GLBA) Safeguards Rule**, **IRS §7216 Protocols**, and **IRS Publication 4557** regulations.
              </p>
              <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wide border-l-2 border-indigo-500 pl-1.5">1. Information Collection & Usage</h4>
              <p>
                We collect primary taxpayer coordinates, Social Security Numbers (SSN), Employer Identification Numbers (EIN), W-2 wages, 1099 interest statements, asset sheets, and prior year returns. Under **IRS Section 7216**, these data points are leveraged exclusively for the direct preparation of tax returns and cannot be used or disclosed for any secondary marketing purposes without explicit written taxpayer consent.
              </p>
              <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wide border-l-2 border-indigo-500 pl-1.5">2. Technical & Physical Security Safeguards</h4>
              <p>
                SaganFG maintains industry-leading data security measures:
                <br />- **Encryption**: All taxpayer documents are encrypted at rest utilizing robust **AES-256 GCM** encryption grids and securely transmitted via SSL/TLS.
                <br />- **Authentication**: Access to user records is strictly filtered via multi-factor authentication (MFA) and granular role-based authorization rules.
                <br />- **Monitoring**: All API requests, logins, and checklist changes are logged in immutable, tamper-resistant audit trails.
              </p>
              <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wide border-l-2 border-indigo-500 pl-1.5">3. Third-Party Sharing Limits</h4>
              <p>
                We do not sell, trade, or distribute client listings or financial records. Sharing only occurs with authorized regulatory bodies (such as filing direct electronic returns to the IRS/state departments) or secure third-party financial modules (like Stripe Elements paywall processing) solely to process requested transactions.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Acknowledge Privacy Safeguards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b081e] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 flex flex-col justify-between max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <FileText size={16} className="text-indigo-400" />
                Terms & Conditions of Service
              </h3>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto text-[11px] text-slate-300 space-y-4 pr-1 leading-relaxed text-left font-medium">
              <p><strong>Last Updated:</strong> January 1, 2026</p>
              <p>
                Welcome to the Sagan Financial Group ("SaganFG") white-label digital tax portal. By accessing your magic link, logging into the firm dashboard, uploading documents, or signing Form 8879, you covenant and agree to the following terms:
              </p>
              <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wide border-l-2 border-indigo-500 pl-1.5">1. Accuracy of Uploaded Materials</h4>
              <p>
                Taxpayers covenant to provide complete, truthful, and accurate documentation (including W-2s, Schedule C logs, 1099 interest, and prior returns). SaganFG prepares returns solely based on client-provided data and does not audit original document validity unless separately engaged.
              </p>
              <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wide border-l-2 border-indigo-500 pl-1.5">2. Cryptographic E-Sign Agreements</h4>
              <p>
                By signing tax authorization Form 8879 or engagement letters within this portal, you agree that your cryptographic digital signature acts as a legally binding, fully certified signature under the **Electronic Signatures in Global and National Commerce (ESIGN) Act**. Each signature captures IP records, timestamps, and browser configurations for audit logs.
              </p>
              <h4 className="font-extrabold text-white uppercase text-[10px] tracking-wide border-l-2 border-indigo-500 pl-1.5">3. Invoicing Paywall locks</h4>
              <p>
                In compliance with professional standards, SaganFG reserves the right to lock finalized tax PDF workpapers and direct e-filing transmissions until all invoice fees have been successfully processed and marked PAID via the Stripe Elements integration.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Accept Terms of Service
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
