"use client";
import React, { useState } from "react";
import { ArrowRight, ChevronLeft, Upload } from "lucide-react";

interface Props {
  onComplete: (profile: Record<string, unknown>) => void;
}

const VEHICLE_TYPES = [
  "Motorcycle (100–150cc)",
  "Bajaj / Tuk-tuk",
  "Pickup Van (Light cargo)",
  "Electric Bicycle",
];
const SUB_CITIES = [
  "Bole", "Yeka", "Kirkos", "Gulele", "Kolfe Keranio",
  "Nifas Silk-Lafto", "Lideta", "Akaky Kaliti", "Arada", "Addis Ketema",
];
const MOBILE_MONEY = [
  "Telebirr (Ethio Telecom)",
  "CBE Birr",
  "Commercial Bank of Ethiopia",
  "Awash Bank",
];

export default function OnboardingRider({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [vehicleType, setVehicleType] = useState("");
  const [plate, setPlate] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [idNumber, setIdNumber] = useState("");
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [payoutService, setPayoutService] = useState("");
  const [payoutNumber, setPayoutNumber] = useState("");

  const steps = ["Your vehicle", "Service area", "ID verification", "Driver's license", "Payout"];

  const canNext = [
    vehicleType.length > 0 && plate.trim().length > 0,
    areas.length > 0,
    idNumber.trim().length > 0,
    true, // license photo is optional
    payoutService.length > 0 && payoutNumber.trim().length > 0,
  ][step];

  const toggleArea = (a: string) =>
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

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
      onComplete({ vehicleType, plate, areas, idNumber, idPhoto, licensePhoto, payoutService, payoutNumber });
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#F5F5F5]">Rider registration</h2>
          <span className="text-xs text-[#B5BAC0]">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="h-1 bg-[#3A3F45] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[#B5BAC0] mt-2 font-medium">{steps[step]}</p>
      </div>

      {/* Step 0: Vehicle */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Vehicle type
            </label>
            <div className="space-y-2">
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVehicleType(v)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition ${
                    vehicleType === v
                      ? "bg-emerald-900/40 border-emerald-500 text-white"
                      : "bg-[#15171A] border-[#3A3F45] text-[#B5BAC0] hover:border-emerald-500"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              License plate
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="e.g. AA-28412"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-emerald-500 outline-none transition font-mono uppercase"
            />
          </div>
        </div>
      )}

      {/* Step 1: Service areas */}
      {step === 1 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block">
            Sub-cities you cover (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SUB_CITIES.map((a) => (
              <button
                key={a}
                onClick={() => toggleArea(a)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition text-left ${
                  areas.includes(a)
                    ? "bg-emerald-900/40 border-emerald-500 text-white"
                    : "bg-[#15171A] border-[#3A3F45] text-[#B5BAC0] hover:border-emerald-500"
                }`}
              >
                {areas.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: ID verification */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              National ID number
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. FAN/AA/XXXXXXXX"
              autoFocus
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-emerald-500 outline-none transition font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Upload ID photo (optional)
            </label>
            <label
              className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition overflow-hidden ${
                idPhoto ? "border-emerald-500" : "border-[#3A3F45] hover:border-emerald-500"
              }`}
            >
              {idPhoto ? (
                <img src={idPhoto} alt="ID preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-[#B5BAC0]" />
                  <span className="text-xs text-[#B5BAC0]">Click to upload</span>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto(setIdPhoto)} />
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Driver's license */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-xs text-[#B5BAC0]">
            Upload a photo of your driver&#39;s license (front side). Optional — you can add it later.
          </p>
          <label
            className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition overflow-hidden ${
              licensePhoto ? "border-emerald-500" : "border-[#3A3F45] hover:border-emerald-500"
            }`}
          >
            {licensePhoto ? (
              <img src={licensePhoto} alt="License preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-[#B5BAC0]" />
                <span className="text-xs text-[#B5BAC0]">Click to upload driver&#39;s license</span>
              </>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto(setLicensePhoto)} />
          </label>
        </div>
      )}

      {/* Step 4: Payout */}
      {step === 4 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Mobile money / bank
            </label>
            <div className="space-y-2">
              {MOBILE_MONEY.map((m) => (
                <button
                  key={m}
                  onClick={() => setPayoutService(m)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition ${
                    payoutService === m
                      ? "bg-emerald-900/40 border-emerald-500 text-white"
                      : "bg-[#15171A] border-[#3A3F45] text-[#B5BAC0] hover:border-emerald-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Account / phone number
            </label>
            <input
              type="text"
              value={payoutNumber}
              onChange={(e) => setPayoutNumber(e.target.value)}
              placeholder="e.g. 0912345678"
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-emerald-500 outline-none transition font-mono"
            />
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
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
        >
          {step === steps.length - 1 ? "Submit application" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
