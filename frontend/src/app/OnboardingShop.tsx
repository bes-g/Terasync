"use client";
import React, { useState } from "react";
import { ArrowRight, ChevronLeft, Upload } from "lucide-react";

interface Props {
  onComplete: (profile: Record<string, unknown>) => void;
}

const BRANDS = [
  "Toyota (OEM & Aftermarket)",
  "BYD Electric",
  "Isuzu & Commercial",
  "Hyundai / Kia",
  "Suzuki",
  "All Makes (General)",
];
const BANKS = [
  "Commercial Bank of Ethiopia (CBE)",
  "Awash Bank",
  "Dashen Bank",
  "Bank of Abyssinia",
  "Telebirr (Ethio Telecom)",
];
const MARKETS = ["Teklehaymanot", "Kera", "Somali Tera", "Merkato", "Other"];

export default function OnboardingShop({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [market, setMarket] = useState("");
  const [street, setStreet] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [tin, setTin] = useState("");
  const [licenseNum, setLicenseNum] = useState("");
  const [shopPhoto, setShopPhoto] = useState<string | null>(null);
  const [shelfPhoto, setShelfPhoto] = useState<string | null>(null);
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const steps = ["Shop details", "Location", "Brands & parts", "Business docs", "Photos", "Payout"];

  const canNext = [
    shopName.trim().length > 0 && ownerName.trim().length > 0,
    market.length > 0 && street.trim().length > 0,
    brands.length > 0,
    tin.trim().length > 0 && licenseNum.trim().length > 0,
    true, // photos are optional but recommended
    bank.length > 0 && accountNumber.trim().length > 0,
  ][step];

  const toggleBrand = (b: string) => {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const handlePhoto =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setter(URL.createObjectURL(file));
    };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        shopName,
        ownerName,
        market,
        street,
        brands,
        tin,
        licenseNum,
        shopPhoto,
        shelfPhoto,
        bank,
        accountNumber,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#F5F5F5]">Register your shop</h2>
          <span className="text-xs text-[#B5BAC0]">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="h-1 bg-[#3A3F45] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[#B5BAC0] mt-2 font-medium">{steps[step]}</p>
      </div>

      {/* Step 0: Shop details */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Shop name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Alpha Toyota Spares"
              autoFocus
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Owner / contact name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Mulugeta Tadesse"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Market area
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MARKETS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarket(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    market === m
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-[#15171A] border-[#3A3F45] text-[#B5BAC0] hover:border-blue-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Street / shop number
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Shop #42, Near Teklehaymanot Church"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Step 2: Brands */}
      {step === 2 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block">
            Select all brands you carry
          </label>
          <div className="space-y-2">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition flex items-center gap-3 ${
                  brands.includes(b)
                    ? "bg-blue-900/40 border-blue-500 text-white"
                    : "bg-[#15171A] border-[#3A3F45] text-[#B5BAC0] hover:border-blue-500"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    brands.includes(b) ? "bg-blue-500 border-blue-500" : "border-[#B5BAC0]"
                  }`}
                >
                  {brands.includes(b) && (
                    <span className="text-white text-[10px] font-bold">✓</span>
                  )}
                </div>
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Business docs */}
      {step === 3 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              TIN number
            </label>
            <input
              type="text"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              placeholder="e.g. 0014XXXXXXX"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-blue-500 outline-none transition font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Trade license number
            </label>
            <input
              type="text"
              value={licenseNum}
              onChange={(e) => setLicenseNum(e.target.value)}
              placeholder="e.g. AA/LIC/2023/XXXX"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-blue-500 outline-none transition font-mono"
            />
          </div>
        </div>
      )}

      {/* Step 4: Photos */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-xs text-[#B5BAC0]">
            Upload photos to help buyers trust your shop. (Optional but recommended)
          </p>
          {[
            { label: "Shop front photo", value: shopPhoto, setter: setShopPhoto },
            { label: "Parts shelf / inventory photo", value: shelfPhoto, setter: setShelfPhoto },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
                {label}
              </label>
              <label
                className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition overflow-hidden ${
                  value ? "border-blue-500" : "border-[#3A3F45] hover:border-blue-500"
                }`}
              >
                {value ? (
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#B5BAC0]" />
                    <span className="text-xs text-[#B5BAC0]">Click to upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhoto(setter)}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Step 5: Payout */}
      {step === 5 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Payment bank / service
            </label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:border-blue-500 outline-none transition"
            >
              <option value="" className="bg-[#0F1012]">Select bank…</option>
              {BANKS.map((b) => (
                <option key={b} value={b} className="bg-[#0F1012]">{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Account number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-blue-500 outline-none transition font-mono"
            />
          </div>
          <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl px-4 py-2.5 text-xs text-amber-200">
            💡 Payments from buyers are held in escrow and released after delivery confirmation via your 4-digit PIN.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-[#B5BAC0] hover:text-white text-sm transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
        >
          {step === steps.length - 1 ? "Submit application" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
