"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, ArrowRight, ChevronLeft, CheckCircle2, Mail, Lock, User, Loader2, RefreshCw } from "lucide-react";
import OnboardingCustomer from "./OnboardingCustomer";
import OnboardingShop from "./OnboardingShop";
import OnboardingRider from "./OnboardingRider";

export type AuthRole = "customer" | "shop" | "rider" | "admin";

export interface AuthProfile {
  role: AuthRole;
  phone: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  make?: string;
  model?: string;
  district?: string;
  shopName?: string;
  ownerName?: string;
  market?: string;
  street?: string;
  brands?: string[];
  tin?: string;
  licenseNum?: string;
  shopPhoto?: string | null;
  shelfPhoto?: string | null;
  bank?: string;
  accountNumber?: string;
  vehicleType?: string;
  plate?: string;
  areas?: string[];
  idNumber?: string;
  idPhoto?: string | null;
  licensePhoto?: string | null;
  payoutService?: string;
  payoutNumber?: string;
  [key: string]: any;
}

type AuthScreen = "role-pick" | "credentials" | "otp" | "onboarding" | "pending-review" | "admin-login";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthComplete: (role: AuthRole, profile: AuthProfile) => void;
  onPendingReview: (role: AuthRole, profile: AuthProfile) => void;
  knownPhones?: Set<string>;
  onPhoneUsed?: (phone: string) => void;
  initialRole?: AuthRole | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ROLE_CARDS = [
  {
    id: "customer" as AuthRole,
    backendRole: "BUYER",
    emoji: "🔧",
    title: "Customer",
    subtitle: "Find & request spare parts for my vehicle",
    accent: "border-[#D93A10]/60 hover:border-[#D93A10] from-red-950/30",
  },
  {
    id: "shop" as AuthRole,
    backendRole: "VENDOR",
    emoji: "🏪",
    title: "Shop Owner",
    subtitle: "List my parts inventory and receive RFQs",
    accent: "border-blue-800/50 hover:border-blue-500 from-blue-950/30",
  },
  {
    id: "rider" as AuthRole,
    backendRole: "COURIER",
    emoji: "🛵",
    title: "Delivery Rider",
    subtitle: "Deliver parts across Addis Ababa and earn",
    accent: "border-emerald-800/50 hover:border-emerald-500 from-emerald-950/30",
  },
  {
    id: "admin" as AuthRole,
    backendRole: "ADMIN",
    emoji: "🛡️",
    title: "Administrator / Staff",
    subtitle: "Central dispute arbitration, escrow audit & application approvals",
    accent: "border-purple-800/60 hover:border-purple-500 from-purple-950/40",
  },
];

export default function AuthModal({
  isOpen,
  onClose,
  onAuthComplete,
  onPendingReview,
  initialRole = null,
}: AuthModalProps) {
  const [screen, setScreen] = useState<AuthScreen>("role-pick");
  const [role, setRole] = useState<AuthRole | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // OTP inputs
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [resendCd, setResendCd] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Admin login inputs
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setRole(initialRole);
        if (initialRole === "admin") {
          setScreen("admin-login");
        } else {
          setScreen("credentials");
        }
      } else {
        setScreen("role-pick");
        setRole(null);
      }
      setAuthMode("login");
      setFullName("");
      setEmail("");
      setPassword("");
      setLoading(false);
      setFormError("");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setChallengeId(null);
      setResendCd(0);
      setAdminUsername("");
      setAdminPassword("");
      setAdminError("");
    }
  }, [isOpen, initialRole]);

  // Resend countdown
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  if (!isOpen) return null;

  const handleSelectRole = (r: AuthRole) => {
    setRole(r);
    setFormError("");
    setFullName("");
    setEmail("");
    setPassword("");
    setAdminUsername("");
    setAdminPassword("");
    setAdminError("");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setChallengeId(null);
    if (r === "admin") {
      setScreen("admin-login");
    } else {
      setScreen("credentials");
    }
  };

  const getBackendRole = (r: AuthRole): string => {
    if (r === "customer") return "BUYER";
    if (r === "shop") return "VENDOR";
    if (r === "rider") return "COURIER";
    return "ADMIN";
  };

  // Submit Sign In or Sign Up credentials
  const handleCredentialsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }
    if (authMode === "signup" && !fullName.trim()) {
      setFormError("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      if (authMode === "signup") {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            fullName: fullName.trim(),
            role: getBackendRole(role!),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || "Registration failed");
        }

        setResendCd(60);
        setScreen("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else {
        // Sign In
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: cleanEmail,
            password,
            requiredRole: getBackendRole(role!),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || "Invalid email or password");
        }

        if (data.requires2FA) {
          setChallengeId(data.challengeId);
          setResendCd(60);
          setOtp(["", "", "", "", "", ""]);
          setScreen("otp");
          setTimeout(() => otpRefs.current[0]?.focus(), 50);
        } else if (data.accessToken) {
          // Trusted device login bypass
          if (typeof window !== "undefined") {
            localStorage.setItem("terasync_access_token", data.accessToken);
            localStorage.setItem("terasync_refresh_token", data.refreshToken);
          }
          const profile: AuthProfile = {
            role: role!,
            email: data.user.email,
            fullName: data.user.fullName,
            firstName: data.user.fullName?.split(" ")[0] || "User",
            phone: data.user.phoneNumber || "",
          };
          onAuthComplete(role!, profile);
          onClose();
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to connect to authentication service");
    } finally {
      setLoading(false);
    }
  };

  // OTP changes
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerifyOtp();
    }
  };

  // Verify 6-digit OTP code
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setOtpError("");
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (authMode === "signup") {
        const res = await fetch(`${API_BASE}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: cleanEmail,
            code,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || "Invalid or expired verification code");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("terasync_access_token", data.accessToken);
          localStorage.setItem("terasync_refresh_token", data.refreshToken);
        }

        // Newly signed up user proceeds to role onboarding
        setScreen("onboarding");
      } else {
        // Sign In verification
        if (!challengeId) {
          throw new Error("Challenge ID missing. Please sign in again.");
        }

        const res = await fetch(`${API_BASE}/auth/login/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            challengeId,
            code,
            rememberDevice: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || data?.message || "Invalid login code");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("terasync_access_token", data.accessToken);
          localStorage.setItem("terasync_refresh_token", data.refreshToken);
        }

        const isAdmin = data.user.role === "ADMIN" || role === "admin";
        const isShop = data.user.role === "VENDOR" || role === "shop";
        const assignedRole: AuthRole = isAdmin ? "admin" : isShop ? "shop" : (role || "customer");
        const profile: AuthProfile = {
          role: assignedRole,
          email: data.user.email,
          fullName: data.user.fullName,
          firstName: data.user.fullName?.split(" ")[0] || (isAdmin ? "Admin" : isShop ? "Merchant" : "User"),
          phone: data.user.phoneNumber || "0911000000",
          shopName: data.user.shopName || (isShop ? (data.user.fullName ? `${data.user.fullName}'s Auto Spares` : "Alpha Auto Spares") : undefined),
          market: data.user.market || (isShop ? "Teklehaymanot" : undefined),
          clearanceLevel: isAdmin ? "TIER_3_OPERATIONS" : undefined,
        };

        onAuthComplete(assignedRole, profile);
        onClose();
      }
    } catch (err: any) {
      setOtpError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResendCode = async () => {
    if (resendCd > 0) return;
    setLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`${API_BASE}/auth/code/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: authMode === "signup" ? "VERIFY_EMAIL" : "LOGIN",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "Failed to resend code");
      }
      if (data.challengeId) {
        setChallengeId(data.challengeId);
      }
      setResendCd(60);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // Admin login handler
  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminError("");
    const cleanUser = adminUsername.trim().toLowerCase();
    const pass = adminPassword.trim();

    if (!cleanUser || !cleanUser.includes("@")) {
      setAdminError("Please enter a valid admin email address");
      return;
    }
    if (cleanUser !== "besufkadtekalign@gmail.com") {
      setAdminError("Access Denied: Only authorized Central Operations Administrator can access this desk.");
      return;
    }
    if (!pass) {
      setAdminError("Please enter your admin password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanUser,
          password: pass,
          requiredRole: "ADMIN",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "Admin authentication failed");
      }

      if (data.requires2FA) {
        setRole("admin");
        setEmail(cleanUser);
        setChallengeId(data.challengeId);
        setAuthMode("login");
        setResendCd(60);
        setOtp(["", "", "", "", "", ""]);
        setScreen("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("terasync_access_token", data.accessToken);
          localStorage.setItem("terasync_refresh_token", data.refreshToken);
        }
        onAuthComplete("admin", {
          role: "admin",
          phone: "0911000000",
          email: cleanUser,
          fullName: data.user.fullName,
          clearanceLevel: "TIER_3_OPERATIONS",
        });
        onClose();
      }
    } catch (err: any) {
      setAdminError(err.message || "Invalid Admin credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardComplete = (profile: Record<string, unknown>) => {
    const fullProfile: AuthProfile = {
      role: role!,
      phone: String((profile as any)?.phone || "0911000000"),
      email: email.trim().toLowerCase(),
      fullName: fullName.trim() || undefined,
      ...profile,
    };
    if (role === "customer") {
      onAuthComplete("customer", fullProfile);
      onClose();
    } else {
      setScreen("pending-review");
      onPendingReview(role!, fullProfile);
    }
  };

  const backLabel: Partial<Record<AuthScreen, string>> = {
    credentials: "role-pick",
    otp: "credentials",
    "admin-login": "role-pick",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-[#0F1012] border border-[#3A3F45] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-[#3A3F45] px-6 py-4 flex items-center justify-between rounded-t-3xl bg-[#15171A]">
          <div className="flex items-center gap-3">
            {backLabel[screen] && (
              <button
                onClick={() => setScreen(backLabel[screen] as AuthScreen)}
                className="text-[#B5BAC0] hover:text-white transition p-0.5"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <img
              src="/terasync-logo.png"
              alt="TeraSync"
              className="h-8 w-auto object-contain select-none"
            />
          </div>
          <button
            onClick={onClose}
            className="text-[#B5BAC0] hover:text-white transition p-1 rounded-full hover:bg-[#3A3F45]/40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* ── ROLE PICK ── */}
          {screen === "role-pick" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#F5F5F5]">Who are you?</h2>
                <p className="text-sm text-[#B5BAC0] mt-1">Select your account type to proceed</p>
              </div>
              <div className="space-y-3">
                {ROLE_CARDS.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectRole(card.id)}
                    className={`w-full text-left p-4 rounded-2xl border bg-gradient-to-r to-transparent ${card.accent} transition-all duration-200 group`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl leading-none">{card.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-[#F5F5F5] text-base group-hover:text-white">
                          {card.title}
                        </div>
                        <div className="text-xs text-[#B5BAC0] mt-0.5">{card.subtitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#B5BAC0] group-hover:text-[#FF6A3D] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-[#3A3F45]/60 text-center text-xs text-[#B5BAC0]">
                Platform Staff &amp; Administrator?{" "}
                <button
                  className="text-purple-400 hover:text-purple-300 hover:underline font-semibold"
                  onClick={() => handleSelectRole("admin")}
                >
                  Admin Portal Login &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── EMAIL & PASSWORD CREDENTIALS ── */}
          {screen === "credentials" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D93A10]/20 text-[#FF6A3D] border border-[#D93A10]/30 uppercase tracking-wider">
                    {role} portal
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#F5F5F5]">
                  {authMode === "login" ? "Sign In with Email" : "Create Account"}
                </h2>
                <p className="text-sm text-[#B5BAC0] mt-1">
                  {authMode === "login"
                    ? "Enter your credentials to receive a 6-digit login code in your email inbox."
                    : "Register your account. We will send an email verification code."}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl bg-[#15171A] p-1 border border-[#3A3F45]">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setFormError(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                    authMode === "login"
                      ? "bg-[#D93A10] text-white shadow-sm"
                      : "text-[#B5BAC0] hover:text-white"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setFormError(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                    authMode === "signup"
                      ? "bg-[#D93A10] text-white shadow-sm"
                      : "text-[#B5BAC0] hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                {authMode === "signup" && (
                  <div>
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 bg-[#15171A] border border-[#3A3F45] rounded-xl px-3.5 py-3 focus-within:border-[#D93A10] transition">
                      <User className="w-4 h-4 text-[#B5BAC0] shrink-0" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Abebe Kebede"
                        className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 bg-[#15171A] border border-[#3A3F45] rounded-xl px-3.5 py-3 focus-within:border-[#D93A10] transition">
                    <Mail className="w-4 h-4 text-[#B5BAC0] shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      autoFocus
                      className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center gap-2 bg-[#15171A] border border-[#3A3F45] rounded-xl px-3.5 py-3 focus-within:border-[#D93A10] transition">
                    <Lock className="w-4 h-4 text-[#B5BAC0] shrink-0" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters (letter + number)"
                      className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 outline-none"
                    />
                  </div>
                  {authMode === "signup" && (
                    <p className="text-[11px] text-[#B5BAC0] mt-1">Must be at least 8 characters with numbers and letters.</p>
                  )}
                </div>

                {formError && (
                  <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-3.5 py-2.5 text-xs text-red-300">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-pill-primary py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D93A10]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Contacting Email Service...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === "login" ? "Sign In & Send Code" : "Create Account & Send Code"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── 6-DIGIT EMAIL OTP ── */}
          {screen === "otp" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#F5F5F5]">Check your email</h2>
                <p className="text-sm text-[#B5BAC0] mt-1 leading-relaxed">
                  We sent a 6-digit code to <strong className="text-white">{email}</strong>.
                  Enter it below to confirm your identity.
                </p>
              </div>

              {/* Security Hint */}
              <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl px-3.5 py-2.5 text-xs text-blue-300 flex items-center gap-2">
                <span className="shrink-0 text-base">📩</span>
                <span>Code sent via SMTP. Check your Inbox or Spam folder.</span>
              </div>

              {/* 6-box OTP */}
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(idx, e)}
                    className={`w-11 sm:w-12 h-14 text-center text-2xl font-bold bg-[#15171A] border rounded-xl outline-none transition text-[#F5F5F5] font-mono ${
                      otpError
                        ? "border-red-500 shadow-sm shadow-red-500/20"
                        : "border-[#3A3F45] focus:border-[#D93A10]"
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-3.5 py-2.5 text-xs text-red-300">
                  {otpError}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                className="w-full btn-pill-primary py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D93A10]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code &amp; Continue →</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-[#B5BAC0]">
                {resendCd > 0 ? (
                  <span className="text-[#B5BAC0]/80">Resend code in {resendCd}s</span>
                ) : (
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-[#FF6A3D] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend verification code</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── ONBOARDING ── */}
          {screen === "onboarding" && role === "customer" && (
            <OnboardingCustomer onComplete={handleOnboardComplete} />
          )}
          {screen === "onboarding" && role === "shop" && (
            <OnboardingShop onComplete={handleOnboardComplete} />
          )}
          {screen === "onboarding" && role === "rider" && (
            <OnboardingRider onComplete={handleOnboardComplete} />
          )}

          {/* ── PENDING REVIEW ── */}
          {screen === "pending-review" && (
            <div className="space-y-5 text-center py-4">
              <div className="text-6xl select-none">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-[#F5F5F5]">Application Submitted!</h2>
                <p className="text-sm text-[#B5BAC0] mt-2 leading-relaxed">
                  Our team will review your{" "}
                  <strong className="text-[#F5F5F5]">
                    {role === "shop" ? "shop" : "rider"}
                  </strong>{" "}
                  application within{" "}
                  <strong className="text-[#F5F5F5]">1–2 business days</strong>.
                  You will receive an email update once approved.
                </p>
              </div>
              <div className="bg-[#15171A] border border-[#3A3F45] rounded-2xl p-4 text-left space-y-2">
                <div className="text-xs font-bold text-[#B5BAC0] uppercase tracking-wider">
                  What happens next
                </div>
                {[
                  "Admin reviews your documents and photos",
                  "You receive an email notification when approved",
                  role === "shop"
                    ? "Your shop goes live and starts receiving part RFQs"
                    : "You can start accepting delivery assignments",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-[#B5BAC0]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="w-full btn-pill-ghost py-3 text-sm">
                Back to Storefront
              </button>
            </div>
          )}

          {/* ── ADMIN LOGIN ── */}
          {screen === "admin-login" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-[#3A3F45] pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold text-lg">
                  🛡️
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F5F5F5]">Operations &amp; Admin Desk</h2>
                  <p className="text-xs text-[#B5BAC0]">Sign in with authorized staff clearance</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Enter staff email"
                    className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:border-purple-500 outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdminLogin();
                    }}
                    placeholder="••••••••"
                    autoFocus
                    className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-[#F5F5F5] font-mono text-sm focus:border-purple-500 outline-none transition"
                  />
                </div>

                {adminError && (
                  <p className="text-xs text-red-400 font-medium">{adminError}</p>
                )}

                <button
                  onClick={handleAdminLogin}
                  disabled={loading || adminPassword.trim().length === 0}
                  className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In &amp; Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
