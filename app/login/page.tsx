"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Detect invitation query params
  const inviteEmail = searchParams.get("invite");
  const inviteName = searchParams.get("name");
  const inviteRole = searchParams.get("role");

  // Sign-in states
  const [email, setEmail] = useState("superadmin@gmail.com");
  const [password, setPassword] = useState("superadmin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Setup password states
  const [setupPassword, setSetupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  // Handle standard login submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  // Handle invite password setup submit
  async function handleSetupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (setupPassword !== confirmPassword) {
      setSetupError("Passwords do not match. Please try again.");
      return;
    }
    if (setupPassword.length < 6) {
      setSetupError("Password must be at least 6 characters long.");
      return;
    }

    setSetupLoading(true);
    setSetupError("");

    try {
      const res = await fetch("/api/v1/settings/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, password: setupPassword }),
      });

      if (res.ok) {
        // Automatically sign in the user immediately
        const result = await signIn("credentials", {
          email: inviteEmail,
          password: setupPassword,
          redirect: false,
        });

        if (result?.error) {
          setSetupError("Account activated, but auto-login failed. Please sign in manually below.");
          setSetupLoading(false);
          // Redirect to standard login mode by cleaning query params
          router.replace("/login");
        } else {
          router.push("/dashboard");
        }
      } else {
        setSetupError(await res.text());
        setSetupLoading(false);
      }
    } catch (err) {
      console.error("Invite setup error:", err);
      setSetupError("Failed to configure password. Please try again.");
      setSetupLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #0D1B4B 0%, #1e3a7a 50%, #0D1B4B 100%)",
        }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#4F46E5" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">SaganFG</p>
              <p className="text-blue-300 text-xs">Tax Workflow Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              More-in-one<br />tax workflow.
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed">
              From client organizers to prep to delivery — the complete platform for modern accounting firms.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: "📋", text: "AI-powered intake & checklists", stage: "#0EA5E9" },
              { icon: "📄", text: "Tick-and-tie workpaper review", stage: "#7C3AED" },
              { icon: "🤖", text: "AI return preparation support", stage: "#F97316" },
              { icon: "✍️", text: "E-sign, invoice & K-1 delivery", stage: "#22C55E" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: f.stage }}
                />
                <span className="text-blue-100 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="border border-white/10 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
          <p className="text-blue-100 text-sm italic leading-relaxed mb-3">
            "This platform transformed our tax season. Client intake that used to take days now takes hours."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#4F46E5" }}
            >
              SF
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Sagan Financial Group</p>
              <p className="text-blue-300 text-xs">Enterprise Client</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Forms Context */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#4F46E5" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">SaganFG</p>
              <p className="text-indigo-600 text-xs">Tax Workflow Platform</p>
            </div>
          </div>

          {/* DYNAMIC VIEWPORT (Invite Accept OR Standard Login) */}
          {inviteEmail ? (
            /* VIEW 1: Accept Invitation & Setup Password Form */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                  Account Activation
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-3">Configure Password</h2>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  Welcome <strong>{inviteName || "Team Member"}</strong>! Choose a secure password to activate your firm workspace access as a <strong>{inviteRole || "PREPARER"}</strong>.
                </p>
              </div>

              <form onSubmit={handleSetupSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={inviteEmail}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Choose Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  />
                </div>

                {setupError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-red-600 text-xs font-semibold">{setupError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={setupLoading}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    background: setupLoading ? "#9ca3af" : "#4F46E5",
                  }}
                >
                  {setupLoading ? "Activating account..." : "Activate Account & Sign In"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => router.replace("/login")}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                  >
                    Back to Standard Sign In
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* VIEW 2: Standard Login Form */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sign in to your firm account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@firm.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    background: loading ? "#9ca3af" : "#4F46E5",
                  }}
                >
                  {loading ? "Signing in..." : "Sign in to your account"}
                </button>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-700 mb-2">🔑 Demo Credentials</p>
                <div className="space-y-1 font-medium text-gray-700">
                  <p className="text-xs text-indigo-600">
                    <span className="font-bold">Email:</span> superadmin@gmail.com
                  </p>
                  <p className="text-xs text-indigo-600">
                    <span className="font-bold">Password:</span> superadmin
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Sagan Financial Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin text-indigo-600" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" className="opacity-25" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
          </svg>
          <span className="text-xs font-semibold text-gray-500 mt-1">Configuring secure session context...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
