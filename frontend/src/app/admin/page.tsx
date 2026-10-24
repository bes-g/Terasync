"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Bike,
  Check,
  AlertTriangle,
  ArrowRight,
  LogOut,
  ChevronLeft,
} from "lucide-react";

interface PendingApp {
  id: string;
  role: "shop" | "rider";
  phone: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  profile: {
    shopName?: string;
    ownerName?: string;
    market?: string;
    street?: string;
    brands?: string[];
    tin?: string;
    licenseNum?: string;
    bank?: string;
    accountNumber?: string;
    vehicleType?: string;
    plate?: string;
    areas?: string[];
    idNumber?: string;
    payoutService?: string;
    payoutNumber?: string;
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@terasync.et");
  const [adminPin, setAdminPin] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"applications" | "disputes">("applications");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [applications, setApplications] = useState<PendingApp[]>([
    {
      id: "APP-101",
      role: "shop",
      phone: "0911554433",
      submittedAt: "10m ago",
      status: "PENDING",
      profile: {
        shopName: "Bole Genuine Starters & Alternators",
        ownerName: "Tewodros Kassahun",
        market: "Teklehaymanot",
        street: "Shop #18, Electrical Row",
        brands: ["Toyota (OEM & Aftermarket)", "BYD Electric"],
        tin: "0038472910",
        licenseNum: "AA/LIC/2024/9912",
        bank: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "100019283746",
      },
    },
    {
      id: "APP-102",
      role: "rider",
      phone: "0922776655",
      submittedAt: "35m ago",
      status: "PENDING",
      profile: {
        vehicleType: "Motorcycle (100–150cc)",
        plate: "AA-49201",
        areas: ["Bole", "Yeka", "Kirkos"],
        idNumber: "FAN/AA/8849201",
        payoutService: "Telebirr (Ethio Telecom)",
        payoutNumber: "0922776655",
      },
    },
    {
      id: "APP-103",
      role: "shop",
      phone: "0933887766",
      submittedAt: "1h ago",
      status: "PENDING",
      profile: {
        shopName: "Somali Tera ECU & Ignition Tech",
        ownerName: "Abdurahman Mohammed",
        market: "Somali Tera",
        street: "Block 4, Workshop Lane",
        brands: ["Toyota (OEM & Aftermarket)", "Isuzu & Commercial", "Hyundai / Kia"],
        tin: "0049281726",
        licenseNum: "AA/LIC/2024/1042",
        bank: "Awash Bank",
        accountNumber: "01320491827400",
      },
    },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === "0000" || adminPin === "admin") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid Security PIN. Use demo clearance PIN: 0000");
    }
  };

  const handleApprove = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "APPROVED" as const } : app))
    );
    setSuccessToast(`Application ${id} approved! Merchant/Courier credentials activated live.`);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const handleReject = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "REJECTED" as const } : app))
    );
  };

  // ─── LOGIN SCREEN ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050506] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#B5BAC0] hover:text-[#F5F5F5] mb-2 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Storefront
            </Link>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto text-2xl font-bold">
              🛡️
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
              TeraSync Central Operations
            </h1>
            <p className="text-xs text-[#B5BAC0]">
              Staff Clearance &amp; Dispute Arbitration Console
            </p>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-4 text-xs text-purple-300 flex items-center gap-2.5">
            <span className="text-lg">🔑</span>
            <div>
              <span className="font-semibold block text-white">Demo Administrator Clearance:</span>
              <span>Use Master Security PIN: <strong className="font-mono text-purple-200">0000</strong></span>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="p-6 rounded-3xl bg-[#0F1012] border border-[#3A3F45] shadow-2xl space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                Staff Email / ID
              </label>
              <input
                type="text"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
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
                  setError("");
                }}
                placeholder="••••"
                autoFocus
                className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-center text-[#F5F5F5] tracking-widest font-mono text-2xl focus:border-purple-500 outline-none transition"
              />
            </div>

            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <span>Authenticate &amp; Open Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED ADMIN CONSOLE ───
  return (
    <div className="min-h-screen bg-[#050506] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#D93A10] selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-[#3A3F45] bg-[#0F1012] sticky top-0 z-50">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-600/30">
              🛡️
            </div>
            <div>
              <span className="font-bold text-base text-[#F5F5F5] tracking-tight">
                TeraSync Central Operations Desk
              </span>
              <span className="hidden sm:inline-block text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 ml-2 font-mono">
                TIER-3 CLEARANCE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-[#B5BAC0] hover:text-[#F5F5F5] transition hidden sm:inline"
            >
              ← Public Storefront
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 rounded-xl bg-[#15171A] hover:bg-[#1E2024] border border-[#3A3F45] text-xs text-[#B5BAC0] hover:text-white flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 py-2.5 px-4 text-xs font-semibold flex items-center justify-between">
          <div className="max-w-[1216px] mx-auto w-full flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1216px] w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45]">
            <div className="text-xs text-[#B5BAC0]">Active Escrow Balance</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">428,500.00 ETB</div>
            <div className="text-[10px] text-[#8A8F96] mt-1">Protected in Telebirr &amp; Chapa Escrow</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45]">
            <div className="text-xs text-[#B5BAC0]">Platform Commission (5%)</div>
            <div className="text-2xl font-black text-blue-400 mt-1">21,425.00 ETB</div>
            <div className="text-[10px] text-[#8A8F96] mt-1">Earned clearinghouse fees</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45]">
            <div className="text-xs text-[#B5BAC0]">Pending Partner Approvals</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {applications.filter((a) => a.status === "PENDING").length} Applications
            </div>
            <div className="text-[10px] text-[#8A8F96] mt-1">Shops &amp; Couriers awaiting live activation</div>
          </div>
        </div>

        {/* Admin Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-[#3A3F45] pb-2">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "applications"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-[#0F1012] text-[#B5BAC0] hover:text-white border border-[#3A3F45]"
            }`}
          >
            <span>Merchant &amp; Rider Applications</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
              {applications.filter((a) => a.status === "PENDING").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "disputes"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-[#0F1012] text-[#B5BAC0] hover:text-white border border-[#3A3F45]"
            }`}
          >
            <span>Dispute Arbitration</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
              1 Case
            </span>
          </button>
        </div>

        {/* ── Applications Queue ── */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Partner Application Queue</h3>
                <p className="text-xs text-[#B5BAC0]">
                  Approve verified Addis Ababa spare parts vendors and couriers to push them live to the market
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {applications.map((app) => {
                const isShop = app.role === "shop";
                const prof = app.profile;

                return (
                  <div
                    key={app.id}
                    className={`p-6 rounded-2xl bg-[#0F1012]/95 border transition space-y-4 ${
                      app.status === "PENDING"
                        ? "border-amber-500/50 hover:border-amber-500"
                        : app.status === "APPROVED"
                        ? "border-emerald-500/40"
                        : "border-red-500/40 opacity-75"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3A3F45] pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                            isShop
                              ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                              : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                          }`}
                        >
                          {isShop ? <Store className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-blue-400 font-bold">{app.id}</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                isShop
                                  ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {isShop ? "Shop Owner" : "Delivery Rider"}
                            </span>
                            <span className="text-xs text-[#8A8F96]">&bull; {app.submittedAt}</span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-0.5">
                            {isShop
                              ? prof.shopName || "Unnamed Shop"
                              : `${prof.vehicleType || "Vehicle"} (${prof.plate || "No Plate"})`}
                          </h4>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono ${
                            app.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : app.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {app.status === "PENDING" ? "⏳ Under Review" : app.status === "APPROVED" ? "✅ Approved & Live" : "❌ Rejected"}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1">
                        <span className="text-[#8A8F96] uppercase text-[10px] font-semibold block">Contact &amp; Location</span>
                        <div className="text-[#F5F5F5]">Phone: <strong className="font-mono">{app.phone}</strong></div>
                        {isShop ? (
                          <>
                            <div className="text-[#B5BAC0]">Market: <strong>{prof.market || "Teklehaymanot"}</strong></div>
                            <div className="text-[#B5BAC0] truncate">Address: {prof.street || "Addis Ababa"}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-[#B5BAC0]">Coverage: <strong>{prof.areas?.join(", ") || "Addis Ababa"}</strong></div>
                            <div className="text-[#B5BAC0]">Plate: <strong className="font-mono">{prof.plate}</strong></div>
                          </>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1">
                        <span className="text-[#8A8F96] uppercase text-[10px] font-semibold block">Official Credentials</span>
                        {isShop ? (
                          <>
                            <div className="text-[#B5BAC0]">TIN: <strong className="font-mono text-[#F5F5F5]">{prof.tin || "Pending"}</strong></div>
                            <div className="text-[#B5BAC0]">Trade License: <strong className="font-mono text-[#F5F5F5]">{prof.licenseNum || "Pending"}</strong></div>
                            <div className="text-[#8A8F96] text-[11px] truncate">Owner: {prof.ownerName}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-[#B5BAC0]">National ID: <strong className="font-mono text-[#F5F5F5]">{prof.idNumber || "Pending"}</strong></div>
                            <div className="text-[#B5BAC0]">Vehicle: {prof.vehicleType}</div>
                          </>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1">
                        <span className="text-[#8A8F96] uppercase text-[10px] font-semibold block">Payout Settlement</span>
                        {isShop ? (
                          <>
                            <div className="text-[#B5BAC0]">Bank: <strong className="text-[#F5F5F5]">{prof.bank || "CBE"}</strong></div>
                            <div className="text-[#B5BAC0]">Account: <strong className="font-mono text-[#F5F5F5]">{prof.accountNumber || "—"}</strong></div>
                          </>
                        ) : (
                          <>
                            <div className="text-[#B5BAC0]">Service: <strong className="text-[#F5F5F5]">{prof.payoutService || "Telebirr"}</strong></div>
                            <div className="text-[#B5BAC0]">Number: <strong className="font-mono text-[#F5F5F5]">{prof.payoutNumber || app.phone}</strong></div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#3A3F45]">
                      <span className="text-[11px] text-[#8A8F96]">
                        {app.status === "PENDING"
                          ? "Review credentials above. Approval makes this shop/courier live in the marketplace."
                          : "Application processed."}
                      </span>

                      {app.status === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReject(app.id)}
                            className="px-4 py-2 rounded-xl bg-[#1E2024] hover:bg-[#2A2E33] text-[#D0D4DA] text-xs font-semibold border border-[#3A3F45] transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                          >
                            <Check className="w-4 h-4" />
                            Approve &amp; Activate Live
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Disputes Tab ── */}
        {activeTab === "disputes" && (
          <div className="p-6 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF6A3D]" />
                <h3 className="text-sm font-bold text-white">Dispute Case #DSP-104</h3>
                <span className="text-[10px] font-mono bg-[#D93A10]/10 text-[#FF6A3D] px-2 py-0.5 rounded border border-amber-800">
                  NO_FAULT_FITMENT
                </span>
              </div>
              <span className="text-xs text-[#8A8F96]">Opened 2h ago</span>
            </div>

            <p className="text-xs text-[#D0D4DA] leading-relaxed">
              <strong>Reason:</strong> Mechanic states the alternator mounting ear offset differs by 3mm from
              chassis spec. Seal code was verified intact; part returned to Teklehaymanot vendor without damage.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => alert("Full item refund released to buyer. Courier fees deducted.")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                Rule: No Fault (Refund Item to Buyer)
              </button>
              <button
                onClick={() => alert("Vendor fault registered. Full item + delivery refunded to buyer.")}
                className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition"
              >
                Rule: Vendor Fault (100% Refund)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
