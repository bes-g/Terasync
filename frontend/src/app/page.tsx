"use client";

import React, { useState } from "react";
import {
  Wrench,
  Store,
  Bike,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  LogOut,
  RefreshCw,
  Eye,
  Camera,
  MapPin,
  Sparkles,
  Layers,
  Search,
  Zap,
  Check,
  Cpu,
  Truck,
  Tag,
  Clock,
  X,
  ChevronDown,
  Info,
  SlidersHorizontal,
  PackageCheck,
  Share2,
} from "lucide-react";

import { AUTOMOTIVE_SYSTEMS, AutomotiveSystem, SinglePartItem } from "../data/systems";

type Role = "landing" | "market" | "buyer" | "vendor" | "courier" | "admin";

interface PartRequest {
  id: string;
  vehicle: string;
  plate: string;
  part: string;
  market: string;
  urgency: string;
  timeAgo: string;
  bidsCount: number;
  image: string;
  status: "OPEN" | "BIDDING" | "MATCHED";
}

interface Bid {
  id: string;
  vendorName: string;
  marketArea: string;
  priceBirr: number;
  condition: string;
  warrantyDays: number;
  rating: number;
  image: string;
}

interface GarageJobCard {
  id: string;
  bayNumber: string;
  vehicle: string;
  plate: string;
  mileage: string;
  complaint: string;
  diagnosisDtc: string;
  assignedTech: string;
  status: "DIAGNOSING" | "PARTS_DISPATCHED" | "IN_TRANSIT" | "INSTALLING" | "READY_FOR_PICKUP";
  requiredPartIds: string[];
}

const GARAGE_JOB_CARDS: GarageJobCard[] = [
  {
    id: "JC-4091",
    bayNumber: "Bay 1 (Heavy Minibus Lift)",
    vehicle: "Toyota HiAce Minibus Taxi (5L 3.0L Diesel)",
    plate: "3-A42190 (Addis Ababa Commercial)",
    mileage: "284,500 km",
    complaint: "Engine overheating on ascent to Megenagna; white smoke from exhaust; cooling pressure drop",
    diagnosisDtc: "Blown Head Gasket between Cyl 2 & 3; Radiator tubes scaled",
    assignedTech: "Master Tech Girma",
    status: "PARTS_DISPATCHED",
    requiredPartIds: ["RAD-HIACE-COPPER", "TOY-CLUTCH-KIT", "TOY-GLOW-5L"],
  },
  {
    id: "JC-4092",
    bayNumber: "Bay 2 (Commercial Common Rail)",
    vehicle: "Toyota Hilux 4WD (1KD-FTV 3.0L D-4D)",
    plate: "3-B48102 (Company Pickup)",
    mileage: "142,800 km",
    complaint: "Engine surging under load on Ring Road; black diesel smoke and check engine light",
    diagnosisDtc: "DTC P0087 (Fuel Rail Pressure Low); Injector #3 pilot rate +4.8 mm³/stk",
    assignedTech: "Diesel Tech Dawit",
    status: "IN_TRANSIT",
    requiredPartIds: ["EMS-INJECTOR", "TURBO-ACT-1KD"],
  },
  {
    id: "JC-4093",
    bayNumber: "Bay 3 (Ride-Hailing Express)",
    vehicle: "Suzuki Dzire Taxi (K12M 1.2L DualJet)",
    plate: "3-C19482 (Feres Ride Taxi)",
    mileage: "76,200 km",
    complaint: "Severe engine shuddering at idle; intermittent misfire under acceleration",
    diagnosisDtc: "DTC P0301 (Cylinder 1 Misfire Detected); Coil #1 open circuit secondary",
    assignedTech: "Tech Henok",
    status: "DIAGNOSING",
    requiredPartIds: ["EMS-COIL", "SUZ-EXPANSION-TANK", "BRK-PADS"],
  },
  {
    id: "JC-4094",
    bayNumber: "Bay 4 (High-Voltage EV Specialist)",
    vehicle: "BYD Atto 3 EV (Electric Permanent Magnet)",
    plate: "2-B88204 (Private Plate)",
    mileage: "34,100 km",
    complaint: "DC Fast charging aborts after 3 minutes at Bole charging hub; EV Warning light",
    diagnosisDtc: "DTC P1A02 (GB/T Port Solenoid Seized); Thermal loop high temp",
    assignedTech: "EV Tech Yonas (High-Voltage Certified)",
    status: "DIAGNOSING",
    requiredPartIds: ["BYD-PORT-GBT", "BYD-COOLANT-PUMP"],
  },
];

const POPULAR_GARAGE_DTCS = [
  { code: "ALL", label: "All Faults & Maintenance" },
  { code: "P0087", label: "⚡ P0087 (Low Fuel Rail Pressure)" },
  { code: "P0300", label: "⚡ P0300/P0301 (Engine Misfire)" },
  { code: "P0100", label: "⚡ P0100 (MAF Sensor Fault)" },
  { code: "C1201", label: "⚡ C1201/C0200 (ABS Light)" },
  { code: "P0400", label: "⚡ P0400 (EGR Flow Malfunction)" },
  { code: "P1A02", label: "⚡ P1A02 (EV Charging System)" },
];

const VEHICLE_GARAGE_OPTIONS = [
  { id: "ALL", label: "All Vehicles (Addis Ababa Fleet)" },
  { id: "TOYOTA_HIACE", label: "Toyota HiAce Minibus Taxi (5L Diesel)" },
  { id: "HILUX", label: "Toyota Hilux / Fortuner (1KD/2KD D-4D)" },
  { id: "LAND_CRUISER", label: "Toyota Land Cruiser HZJ79 / Prado (1HZ/1KD)" },
  { id: "COROLLA_VITZ", label: "Toyota Corolla / Vitz / Yaris (1NZ/1ZR)" },
  { id: "SUZUKI_DZIRE", label: "Suzuki Dzire / Swift (K12M Petrol)" },
  { id: "BYD_ATTO3", label: "BYD Atto 3 / Dolphin / Seagull (Electric EV)" },
  { id: "HYUNDAI_TUCSON", label: "Hyundai Tucson / Accent (CRDi / Petrol)" },
  { id: "ISUZU_NPR", label: "Isuzu NPR / Forward (4HF1/4HG1 24V Truck)" },
];

export default function TeraSyncPlatform() {
  const [currentRole, setCurrentRole] = useState<Role>("landing");

  // Market View Mode: Exploded System View vs Grid View
  const [marketViewMode, setMarketViewMode] = useState<"systems" | "grid">("systems");
  const [selectedSystemId, setSelectedSystemId] = useState<"ems" | "braking" | "charging" | "schematic">("ems");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [selectedDtc, setSelectedDtc] = useState<string>("ALL");

  // Interactive filters
  const [selectedVehicle, setSelectedVehicle] = useState<string>("ALL");
  const [selectedVoltage, setSelectedVoltage] = useState<string>("ALL");
  const [selectedMarketHub, setSelectedMarketHub] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Build Bundle for System Assembly
  const [buildBundle, setBuildBundle] = useState<SinglePartItem[]>([]);

  // Modals
  const [selectedPartForSpecs, setSelectedPartForSpecs] = useState<SinglePartItem | null>(null);
  const [rfqModalPart, setRfqModalPart] = useState<SinglePartItem | null>(null);
  const [rfqPlateInput, setRfqPlateInput] = useState<string>("3-B48102");
  const [rfqGarageLocation, setRfqGarageLocation] = useState<string>("Tadesse Mechanics, Bole Medhanialem");
  const [rfqUrgency, setRfqUrgency] = useState<"CRITICAL_SAME_DAY" | "STANDARD_24H">("CRITICAL_SAME_DAY");
  const [rfqSuccessToast, setRfqSuccessToast] = useState<string | null>(null);

  // Escrow & Handshake state
  const [pinRevealed, setPinRevealed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinVerified, setPinVerified] = useState(false);

  // Active RFQs
  const [rfqList, setRfqList] = useState<PartRequest[]>([
    {
      id: "REQ-901",
      vehicle: "Toyota Hilux 2018 (1KD Engine)",
      plate: "3-B48102",
      part: "Denso 12V 80A Alternator (27060-0L020)",
      market: "Teklehaymanot",
      urgency: "CRITICAL_SAME_DAY",
      timeAgo: "12m ago",
      bidsCount: 4,
      image: "/images/gear-precision.jpg",
      status: "BIDDING",
    },
    {
      id: "REQ-902",
      vehicle: "Isuzu NPR 2015 4HF1",
      plate: "3-A11928",
      part: "Sawafuji 24V 50A Alternator with Vacuum Pump",
      market: "Kera",
      urgency: "STANDARD_24H",
      timeAgo: "45m ago",
      bidsCount: 2,
      image: "/images/vendor-warehouse.jpg",
      status: "BIDDING",
    },
    {
      id: "REQ-903",
      vehicle: "Toyota Land Cruiser HZJ79",
      plate: "4-C90214",
      part: "1KD Common Rail ECU Computer (89661-0KP20)",
      market: "Somali Tera",
      urgency: "CRITICAL_SAME_DAY",
      timeAgo: "1h ago",
      bidsCount: 5,
      image: "/images/scrap-yard.jpg",
      status: "MATCHED",
    },
  ]);

  const bidsForReq901: Bid[] = [
    {
      id: "BID-101",
      vendorName: "Alpha Toyota Spares",
      marketArea: "Teklehaymanot (Shop #42)",
      priceBirr: 13900,
      condition: "GENUINE_NEW (Toyota Denso)",
      warrantyDays: 90,
      rating: 4.9,
      image: "/images/vendor-warehouse.jpg",
    },
    {
      id: "BID-102",
      vendorName: "Mulugeta Original Dismantling",
      marketArea: "Somali Tera (Block 4)",
      priceBirr: 10800,
      condition: "USED_ORIGINAL (Japan Scrap Cut)",
      warrantyDays: 30,
      rating: 4.8,
      image: "/images/scrap-yard.jpg",
    },
    {
      id: "BID-103",
      vendorName: "Addis Heavy Machinery Parts",
      marketArea: "Kera Commercial Row",
      priceBirr: 8900,
      condition: "OEM_NEW (Certified Spec)",
      warrantyDays: 45,
      rating: 4.6,
      image: "/images/gear-precision.jpg",
    },
  ];

  // Active Selected System
  const activeSystem = AUTOMOTIVE_SYSTEMS.find((s) => s.id === selectedSystemId) || AUTOMOTIVE_SYSTEMS[0];

  // Filter single parts within the active system
  const filteredParts = activeSystem.singleParts.filter((part) => {
    if (selectedSubcategory !== "ALL" && part.systemSubcategory !== selectedSubcategory) {
      return false;
    }
    if (selectedVehicle !== "ALL" && !part.compatibleVehicles.includes("ALL") && !part.compatibleVehicles.includes(selectedVehicle)) {
      return false;
    }
    if (selectedVoltage !== "ALL" && part.voltage !== selectedVoltage) {
      return false;
    }
    if (selectedMarketHub !== "ALL" && part.marketHub !== selectedMarketHub) {
      return false;
    }
    if (selectedDtc !== "ALL") {
      const matchDtc = part.dtcCodes && part.dtcCodes.some((c) => c.toLowerCase().includes(selectedDtc.toLowerCase()));
      if (!matchDtc) return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match =
        part.name.toLowerCase().includes(q) ||
        part.sku.toLowerCase().includes(q) ||
        part.role.toLowerCase().includes(q) ||
        part.brand.toLowerCase().includes(q) ||
        part.primaryVehicleModel.toLowerCase().includes(q) ||
        (part.localAmharicName && part.localAmharicName.toLowerCase().includes(q)) ||
        (part.dtcCodes && part.dtcCodes.some((c) => c.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Flat catalog across all systems for the general grid view
  const allPartsFlat = AUTOMOTIVE_SYSTEMS.flatMap((s) => s.singleParts);
  const allFilteredFlat = allPartsFlat.filter((part) => {
    if (selectedVehicle !== "ALL" && !part.compatibleVehicles.includes("ALL") && !part.compatibleVehicles.includes(selectedVehicle)) {
      return false;
    }
    if (selectedVoltage !== "ALL" && part.voltage !== selectedVoltage) {
      return false;
    }
    if (selectedMarketHub !== "ALL" && part.marketHub !== selectedMarketHub) {
      return false;
    }
    if (selectedDtc !== "ALL") {
      const matchDtc = part.dtcCodes && part.dtcCodes.some((c) => c.toLowerCase().includes(selectedDtc.toLowerCase()));
      if (!matchDtc) return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        part.name.toLowerCase().includes(q) ||
        part.sku.toLowerCase().includes(q) ||
        part.role.toLowerCase().includes(q) ||
        part.brand.toLowerCase().includes(q) ||
        part.primaryVehicleModel.toLowerCase().includes(q) ||
        (part.localAmharicName && part.localAmharicName.toLowerCase().includes(q)) ||
        (part.dtcCodes && part.dtcCodes.some((c) => c.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  // Load specific job card parts into bundle
  const handleLoadJobCardParts = (jc: GarageJobCard) => {
    const partsToLoad = allPartsFlat.filter((p) => jc.requiredPartIds.includes(p.id));
    setBuildBundle(partsToLoad);
    setCurrentRole("market");
    setMarketViewMode("grid");
    setSelectedVehicle(
      jc.id === "JC-4091" ? "TOYOTA_HIACE" :
      jc.id === "JC-4092" ? "HILUX" :
      jc.id === "JC-4093" ? "SUZUKI_DZIRE" : "BYD_ATTO3"
    );
  };

  // Toggle single part in Build Bundle
  const toggleBundlePart = (part: SinglePartItem) => {
    if (buildBundle.some((p) => p.id === part.id)) {
      setBuildBundle(buildBundle.filter((p) => p.id !== part.id));
    } else {
      setBuildBundle([...buildBundle, part]);
    }
  };

  // Handler to Broadcast a Reverse-RFQ from the Catalog
  const handleBroadcastRfq = (part: SinglePartItem) => {
    const newRfq: PartRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      vehicle: part.primaryVehicleModel,
      plate: rfqPlateInput || "3-B48102",
      part: `${part.name} (${part.sku})`,
      market: part.marketHub,
      urgency: rfqUrgency,
      timeAgo: "Just now",
      bidsCount: 0,
      image: part.image,
      status: "OPEN",
    };

    setRfqList([newRfq, ...rfqList]);
    setRfqModalPart(null);
    setRfqSuccessToast(
      `RFQ ${newRfq.id} broadcasted to ${part.stockVendorsCount} verified ${part.marketHub} electrical shops! Bids will arrive with shelf photos.`
    );
    setTimeout(() => setRfqSuccessToast(null), 8000);
  };

  // Broadcast Multi-Part Build Bundle
  const handleBroadcastBundleRfq = () => {
    if (buildBundle.length === 0) return;
    const partsSummary = buildBundle.map((p) => p.name).join(", ");
    const newRfq: PartRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      vehicle: buildBundle[0]?.primaryVehicleModel || "Toyota Hilux",
      plate: rfqPlateInput || "3-B48102",
      part: `System Build Bundle (${buildBundle.length} parts): ${partsSummary}`,
      market: "Teklehaymanot",
      urgency: "CRITICAL_SAME_DAY",
      timeAgo: "Just now",
      bidsCount: 0,
      image: activeSystem.diagramImage,
      status: "OPEN",
    };

    setRfqList([newRfq, ...rfqList]);
    setBuildBundle([]);
    setRfqSuccessToast(
      `Multi-Part Build RFQ ${newRfq.id} broadcasted! Verified shops will quote your full repair package.`
    );
    setTimeout(() => setRfqSuccessToast(null), 8000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top System Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-[#0c1222]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentRole("landing")}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-[#090e1a] rounded-[10px] flex items-center justify-center font-black text-white text-lg">
                  ⚡
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-blue-400 transition">
                  TeraSync
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  Parts &amp; Systems Hub
                </span>
              </div>
            </button>
          </div>

          {/* Classified Roles Navigation Pill */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800/90 flex items-center shadow-inner overflow-x-auto max-w-[80vw] sm:max-w-none">
              <button
                onClick={() => setCurrentRole("landing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  currentRole === "landing"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Overview</span>
              </button>

              {/* Systems & Electrical Feed */}
              <button
                onClick={() => setCurrentRole("market")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  currentRole === "market"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                    : "text-amber-400 hover:text-amber-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Systems &amp; Feed</span>
              </button>

              <button
                onClick={() => setCurrentRole("buyer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  currentRole === "buyer"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">Garage /</span> Buyer
              </button>

              <button
                onClick={() => setCurrentRole("vendor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  currentRole === "vendor"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Shop /</span> Vendor
              </button>

              <button
                onClick={() => setCurrentRole("courier")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  currentRole === "courier"
                    ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-amber-400" />
                Courier
              </button>

              <button
                onClick={() => setCurrentRole("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  currentRole === "admin"
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Admin
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

            <a
              href="http://localhost:4000/health"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hidden lg:flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Backend API Active
            </a>
          </div>
        </div>
      </header>

      {/* Global Toast for Broadcasted RFQs */}
      {rfqSuccessToast && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 px-4 shadow-lg text-xs font-semibold flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{rfqSuccessToast}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentRole("buyer")}
                className="underline hover:text-slate-100 font-bold"
              >
                View in Garage Workbench &rarr;
              </button>
              <button onClick={() => setRfqSuccessToast(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
        {/* =========================================================================
            1. LANDING / SYSTEM SHOWCASE WITH STYLED VISUAL PANELS
        ========================================================================= */}
        {currentRole === "landing" && (
          <div className="space-y-12">
            {/* Hero Section with Visual Backdrop Card */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#0b101d]">
              <div className="absolute inset-0 z-0 opacity-25">
                <img
                  src="/images/mechanic-bench.jpg"
                  alt="Mechanic Workbench with automotive electrical components"
                  className="w-full h-full object-cover object-center filter grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/90 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b101d] via-transparent to-transparent"></div>
              </div>

              <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-20 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-xs font-semibold text-amber-300">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Automotive Systems Architecture &amp; Single Parts Reverse-RFQ
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Automotive Systems &amp; Single Spare Parts.
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400">
                    Broken Down by Component &amp; Model.
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Explore complete exploded diagrams—from the <strong className="text-white">Engine Management Network</strong> (ECU, MAP, MAF, CKP, O2 Sensors) to the <strong className="text-white">Car Braking System</strong> (ABS Module, Rotors, Calipers, Speed Sensors). Select the exact single parts needed for your repair build and broadcast a sealed RFQ to Addis Ababa merchants.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setCurrentRole("market")}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-orange-500/25 transition transform hover:-translate-y-0.5"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Open Systems &amp; Parts Explorer
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentRole("buyer")}
                    className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-blue-400 text-xs sm:text-sm font-bold flex items-center gap-2 transition"
                  >
                    <Wrench className="w-4 h-4" />
                    Enter Garage / Buyer Portal
                  </button>

                  <button
                    onClick={() => setCurrentRole("vendor")}
                    className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2 transition"
                  >
                    <Store className="w-4 h-4" />
                    Vendor Quoting Console
                  </button>
                </div>
              </div>
            </div>

            {/* Exploded System Previews */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Exploded Automotive Systems Architecture
                  </h2>
                  <p className="text-xs text-slate-400">
                    Click any system below to inspect its individual single parts, wiring, and fitment.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentRole("market")}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  View All Systems &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AUTOMOTIVE_SYSTEMS.map((sys) => (
                  <div
                    key={sys.id}
                    onClick={() => {
                      setSelectedSystemId(sys.id as any);
                      setMarketViewMode("systems");
                      setCurrentRole("market");
                    }}
                    className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
                  >
                    <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                      <img
                        src={sys.diagramImage}
                        alt={sys.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow">
                        {sys.totalPartsCount}+ Single Parts
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                          {sys.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {sys.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-bold text-amber-400">
                        <span>Inspect Exploded Parts</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Classified System Pillars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Classified Operational Portals
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live reverse-RFQ execution across Addis Ababa spare parts clusters.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div
                  onClick={() => setCurrentRole("buyer")}
                  className="group cursor-pointer bg-slate-900/95 border border-slate-800 hover:border-blue-500 rounded-2xl overflow-hidden transition p-5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    Garage Workbench
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Compare sealed bids with shelf photos from verified merchants. Lock funds in Chapa escrow.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentRole("vendor")}
                  className="group cursor-pointer bg-slate-900/95 border border-slate-800 hover:border-emerald-500 rounded-2xl overflow-hidden transition p-5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                    Vendor Quoting Drawer
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access live RFQ demand feeds. Submit sealed prices with shelf verification photos.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentRole("courier")}
                  className="group cursor-pointer bg-slate-900/95 border border-slate-800 hover:border-amber-500 rounded-2xl overflow-hidden transition p-5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                    Courier Tamper Seal &amp; PIN
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Numbered seal photo at pickup, plus cryptographic 4-digit PIN exchange upon delivery.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentRole("admin")}
                  className="group cursor-pointer bg-slate-900/95 border border-slate-800 hover:border-purple-500 rounded-2xl overflow-hidden transition p-5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
                    Operations &amp; Dispute Desk
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Escrow fund custody, fitment dispute arbitration, and audit log settlement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. AUTOMOTIVE SYSTEMS & SINGLE PARTS BREAKDOWN (IMAGE-GROUNDED)
        ========================================================================= */}
        {currentRole === "market" && (
          <div className="space-y-6">
            {/* Top Toolbar: Vehicle Selector, Search & View Mode Switcher */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#0d1629] to-[#121a2f] border border-amber-500/30 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 mb-2">
                    <Zap className="w-3 h-3 fill-current" />
                    Automotive Systems &amp; Single Component Breakdown
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {marketViewMode === "systems" ? activeSystem.name : "Spare Parts Catalog & Feed"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {marketViewMode === "systems"
                      ? "Select and inspect the single parts required to construct or repair this system. Add parts to your build bundle or request immediate quotes."
                      : "Search and filter all single automotive parts across Ethiopian fleet models."}
                  </p>
                </div>

                {/* View Switcher Pill */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setMarketViewMode("systems")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      marketViewMode === "systems"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Exploded System View</span>
                  </button>
                  <button
                    onClick={() => setMarketViewMode("grid")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      marketViewMode === "grid"
                        ? "bg-amber-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>All Parts Grid</span>
                  </button>
                </div>
              </div>

              {/* Vehicle Garage Fitment & Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search single part (e.g. MAP sensor, ABS module, 1KD ECU, MAF)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="md:col-span-4 bg-slate-950 rounded-xl px-3 py-2 border border-slate-800 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                    >
                      {VEHICLE_GARAGE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3 flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                  <select
                    value={selectedMarketHub}
                    onChange={(e) => setSelectedMarketHub(e.target.value)}
                    className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900 text-white">All Market Hubs</option>
                    <option value="Teklehaymanot" className="bg-slate-900 text-white">Teklehaymanot (New OEM)</option>
                    <option value="Kera" className="bg-slate-900 text-white">Kera (Truck &amp; Engines)</option>
                    <option value="Somali Tera" className="bg-slate-900 text-white">Somali Tera (Scrap Cuts)</option>
                  </select>
                </div>
              </div>

              {/* OBD-II Fault Code & Diagnostic Troubleshooting Filter */}
              <div className="border-t border-slate-800/80 pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    OBD-II Diagnostic Trouble Code (DTC) Quick Filter:
                  </span>
                  {selectedDtc !== "ALL" && (
                    <button
                      onClick={() => setSelectedDtc("ALL")}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      ✕ Reset DTC Filter
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {POPULAR_GARAGE_DTCS.map((dtc) => (
                    <button
                      key={dtc.code}
                      onClick={() => setSelectedDtc(dtc.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                        selectedDtc === dtc.code
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {dtc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Architecture Selector Tabs (when in Exploded System View) */}
              {marketViewMode === "systems" && (
                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {AUTOMOTIVE_SYSTEMS.map((sys) => (
                      <button
                        key={sys.id}
                        onClick={() => {
                          setSelectedSystemId(sys.id as any);
                          setSelectedSubcategory("ALL");
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition ${
                          selectedSystemId === sys.id
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 font-black"
                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        <span>{sys.id === "ems" ? "🧠" : sys.id === "braking" ? "🛑" : "🚗"}</span>
                        <span>{sys.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedSystemId === sys.id ? "bg-slate-950/20 text-slate-950" : "bg-slate-900 text-slate-400"}`}>
                          {sys.totalPartsCount}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Subcategory Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedSubcategory("ALL")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                        selectedSubcategory === "ALL"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      All Components ({activeSystem.singleParts.length})
                    </button>
                    {activeSystem.subcategories.map((subcat) => (
                      <button
                        key={subcat}
                        onClick={() => setSelectedSubcategory(subcat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                          selectedSubcategory === subcat
                            ? "bg-blue-600 text-white"
                            : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        {subcat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Build Bundle Drawer Floating Bar */}
            {buildBundle.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950/90 border-2 border-blue-500 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold">
                    {buildBundle.length}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      System Build Bundle Active ({buildBundle.length} Single Parts Selected)
                    </h4>
                    <p className="text-xs text-slate-300">
                      Estimated Package Total:{" "}
                      <strong className="text-emerald-400">
                        {buildBundle.reduce((sum, p) => sum + p.priceEstBirr, 0).toLocaleString()} ETB
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBuildBundle([])}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Clear Bundle
                  </button>
                  <button
                    onClick={handleBroadcastBundleRfq}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-orange-500/30 transition flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Broadcast Combined Build RFQ
                  </button>
                </div>
              </div>
            )}

            {/* Exploded System View Layout (Image Diagram Showcase + Constituent Single Parts Grid) */}
            {marketViewMode === "systems" && (
              <div className="space-y-6">
                {/* Visual Architecture Banner Card */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0c1222] shadow-2xl">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-center">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 text-[11px] font-bold">
                        <Cpu className="w-3.5 h-3.5" />
                        System Breakdown
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight">
                        {activeSystem.name}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeSystem.description}
                      </p>
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          Central Hub &amp; Interface:
                        </div>
                        <div className="font-bold text-amber-400">{activeSystem.centralHub}</div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col items-center">
                      <div className="relative w-full max-h-[380px] rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-inner">
                        <img
                          src={activeSystem.diagramImage}
                          alt={activeSystem.name}
                          className="w-full h-full object-contain max-h-[380px]"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 italic mt-2 text-center">
                        {activeSystem.diagramCaption}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Single Constituent Parts Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <div>
                    Showing <strong className="text-white">{filteredParts.length}</strong> single constituent parts in{" "}
                    <strong className="text-amber-400">{activeSystem.name}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fitment Checked for {selectedVehicle === "ALL" ? "All Fleet Models" : selectedVehicle}</span>
                  </div>
                </div>

                {/* Single Constituent Parts Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredParts.map((part) => {
                    const isSelectedInBundle = buildBundle.some((p) => p.id === part.id);
                    return (
                      <div
                        key={part.id}
                        className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                          isSelectedInBundle
                            ? "bg-blue-950/30 border-blue-500 shadow-lg shadow-blue-500/10"
                            : "bg-slate-900/90 border-slate-800 hover:border-amber-500/60"
                        }`}
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {part.systemSubcategory}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {part.voltage}
                            </span>
                          </div>

                          {/* Component Visual Reference Image */}
                          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 group">
                            <img
                              src={part.image}
                              alt={part.name}
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-slate-700/80">
                              {part.sku}
                            </span>
                          </div>

                          <div>
                            {part.localAmharicName && (
                              <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[11px] font-bold border border-emerald-800/70 mb-1">
                                {part.localAmharicName}
                              </div>
                            )}
                            <h4 className="text-sm font-bold text-white leading-snug">
                              {part.name}
                            </h4>
                          </div>

                          {part.dtcCodes && part.dtcCodes.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold">DTC:</span>
                              {part.dtcCodes.map((code) => (
                                <button
                                  key={code}
                                  onClick={() => setSelectedDtc(code.split("/")[0])}
                                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/70 hover:bg-amber-800/50"
                                >
                                  {code}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Role in System:</span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              {part.role}
                            </p>
                          </div>

                          {(part.laborTimeEst || part.difficulty) && (
                            <div className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-slate-950/90 border border-slate-800">
                              <span className="text-slate-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-500" />
                                Labor: <strong className="text-slate-200">{part.laborTimeEst || "45 mins"}</strong>
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                part.difficulty === "PROFESSIONAL_GARAGE_ONLY" ? "bg-red-950/70 text-red-300 border border-red-800/60" :
                                part.difficulty === "INTERMEDIATE" ? "bg-amber-950/70 text-amber-300 border border-amber-800/60" :
                                "bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
                              }`}>
                                {part.difficulty === "PROFESSIONAL_GARAGE_ONLY" ? "PRO GARAGE" :
                                 part.difficulty === "INTERMEDIATE" ? "MODERATE" : "DIY FRIENDLY"}
                              </span>
                            </div>
                          )}

                          {part.garageInspectionTips && (
                            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/50 text-[11px] space-y-1">
                              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                Mechanic Diagnostic Tip:
                              </div>
                              <p className="text-blue-200/90 italic text-[11px] leading-relaxed">
                                {part.garageInspectionTips}
                              </p>
                            </div>
                          )}

                          {part.toolsRequired && part.toolsRequired.length > 0 && (
                            <div className="text-[11px] text-slate-400 flex items-start gap-1">
                              <span className="text-slate-500 font-semibold shrink-0">Tools:</span>
                              <span className="text-slate-300">{part.toolsRequired.join(", ")}</span>
                            </div>
                          )}

                          <div className="space-y-1 text-[11px]">
                            <div className="text-slate-400">
                              Brand: <strong className="text-slate-200">{part.brand}</strong> ({part.conditionLabel})
                            </div>
                            <div className="text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {part.marketHub} &bull; {part.stockVendorsCount} Shops
                            </div>
                          </div>

                          <div className="pt-2 flex items-baseline justify-between border-t border-slate-800">
                            <div>
                              <div className="text-base font-black text-white">
                                {part.priceEstBirr.toLocaleString()} ETB
                              </div>
                              <div className="text-[10px] text-slate-500 line-through">
                                {part.originalPriceBirr.toLocaleString()} ETB
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/80">
                              Verified Stock
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 pt-0 space-y-2 border-t border-slate-800/60">
                          <button
                            onClick={() => toggleBundlePart(part)}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              isSelectedInBundle
                                ? "bg-blue-600 text-white"
                                : "bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800"
                            }`}
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            {isSelectedInBundle ? "Selected in Build Bundle" : "+ Add to Build Bundle"}
                          </button>

                          <button
                            onClick={() => setRfqModalPart(part)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            Request Single Part Quote
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flat Grid Catalog View */}
            {marketViewMode === "grid" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <div>
                    Showing <strong className="text-white">{allFilteredFlat.length}</strong> total single spare parts across all systems
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {allFilteredFlat.map((part) => (
                    <div
                      key={part.id}
                      className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono">{part.sku}</span>
                          <span className="text-amber-400 font-semibold">{part.voltage}</span>
                        </div>

                        {/* Component Visual Reference Image */}
                        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                          <img
                            src={part.image}
                            alt={part.name}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div>
                          {part.localAmharicName && (
                            <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[11px] font-bold border border-emerald-800/70 mb-1">
                              {part.localAmharicName}
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-white">{part.name}</h4>
                        </div>

                        {part.dtcCodes && part.dtcCodes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-slate-500 font-semibold">DTC:</span>
                            {part.dtcCodes.map((code) => (
                              <button
                                key={code}
                                onClick={() => setSelectedDtc(code.split("/")[0])}
                                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/70 hover:bg-amber-800/50"
                              >
                                {code}
                              </button>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-400 line-clamp-2">{part.role}</p>

                        {(part.laborTimeEst || part.difficulty) && (
                          <div className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-950/90 border border-slate-800">
                            <span className="text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Labor: <strong className="text-slate-200">{part.laborTimeEst || "45m"}</strong>
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              part.difficulty === "PROFESSIONAL_GARAGE_ONLY" ? "bg-red-950/70 text-red-300 border border-red-800/60" :
                              part.difficulty === "INTERMEDIATE" ? "bg-amber-950/70 text-amber-300 border border-amber-800/60" :
                              "bg-emerald-950/70 text-emerald-300 border border-emerald-800/60"
                            }`}>
                              {part.difficulty === "PROFESSIONAL_GARAGE_ONLY" ? "PRO GARAGE" :
                               part.difficulty === "INTERMEDIATE" ? "MODERATE" : "DIY FRIENDLY"}
                            </span>
                          </div>
                        )}

                        {part.garageInspectionTips && (
                          <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-900/50 text-[10px] text-blue-200/90 italic line-clamp-2">
                            Tip: {part.garageInspectionTips}
                          </div>
                        )}

                        <div className="text-xs text-slate-400">
                          Primary: <strong className="text-slate-200">{part.primaryVehicleModel}</strong>
                        </div>
                        <div className="pt-2 flex items-baseline justify-between border-t border-slate-800">
                          <div>
                            <div className="text-base font-black text-white">
                              {part.priceEstBirr.toLocaleString()} ETB
                            </div>
                            <div className="text-[10px] text-slate-500 line-through">
                              {part.originalPriceBirr.toLocaleString()} ETB
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/80">
                            {part.marketHub}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-2 border-t border-slate-800/60">
                        <button
                          onClick={() => toggleBundlePart(part)}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            buildBundle.some((p) => p.id === part.id)
                              ? "bg-blue-600 text-white"
                              : "bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800"
                          }`}
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          {buildBundle.some((p) => p.id === part.id) ? "In Build Bundle" : "+ Add to Bundle"}
                        </button>
                        <button
                          onClick={() => setRfqModalPart(part)}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          Request Quotes (RFQ)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Request Fitment Quote (Reverse-RFQ) from Single Part */}
        {rfqModalPart && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1526] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Broadcast Sealed RFQ</h3>
                    <p className="text-[11px] text-slate-400">
                      Dispatches to verified {rfqModalPart.marketHub} merchants
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRfqModalPart(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Part Summary Preview with Visual Verification Image */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-full h-44 bg-black/70 rounded-xl overflow-hidden border border-slate-800/80 flex items-center justify-center p-2">
                  <img
                    src={rfqModalPart.image}
                    alt={rfqModalPart.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {rfqModalPart.systemSubcategory} &bull; {rfqModalPart.voltage}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{rfqModalPart.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {rfqModalPart.sku} &bull; {rfqModalPart.brand}</p>
                  <p className="text-[11px] text-slate-300 italic pt-1">{rfqModalPart.role}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Vehicle Plate Number (Chassis Identifier):
                  </label>
                  <input
                    type="text"
                    value={rfqPlateInput}
                    onChange={(e) => setRfqPlateInput(e.target.value)}
                    placeholder="e.g. 3-B48102"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Garage / Mechanics Delivery Location:
                  </label>
                  <input
                    type="text"
                    value={rfqGarageLocation}
                    onChange={(e) => setRfqGarageLocation(e.target.value)}
                    placeholder="e.g. Tadesse Auto, Bole Medhanialem"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Delivery Urgency:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRfqUrgency("CRITICAL_SAME_DAY")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        rfqUrgency === "CRITICAL_SAME_DAY"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      ⚡ Critical (Same Day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRfqUrgency("STANDARD_24H")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        rfqUrgency === "STANDARD_24H"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      📦 Standard (24 Hours)
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Reverse-RFQ Escrow Guarantee:
                  </div>
                  <p className="text-slate-300">
                    Merchants respond with sealed shelf-photo proof. Payout is released to the seller only after your mechanic tests physical bolt fitment and inputs the 4-digit PIN.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setRfqModalPart(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBroadcastRfq(rfqModalPart)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-orange-500/30 transition"
                >
                  Broadcast Sealed RFQ Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. BUYER / GARAGE CLASSIFIED WORKBENCH
        ========================================================================= */}
        {currentRole === "buyer" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-blue-950/30 border border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Garage Workbench: Tadesse Auto Mechanics
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Bole Medhanialem
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Live Escrow Orders: 1 | Pending Quotes: {rfqList.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentRole("market")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Explore Systems &amp; Parts
                </button>
                <button
                  onClick={() => setCurrentRole("landing")}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workshop Repair Bays & Live Diagnostic Job Cards */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 mb-1">
                    <Wrench className="w-3 h-3 text-blue-400" />
                    Live Garage Floor Management
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Active Workshop Service Bays &amp; Diagnostic Job Cards
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {GARAGE_JOB_CARDS.length} Bays In-Service
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Active vehicle repairs in Bole Medhanialem workshop. Click <strong className="text-amber-400">&quot;Load Job Parts to Bundle&quot;</strong> to directly push fault-isolated components into a sealed market RFQ.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GARAGE_JOB_CARDS.map((jc) => {
                  const statusColors = {
                    DIAGNOSING: "bg-amber-950/80 text-amber-300 border-amber-800/80",
                    PARTS_DISPATCHED: "bg-blue-950/80 text-blue-300 border-blue-800/80",
                    IN_TRANSIT: "bg-purple-950/80 text-purple-300 border-purple-800/80",
                    INSTALLING: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
                    READY_FOR_PICKUP: "bg-teal-950/80 text-teal-300 border-teal-800/80",
                  };

                  return (
                    <div
                      key={jc.id}
                      className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1324] via-[#0d1629] to-[#11192e] border border-slate-800 hover:border-blue-500/50 shadow-xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Bay & Status Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              {jc.id} &bull; {jc.bayNumber}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                              {jc.vehicle}
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              statusColors[jc.status]
                            }`}
                          >
                            {jc.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Vehicle Specs Bar */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] py-1.5 px-3 rounded-xl bg-slate-950/80 border border-slate-800">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Plate / Chassis</span>
                            <span className="font-mono text-white font-semibold">{jc.plate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase font-bold">Odometer</span>
                            <span className="font-mono text-amber-300 font-semibold">{jc.mileage}</span>
                          </div>
                        </div>

                        {/* Driver Complaint */}
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Driver Complaint:</span>
                          <p className="text-slate-300 italic text-[11px] bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                            &quot;{jc.complaint}&quot;
                          </p>
                        </div>

                        {/* Mechanic Diagnostic Finding */}
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Diagnostic Finding &amp; DTC:
                          </span>
                          <p className="text-amber-200/90 font-mono text-[11px] bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                            {jc.diagnosisDtc}
                          </p>
                        </div>

                        {/* Tech Assigned & Required Parts */}
                        <div className="flex flex-col gap-2 pt-1">
                          <div className="text-[11px] text-slate-400">
                            Assigned Mechanic: <strong className="text-white">{jc.assignedTech}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 font-semibold">Required Parts:</span>
                            {jc.requiredPartIds.map((pid) => (
                              <span
                                key={pid}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-900"
                              >
                                {pid}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-slate-800/80">
                        <button
                          onClick={() => handleLoadJobCardParts(jc)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                          <span>Load Job Parts to Bundle &amp; Order</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Escrow In-Transit Card with Rich Photo Badge & PIN */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e172a] border-2 border-emerald-500/40 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-black">
                    <img
                      src="/images/gear-precision.jpg"
                      alt="Alternator part inspection"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ESCROW_LOCKED • IN_TRANSIT
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Order #TR-2026-0081</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Toyota Hilux 1KD Alternator Assembly (80 Amp)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Merchant: <strong className="text-slate-200">Alpha Spares (Teklehaymanot)</strong> |
                      Courier: <strong className="text-slate-200">Abebe (Motorcycle)</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Escrow Total Locked</div>
                  <div className="text-xl font-black text-emerald-400">14,850.00 ETB</div>
                  <div className="text-[10px] text-slate-500">Chapa Escrow Safe Settlement</div>
                </div>
              </div>

              {/* Security Handshake Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Tamper Seal Code:
                    </span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      #TS-8942
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Compare the physical numbered seal on the delivery pouch with this code before opening.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-300 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Derived Secret PIN:
                    </span>
                    <button
                      onClick={() => setPinRevealed(!pinRevealed)}
                      className="text-[11px] underline text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {pinRevealed ? "Hide PIN" : "Reveal PIN"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-2xl font-black tracking-widest text-emerald-400">
                      {pinRevealed ? "7419" : "••••"}
                    </div>
                    <span className="text-[10px] text-amber-300/90 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/80">
                      ⚠️ Give ONLY after bolt inspection!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bids Comparison Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Competing Bids on Request REQ-901</h3>
                  <p className="text-xs text-slate-400">Toyota Hilux 2018 (Plate: 3-B48102) &bull; Denso 12V 80A Alternator</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  3 Verified Quotes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bidsForReq901.map((bid) => (
                  <div
                    key={bid.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 border border-slate-800">
                        <img
                          src={bid.image}
                          alt={bid.vendorName}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/80 text-white backdrop-blur">
                          Shelf Photo Verified
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{bid.vendorName}</span>
                        <span className="text-amber-400 font-semibold">★ {bid.rating}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {bid.marketArea}
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                        <div className="text-xs font-semibold text-emerald-400">{bid.condition}</div>
                        <div className="text-[11px] text-slate-300">{bid.warrantyDays} Days Replacement Guarantee</div>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">Quoted Price:</span>
                        <span className="text-lg font-black text-white">
                          {bid.priceBirr.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Accepted bid from ${bid.vendorName} for ${bid.priceBirr} ETB! Funds locked in Chapa Escrow.`)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                    >
                      Accept &amp; Lock Escrow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. VENDOR / SHOP CLASSIFIED CONSOLE
        ========================================================================= */}
        {currentRole === "vendor" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-950/30 border border-emerald-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Alpha Auto Spares
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Teklehaymanot Market (Shop #42)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Specialty: Engine Management Sensors &amp; Electricals &bull; Verified Merchant</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Available Payout Balance</span>
                  <div className="text-sm font-bold text-emerald-400">42,650.00 ETB</div>
                </div>
                <button
                  onClick={() => setCurrentRole("landing")}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Incoming Requests Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Requests Matching Your Inventory</h3>
                  <p className="text-xs text-slate-400">Bids are sealed and invisible to rival shops</p>
                </div>
                <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {rfqList.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-black">
                        <img
                          src={req.image}
                          alt={req.part}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-400">{req.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                            {req.urgency === "CRITICAL_SAME_DAY" ? "⚡ Critical (Same Day)" : "Standard (24h)"}
                          </span>
                          <span className="text-xs text-slate-500">&bull; {req.timeAgo}</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{req.part}</h4>
                        <p className="text-xs text-slate-400">
                          Vehicle: <strong className="text-slate-200">{req.vehicle}</strong> | Plate:{" "}
                          <strong className="text-slate-200">{req.plate}</strong> | Market:{" "}
                          <strong className="text-slate-200">{req.market}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="number"
                        placeholder="Price in ETB"
                        className="w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => alert(`Sealed quote submitted with shelf photo verification for ${req.id}!`)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Place Sealed Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. COURIER / RIDER DISPATCH WORKSPACE
        ========================================================================= */}
        {currentRole === "courier" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-950/30 border border-amber-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Abebe Kebede (Motorcycle #ET-3-48921)
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ON_DUTY
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Delivery Dispatch &bull; Active Job in Progress</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentRole("landing")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Active Delivery Job */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Current Assigned Delivery
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Order #TR-2026-0081</h3>
                  <p className="text-xs text-slate-400">Toyota Hilux 1KD Alternator Assembly (80A Denso)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Delivery Payout</span>
                  <div className="text-lg font-black text-amber-400">350.00 ETB</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-400" />
                      1. Pickup: Alpha Spares (Teklehaymanot)
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-400">
                    Tamper Seal Attached: <strong className="text-amber-400 font-mono">#TS-8942</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bag photo verified on server at 11:24 AM.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-blue-400" />
                      2. Destination: Tadesse Garage (Bole)
                    </span>
                    <span className="text-amber-400 text-[10px] font-mono uppercase bg-amber-950/50 px-2 py-0.5 rounded border border-amber-900">
                      Pending PIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ask the garage mechanic for their 4-digit PIN after they physically test fitment.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter 4-Digit PIN"
                      className="w-36 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        if (pinInput === "7419") {
                          setPinVerified(true);
                        } else {
                          alert("Incorrect PIN. Must match buyer's derived secret.");
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                    >
                      Verify &amp; Release
                    </button>
                  </div>

                  {pinVerified && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>PIN Verified! Funds released to vendor. 350 ETB credited to courier.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. ADMIN / OPERATIONS CLASSIFIED DESK
        ========================================================================= */}
        {currentRole === "admin" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-purple-950/30 border border-purple-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    TeraSync Central Operations &amp; Dispute Desk
                  </h2>
                  <p className="text-xs text-slate-400">Escrow Custody &amp; Cryptographic Audit Chain</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentRole("landing")}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs text-slate-400">Active Escrow Balance</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">428,500.00 ETB</div>
                <div className="text-[10px] text-slate-500 mt-1">Held across 28 live orders</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs text-slate-400">Platform Commission (5%)</div>
                <div className="text-2xl font-black text-blue-400 mt-1">21,425.00 ETB</div>
                <div className="text-[10px] text-slate-500 mt-1">Earned this cycle</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs text-slate-400">Active Dispute Cases</div>
                <div className="text-2xl font-black text-amber-400 mt-1">1 Case</div>
                <div className="text-[10px] text-slate-500 mt-1">Requires manual arbitration</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Dispute Case #DSP-104</h3>
                  <span className="text-[10px] font-mono bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded border border-amber-800">
                    NO_FAULT_FITMENT
                  </span>
                </div>
                <span className="text-xs text-slate-500">Opened 2h ago</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
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
                <button
                  onClick={() => alert("Admin requested uploaded photo verification.")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
                >
                  Request Photos
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* System Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b14] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>TeraSync &copy; 2026. Automotive Systems &amp; Single Spare Parts Clearinghouse.</div>
          <div className="flex gap-3 text-slate-400 font-medium">
            <span>Teklehaymanot</span>
            <span>&bull;</span>
            <span>Kera</span>
            <span>&bull;</span>
            <span>Somali Tera</span>
            <span>&bull;</span>
            <span>Akaki</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
