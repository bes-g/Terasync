"use client";
import React, { useState } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";

interface Props {
  onComplete: (profile: Record<string, unknown>) => void;
}

const MAKES = ["Toyota", "BYD Electric", "Hyundai", "Suzuki", "Isuzu Commercial"];
const MODELS: Record<string, string[]> = {
  Toyota: ["HiAce Minibus Taxi", "Hilux / Fortuner (1KD)", "Land Cruiser HZJ79", "Corolla / Vitz"],
  "BYD Electric": ["Atto 3 (EV SUV)", "Dolphin (Hatchback)", "Seagull (City EV)", "Qin Plus (Sedan)"],
  Hyundai: ["Tucson", "Accent", "H-1 Van"],
  Suzuki: ["Dzire Taxi", "Swift Hatchback"],
  "Isuzu Commercial": ["NPR 24V Truck", "Forward Medium Truck"],
};
const DISTRICTS = [
  "Bole", "Yeka", "Kirkos", "Gulele", "Kolfe Keranio",
  "Nifas Silk-Lafto", "Lideta", "Akaky Kaliti", "Arada", "Addis Ketema",
];

export default function OnboardingCustomer({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("");
  const [district, setDistrict] = useState("");

  const steps = ["Your name", "Your vehicle", "Delivery location"];

  const canNext = [
    firstName.trim().length > 0 && lastName.trim().length > 0,
    make.length > 0 && model.length > 0,
    district.length > 0,
  ][step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ firstName, lastName, make, model, district });
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#F5F5F5]">Set up your account</h2>
          <span className="text-xs text-[#B5BAC0]">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="h-1 bg-[#3A3F45] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D93A10] transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-[#B5BAC0] mt-2 font-medium">{steps[step]}</p>
      </div>

      {/* Step 0: Name */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Abebe"
              autoFocus
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-[#D93A10] outline-none transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Girma"
              onKeyDown={(e) => e.key === "Enter" && canNext && handleNext()}
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#B5BAC0]/40 focus:border-[#D93A10] outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Step 1: Vehicle */}
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Vehicle make
            </label>
            <select
              value={make}
              onChange={(e) => { setMake(e.target.value); setModel(""); }}
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:border-[#D93A10] outline-none transition"
            >
              {MAKES.map((m) => (
                <option key={m} value={m} className="bg-[#0F1012]">{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1.5">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:border-[#D93A10] outline-none transition"
            >
              <option value="" className="bg-[#0F1012]">Select model…</option>
              {(MODELS[make] ?? []).map((m) => (
                <option key={m} value={m} className="bg-[#0F1012]">{m}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block">
            Your sub-city / district
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => setDistrict(d)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition text-left ${
                  district === d
                    ? "bg-[#D93A10] border-[#D93A10] text-white"
                    : "bg-[#15171A] border-[#3A3F45] text-[#B5BAC0] hover:border-[#D93A10] hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
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
          className="btn-pill-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {step === steps.length - 1 ? "Finish setup" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
