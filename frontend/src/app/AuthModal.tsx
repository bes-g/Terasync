"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import OnboardingCustomer from "./OnboardingCustomer";
import OnboardingShop from "./OnboardingShop";
import OnboardingRider from "./OnboardingRider";

export type AuthRole = "customer" | "shop" | "rider" | "admin";

export interface AuthProfile {
  role: AuthRole;
  phone: string;
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

type AuthScreen = "role-pick" | "phone" | "otp" | "onboarding" | "pending-review" | "admin-login";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthComplete: (role: AuthRole, profile: AuthProfile) => void;
  onPendingReview: (role: AuthRole, profile: AuthProfile) => void;
  /** Set of phone numbers seen before (determines returning vs new user) */
  knownPhones: Set<string>;
  onPhoneUsed: (phone: string) => void;
  initialRole?: AuthRole | null;
}

const ROLE_CARDS = [
  {
    id: "customer" as AuthRole,
    emoji: "🔧",
    title: "Customer",
    subtitle: "Find & request spare parts for my vehicle",
    accent: "border-[#D93A10]/60 hover:border-[#D93A10] from-red-950/30",
  },
  {
    id: "shop" as AuthRole,
    emoji: "🏪",
    title: "Shop Owner",
    subtitle: "List my parts inventory and receive RFQs",
    accent: "border-blue-800/50 hover:border-blue-500 from-blue-950/30",
  },
  {
    id: "rider" as AuthRole,
    emoji: "🛵",
    title: "Delivery Rider",
    subtitle: "Deliver parts across Addis Ababa and earn",
    accent: "border-emerald-800/50 hover:border-emerald-500 from-emerald-950/30",
  },
  {
    id: "admin" as AuthRole,
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
  knownPhones,
  onPhoneUsed,
  initialRole = null,
}: AuthModalProps) {
  const [screen, setScreen] = useState<AuthScreen>("role-pick");
  const [role, setRole] = useState<AuthRole | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCd, setResendCd] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Admin credentials state
  const [adminUsername, setAdminUsername] = useState("admin@terasync.et");
  const [adminPin, setAdminPin] = useState("");
  const [adminError, setAdminError] = useState("");

  // Reset state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setRole(initialRole);
        setScreen(initialRole === "admin" ? "admin-login" : "phone");
      } else {
        setScreen("role-pick");
        setRole(null);
      }
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setOtpCode("");
      setOtpError("");
      setResendCd(0);
      setIsReturning(false);
      setAdminPin("");
      setAdminError("");
    }
  }, [isOpen, initialRole]);

  // Resend countdown tick
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  if (!isOpen) return null;

  const cleanPhone = phone.replace(/\s/g, "");

  const handleSelectRole = (r: AuthRole) => {
    setRole(r);
    if (r === "admin") {
      setScreen("admin-login");
    } else {
      setScreen("phone");
    }
  };

  const handleAdminLogin = () => {
    if (adminPin.trim() === "0000" || adminPin.trim() === "admin") {
      onAuthComplete("admin", {
        role: "admin",
        phone: "0911000000",
        name: "Central Operations Admin",
        email: adminUsername,
        clearanceLevel: "TIER_3_OPERATIONS",
      });
      onClose();
    } else {
      setAdminError("Invalid Security PIN. Use demo master PIN: 0000");
    }
  };

  const sendOtp = () => {
    if (cleanPhone.length < 9) return;
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setOtpCode(code);
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    const normalized = cleanPhone.startsWith("0") ? cleanPhone : `0${cleanPhone}`;
    setIsReturning(knownPhones.has(normalized) || knownPhones.has(cleanPhone));
    setResendCd(60);
    setScreen("otp");
    // Focus first OTP box after render
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length >= 4) verifyOtp();
  };

  const verifyOtp = () => {
    const entered = otp.join("");
    if (entered.length < 4) return;
    if (entered !== otpCode) {
      setOtpError("Incorrect code — try again.");
      return;
    }
    const normalized = cleanPhone.startsWith("0") ? cleanPhone : `0${cleanPhone}`;
    onPhoneUsed(normalized);
    if (isReturning) {
      onAuthComplete(role!, { role: role!, phone: normalized });
      onClose();
    } else {
      setScreen("onboarding");
    }
  };

  const handleOnboardComplete = (profile: Record<string, unknown>) => {
    const fullProfile: AuthProfile = { role: role!, phone: cleanPhone, ...profile };
    if (role === "customer") {
      onAuthComplete("customer", fullProfile);
      onClose();
    } else {
      setScreen("pending-review");
      onPendingReview(role!, fullProfile);
    }
  };

  const backLabel: Partial<Record<AuthScreen, string>> = {
    phone: "role-pick",
    otp: "phone",
    "admin-login": "role-pick",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-[#0F1012] border border-[#3A3F45] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Sticky header */}
        <div className="shrink-0 border-b border-[#3A3F45] px-6 py-4 flex items-center justify-between rounded-t-3xl">
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
            <div className="w-8 h-8 rounded-full bg-[#D93A10] flex items-center justify-center font-black text-white text-sm select-none">
              ⚡
            </div>
            <span className="font-bold text-[#F5F5F5] text-sm">TeraSync</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#B5BAC0] hover:text-white transition p-1 rounded-full"
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
                <p className="text-sm text-[#B5BAC0] mt-1">Choose your portal to get started</p>
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
                Internal staff &amp; operations?{" "}
                <button
                  className="text-purple-400 hover:text-purple-300 hover:underline font-semibold"
                  onClick={() => handleSelectRole("admin")}
                >
                  Admin Portal Login &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ── PHONE ── */}
          {screen === "phone" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#F5F5F5]">Enter your phone</h2>
                <p className="text-sm text-[#B5BAC0] mt-1">
                  Logging in as{" "}
                  <span className="text-[#FF6A3D] font-semibold capitalize">{role}</span>.
                  We&apos;ll send you a code.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-[#15171A] border border-[#3A3F45] rounded-2xl px-4 py-3 focus-within:border-[#D93A10] transition">
                  <span className="text-[#B5BAC0] text-sm font-medium shrink-0 select-none">
                    🇪🇹 +251
                  </span>
                  <div className="w-px h-5 bg-[#3A3F45] shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && cleanPhone.length >= 9 && sendOtp()}
                    placeholder="9X XXX XXXX"
                    maxLength={12}
                    autoFocus
                    className="flex-1 bg-transparent text-[#F5F5F5] text-sm font-medium placeholder-[#B5BAC0]/40 outline-none"
                  />
                </div>
                <button
                  onClick={sendOtp}
                  disabled={cleanPhone.length < 9}
                  className="w-full btn-pill-primary py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send OTP Code →
                </button>
              </div>
            </div>
          )}

          {/* ── OTP ── */}
          {screen === "otp" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#F5F5F5]">Enter the code</h2>
                <p className="text-sm text-[#B5BAC0] mt-1">
                  Sent to <span className="text-white font-medium">+251 {phone}</span>
                </p>
              </div>

              {/* Demo hint box */}
              <div className="bg-blue-950/50 border border-blue-800/40 rounded-xl px-4 py-2.5 text-xs text-blue-300 flex items-center gap-2">
                <span className="shrink-0">🔬</span>
                <span>
                  Demo mode — your code is:{" "}
                  <strong className="text-white font-mono text-sm">{otpCode}</strong>
                </span>
              </div>

              {/* 6-box OTP */}
              <div className="flex justify-between gap-2">
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
                    className={`w-12 h-14 text-center text-2xl font-bold bg-[#15171A] border rounded-xl outline-none transition text-[#F5F5F5] ${
                      otpError
                        ? "border-red-500"
                        : "border-[#3A3F45] focus:border-[#D93A10]"
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-400 text-xs">{otpError}</p>
              )}

              <button
                onClick={verifyOtp}
                disabled={otp.join("").length < 4}
                className="w-full btn-pill-primary py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReturning ? "Sign in →" : "Verify & Continue →"}
              </button>

              <p className="text-center text-xs text-[#B5BAC0]">
                {resendCd > 0 ? (
                  <span>Resend in {resendCd}s</span>
                ) : (
                  <button onClick={sendOtp} className="text-[#FF6A3D] hover:underline">
                    Resend code
                  </button>
                )}
              </p>
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
                  You&apos;ll receive an SMS once approved.
                </p>
              </div>
              <div className="bg-[#15171A] border border-[#3A3F45] rounded-2xl p-4 text-left space-y-2">
                <div className="text-xs font-bold text-[#B5BAC0] uppercase tracking-wider">
                  What happens next
                </div>
                {[
                  "Admin reviews your documents and photos",
                  "You receive an SMS when approved",
                  role === "shop"
                    ? "Your shop goes live and starts receiving part requests"
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

              <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl px-4 py-2.5 text-xs text-purple-300 flex items-center gap-2">
                <span className="shrink-0 text-base">🔑</span>
                <span>
                  Demo Master Access: clearance PIN is <strong className="text-white font-mono text-sm">0000</strong>
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                    Staff Email or ID
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin@terasync.et"
                    className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:border-purple-500 outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                    4-Digit Security Master PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setAdminError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdminLogin();
                    }}
                    placeholder="••••"
                    autoFocus
                    className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-center text-[#F5F5F5] tracking-widest font-mono text-2xl focus:border-purple-500 outline-none transition"
                  />
                </div>

                {adminError && (
                  <p className="text-xs text-red-400 font-medium">{adminError}</p>
                )}

                <button
                  onClick={handleAdminLogin}
                  disabled={adminPin.trim().length === 0}
                  className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Authorize &amp; Open Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
