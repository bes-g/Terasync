"use client";

import React, { useState, useMemo } from "react";
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
  User,
  Trash2,
  ShoppingBag,
  Filter,
} from "lucide-react";

import { AUTOMOTIVE_SYSTEMS, AutomotiveSystem, SinglePartItem } from "../data/systems";
import AuthModal, { AuthRole, AuthProfile } from "./AuthModal";

type Role = "landing" | "market" | "buyer" | "vendor" | "courier" | "admin";

interface NavItem {
  label: string;
  role: Role;
  rolesAllowed?: AuthRole[]; // empty/undefined = public
}

const NAV_ITEMS: NavItem[] = [
  { label: "Storefront", role: "landing" },
  { label: "Catalog", role: "market" },
  { label: "Garage", role: "buyer", rolesAllowed: ["customer", "admin"] },
  { label: "Vendor", role: "vendor", rolesAllowed: ["shop", "admin"] },
  { label: "Courier", role: "courier", rolesAllowed: ["rider", "admin"] },
  { label: "Admin", role: "admin", rolesAllowed: ["admin"] },
];

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

export interface ShopPostItem {
  id: string;
  title: string;
  priceETB: number;
  category: string;
  condition: "Brand New OEM" | "Tested Genuine Used" | "High Quality Aftermarket";
  compatibility: string;
  shopName: string;
  marketLocation: string;
  phone: string;
  image: string;
  stock: number;
  createdAt: string;
}

const INITIAL_SHOP_POSTS: ShopPostItem[] = [
  {
    id: "POST-101",
    title: "Toyota 1KD-FTV Genuine Turbocharger (CT16V)",
    priceETB: 48500,
    category: "Engine & Forced Induction",
    condition: "Brand New OEM",
    compatibility: "Toyota Hilux / Fortuner / Prado 3.0 D-4D (2008–2022)",
    shopName: "Somali Tera ECU & Ignition Tech",
    marketLocation: "Somali Tera (Block 4, Workshop Lane)",
    phone: "0933887766",
    image: "/images/catalog/turbocharger-actuator.jpg",
    stock: 3,
    createdAt: "Just now",
  },
  {
    id: "POST-102",
    title: "Denso 80A Alternator Assembly",
    priceETB: 16500,
    category: "Electrical & Ignition",
    condition: "Brand New OEM",
    compatibility: "Toyota HiAce Minibus & Hilux 2KD/1KD Diesel",
    shopName: "Bole Genuine Starters & Alternators",
    marketLocation: "Teklehaymanot (Shop #18, Electrical Row)",
    phone: "0911554433",
    image: "/images/catalog/commercial-alternator.jpg",
    stock: 6,
    createdAt: "25m ago",
  },
  {
    id: "POST-103",
    title: "Brembo Front Ceramic Brake Pad Set",
    priceETB: 8200,
    category: "Braking & Safety",
    condition: "Brand New OEM",
    compatibility: "Toyota Land Cruiser LC200 / LC300 / Prado 150",
    shopName: "Alpha Auto Spares",
    marketLocation: "Teklehaymanot (Shop #42)",
    phone: "0911223344",
    image: "/images/catalog/ceramic-brake-pads-set.jpg",
    stock: 9,
    createdAt: "1h ago",
  },
  {
    id: "POST-104",
    title: "Bosch Common Rail Diesel Injector (0445110)",
    priceETB: 12500,
    category: "Fuel Injection",
    condition: "Tested Genuine Used",
    compatibility: "Isuzu NPR / NQR 4HK1 & Toyota 1KD/2KD",
    shopName: "Kera Heavy Truck Parts Hub",
    marketLocation: "Kera (Row 7, Heavy Vehicle Zone)",
    phone: "0911998877",
    image: "/images/catalog/common-rail-diesel-injector.jpg",
    stock: 4,
    createdAt: "2h ago",
  },
  {
    id: "POST-105",
    title: "Toyota 1KD/2KD Engine ECU Control Unit",
    priceETB: 36000,
    category: "Engine Management",
    condition: "Tested Genuine Used",
    compatibility: "Toyota Hilux / HiAce 3.0L Common Rail Diesel",
    shopName: "Alpha Auto Spares",
    marketLocation: "Teklehaymanot (Shop #42)",
    phone: "0911223344",
    image: "/images/catalog/engine-ecu-control-unit.jpg",
    stock: 2,
    createdAt: "3h ago",
  },
  {
    id: "POST-106",
    title: "Heavy Duty Reduction Starter Motor (2.2kW)",
    priceETB: 14800,
    category: "Electrical & Ignition",
    condition: "Brand New OEM",
    compatibility: "Toyota HiAce 5L / Hilux 1HZ Commercial",
    shopName: "Bole Genuine Starters & Alternators",
    marketLocation: "Teklehaymanot (Shop #18, Electrical Row)",
    phone: "0911554433",
    image: "/images/catalog/reduction-starter-motor.jpg",
    stock: 5,
    createdAt: "4h ago",
  },
];

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
  bayPhoto?: string;
  photoCaption?: string;
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
    bayPhoto: "/images/mechanic-underhood-inspection.jpg",
    photoCaption: "Master Tech Girma &bull; Under-Hood 5L Mechanical Diesel Inspection",
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
    bayPhoto: "/images/garage-workshop-bay.jpg",
    photoCaption: "Hilux 1KD Common Rail lifted in Bay 2 for turbocharger inspection",
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
    bayPhoto: "/images/ev-highvoltage-technician.jpg",
    photoCaption: "EV Tech Yonas &bull; High-Voltage Insulated Safety Gloves Servicing Inverter",
  },
];

const POPULAR_GARAGE_DTCS = [
  { code: "P0087", label: "P0087 Low fuel rail pressure" },
  { code: "P0300", label: "P0300 Engine misfire" },
  { code: "P0100", label: "P0100 MAF sensor fault" },
  { code: "C1201", label: "C1201 ABS light" },
  { code: "P0400", label: "P0400 EGR flow" },
  { code: "MORE", label: "More codes" },
];

const VEHICLE_GARAGE_OPTIONS = [
  { id: "ALL", label: "All vehicles (Addis fleet)" },
  { id: "TOYOTA_HIACE", label: "Toyota HiAce 5L" },
  { id: "HILUX", label: "Toyota Hilux / Fortuner (1KD/2KD D-4D)" },
  { id: "LAND_CRUISER", label: "Toyota Land Cruiser HZJ79 / Prado (1HZ/1KD)" },
  { id: "COROLLA_VITZ", label: "Toyota Corolla / Vitz / Yaris (1NZ/1ZR)" },
  { id: "SUZUKI_DZIRE", label: "Suzuki Dzire / Swift (K12M Petrol)" },
  { id: "BYD_ATTO3", label: "BYD Atto 3 / Dolphin / Seagull (Electric EV)" },
  { id: "HYUNDAI_TUCSON", label: "Hyundai Tucson / Accent (CRDi / Petrol)" },
  { id: "ISUZU_NPR", label: "Isuzu NPR / Forward (4HF1/4HG1 24V Truck)" },
];

const TOP_SELLER_PART_IDS = [
  "RAD-HIACE-COPPER",
  "EMS-INJECTOR",
  "BRK-ROTOR-VENTED",
  "BYD-PORT-GBT",
  "EMS-COIL",
  "TOY-CLUTCH-KIT",
  "BRK-PADS",
  "EMS-PUMP",
];

const TOP_SELLERS_LIST: SinglePartItem[] = TOP_SELLER_PART_IDS.map((id) => {
  for (const sys of AUTOMOTIVE_SYSTEMS) {
    const found = sys.singleParts.find((p) => p.id === id);
    if (found) return found;
  }
  return AUTOMOTIVE_SYSTEMS[0].singleParts[0];
});

function ProtectedPortalGuard({
  allowedRoles,
  currentUser,
  portalName,
  requiredRole,
  onLoginPrompt,
  onReturnHome,
  children,
}: {
  allowedRoles: AuthRole[];
  currentUser: AuthProfile | null;
  portalName: string;
  requiredRole: AuthRole;
  onLoginPrompt: (role: AuthRole) => void;
  onReturnHome: () => void;
  children: React.ReactNode;
}) {
  const isAuthorized =
    currentUser && (allowedRoles.includes(currentUser.role) || currentUser.role === "admin");

  if (!isAuthorized) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0F1012] border border-[#3A3F45] max-w-xl mx-auto my-12 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-3xl font-bold">
          <Lock className="w-8 h-8 text-[#FF6A3D]" />
        </div>
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider">
            Protected Portal &bull; Unauthorized
          </div>
          <h2 className="text-2xl font-bold text-[#F5F5F5]">
            {portalName} Access Restricted
          </h2>
          <p className="text-sm text-[#B5BAC0] leading-relaxed max-w-md mx-auto">
            {currentUser
              ? `Your current account (${currentUser.role}) does not have clearance to access the ${portalName}. Please switch accounts or log in with an authorized role.`
              : `You must be logged in with a verified ${portalName} account to view this dashboard and manage orders.`}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onLoginPrompt(requiredRole)}
            className="w-full sm:w-auto btn-pill-primary px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Log In to {portalName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto btn-pill-ghost px-6 py-2.5 text-xs font-medium text-[#B5BAC0]"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function TeraSyncPlatform() {
  const [currentRole, setCurrentRole] = useState<Role>("landing");

  // Top sellers carousel index & mobile navigation drawer
  const [topSellerIdx, setTopSellerIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [finderBrand, setFinderBrand] = useState("TOYOTA");
  const [finderModel, setFinderModel] = useState("HIACE");
  const [finderEngine, setFinderEngine] = useState("DIESEL");

  // Market View Mode: Exploded System View vs Grid View
  const [marketViewMode, setMarketViewMode] = useState<"systems" | "grid">("systems");
  const [selectedSystemId, setSelectedSystemId] = useState<"ems" | "braking" | "charging" | "schematic">("ems");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [selectedDtc, setSelectedDtc] = useState<string>("P0087");

  // Interactive filters
  const [selectedVehicle, setSelectedVehicle] = useState<string>("ALL");
  const [selectedVoltage, setSelectedVoltage] = useState<string>("ALL");
  const [selectedMarketHub, setSelectedMarketHub] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamic Catalog Pagination Limit (Load More Parts)
  const [visiblePartsLimit, setVisiblePartsLimit] = useState<number>(4);
  const [isLoadingMoreParts, setIsLoadingMoreParts] = useState<boolean>(false);

  const handleLoadMoreParts = () => {
    setIsLoadingMoreParts(true);
    setTimeout(() => {
      setVisiblePartsLimit((prev) => prev + 4);
      setIsLoadingMoreParts(false);
    }, 300);
  };

  // Build Bundle for System Assembly
  const [buildBundle, setBuildBundle] = useState<SinglePartItem[]>([]);

  // Modals
  const [selectedPartForSpecs, setSelectedPartForSpecs] = useState<SinglePartItem | null>(null);
  const [rfqModalPart, setRfqModalPart] = useState<SinglePartItem | null>(null);
  const [rfqPlateInput, setRfqPlateInput] = useState<string>("3-B48102");
  const [rfqGarageLocation, setRfqGarageLocation] = useState<string>("Tadesse Mechanics, Bole Medhanialem");
  const [rfqUrgency, setRfqUrgency] = useState<"CRITICAL_SAME_DAY" | "STANDARD_24H">("CRITICAL_SAME_DAY");
  const [rfqSuccessToast, setRfqSuccessToast] = useState<string | null>(null);

  // Shop Inventory & Storefront Posts state
  const [shopPosts, setShopPosts] = useState<ShopPostItem[]>(INITIAL_SHOP_POSTS);
  const [shopFilter, setShopFilter] = useState<string>("ALL");
  const [orderModalPost, setOrderModalPost] = useState<ShopPostItem | null>(null);
  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState<string>("Tadesse Garage, Bole Medhanialem");
  const [orderContactPhone, setOrderContactPhone] = useState<string>("0911223344");

  // Vendor Portal New Post Form state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostPrice, setNewPostPrice] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Electrical & Ignition");
  const [newPostCondition, setNewPostCondition] = useState<ShopPostItem["condition"]>("Brand New OEM");
  const [newPostCompatibility, setNewPostCompatibility] = useState("");
  const [newPostStock, setNewPostStock] = useState("1");
  const [newPostImage, setNewPostImage] = useState("/images/catalog/commercial-alternator.jpg");

  const handleCreateShopPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostPrice) return;
    const priceNum = parseFloat(newPostPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    const activeShopName = currentUser?.shopName || "Alpha Auto Spares";
    const activeMarket = currentUser?.market
      ? `${currentUser.market} (${currentUser.street || "Main Workshop Row"})`
      : "Teklehaymanot (Shop #42)";

    const newPost: ShopPostItem = {
      id: `POST-${Date.now().toString().slice(-4)}`,
      title: newPostTitle.trim(),
      priceETB: priceNum,
      category: newPostCategory,
      condition: newPostCondition,
      compatibility: newPostCompatibility.trim() || "Universal / Addis Commercial Fleet",
      shopName: activeShopName,
      marketLocation: activeMarket,
      phone: currentUser?.phone || "0911223344",
      image: newPostImage,
      stock: parseInt(newPostStock) || 1,
      createdAt: "Just now",
    };

    setShopPosts((prev) => [newPost, ...prev]);
    setNewPostTitle("");
    setNewPostPrice("");
    setNewPostCompatibility("");
    setNewPostStock("1");
    setRfqSuccessToast(`✅ Successfully published "${newPost.title}" to the live marketplace!`);
    setTimeout(() => setRfqSuccessToast(null), 6000);
  };

  const handleDeleteShopPost = (id: string) => {
    const item = shopPosts.find((p) => p.id === id);
    setShopPosts((prev) => prev.filter((p) => p.id !== id));
    if (item) {
      setRfqSuccessToast(`🗑️ Removed "${item.title}" from marketplace listings.`);
      setTimeout(() => setRfqSuccessToast(null), 4000);
    }
  };

  const handleOrderPost = (post: ShopPostItem) => {
    if (!currentUser) {
      openAuth("customer");
      return;
    }
    setOrderModalPost(post);
  };

  const handleConfirmOrder = () => {
    if (!orderModalPost) return;
    setRfqSuccessToast(
      `🎉 Escrow order placed for ${orderModalPost.title} from ${orderModalPost.shopName}! Courier assigned for pickup in ${orderModalPost.marketLocation}.`
    );
    setOrderModalPost(null);
    setTimeout(() => setRfqSuccessToast(null), 7000);
  };

  // Escrow & Handshake state
  const [pinRevealed, setPinRevealed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinVerified, setPinVerified] = useState(false);
  const [deliverySettlementStatus, setDeliverySettlementStatus] = useState<"IN_TRANSIT" | "ARRIVED_VERIFIED" | "SETTLED">("IN_TRANSIT");
  const [shopBalance, setShopBalance] = useState<number>(42650);
  const [courierBalance, setCourierBalance] = useState<number>(350);
  const [airPayoutTx, setAirPayoutTx] = useState<{
    shopTx: string;
    courierTx: string;
    shopAmount: number;
    courierAmount: number;
    platformFee: number;
    timestamp: string;
  } | null>(null);

  // Auth & Onboarding state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTargetRole, setAuthTargetRole] = useState<AuthRole | null>(null);
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthProfile | null>(null);

  const openAuth = (role: AuthRole | null = null) => {
    setAuthTargetRole(role);
    setAuthModalOpen(true);
    setPartnerDropdownOpen(false);
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.rolesAllowed) return true; // public
    return currentUser && item.rolesAllowed.includes(currentUser.role);
  });
  const [knownPhones, setKnownPhones] = useState<Set<string>>(
    () => new Set(["0911223344", "0922334455", "0911554433", "0922776655"])
  );
  const [adminSubTab, setAdminSubTab] = useState<"settlements" | "applications" | "disputes">("settlements");
  const [pendingApplications, setPendingApplications] = useState<
    Array<{
      id: string;
      role: "shop" | "rider";
      phone: string;
      submittedAt: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      profile: AuthProfile;
    }>
  >([
    {
      id: "APP-101",
      role: "shop",
      phone: "0911554433",
      submittedAt: "10m ago",
      status: "PENDING",
      profile: {
        role: "shop",
        phone: "0911554433",
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
        role: "rider",
        phone: "0922776655",
        vehicleType: "Motorcycle (100–150cc)",
        plate: "AA-49201",
        areas: ["Bole", "Yeka", "Kirkos"],
        idNumber: "FAN/AA/8849201",
        payoutService: "Telebirr (Ethio Telecom)",
        payoutNumber: "0922776655",
      },
    },
  ]);

  // Dynamic list of available shops & hubs for catalog filtering
  const allAvailableShops = useMemo(() => {
    const shopsMap = new Map<string, { id: string; name: string; hub: string; isCurrentUser?: boolean }>();

    // 1. If current logged-in user is a shop, ensure they are at the top!
    if (currentUser && (currentUser.role === "shop" || currentUser.shopName)) {
      const sName = currentUser.shopName || currentUser.fullName || "My Verified Shop";
      const sHub = currentUser.market || "Teklehaymanot";
      shopsMap.set(sName, {
        id: `SHOP-${sName}`,
        name: sName,
        hub: sHub,
        isCurrentUser: true,
      });
    }

    // 2. Include all active shops with inventory in shopPosts
    shopPosts.forEach((post) => {
      if (post.shopName && !shopsMap.has(post.shopName)) {
        const hub = post.marketLocation.split(" (")[0] || "Teklehaymanot";
        shopsMap.set(post.shopName, {
          id: `SHOP-${post.shopName}`,
          name: post.shopName,
          hub: hub,
        });
      }
    });

    // 3. Include any registered shops from pending/approved applications
    pendingApplications.forEach((app) => {
      if (app.role === "shop" && app.profile.shopName && !shopsMap.has(app.profile.shopName)) {
        shopsMap.set(app.profile.shopName, {
          id: `SHOP-${app.profile.shopName}`,
          name: app.profile.shopName,
          hub: app.profile.market || "Teklehaymanot",
        });
      }
    });

    // 4. Default verified network merchants if not already present
    const defaultShops = [
      { name: "Alpha Auto Spares", hub: "Teklehaymanot" },
      { name: "Bole Genuine Starters & Alternators", hub: "Teklehaymanot" },
      { name: "Somali Tera ECU & Ignition Tech", hub: "Somali Tera" },
      { name: "Kera Heavy Truck Parts Hub", hub: "Kera" },
    ];
    defaultShops.forEach((ds) => {
      if (!shopsMap.has(ds.name)) {
        shopsMap.set(ds.name, {
          id: `SHOP-${ds.name}`,
          name: ds.name,
          hub: ds.hub,
        });
      }
    });

    return Array.from(shopsMap.values());
  }, [currentUser, shopPosts, pendingApplications]);

  const handlePhoneUsed = (phone: string) => {
    setKnownPhones((prev) => new Set([...Array.from(prev), phone]));
  };

  const handleAuthComplete = (role: AuthRole, profile: AuthProfile) => {
    setCurrentUser(profile);
    if (role === "customer") {
      if (profile.make) {
        const makeStr = String(profile.make);
        if (makeStr.includes("Toyota")) setFinderBrand("TOYOTA");
        else if (makeStr.includes("BYD")) setFinderBrand("BYD");
        else if (makeStr.includes("Hyundai")) setFinderBrand("HYUNDAI");
        else if (makeStr.includes("Suzuki")) setFinderBrand("SUZUKI");
        else if (makeStr.includes("Isuzu")) setFinderBrand("ISUZU");
      }
      if (profile.model) {
        const modStr = String(profile.model);
        if (modStr.includes("HiAce")) setFinderModel("HIACE");
        else if (modStr.includes("Hilux")) setFinderModel("HILUX");
        else if (modStr.includes("Atto 3")) setFinderModel("ATTO3");
        else if (modStr.includes("Dzire")) setFinderModel("DZIRE");
      }
      setCurrentRole("landing");
      setRfqSuccessToast(`Welcome, ${String(profile.firstName || "Customer")}! Your vehicle is selected on the storefront.`);
      setTimeout(() => setRfqSuccessToast(null), 8000);
    } else if (role === "shop") {
      setCurrentRole("vendor");
      if (profile.shopName) {
        setSelectedMarketHub(`SHOP:${profile.shopName}`);
      }
      setRfqSuccessToast(`Logged in as verified merchant (${String(profile.shopName || "Alpha Auto Spares")}). Your shop option is now active in the catalog!`);
      setTimeout(() => setRfqSuccessToast(null), 8000);
    } else if (role === "rider") {
      setCurrentRole("courier");
      setRfqSuccessToast(`Logged in to Delivery Dispatch (${String(profile.plate || "Motorcycle")})`);
      setTimeout(() => setRfqSuccessToast(null), 8000);
    } else if (role === "admin") {
      setCurrentRole("admin");
      setRfqSuccessToast("Authenticated as Central Operations Administrator.");
      setTimeout(() => setRfqSuccessToast(null), 8000);
    }
  };

  const handlePendingReview = (role: AuthRole, profile: AuthProfile) => {
    const newApp = {
      id: `APP-${Math.floor(100 + Math.random() * 900)}`,
      role: role as "shop" | "rider",
      phone: profile.phone,
      submittedAt: "Just now",
      status: "PENDING" as const,
      profile,
    };
    setPendingApplications((prev) => [newApp, ...prev]);
    if (role === "shop") {
      setCurrentUser(profile);
      if (profile.shopName) {
        setSelectedMarketHub(`SHOP:${profile.shopName}`);
      }
    }
  };

  const handleApproveApp = (appId: string) => {
    setPendingApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "APPROVED" as const } : app))
    );
    const target = pendingApplications.find((a) => a.id === appId);
    if (target) {
      setKnownPhones((prev) => new Set([...Array.from(prev), target.phone]));
      setRfqSuccessToast(`Application ${appId} Approved! Merchant/Rider is now active and approved.`);
      setTimeout(() => setRfqSuccessToast(null), 8000);
    }
  };

  const handleRejectApp = (appId: string) => {
    setPendingApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: "REJECTED" as const } : app))
    );
  };

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

  // Helper to match part by selected market hub or specific shop
  const isPartMatchingHubOrShop = (
    partMarketHub: string,
    partCategory: string,
    partCompVehicles: string[],
    partName?: string
  ) => {
    if (selectedMarketHub === "ALL") return true;
    if (selectedMarketHub.startsWith("SHOP:")) {
      const targetShop = selectedMarketHub.replace("SHOP:", "");
      const foundShop = allAvailableShops.find((s) => s.name.toLowerCase() === targetShop.toLowerCase());
      const shopHub = foundShop?.hub?.toLowerCase();

      // Check if this shop posted an item matching this part category, compatibility, or title
      const hasSpecificShopPost = shopPosts.some(
        (sp) =>
          sp.shopName.toLowerCase() === targetShop.toLowerCase() &&
          (sp.category.toLowerCase().includes(partCategory.toLowerCase()) ||
            (partName &&
              (sp.title.toLowerCase().includes(partName.toLowerCase()) ||
                partName.toLowerCase().includes(sp.title.toLowerCase()))) ||
            partCompVehicles.some((v) => sp.compatibility.toLowerCase().includes(v.toLowerCase())))
      );
      if (hasSpecificShopPost) return true;

      // Match if the shop's market location corresponds to this part's market hub
      if (shopHub && (partMarketHub.toLowerCase().includes(shopHub) || shopHub.includes(partMarketHub.toLowerCase()))) {
        return true;
      }

      // Fallback for new general shops without specific hub restrictions
      if (!shopHub || shopHub === "all" || shopHub === "addis ababa") {
        return true;
      }

      return false;
    }
    return partMarketHub.toLowerCase() === selectedMarketHub.toLowerCase();
  };

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
    if (!isPartMatchingHubOrShop(part.marketHub, part.systemSubcategory, part.compatibleVehicles, part.name)) {
      return false;
    }
    if (selectedDtc !== "ALL" && selectedDtc !== "P0087" && selectedDtc !== "MORE") {
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
    if (!isPartMatchingHubOrShop(part.marketHub, part.systemSubcategory, part.compatibleVehicles, part.name)) {
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
    <div className="min-h-screen bg-[#050506] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#D93A10] selection:text-white pb-16 sm:pb-0">
      {/* 1. Thin Top Bar (13px, light weight) */}
      <div className="bg-[#050506] border-b border-[#3A3F45] text-[13px] font-light text-[#B5BAC0]">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-8 h-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D93A10] shrink-0 animate-pulse"></span>
            <span className="truncate">Addis Ababa Reverse-RFQ &amp; Sealed Escrow Clearinghouse for Automotive Parts</span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-xs">
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B5BAC0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentRole !== "market") setCurrentRole("market");
                }}
                placeholder="Search part, SKU, OEM..."
                className="bg-[#0F1012] border border-[#3A3F45] rounded-full pl-8 pr-3 py-1 text-xs text-[#F5F5F5] placeholder-[#B5BAC0]/50 focus:border-[#FF6A3D] w-48 transition"
              />
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentUser.role === "customer") setCurrentRole("buyer");
                    else if (currentUser.role === "shop") setCurrentRole("vendor");
                    else if (currentUser.role === "rider") setCurrentRole("courier");
                    else if (currentUser.role === "admin") setCurrentRole("admin");
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#15171A] border border-[#3A3F45] text-xs font-medium text-[#F5F5F5] hover:border-[#FF6A3D] flex items-center gap-1.5 transition"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${currentUser.role === "admin" ? "bg-purple-400" : "bg-emerald-500"}`}></span>
                  <span className="capitalize">{currentUser.role === "admin" ? "Central Admin" : currentUser.role}</span>
                  {currentUser.firstName ? ` (${String(currentUser.firstName)})` : currentUser.shopName ? ` (${String(currentUser.shopName)})` : ""}
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setCurrentRole("landing");
                    setRfqSuccessToast("Signed out successfully.");
                    setTimeout(() => setRfqSuccessToast(null), 5000);
                  }}
                  className="hover:text-red-400 text-xs text-[#B5BAC0] transition px-1"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Partner Portal Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setPartnerDropdownOpen(!partnerDropdownOpen)}
                    className="hover:text-[#F5F5F5] transition hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#15171A] border border-[#3A3F45] text-xs font-medium text-[#B5BAC0] hover:border-[#FF6A3D]"
                  >
                    <Store className="w-3.5 h-3.5 text-[#FF6A3D]" />
                    <span>Partner Portal</span>
                    <ChevronDown className="w-3 h-3 text-[#B5BAC0]" />
                  </button>

                  {partnerDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setPartnerDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0F1012] border border-[#3A3F45] p-2 shadow-2xl z-50 space-y-1 text-xs">
                        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#8A8F96] tracking-wider border-b border-[#3A3F45]/60">
                          Partner Logins
                        </div>
                        <button
                          onClick={() => openAuth("customer")}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#1E2024] text-[#F5F5F5] flex items-center gap-2.5 transition"
                        >
                          <Wrench className="w-4 h-4 text-orange-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">Garage / Workshop</div>
                            <div className="text-[10px] text-[#B5BAC0]">Diagnostics &amp; RFQs</div>
                          </div>
                        </button>
                        <button
                          onClick={() => openAuth("shop")}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#1E2024] text-[#F5F5F5] flex items-center gap-2.5 transition"
                        >
                          <Store className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">Parts Merchant</div>
                            <div className="text-[10px] text-[#B5BAC0]">Inventory &amp; Bids</div>
                          </div>
                        </button>
                        <button
                          onClick={() => openAuth("rider")}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#1E2024] text-[#F5F5F5] flex items-center gap-2.5 transition"
                        >
                          <Bike className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">Delivery Courier</div>
                            <div className="text-[10px] text-[#B5BAC0]">Express Dispatch</div>
                          </div>
                        </button>
                        <button
                          onClick={() => openAuth("admin")}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#1E2024] text-[#F5F5F5] flex items-center gap-2.5 transition border-t border-[#3A3F45]/40"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-purple-300">Operations Desk</div>
                            <div className="text-[10px] text-[#B5BAC0]">Staff Clearance</div>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => openAuth(null)}
                  className="hover:text-[#F5F5F5] transition hidden sm:inline-flex items-center gap-1 font-semibold text-xs text-[#FF6A3D]"
                >
                  Log In / Register
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (!currentUser) {
                  openAuth("customer");
                } else {
                  setCurrentRole("buyer");
                }
              }}
              className="flex items-center gap-1.5 hover:text-[#FF6A3D] transition font-medium"
            >
              <span>My requests</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#D93A10] text-white text-[11px] font-bold">
                {rfqList.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Header (Logo on left, links at 14px weight 500 on right, mobile collapse) */}
      <header className="border-b border-[#3A3F45] bg-[#050506]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-8 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentRole("landing")}
              className="flex items-center gap-2.5 text-left group"
            >
              <img
                src="/terasync-logo.png"
                alt="TeraSync Automotive Catalog"
                className="h-10 w-auto object-contain select-none transition group-hover:opacity-90"
              />
            </button>
          </div>

          {/* Desktop Nav Links (14px, weight 500) */}
          <nav className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-[#F5F5F5]">
            <button
              onClick={() => {
                setMarketViewMode("systems");
                setCurrentRole("market");
              }}
              className="hover:text-[#FF6A3D] transition"
            >
              Shop Parts
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("vehicle-finder-bar");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else setCurrentRole("market");
              }}
              className="hover:text-[#FF6A3D] transition"
            >
              Brands
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("showcase-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#FF6A3D] transition"
            >
              How it works
            </button>

            {!currentUser ? (
              <button
                onClick={() => setPartnerDropdownOpen(!partnerDropdownOpen)}
                className="hover:text-[#FF6A3D] text-[#B5BAC0] transition flex items-center gap-1"
              >
                <span>Partner Portal</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (currentUser.role === "customer") setCurrentRole("buyer");
                  else if (currentUser.role === "shop") setCurrentRole("vendor");
                  else if (currentUser.role === "rider") setCurrentRole("courier");
                  else if (currentUser.role === "admin") setCurrentRole("admin");
                }}
                className="hover:text-[#FF6A3D] text-[#FF6A3D] font-bold transition flex items-center gap-1"
              >
                <span>
                  {currentUser.role === "customer"
                    ? "Garage Workbench"
                    : currentUser.role === "shop"
                    ? "Merchant Console"
                    : currentUser.role === "rider"
                    ? "Courier Dispatch"
                    : "Central Admin Desk"}
                </span>
                &rarr;
              </button>
            )}
          </nav>

          {/* Quick Role Switcher Pill + Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0F1012] p-1 rounded-full border border-[#3A3F45] flex items-center gap-1">
              {visibleNavItems.map((item) => (
                <button
                  key={item.role}
                  onClick={() => setCurrentRole(item.role)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    currentRole === item.role
                      ? "bg-[#D93A10] text-white shadow-sm"
                      : "text-[#B5BAC0] hover:text-[#F5F5F5]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-[#3A3F45] text-[#F5F5F5] hover:border-[#FF6A3D] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#3A3F45] bg-[#0F1012] px-6 py-4 space-y-4">
            <div className="flex flex-col gap-1 text-sm font-medium">
              {visibleNavItems.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    setCurrentRole(item.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-3 rounded-xl transition ${
                    currentRole === item.role
                      ? "bg-[#D93A10] text-white font-bold"
                      : "text-[#F5F5F5] hover:text-[#FF6A3D] hover:bg-[#1E2024]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#3A3F45]/60 space-y-2">
              {currentUser ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#050506] border border-[#3A3F45]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#D93A10]/20 text-[#FF6A3D] font-bold text-xs flex items-center justify-center border border-[#D93A10]/40">
                      {currentUser.role[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F5F5] leading-tight">
                        {String(currentUser.shopName || currentUser.firstName || currentUser.plate || currentUser.role)}
                      </div>
                      <div className="text-[10px] text-[#B5BAC0] uppercase tracking-wider font-mono">
                        {currentUser.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setCurrentRole("landing");
                      setMobileMenuOpen(false);
                      setRfqSuccessToast("Signed out successfully.");
                      setTimeout(() => setRfqSuccessToast(null), 4000);
                    }}
                    className="text-xs font-semibold text-[#B5BAC0] hover:text-red-400 py-1 px-2"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      openAuth(null);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-pill-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Log In / Register</span>
                  </button>
                  <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A8F96] block">
                      Partner Portals
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        onClick={() => {
                          openAuth("customer");
                          setMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-[#0F1012] hover:bg-[#1E2024] text-left text-[#B5BAC0] hover:text-white border border-[#3A3F45]/50 flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        <span>Garage</span>
                      </button>
                      <button
                        onClick={() => {
                          openAuth("shop");
                          setMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-[#0F1012] hover:bg-[#1E2024] text-left text-[#B5BAC0] hover:text-white border border-[#3A3F45]/50 flex items-center gap-1.5"
                      >
                        <Store className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vendor</span>
                      </button>
                      <button
                        onClick={() => {
                          openAuth("rider");
                          setMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-[#0F1012] hover:bg-[#1E2024] text-left text-[#B5BAC0] hover:text-white border border-[#3A3F45]/50 flex items-center gap-1.5"
                      >
                        <Bike className="w-3.5 h-3.5 text-amber-400" />
                        <span>Courier</span>
                      </button>
                      <button
                        onClick={() => {
                          openAuth("admin");
                          setMobileMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-[#0F1012] hover:bg-[#1E2024] text-left text-[#B5BAC0] hover:text-white border border-[#3A3F45]/50 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Toast for Broadcasted RFQs */}
      {rfqSuccessToast && (
        <div className="bg-[#0F1012] border-b border-emerald-500/40 text-emerald-400 py-2.5 px-4 shadow-lg text-xs font-semibold flex items-center justify-between">
          <div className="max-w-[1216px] mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="text-[#F5F5F5]">{rfqSuccessToast}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentRole("buyer")}
                className="text-[#FF6A3D] hover:underline font-bold"
              >
                View in Garage Workbench &rarr;
              </button>
              <button onClick={() => setRfqSuccessToast(null)} className="text-[#B5BAC0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1216px] w-full mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* =========================================================================
            1. LANDING / SYSTEM SHOWCASE WITH STYLED VISUAL PANELS
        ========================================================================= */}
        {currentRole === "landing" && (
          <div className="space-y-[84px]">
            {/* 3. HERO SECTION */}
            <section className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left: Headline and CTA */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="text-sm font-light text-[#B5BAC0] tracking-[0.2em] uppercase">
                    GENUINE &amp; OEM AUTOMOTIVE SPARE PARTS
                  </div>

                  <h1 className="text-[40px] sm:text-[54px] lg:text-[68px] font-bold text-[#F5F5F5] leading-[1.05] tracking-tight">
                    Find the Right Part.
                    <span className="block text-[#F5F5F5]">Skip the Walk.</span>
                  </h1>

                  <p className="text-[#B5BAC0] text-sm sm:text-base leading-relaxed max-w-xl font-light">
                    Broadcast your spare parts requirement directly to verified shops in Teklehaymanot, Kera, and Somali Tera. Compare sealed bids, photos, and warranties—with your payment protected in escrow until physical delivery inspection.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-4 items-center">
                    <button
                      onClick={() => {
                        const el = document.getElementById("vehicle-finder-bar");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                        else setCurrentRole("market");
                      }}
                      className="btn-pill-primary text-sm sm:text-base px-8 py-3.5"
                    >
                      Find my part
                    </button>

                    <button
                      onClick={() => setCurrentRole("market")}
                      className="btn-pill-ghost text-sm px-6 py-3"
                    >
                      Browse All Parts
                    </button>
                  </div>
                </div>

                {/* Right: Dark Photo Fading into Black with mask gradient */}
                <div className="lg:col-span-5 relative">
                  <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden bg-[#050506]">
                    <img
                      src="/images/car-exploded-schematic.jpg"
                      alt="Automotive Component Architecture"
                      className="w-full h-full object-cover filter contrast-125 brightness-90 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_92%)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Row of 3 Features under Hero */}
              <div className="mt-12 pt-8 border-t border-[#3A3F45] grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {/* Feature 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#15171A] border border-[#3A3F45] flex items-center justify-center shrink-0 text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="w-[2px] h-8 bg-[#D93A10] shrink-0"></div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F5F5]">Verified Addis Merchants</h3>
                    <p className="text-xs italic text-[#B5BAC0] mt-0.5">Teklehaymanot, Kera, Somali Tera</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#15171A] border border-[#3A3F45] flex items-center justify-center shrink-0 text-white">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="w-[2px] h-8 bg-[#D93A10] shrink-0"></div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F5F5]">Escrow Handshake</h3>
                    <p className="text-xs italic text-[#B5BAC0] mt-0.5">Payment released after 4-digit PIN verification</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#15171A] border border-[#3A3F45] flex items-center justify-center shrink-0 text-white">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="w-[2px] h-8 bg-[#D93A10] shrink-0"></div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#F5F5F5]">Tamper-Sealed Delivery</h3>
                    <p className="text-xs italic text-[#B5BAC0] mt-0.5">Numbered seal photo before garage hand-off</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. VEHICLE FINDER GLASS PILL */}
            <section id="vehicle-finder-bar" className="relative -mt-4 lg:-mt-6 z-20">
              {/* Desktop Wide Glass Pill Bar */}
              <div className="hidden sm:flex items-center justify-between gap-3 bg-[rgba(21,23,26,0.85)] backdrop-blur-[14px] border border-[#D93A10]/50 shadow-[0_8px_32px_rgba(217,58,16,0.18)] rounded-full px-7 py-3">
                <div className="flex items-center gap-2 shrink-0">
                  <Wrench className="w-4 h-4 text-[#FF6A3D]" />
                  <span className="text-xs uppercase font-bold tracking-wider text-[#FF6A3D] whitespace-nowrap">
                    Select your vehicle
                  </span>
                </div>

                <div className="h-6 w-px bg-[#3A3F45] shrink-0"></div>

                {/* Make Select */}
                <div className="flex-1 min-w-[120px]">
                  <select
                    value={finderBrand}
                    onChange={(e) => setFinderBrand(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#F5F5F5] font-medium border-0 focus:ring-0 cursor-pointer"
                  >
                    <option value="TOYOTA" className="bg-[#0F1012] text-[#F5F5F5]">Toyota</option>
                    <option value="BYD" className="bg-[#0F1012] text-[#F5F5F5]">BYD Electric</option>
                    <option value="HYUNDAI" className="bg-[#0F1012] text-[#F5F5F5]">Hyundai</option>
                    <option value="SUZUKI" className="bg-[#0F1012] text-[#F5F5F5]">Suzuki</option>
                    <option value="ISUZU" className="bg-[#0F1012] text-[#F5F5F5]">Isuzu Commercial</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-[#3A3F45] shrink-0"></div>

                {/* Model Select */}
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={finderModel}
                    onChange={(e) => setFinderModel(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#F5F5F5] font-medium border-0 focus:ring-0 cursor-pointer"
                  >
                    {finderBrand === "TOYOTA" && (
                      <>
                        <option value="HIACE" className="bg-[#0F1012] text-[#F5F5F5]">HiAce Minibus Taxi</option>
                        <option value="HILUX" className="bg-[#0F1012] text-[#F5F5F5]">Hilux / Fortuner</option>
                        <option value="LAND_CRUISER" className="bg-[#0F1012] text-[#F5F5F5]">Land Cruiser HZJ79</option>
                        <option value="COROLLA_VITZ" className="bg-[#0F1012] text-[#F5F5F5]">Corolla / Vitz</option>
                      </>
                    )}
                    {finderBrand === "BYD" && (
                      <>
                        <option value="ATTO3" className="bg-[#0F1012] text-[#F5F5F5]">Atto 3 (EV Compact SUV)</option>
                        <option value="DOLPHIN" className="bg-[#0F1012] text-[#F5F5F5]">Dolphin (Hatchback)</option>
                        <option value="SEAGULL" className="bg-[#0F1012] text-[#F5F5F5]">Seagull (City EV)</option>
                        <option value="QIN_PLUS" className="bg-[#0F1012] text-[#F5F5F5]">Qin Plus (Sedan)</option>
                      </>
                    )}
                    {finderBrand === "HYUNDAI" && (
                      <>
                        <option value="TUCSON" className="bg-[#0F1012] text-[#F5F5F5]">Tucson Crossover</option>
                        <option value="ACCENT" className="bg-[#0F1012] text-[#F5F5F5]">Accent Sedan</option>
                        <option value="H1" className="bg-[#0F1012] text-[#F5F5F5]">H-1 Commercial Van</option>
                      </>
                    )}
                    {finderBrand === "SUZUKI" && (
                      <>
                        <option value="DZIRE" className="bg-[#0F1012] text-[#F5F5F5]">Dzire Taxi (1.2L)</option>
                        <option value="SWIFT" className="bg-[#0F1012] text-[#F5F5F5]">Swift Hatchback</option>
                      </>
                    )}
                    {finderBrand === "ISUZU" && (
                      <>
                        <option value="NPR" className="bg-[#0F1012] text-[#F5F5F5]">NPR Forward Truck (4HF1)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="h-6 w-px bg-[#3A3F45] shrink-0"></div>

                {/* Engine Select */}
                <div className="flex-1 min-w-[130px]">
                  <select
                    value={finderEngine}
                    onChange={(e) => setFinderEngine(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#F5F5F5] font-medium border-0 focus:ring-0 cursor-pointer"
                  >
                    <option value="DIESEL" className="bg-[#0F1012] text-[#F5F5F5]">5L Diesel / D-4D</option>
                    <option value="PETROL" className="bg-[#0F1012] text-[#F5F5F5]">1.2L - 1.8L Petrol</option>
                    <option value="EV" className="bg-[#0F1012] text-[#F5F5F5]">Permanent Magnet EV</option>
                    <option value="HEAVY_DIESEL" className="bg-[#0F1012] text-[#F5F5F5]">4HF1 Commercial</option>
                  </select>
                </div>

                {/* Search Button */}
                <button
                  onClick={() => {
                    if (finderBrand === "TOYOTA" && finderModel === "HIACE") setSelectedVehicle("TOYOTA_HIACE");
                    else if (finderBrand === "TOYOTA" && finderModel === "HILUX") setSelectedVehicle("HILUX");
                    else if (finderBrand === "TOYOTA" && finderModel === "LAND_CRUISER") setSelectedVehicle("LAND_CRUISER");
                    else if (finderBrand === "BYD") setSelectedVehicle("BYD_ATTO3");
                    else if (finderBrand === "HYUNDAI") setSelectedVehicle("HYUNDAI_TUCSON");
                    else if (finderBrand === "SUZUKI") setSelectedVehicle("SUZUKI_DZIRE");
                    else if (finderBrand === "ISUZU") setSelectedVehicle("ISUZU_NPR");
                    else setSelectedVehicle("ALL");
                    setCurrentRole("market");
                  }}
                  className="btn-pill-primary text-xs px-6 py-2.5 shrink-0"
                >
                  Find Parts
                </button>
              </div>

              {/* Mobile Stacked Card (< 640px) */}
              <div className="sm:hidden bg-[rgba(21,23,26,0.92)] backdrop-blur-[14px] border border-[#D93A10]/50 shadow-[0_8px_32px_rgba(217,58,16,0.18)] rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#FF6A3D]" />
                  <span className="text-xs uppercase font-bold tracking-wider text-[#FF6A3D]">
                    Select your vehicle
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] text-[#B5BAC0] block mb-1">Make / Brand</label>
                    <select
                      value={finderBrand}
                      onChange={(e) => setFinderBrand(e.target.value)}
                      className="w-full bg-[#0F1012] border border-[#3A3F45] rounded-xl px-3 py-2 text-xs text-[#F5F5F5]"
                    >
                      <option value="TOYOTA">Toyota</option>
                      <option value="BYD">BYD Electric</option>
                      <option value="HYUNDAI">Hyundai</option>
                      <option value="SUZUKI">Suzuki</option>
                      <option value="ISUZU">Isuzu Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#B5BAC0] block mb-1">Model</label>
                    <select
                      value={finderModel}
                      onChange={(e) => setFinderModel(e.target.value)}
                      className="w-full bg-[#0F1012] border border-[#3A3F45] rounded-xl px-3 py-2 text-xs text-[#F5F5F5]"
                    >
                      {finderBrand === "TOYOTA" && (
                        <>
                          <option value="HIACE">HiAce Minibus Taxi</option>
                          <option value="HILUX">Hilux / Fortuner</option>
                          <option value="LAND_CRUISER">Land Cruiser HZJ79</option>
                          <option value="COROLLA_VITZ">Corolla / Vitz</option>
                        </>
                      )}
                      {finderBrand === "BYD" && (
                        <>
                          <option value="ATTO3">Atto 3 (EV Compact SUV)</option>
                          <option value="DOLPHIN">Dolphin (Hatchback)</option>
                          <option value="SEAGULL">Seagull (City EV)</option>
                        </>
                      )}
                      {finderBrand === "HYUNDAI" && (
                        <>
                          <option value="TUCSON">Tucson Crossover</option>
                          <option value="ACCENT">Accent Sedan</option>
                        </>
                      )}
                      {finderBrand === "SUZUKI" && (
                        <>
                          <option value="DZIRE">Dzire Taxi (1.2L)</option>
                          <option value="SWIFT">Swift Hatchback</option>
                        </>
                      )}
                      {finderBrand === "ISUZU" && (
                        <>
                          <option value="NPR">NPR Forward Truck</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#B5BAC0] block mb-1">Engine / Fuel</label>
                    <select
                      value={finderEngine}
                      onChange={(e) => setFinderEngine(e.target.value)}
                      className="w-full bg-[#0F1012] border border-[#3A3F45] rounded-xl px-3 py-2 text-xs text-[#F5F5F5]"
                    >
                      <option value="DIESEL">5L Diesel / D-4D</option>
                      <option value="PETROL">1.2L - 1.8L Petrol</option>
                      <option value="EV">Permanent Magnet EV</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (finderBrand === "TOYOTA" && finderModel === "HIACE") setSelectedVehicle("TOYOTA_HIACE");
                    else if (finderBrand === "TOYOTA" && finderModel === "HILUX") setSelectedVehicle("HILUX");
                    else if (finderBrand === "BYD") setSelectedVehicle("BYD_ATTO3");
                    else setSelectedVehicle("ALL");
                    setCurrentRole("market");
                  }}
                  className="btn-pill-primary w-full text-xs py-3 mt-1"
                >
                  Find Parts
                </button>
              </div>
            </section>

            {/* 5. SHOP BY CATEGORY */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[34px] font-light text-[#F5F5F5] tracking-tight">
                    Shop by Category
                  </h2>
                  <p className="text-xs text-[#B5BAC0] mt-1 font-light">
                    Visual subsystem architectures with direct sealed bidding across Addis Ababa
                  </p>
                </div>
                <button
                  onClick={() => setCurrentRole("market")}
                  className="btn-pill-ghost text-xs px-5 py-2 shrink-0"
                >
                  Shop
                </button>
              </div>

              {/* 4 Photo tiles (aspect 155:179, 14px gap) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
                {/* Tile 1: EMS */}
                <div
                  onClick={() => {
                    setSelectedSystemId("ems");
                    setMarketViewMode("systems");
                    setCurrentRole("market");
                  }}
                  className="group relative aspect-[155/179] rounded-2xl overflow-hidden cursor-pointer border border-[#3A3F45]/80 hover:border-[#D93A10] transition-all duration-300 hover:-translate-y-1 shadow-lg bg-[#0F1012]"
                >
                  <img
                    src="/images/engine-management-system.png"
                    alt="Engine Management System"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6A3D] block">
                        EMS &amp; Sensors
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-[#F5F5F5]">
                        Engine Management
                      </h3>
                    </div>
                    <span className="text-xs text-[#FF6A3D] font-medium group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </div>

                {/* Tile 2: Braking */}
                <div
                  onClick={() => {
                    setSelectedSystemId("braking");
                    setMarketViewMode("systems");
                    setCurrentRole("market");
                  }}
                  className="group relative aspect-[155/179] rounded-2xl overflow-hidden cursor-pointer border border-[#3A3F45]/80 hover:border-[#D93A10] transition-all duration-300 hover:-translate-y-1 shadow-lg bg-[#0F1012]"
                >
                  <img
                    src="/images/car-braking-system.jpg"
                    alt="Car Braking System"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6A3D] block">
                        Hydraulics &amp; ABS
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-[#F5F5F5]">
                        Braking System
                      </h3>
                    </div>
                    <span className="text-xs text-[#FF6A3D] font-medium group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </div>

                {/* Tile 3: Charging & EV */}
                <div
                  onClick={() => {
                    setSelectedSystemId("charging");
                    setMarketViewMode("systems");
                    setCurrentRole("market");
                  }}
                  className="group relative aspect-[155/179] rounded-2xl overflow-hidden cursor-pointer border border-[#3A3F45]/80 hover:border-[#D93A10] transition-all duration-300 hover:-translate-y-1 shadow-lg bg-[#0F1012]"
                >
                  <img
                    src="/images/catalog/byd-ev-motor-inverter-mcu.jpg"
                    alt="EV Charging & Starting"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6A3D] block">
                        EV &amp; High Voltage
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-[#F5F5F5]">
                        Charging &amp; Starting
                      </h3>
                    </div>
                    <span className="text-xs text-[#FF6A3D] font-medium group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </div>

                {/* Tile 4: Chassis */}
                <div
                  onClick={() => {
                    setSelectedSystemId("schematic");
                    setMarketViewMode("systems");
                    setCurrentRole("market");
                  }}
                  className="group relative aspect-[155/179] rounded-2xl overflow-hidden cursor-pointer border border-[#3A3F45]/80 hover:border-[#D93A10] transition-all duration-300 hover:-translate-y-1 shadow-lg bg-[#0F1012]"
                >
                  <img
                    src="/images/car-exploded-schematic.jpg"
                    alt="Modular Vehicle Architecture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6A3D] block">
                        Chassis &amp; Drivetrain
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-[#F5F5F5]">
                        Modular Architecture
                      </h3>
                    </div>
                    <span className="text-xs text-[#FF6A3D] font-medium group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                6. DIRECT FROM VERIFIED SHOPS & GARAGES (LIVE POSTINGS FEED)
            ========================================================================= */}
            <section className="space-y-6 pt-2">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-2">
                    <Store className="w-3.5 h-3.5" />
                    Live Addis Merchant Inventory Feed
                  </div>
                  <h2 className="text-2xl sm:text-[34px] font-bold text-[#F5F5F5] tracking-tight">
                    Direct From Verified Shops &amp; Garages
                  </h2>
                  <p className="text-xs sm:text-sm text-[#B5BAC0] mt-1 font-light">
                    Browse real-time spare parts posted directly by merchants across Teklehaymanot, Somali Tera, and Kera. Order directly with escrow delivery protection.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-[#0F1012] p-1.5 rounded-2xl border border-[#3A3F45]">
                  {["ALL", "Teklehaymanot", "Somali Tera", "Kera"].map((hub) => (
                    <button
                      key={hub}
                      onClick={() => setShopFilter(hub)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        shopFilter === hub
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "text-[#B5BAC0] hover:text-white"
                      }`}
                    >
                      {hub === "ALL" ? "All Shops & Garages" : hub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Shop Posts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {shopPosts
                  .filter((post) => shopFilter === "ALL" || post.marketLocation.toLowerCase().includes(shopFilter.toLowerCase()))
                  .map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45] hover:border-emerald-500/60 transition flex flex-col justify-between overflow-hidden group shadow-xl"
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#15171A] text-emerald-400 font-bold border border-[#3A3F45]">
                            {post.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 font-semibold text-[10px] border border-emerald-900/80">
                            {post.condition}
                          </span>
                        </div>

                        {/* Image */}
                        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#050506] border border-[#3A3F45] flex items-center justify-center p-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{post.shopName}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-[11px] text-[#B5BAC0] mt-1">
                            Fitment: <strong className="text-[#F5F5F5]">{post.compatibility}</strong>
                          </p>
                          <p className="text-[10px] text-[#8A8F96] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#B5BAC0]" />
                            {post.marketLocation}
                          </p>
                        </div>

                        <div className="pt-3 flex items-baseline justify-between border-t border-[#3A3F45]">
                          <div>
                            <div className="text-lg font-black text-white font-mono">
                              {post.priceETB.toLocaleString()} ETB
                            </div>
                            <span className="text-[10px] text-[#8A8F96]">
                              In Stock: <strong className="text-white">{post.stock} units</strong>
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-1 rounded border border-emerald-900/60">
                            Verified Merchant
                          </span>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => handleOrderPost(post)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Order Now (Escrow Handshake)</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* 7. SHOWCASE SECTION (DEEP RED BACKGROUND) */}
            <section
              id="showcase-section"
              className="bg-deep-red-showcase rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#6A4A44]/70 overflow-hidden relative shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Left side */}
                <div className="lg:col-span-7 space-y-6">
                  <h2 className="text-3xl sm:text-[40px] lg:text-[48px] font-light text-[#F5F5F5] leading-[1.1] tracking-tight">
                    One Request. Every Part for Your Car.
                  </h2>

                  <p className="text-[#B5BAC0] text-sm sm:text-base leading-relaxed font-light max-w-xl">
                    Addis Ababa mechanics waste hours walking between Somali Tera, Teklehaymanot, and Kera searching for fitments. On TeraSync, verified shops compete with sealed bids and shelf verification photos. Inspect the part before releasing your private 4-digit PIN.
                  </p>

                  {/* 2x2 grid of boxes with thin borders #6A4A44 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl border border-[#6A4A44] bg-black/30 backdrop-blur-sm space-y-1">
                      <div className="text-xs font-semibold text-[#FF6A3D]">Sealed Quotes</div>
                      <div className="text-xs text-[#B5BAC0] leading-relaxed">
                        Vendors never see competitor prices. Fair pricing driven by private competition.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[#6A4A44] bg-black/30 backdrop-blur-sm space-y-1">
                      <div className="text-xs font-semibold text-[#FF6A3D]">Shelf Proof Photos</div>
                      <div className="text-xs text-[#B5BAC0] leading-relaxed">
                        Every quote requires a live photo of the actual part on the shop's shelf.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[#6A4A44] bg-black/30 backdrop-blur-sm space-y-1">
                      <div className="text-xs font-semibold text-[#FF6A3D]">Physical Inspection</div>
                      <div className="text-xs text-[#B5BAC0] leading-relaxed">
                        Inspect bolt patterns, serials, and condition at your workshop bay first.
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-[#6A4A44] bg-black/30 backdrop-blur-sm space-y-1">
                      <div className="text-xs font-semibold text-[#FF6A3D]">4-Digit Secret PIN</div>
                      <div className="text-xs text-[#B5BAC0] leading-relaxed">
                        Funds stay locked in Chapa escrow until you hand the secret PIN to the courier.
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentRole("market")}
                      className="btn-pill-primary text-xs sm:text-sm px-8 py-3"
                    >
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Right side: dark photo blended into the red */}
                <div className="lg:col-span-5 relative flex items-center justify-center">
                  <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-[#6A4A44]/50 group">
                    <img
                      src="/images/mechanic-underhood-inspection.jpg"
                      alt="Verified Ethiopian Mechanic Physical Fitment Inspection"
                      className="w-full h-full object-cover mix-blend-lighten [mask-image:radial-gradient(circle_at_center,black_55%,transparent_95%)] filter contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-3 rounded-xl border border-white/10 text-left">
                      <span className="text-[10px] text-[#FF6A3D] font-mono uppercase font-bold block">Physical Fitment Inspection</span>
                      <p className="text-xs text-white font-medium">Addis Ababa mechanics test bolt patterns &amp; wiring at workshop bays before releasing PIN</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. TOP SELLERS CAROUSEL */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[34px] font-light text-[#F5F5F5] tracking-tight">
                    Top Sellers
                  </h2>
                  <p className="text-xs text-[#B5BAC0] mt-1 font-light">
                    Frequently requested genuine OEM spare parts across Addis Ababa fleets
                  </p>
                </div>

                {/* Arrow Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTopSellerIdx(Math.max(0, topSellerIdx - 1))}
                    disabled={topSellerIdx === 0}
                    className="w-10 h-10 rounded-full border border-[#8A8F96] hover:border-[#FF6A3D] text-[#F5F5F5] hover:text-[#FF6A3D] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition"
                    aria-label="Previous top sellers"
                  >
                    &larr;
                  </button>
                  <button
                    onClick={() => setTopSellerIdx(Math.min(3, topSellerIdx + 1))}
                    disabled={topSellerIdx >= 3}
                    className="w-10 h-10 rounded-full border border-[#8A8F96] hover:border-[#FF6A3D] text-[#F5F5F5] hover:text-[#FF6A3D] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition"
                    aria-label="Next top sellers"
                  >
                    &rarr;
                  </button>
                </div>
              </div>

              {/* 5 Cards Row (Horizontal scroll on mobile, responsive carousel) */}
              <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
                {TOP_SELLERS_LIST.slice(topSellerIdx, topSellerIdx + 5).map((part) => (
                  <div
                    key={part.id}
                    className="min-w-[220px] sm:min-w-0 snap-start flex-1 flex flex-col justify-between p-3.5 rounded-2xl bg-[#0F1012] border border-[#3A3F45] hover:border-[#D93A10] transition-all duration-300 group"
                  >
                    {/* Light gray #D9D9D9 tile with aspect 234:278 */}
                    <div className="relative aspect-[234/278] bg-[#D9D9D9] rounded-xl p-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={part.image}
                        alt={part.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Square Accent Tag "Best Seller" */}
                      <span className="absolute top-2 left-2 bg-[#D93A10] text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm shadow-sm">
                        Best Seller
                      </span>
                    </div>

                    {/* Part Details */}
                    <div className="pt-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm text-[#F5F5F5] group-hover:text-[#FF6A3D] transition line-clamp-1">
                          {part.name}
                        </h3>
                        {part.localAmharicName && (
                          <span className="amharic-text text-[11px] text-[#FF6A3D] block truncate mt-0.5">
                            {part.localAmharicName}
                          </span>
                        )}
                        <p className="text-xs text-[#B5BAC0] font-mono mt-1">
                          OEM: {part.sku}
                        </p>
                      </div>

                      {/* Full-width ghost pill "Get offers" */}
                      <button
                        onClick={() => setRfqModalPart(part)}
                        className="btn-pill-ghost w-full text-xs py-2 mt-3.5"
                      >
                        Get offers
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. PARTNER CALL-OUT */}
            <section className="bg-[#D93A10] rounded-3xl p-8 sm:p-12 relative overflow-hidden text-white shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="text-xs uppercase tracking-widest font-bold text-white/80">
                  MERCHANT NETWORK
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Own a spare parts shop in Addis Ababa?
                </h2>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                  Join hundreds of verified merchants in Teklehaymanot, Kera, and Somali Tera receiving real-time purchase requests every minute. Quote with a photo from your shelf and receive guaranteed payouts directly via Chapa and Telebirr.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentRole("vendor")}
                    className="rounded-full bg-[#050506] hover:bg-[#15171A] text-[#F5F5F5] hover:text-[#FF6A3D] px-8 py-3.5 font-medium transition text-sm flex items-center gap-2"
                  >
                    <span>Register as Verified Shop</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            2. AUTOMOTIVE SYSTEMS & SINGLE PARTS BREAKDOWN (IMAGE-GROUNDED EXACT MATCH)
        ========================================================================= */}
        {currentRole === "market" && (
          <div className="space-y-6">
            {/* The Outer Slate-Blue Border Container matching Image 1 */}
            <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-[#0B0C0E] border border-[#1E293B] shadow-2xl space-y-6">
              {/* Row 1: Breadcrumb (left) & Actions (right) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-normal text-zinc-400 flex-wrap">
                  <span
                    className="hover:text-white cursor-pointer transition"
                    onClick={() => setCurrentRole("landing")}
                  >
                    Storefront
                  </span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-400">Toyota</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-400 truncate max-w-[180px] sm:max-w-none">
                    {selectedVehicle === "ALL" ? "All vehicles" : VEHICLE_GARAGE_OPTIONS.find((v) => v.id === selectedVehicle)?.label || "All vehicles"}
                  </span>
                </div>

                {/* Right controls: Vehicle Dropdown + Systems/All parts Switcher */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Vehicle dropdown pill */}
                  <div className="relative">
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="appearance-none bg-[#050506] border border-[#2A2E35] rounded-full px-4 py-1.5 pr-8 text-xs font-medium text-white focus:outline-none cursor-pointer hover:border-zinc-500 transition max-w-[200px] truncate"
                    >
                      {VEHICLE_GARAGE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-[#0B0C0E] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Segmented Systems / All parts Pill */}
                  <div className="flex items-center bg-[#050506] p-1 rounded-full border border-[#2A2E35]">
                    <button
                      onClick={() => setMarketViewMode("systems")}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold transition ${
                        marketViewMode === "systems"
                          ? "bg-[#D93A10] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Systems
                    </button>
                    <button
                      onClick={() => setMarketViewMode("grid")}
                      className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
                        marketViewMode === "grid"
                          ? "bg-[#D93A10] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      All parts
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Title & Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Parts for {selectedVehicle === "ALL" ? "All Vehicles" : VEHICLE_GARAGE_OPTIONS.find((v) => v.id === selectedVehicle)?.label || "All Vehicles"}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 font-light">
                  Tap a part, and verified shops send you private offers.
                </p>
              </div>

              {/* Row 3: Single-Line Search & Hub Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a part, OEM number or fault code, for example P0087"
                    className="w-full pl-11 pr-9 py-2.5 rounded-full bg-[#050506] border border-[#2A2E35] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D93A10] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {/* All market hubs dropdown pill */}
                  <div className="relative flex-1 sm:flex-initial">
                    <select
                      value={selectedMarketHub}
                      onChange={(e) => setSelectedMarketHub(e.target.value)}
                      className="w-full appearance-none bg-[#050506] border border-[#2A2E35] rounded-full px-4 py-2.5 pr-8 text-xs font-medium text-zinc-300 focus:outline-none cursor-pointer hover:border-zinc-500 transition max-w-full sm:max-w-[240px] truncate"
                    >
                      <option value="ALL" className="bg-[#0B0C0E] text-white">
                        All market hubs &amp; shops
                      </option>

                      {/* Logged in shop option prominently at the top */}
                      {currentUser && (currentUser.role === "shop" || currentUser.shopName) && (
                        <optgroup label="Your Logged-In Shop" className="bg-[#0B0C0E] text-[#FF6A3D] font-bold">
                          <option
                            value={`SHOP:${currentUser.shopName || "My Shop"}`}
                            className="bg-[#0B0C0E] text-amber-400 font-bold"
                          >
                            ★ {currentUser.shopName || "My Shop"} ({currentUser.market || "Your Shop"})
                          </option>
                        </optgroup>
                      )}

                      {/* Market Hubs */}
                      <optgroup label="Market Hubs" className="bg-[#0B0C0E] text-zinc-400 font-semibold">
                        <option value="Teklehaymanot" className="bg-[#0B0C0E] text-white">Teklehaymanot Hub</option>
                        <option value="Kera" className="bg-[#0B0C0E] text-white">Kera Hub</option>
                        <option value="Somali Tera" className="bg-[#0B0C0E] text-white">Somali Tera Hub</option>
                        <option value="Merkato" className="bg-[#0B0C0E] text-white">Merkato Hub</option>
                        <option value="Bole" className="bg-[#0B0C0E] text-white">Bole Hub</option>
                      </optgroup>

                      {/* Verified Registered Shops across platform */}
                      {allAvailableShops.length > 0 && (
                        <optgroup label="Verified Registered Shops" className="bg-[#0B0C0E] text-zinc-400 font-semibold">
                          {allAvailableShops
                            .filter(
                              (shop) =>
                                !currentUser?.shopName ||
                                shop.name.toLowerCase() !== currentUser.shopName.toLowerCase()
                            )
                            .map((shop) => (
                              <option
                                key={shop.id || shop.name}
                                value={`SHOP:${shop.name}`}
                                className="bg-[#0B0C0E] text-white"
                              >
                                {shop.name} ({shop.hub})
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Most requested pill */}
                  <div className="relative shrink-0">
                    <button className="bg-[#050506] border border-[#2A2E35] rounded-full px-4 py-2.5 text-xs font-medium text-zinc-300 flex items-center gap-2 hover:border-zinc-500 transition">
                      <span>Most requested</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: BROWSE BY SYSTEM Section */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    BROWSE BY SYSTEM
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const sysOrder = ["ems", "braking", "schematic", "charging"] as const;
                        const currIdx = sysOrder.indexOf(selectedSystemId as any);
                        const prevIdx = currIdx <= 0 ? sysOrder.length - 1 : currIdx - 1;
                        setSelectedSystemId(sysOrder[prevIdx]);
                        setSelectedSubcategory("ALL");
                      }}
                      className="w-7 h-7 rounded-full bg-[#050506] border border-[#2A2E35] text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center justify-center text-xs transition"
                      aria-label="Previous system"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={() => {
                        const sysOrder = ["ems", "braking", "schematic", "charging"] as const;
                        const currIdx = sysOrder.indexOf(selectedSystemId as any);
                        const nextIdx = (currIdx + 1) % sysOrder.length;
                        setSelectedSystemId(sysOrder[nextIdx]);
                        setSelectedSubcategory("ALL");
                      }}
                      className="w-7 h-7 rounded-full bg-[#050506] border border-[#2A2E35] text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center justify-center text-xs transition"
                      aria-label="Next system"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {AUTOMOTIVE_SYSTEMS.map((sys) => {
                    const isSelected = selectedSystemId === sys.id;
                    return (
                      <div
                        key={sys.id}
                        onClick={() => {
                          setSelectedSystemId(sys.id as any);
                          setSelectedSubcategory("ALL");
                        }}
                        className={`rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-[#D93A10] text-white shadow-lg shadow-orange-950/40 border border-[#D93A10]"
                            : "bg-[#0B0C0E] border border-[#2A2E35] hover:border-zinc-500 text-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? "border-2 border-white/70" : "border border-zinc-600"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full ${
                              isSelected ? "bg-white/80" : "bg-transparent"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold leading-tight truncate">
                            {sys.name}
                          </h4>
                          <p
                            className={`text-[11px] font-normal mt-0.5 ${
                              isSelected ? "text-white/80" : "text-zinc-400"
                            }`}
                          >
                            {sys.totalPartsCount} components
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: HAVE A FAULT CODE? TAP ONE */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    HAVE A FAULT CODE? TAP ONE
                  </span>
                  <button
                    onClick={() => setSelectedDtc("ALL")}
                    className="text-xs text-[#D93A10] font-semibold hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {POPULAR_GARAGE_DTCS.map((dtc) => {
                    const isSelected = selectedDtc === dtc.code;
                    return (
                      <button
                        key={dtc.code}
                        onClick={() => setSelectedDtc(dtc.code)}
                        className={`px-3.5 py-1.5 rounded-full text-xs transition ${
                          isSelected
                            ? "bg-[#D93A10] text-white font-bold shadow-md shadow-orange-950/40"
                            : "bg-[#0B0C0E] border border-[#2A2E35] text-zinc-300 font-medium hover:border-zinc-500"
                        }`}
                      >
                        {dtc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Subsystem Components Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedSubcategory("ALL")}
                  className={`px-4 py-1.5 rounded-full text-xs transition ${
                    selectedSubcategory === "ALL"
                      ? "bg-[#0B0C0E] border border-zinc-500 text-white font-bold shadow-sm"
                      : "bg-[#0B0C0E] border border-[#2A2E35] text-zinc-300 font-medium hover:border-zinc-500"
                  }`}
                >
                  All components ({activeSystem.singleParts.length})
                </button>
                {activeSystem.subcategories.map((subcat) => {
                  const isSelected = selectedSubcategory === subcat;
                  return (
                    <button
                      key={subcat}
                      onClick={() => setSelectedSubcategory(subcat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition ${
                        isSelected
                          ? "bg-[#0B0C0E] border border-zinc-500 text-white font-bold shadow-sm"
                          : "bg-[#0B0C0E] border border-[#2A2E35] text-zinc-300 font-medium hover:border-zinc-500"
                      }`}
                    >
                      {subcat}
                    </button>
                  );
                })}
              </div>

              {/* Row 7: Active Filter Tags Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1F2227] text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Active System Tag */}
                  <span
                    onClick={() => {
                      setSelectedSystemId("ems");
                      setSelectedSubcategory("ALL");
                    }}
                    className="px-3 py-1 rounded-full bg-[#15171A] border border-[#2A2E35] text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:border-zinc-500 transition"
                  >
                    <span>{activeSystem.name.split(" (")[0]}</span>
                    <X className="w-3 h-3 text-zinc-400" />
                  </span>

                  {/* Active DTC Tag if selected */}
                  {selectedDtc !== "ALL" && (
                    <span
                      onClick={() => setSelectedDtc("ALL")}
                      className="px-3 py-1 rounded-full bg-[#15171A] border border-[#2A2E35] text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:border-zinc-500 transition"
                    >
                      <span>{selectedDtc}</span>
                      <X className="w-3 h-3 text-zinc-400" />
                    </span>
                  )}

                  {/* Active Market Hub / Shop Tag if selected */}
                  {selectedMarketHub !== "ALL" && (
                    <span
                      onClick={() => setSelectedMarketHub("ALL")}
                      className="px-3 py-1 rounded-full bg-[#15171A] border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:border-amber-400 transition"
                    >
                      <span>
                        {selectedMarketHub.startsWith("SHOP:")
                          ? `Shop: ${selectedMarketHub.replace("SHOP:", "")}`
                          : `Hub: ${selectedMarketHub}`}
                      </span>
                      <X className="w-3 h-3 text-zinc-400" />
                    </span>
                  )}

                  {/* Clear all */}
                  {(selectedDtc !== "ALL" || selectedSubcategory !== "ALL" || selectedMarketHub !== "ALL" || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedDtc("ALL");
                        setSelectedSubcategory("ALL");
                        setSelectedMarketHub("ALL");
                        setSearchQuery("");
                      }}
                      className="text-xs text-[#D93A10] font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-400">
                    {marketViewMode === "systems" ? filteredParts.length : allFilteredFlat.length} parts
                  </span>
                  <button className="px-3 py-1 rounded-full bg-[#0B0C0E] border border-[#2A2E35] text-zinc-300 text-xs font-medium flex items-center gap-1 hover:border-zinc-500 transition">
                    <span>Most requested</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Row 8: The Product Cards Grid (Matching Picture 1 Exactly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {(marketViewMode === "systems" ? filteredParts : allFilteredFlat)
                  .slice(0, visiblePartsLimit)
                  .map((part) => {
                    return (
                      <div
                        key={part.id}
                        className="rounded-3xl bg-[#0B0C0E] border border-[#1F2227] hover:border-[#3A3F45] p-3.5 flex flex-col justify-between transition-all duration-300 shadow-xl"
                      >
                        <div>
                          {/* Product Image Frame with light backdrop for crisp part visibility */}
                          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#EEEEEE] flex items-center justify-center p-3 mb-3 group">
                            <img
                              src={part.image}
                              alt={part.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Top Right Difficulty Badge */}
                            <span
                              className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/90 backdrop-blur-sm border ${
                                part.difficulty === "PROFESSIONAL_GARAGE_ONLY"
                                  ? "text-[#FF6A3D] border-[#FF6A3D]/40"
                                  : "text-emerald-400 border-emerald-500/40"
                              }`}
                            >
                              {part.difficulty === "PROFESSIONAL_GARAGE_ONLY" ? "PRO GARAGE" : "DIY FRIENDLY"}
                            </span>

                            {/* Bottom Left SKU Pill */}
                            <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/95 text-[#FF6A3D] font-mono text-[10px] font-bold border border-white/10 backdrop-blur-sm">
                              {part.sku}
                            </span>
                          </div>

                          {/* Category */}
                          <span className="text-[10px] font-black text-[#D93A10] uppercase tracking-wider block mb-1">
                            {part.systemSubcategory === "Fuel & Injection"
                              ? "FUEL SYSTEM"
                              : part.systemSubcategory === "Thermal & Auxiliary"
                              ? "STARTING SYSTEM"
                              : part.systemSubcategory === "Control Units"
                              ? "ELECTRONICS"
                              : part.systemSubcategory === "Air & Pressure Sensors"
                              ? "SENSORS"
                              : part.systemSubcategory.toUpperCase()}
                          </span>

                          {/* Title */}
                          <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2 min-h-[36px]">
                            {part.name}
                          </h3>

                          {/* Description */}
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mt-1.5">
                            {part.role}
                          </p>

                          {/* DTC / Problem Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {part.dtcCodes &&
                              part.dtcCodes.slice(0, 2).map((code) => (
                                <span
                                  key={code}
                                  className="px-2 py-0.5 rounded bg-[#15171A] border border-[#2A2E35] text-zinc-300 font-mono text-[9px] font-medium"
                                >
                                  {code}
                                </span>
                              ))}
                            {part.dtcCodes && part.dtcCodes.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#15171A] border border-[#2A2E35] text-zinc-400 font-mono text-[9px] font-medium">
                                +{part.dtcCodes.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Specification / Labor */}
                          <div className="text-[11px] text-zinc-400 mt-2 font-medium">
                            {part.brand} · Labor {part.laborTimeEst || "45 mins"}
                          </div>

                          {/* Shop Availability */}
                          <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2.5 border-t border-[#1F2227]">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium truncate max-w-[170px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">
                                {selectedMarketHub.startsWith("SHOP:")
                                  ? selectedMarketHub.replace("SHOP:", "")
                                  : part.marketHub}
                              </span>
                            </div>
                            <span className="text-zinc-400 font-mono shrink-0">
                              {selectedMarketHub.startsWith("SHOP:") ? "Verified In Stock" : `${part.stockVendorsCount} shops`}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-2">
                          <button
                            onClick={() => setRfqModalPart(part)}
                            className="flex-1 py-2 rounded-full bg-[#D93A10] hover:bg-[#F04A1C] text-white text-xs font-bold transition text-center shadow-md shadow-orange-950/40"
                          >
                            Get offers
                          </button>
                          <button
                            onClick={() => setSelectedPartForSpecs(part)}
                            className="py-2 px-3.5 rounded-full bg-[#15171A] hover:bg-[#202428] border border-[#3A3F45] text-white text-xs font-medium transition text-center"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Load More Parts Button (Dynamic Pagination & No Alert) */}
              <div className="pt-4 flex flex-col items-center justify-center gap-2">
                {(marketViewMode === "systems"
                  ? visiblePartsLimit < filteredParts.length
                  : visiblePartsLimit < allFilteredFlat.length) ? (
                  <button
                    onClick={handleLoadMoreParts}
                    disabled={isLoadingMoreParts}
                    className="px-8 py-2.5 rounded-full bg-[#050506] hover:bg-[#15171A] border border-[#2A2E35] hover:border-[#D93A10] text-xs font-bold text-white transition shadow-lg flex items-center gap-2 group disabled:opacity-60"
                  >
                    {isLoadingMoreParts ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF6A3D]" />
                        <span>Loading more genuine parts...</span>
                      </>
                    ) : (
                      <>
                        <span>Load more parts</span>
                        <span className="text-[10px] text-[#FF6A3D] font-mono font-bold bg-[#D93A10]/15 px-2 py-0.5 rounded-full border border-[#D93A10]/30">
                          +4 more
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#050506] border border-[#2A2E35] text-xs text-zinc-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      All {marketViewMode === "systems" ? filteredParts.length : allFilteredFlat.length} verified spare parts displayed
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Deep Red Showcase Banner (Image 1 Bottom Card) */}
            <div className="bg-gradient-to-r from-[#200A08] via-[#140606] to-[#0A0404] border border-[#5A1E1A] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Cannot find your part?
                </h3>
                <p className="text-xs text-zinc-400 font-light">
                  Describe it or send a photo. Verified shops will check their shelves for you.
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentRole("buyer");
                }}
                className="bg-[#D93A10] hover:bg-[#F04A1C] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-lg shadow-orange-950/40 transition whitespace-nowrap self-start md:self-auto"
              >
                Request a custom part
              </button>
            </div>

            {/* Bottom Footer Line matching Picture 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-zinc-500 border-t border-[#1F2227]">
              <div>TeraSync: Spare parts for Addis Ababa.</div>
              <div className="flex items-center gap-6">
                <button className="hover:text-zinc-300 transition">About</button>
                <button className="hover:text-zinc-300 transition">Contact</button>
                <button className="hover:text-zinc-300 transition">Terms</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Request Fitment Quote (Reverse-RFQ) from Single Part */}
        {rfqModalPart && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e1526] border border-[#D93A10]/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#3A3F45] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#D93A10]/15 text-[#FF6A3D] flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Broadcast Sealed RFQ</h3>
                    <p className="text-[11px] text-[#B5BAC0]">
                      Dispatches to verified {rfqModalPart.marketHub} merchants
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRfqModalPart(null)}
                  className="p-1.5 rounded-lg bg-[#1E2024] text-[#B5BAC0] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Part Summary Preview with Visual Verification Image */}
              <div className="p-3.5 rounded-2xl bg-[#050506] border border-[#3A3F45] space-y-3">
                <div className="w-full h-44 bg-black/70 rounded-xl overflow-hidden border border-[#3A3F45] flex items-center justify-center p-2">
                  <img
                    src={rfqModalPart.image}
                    alt={rfqModalPart.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#FF6A3D] uppercase tracking-wider">
                    {rfqModalPart.systemSubcategory} &bull; {rfqModalPart.voltage}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{rfqModalPart.name}</h4>
                  <p className="text-[10px] text-[#B5BAC0] font-mono">SKU: {rfqModalPart.sku} &bull; {rfqModalPart.brand}</p>
                  <p className="text-[11px] text-[#D0D4DA] italic pt-1">{rfqModalPart.role}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#D0D4DA] mb-1">
                    Vehicle Plate Number (Chassis Identifier):
                  </label>
                  <input
                    type="text"
                    value={rfqPlateInput}
                    onChange={(e) => setRfqPlateInput(e.target.value)}
                    placeholder="e.g. 3-B48102"
                    className="w-full bg-[#050506] border border-[#3A3F45] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D93A10]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#D0D4DA] mb-1">
                    Garage / Mechanics Delivery Location:
                  </label>
                  <input
                    type="text"
                    value={rfqGarageLocation}
                    onChange={(e) => setRfqGarageLocation(e.target.value)}
                    placeholder="e.g. Tadesse Auto, Bole Medhanialem"
                    className="w-full bg-[#050506] border border-[#3A3F45] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D93A10]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#D0D4DA] mb-1">
                    Delivery Urgency:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRfqUrgency("CRITICAL_SAME_DAY")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        rfqUrgency === "CRITICAL_SAME_DAY"
                          ? "bg-[#D93A10]/15 text-[#FF6A3D] border-[#D93A10]"
                          : "bg-[#050506] text-[#B5BAC0] border-[#3A3F45] hover:text-white"
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
                          : "bg-[#050506] text-[#B5BAC0] border-[#3A3F45] hover:text-white"
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
                  <p className="text-[#D0D4DA]">
                    Merchants respond with sealed shelf-photo proof. Payout is released to the seller only after your mechanic tests physical bolt fitment and inputs the 4-digit PIN.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3A3F45]">
                <button
                  onClick={() => setRfqModalPart(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1E2024] text-[#D0D4DA] text-xs font-semibold hover:bg-[#2A2E33] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBroadcastRfq(rfqModalPart)}
                  className="px-5 py-2.5 rounded-xl bg-[#D93A10] hover:bg-[#F04A1C] text-slate-950 text-xs font-black shadow-lg shadow-orange-500/30 transition"
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
          <ProtectedPortalGuard
            portalName="Garage Workbench"
            requiredRole="customer"
            allowedRoles={["customer"]}
            currentUser={currentUser}
            onLoginPrompt={openAuth}
            onReturnHome={() => setCurrentRole("landing")}
          >
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
                  <p className="text-xs text-[#B5BAC0]">Live Escrow Orders: 1 | Pending Quotes: {rfqList.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentRole("market")}
                  className="px-4 py-2 rounded-xl bg-[#D93A10] hover:bg-[#F04A1C] text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Explore Systems &amp; Parts
                </button>
                <button
                  onClick={() => setCurrentRole("landing")}
                  className="p-2 rounded-xl bg-[#0F1012] hover:bg-[#1E2024] border border-[#3A3F45] text-[#B5BAC0] text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Workshop Floor Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-[#3A3F45] bg-[#0c1324] shadow-2xl">
              <div className="relative h-48 sm:h-56 w-full">
                <img
                  src="/images/garage-workshop-bay.jpg"
                  alt="Addis Ababa Certified Garage Workshop Floor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 backdrop-blur-md mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Workshop Floor • Addis Ababa Central Facility
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                      Bole Medhanialem Diagnostic &amp; Service Center
                    </h2>
                    <p className="text-xs text-[#D0D4DA] max-w-xl drop-shadow">
                      4 active hydraulic repair bays equipped with OBD-II telematics, high-voltage EV diagnostic rigs, and direct TeraSync parts escrow integration.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-emerald-400 font-bold">
                      Bays Active: 4/4
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Workshop Repair Bays & Live Diagnostic Job Cards */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3A3F45] pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30 mb-1">
                    <Wrench className="w-3 h-3 text-blue-400" />
                    Live Garage Floor Management
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Active Workshop Service Bays &amp; Diagnostic Job Cards
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E2024] text-[#D0D4DA] font-mono">
                      {GARAGE_JOB_CARDS.length} Bays In-Service
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-[#B5BAC0] max-w-md">
                  Active vehicle repairs in Bole Medhanialem workshop. Click <strong className="text-[#FF6A3D]">&quot;Load Job Parts to Bundle&quot;</strong> to directly push fault-isolated components into a sealed market RFQ.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GARAGE_JOB_CARDS.map((jc) => {
                  const statusColors = {
                    DIAGNOSING: "bg-[#D93A10]/10 text-[#FF6A3D] border-amber-800/80",
                    PARTS_DISPATCHED: "bg-blue-950/80 text-blue-300 border-blue-800/80",
                    IN_TRANSIT: "bg-purple-950/80 text-purple-300 border-purple-800/80",
                    INSTALLING: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
                    READY_FOR_PICKUP: "bg-teal-950/80 text-teal-300 border-teal-800/80",
                  };

                  return (
                    <div
                      key={jc.id}
                      className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1324] via-[#0d1629] to-[#11192e] border border-[#3A3F45] hover:border-blue-500/50 shadow-xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Bay & Status Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#3A3F45] pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#B5BAC0] uppercase tracking-wider">
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

                        {/* Bay Live Diagnostic Inspection Photo */}
                        {jc.bayPhoto && (
                          <div className="relative rounded-xl overflow-hidden border border-[#3A3F45] bg-black/80 aspect-[16/9] group">
                            <img
                              src={jc.bayPhoto}
                              alt={jc.photoCaption || jc.vehicle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
                              <span className="text-white font-medium truncate drop-shadow bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                                {jc.photoCaption}
                              </span>
                              <span className="text-emerald-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 shrink-0 ml-1">
                                LIVE BAY CAM
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Vehicle Specs Bar */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] py-1.5 px-3 rounded-xl bg-[#050506]/90 border border-[#3A3F45]">
                          <div>
                            <span className="text-[#8A8F96] block text-[9px] uppercase font-bold">Plate / Chassis</span>
                            <span className="font-mono text-white font-semibold">{jc.plate}</span>
                          </div>
                          <div>
                            <span className="text-[#8A8F96] block text-[9px] uppercase font-bold">Odometer</span>
                            <span className="font-mono text-[#FF6A3D] font-semibold">{jc.mileage}</span>
                          </div>
                        </div>

                        {/* Driver Complaint */}
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#B5BAC0]">Driver Complaint:</span>
                          <p className="text-[#D0D4DA] italic text-[11px] bg-[#050506]/90 p-2 rounded-lg border border-[#3A3F45]">
                            &quot;{jc.complaint}&quot;
                          </p>
                        </div>

                        {/* Mechanic Diagnostic Finding */}
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#FF6A3D] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-[#FF6A3D]" />
                            Diagnostic Finding &amp; DTC:
                          </span>
                          <p className="text-amber-200/90 font-mono text-[11px] bg-[#D93A10]/10 p-2 rounded-lg border border-amber-900/40">
                            {jc.diagnosisDtc}
                          </p>
                        </div>

                        {/* Tech Assigned & Required Parts */}
                        <div className="flex flex-col gap-2 pt-1">
                          <div className="text-[11px] text-[#B5BAC0]">
                            Assigned Mechanic: <strong className="text-white">{jc.assignedTech}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-[#8A8F96] font-semibold">Required Parts:</span>
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
                      <div className="pt-3 border-t border-[#3A3F45]">
                        <button
                          onClick={() => handleLoadJobCardParts(jc)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current text-[#FF6A3D]" />
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A3F45] pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#4A4F55] bg-black">
                    <img
                      src="/images/mechanic-underhood-inspection.jpg"
                      alt="Mechanic Under-Hood Physical Inspection"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ESCROW_LOCKED • IN_TRANSIT
                      </span>
                      <span className="text-xs text-[#B5BAC0] font-mono">Order #TR-2026-0081</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Toyota Hilux 1KD Alternator Assembly (80 Amp)
                    </h3>
                    <p className="text-xs text-[#B5BAC0]">
                      Merchant: <strong className="text-[#F5F5F5]">Alpha Spares (Teklehaymanot)</strong> |
                      Courier: <strong className="text-[#F5F5F5]">Abebe (Motorcycle)</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#B5BAC0]">Escrow Total Locked</div>
                  <div className="text-xl font-black text-emerald-400">14,850.00 ETB</div>
                  <div className="text-[10px] text-[#8A8F96]">Chapa Escrow Safe Settlement</div>
                </div>
              </div>

              {/* Security Handshake Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2">
                <div className="p-4 rounded-xl bg-[#050506]/90 border border-[#3A3F45] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#B5BAC0] flex items-center gap-1.5 font-medium">
                      <Lock className="w-3.5 h-3.5 text-[#FF6A3D]" />
                      Tamper Seal Code:
                    </span>
                    <span className="font-mono font-bold text-[#FF6A3D] bg-[#D93A10]/10 px-2 py-0.5 rounded border border-amber-800">
                      #TS-8942
                    </span>
                  </div>
                  <p className="text-[11px] text-[#B5BAC0] leading-relaxed">
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
                    <span className="text-[10px] text-[#FF6A3D]/90 bg-[#D93A10]/10 px-2 py-1 rounded border border-amber-800/80">
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
                  <p className="text-xs text-[#B5BAC0]">Toyota Hilux 2018 (Plate: 3-B48102) &bull; Denso 12V 80A Alternator</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  3 Verified Quotes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bidsForReq901.map((bid) => (
                  <div
                    key={bid.id}
                    className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45] hover:border-[#4A4F55] transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 border border-[#3A3F45]">
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
                        <span className="text-[#FF6A3D] font-semibold">★ {bid.rating}</span>
                      </div>
                      <div className="text-[11px] text-[#B5BAC0] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#8A8F96]" />
                        {bid.marketArea}
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-0.5">
                        <div className="text-xs font-semibold text-emerald-400">{bid.condition}</div>
                        <div className="text-[11px] text-[#D0D4DA]">{bid.warrantyDays} Days Replacement Guarantee</div>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-xs text-[#B5BAC0]">Quoted Price:</span>
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
          </ProtectedPortalGuard>
        )}

        {/* =========================================================================
            4. VENDOR / SHOP CLASSIFIED CONSOLE
        ========================================================================= */}
        {currentRole === "vendor" && (
          <ProtectedPortalGuard
            portalName="Merchant Console"
            requiredRole="shop"
            allowedRoles={["shop"]}
            currentUser={currentUser}
            onLoginPrompt={openAuth}
            onReturnHome={() => setCurrentRole("landing")}
          >
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
                  <p className="text-xs text-[#B5BAC0]">Specialty: Engine Management Sensors &amp; Electricals &bull; Verified Merchant</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-[#B5BAC0]">Available Payout Balance</span>
                  <div className="text-sm font-bold text-emerald-400">42,650.00 ETB</div>
                </div>
                <button
                  onClick={() => setCurrentRole("landing")}
                  className="p-2 rounded-xl bg-[#0F1012] hover:bg-[#1E2024] border border-[#3A3F45] text-[#B5BAC0] text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. Post New Part / Inventory Item */}
            <div className="p-6 rounded-3xl bg-[#0F1012] border border-[#3A3F45] shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3A3F45] pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 mb-1">
                    <Plus className="w-3.5 h-3.5" />
                    Storefront Inventory Manager
                  </div>
                  <h3 className="text-lg font-bold text-white">Post New Part for Sale</h3>
                  <p className="text-xs text-[#B5BAC0]">
                    Directly list items available in your shop shelf so customers and garages can discover and order immediately.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateShopPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Part Title */}
                  <div className="lg:col-span-2">
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Part Title &amp; Specification <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="e.g. Toyota Hilux 1KD-FTV Genuine Turbocharger (CT16V)"
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Price in ETB <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={newPostPrice}
                      onChange={(e) => setNewPostPrice(e.target.value)}
                      placeholder="e.g. 18500"
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] font-mono focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-3 py-2.5 text-xs text-[#F5F5F5] focus:border-emerald-500 outline-none transition"
                    >
                      <option value="Electrical & Ignition">Electrical &amp; Ignition</option>
                      <option value="Braking & Safety">Braking &amp; Safety</option>
                      <option value="Engine & Forced Induction">Engine &amp; Forced Induction</option>
                      <option value="Fuel Injection">Fuel Injection</option>
                      <option value="Engine Management">Engine Management (ECU/Sensors)</option>
                      <option value="Suspension & Steering">Suspension &amp; Steering</option>
                      <option value="Cooling & Climate">Cooling &amp; Climate</option>
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Part Condition
                    </label>
                    <select
                      value={newPostCondition}
                      onChange={(e) => setNewPostCondition(e.target.value as any)}
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-3 py-2.5 text-xs text-[#F5F5F5] focus:border-emerald-500 outline-none transition"
                    >
                      <option value="Brand New OEM">Brand New OEM</option>
                      <option value="Tested Genuine Used">Tested Genuine Used (Japan Cut)</option>
                      <option value="High Quality Aftermarket">High Quality Aftermarket</option>
                    </select>
                  </div>

                  {/* Vehicle Compatibility */}
                  <div>
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Vehicle Fitment / Compatibility
                    </label>
                    <input
                      type="text"
                      value={newPostCompatibility}
                      onChange={(e) => setNewPostCompatibility(e.target.value)}
                      placeholder="e.g. Toyota HiAce 5L / Hilux 2KD (2010–2021)"
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {/* Available Stock */}
                  <div>
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Available In Stock (Qty)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newPostStock}
                      onChange={(e) => setNewPostStock(e.target.value)}
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] font-mono focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {/* Component Photo Preset */}
                  <div className="lg:col-span-2">
                    <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                      Shelf Component Reference Photo
                    </label>
                    <select
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-3 py-2.5 text-xs text-[#F5F5F5] focus:border-emerald-500 outline-none transition"
                    >
                      <option value="/images/catalog/commercial-alternator.jpg">Alternator Assembly (12V/24V)</option>
                      <option value="/images/catalog/turbocharger-actuator.jpg">Turbocharger &amp; Actuator</option>
                      <option value="/images/catalog/ceramic-brake-pads-set.jpg">Ceramic Brake Pads</option>
                      <option value="/images/catalog/common-rail-diesel-injector.jpg">Common Rail Diesel Injector</option>
                      <option value="/images/catalog/engine-ecu-control-unit.jpg">Engine ECU Control Computer</option>
                      <option value="/images/catalog/reduction-starter-motor.jpg">Reduction Starter Motor</option>
                      <option value="/images/catalog/abs-hydraulic-module-pump.jpg">ABS Hydraulic Pump Module</option>
                      <option value="/images/catalog/clutch-kit-assembly.jpg">Clutch Kit &amp; Pressure Plate</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Item to Live Marketplace</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. My Active Shop Posts & Delete Controls */}
            <div className="p-6 rounded-3xl bg-[#0F1012] border border-[#3A3F45] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#3A3F45] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    My Active Storefront Listings
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      {shopPosts.length} Live Items
                    </span>
                  </h3>
                  <p className="text-xs text-[#B5BAC0]">
                    All items below are visible in real-time to visiting customers and garages. You can delete or manage any post anytime.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopPosts.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#15171A] border border-[#3A3F45] hover:border-emerald-500/50 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{item.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-900/60 font-semibold">
                          {item.condition}
                        </span>
                      </div>

                      <div className="h-32 w-full rounded-xl overflow-hidden bg-[#050506] border border-[#3A3F45] p-2 flex items-center justify-center">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-[#B5BAC0] mt-0.5">Fitment: {item.compatibility}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#3A3F45]/60 text-xs">
                        <span className="text-emerald-400 font-black font-mono text-sm">
                          {item.priceETB.toLocaleString()} ETB
                        </span>
                        <span className="text-[11px] text-[#B5BAC0]">
                          Stock: <strong className="text-white">{item.stock}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#3A3F45] flex items-center justify-between">
                      <span className="text-[10px] text-[#8A8F96]">Posted {item.createdAt}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteShopPost(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Incoming Requests Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Requests Matching Your Inventory</h3>
                  <p className="text-xs text-[#B5BAC0]">Bids are sealed and invisible to rival shops</p>
                </div>
                <button className="text-xs text-[#B5BAC0] hover:text-white flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              <div className="space-y-3">
                {rfqList.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45] hover:border-[#4A4F55] transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#3A3F45] bg-black">
                        <img
                          src={req.image}
                          alt={req.part}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-400">{req.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E2024] text-[#D0D4DA] border border-[#4A4F55] font-semibold">
                            {req.urgency === "CRITICAL_SAME_DAY" ? "⚡ Critical (Same Day)" : "Standard (24h)"}
                          </span>
                          <span className="text-xs text-[#8A8F96]">&bull; {req.timeAgo}</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{req.part}</h4>
                        <p className="text-xs text-[#B5BAC0]">
                          Vehicle: <strong className="text-[#F5F5F5]">{req.vehicle}</strong> | Plate:{" "}
                          <strong className="text-[#F5F5F5]">{req.plate}</strong> | Market:{" "}
                          <strong className="text-[#F5F5F5]">{req.market}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="number"
                        placeholder="Price in ETB"
                        className="w-36 bg-[#050506] border border-[#3A3F45] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
          </ProtectedPortalGuard>
        )}

        {/* =========================================================================
            5. COURIER / RIDER DISPATCH WORKSPACE
        ========================================================================= */}
        {currentRole === "courier" && (
          <ProtectedPortalGuard
            portalName="Courier Delivery Desk"
            requiredRole="rider"
            allowedRoles={["rider"]}
            currentUser={currentUser}
            onLoginPrompt={openAuth}
            onReturnHome={() => setCurrentRole("landing")}
          >
            <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#D93A10]/10 border border-amber-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-[#D93A10]/50 text-[#FF6A3D] flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Abebe Kebede (Motorcycle #ET-3-48921)
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#D93A10]/15 text-[#FF6A3D] border border-[#D93A10]/50">
                      ON_DUTY
                    </span>
                  </h2>
                  <p className="text-xs text-[#B5BAC0]">Delivery Dispatch &bull; Active Job in Progress</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentRole("landing")}
                className="p-2 rounded-xl bg-[#0F1012] hover:bg-[#1E2024] border border-[#3A3F45] text-[#B5BAC0] text-xs self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Active Delivery Job */}
            <div className="p-6 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45] space-y-6">
              <div className="flex items-center justify-between border-b border-[#3A3F45] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#FF6A3D] uppercase tracking-wider">
                    Current Assigned Delivery
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Order #TR-2026-0081</h3>
                  <p className="text-xs text-[#B5BAC0]">Toyota Hilux 1KD Alternator Assembly (80A Denso)</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#B5BAC0]">Delivery &amp; Commission Earnings</span>
                  <div className="text-lg font-black text-[#FF6A3D]">
                    {deliverySettlementStatus === "SETTLED" ? "1,092.50 ETB" : "350.00 ETB + 5%"}
                  </div>
                  <span className="text-[10px] text-[#8A8F96]">Base: 350 ETB + 5% Commission Bonus</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-[#050506]/90 border border-[#3A3F45] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#D0D4DA]">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-400" />
                      1. Pickup: Alpha Spares (Teklehaymanot)
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-[#B5BAC0]">
                    Tamper Seal Attached: <strong className="text-[#FF6A3D] font-mono">#TS-8942</strong>
                  </div>
                  <div className="text-[11px] text-[#8A8F96]">
                    Bag photo verified on server at 11:24 AM.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#050506]/90 border border-[#3A3F45] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#D0D4DA]">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-blue-400" />
                      2. Destination: Tadesse Garage (Bole)
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      deliverySettlementStatus === "SETTLED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : deliverySettlementStatus === "ARRIVED_VERIFIED"
                        ? "bg-amber-950 text-amber-400 border-amber-800"
                        : "bg-[#D93A10]/10 text-[#FF6A3D] border-amber-900"
                    }`}>
                      {deliverySettlementStatus === "SETTLED"
                        ? "SETTLED"
                        : deliverySettlementStatus === "ARRIVED_VERIFIED"
                        ? "PIN CONFIRMED"
                        : "Pending Customer PIN"}
                    </span>
                  </div>
                  <p className="text-xs text-[#B5BAC0]">
                    Ask the customer / garage mechanic to enter their 4-digit verification ID code after checking the part.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter 4-Digit PIN"
                      disabled={deliverySettlementStatus !== "IN_TRANSIT"}
                      className="w-36 bg-[#0F1012] border border-[#4A4F55] rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-[#D93A10] disabled:opacity-50"
                    />
                    <button
                      onClick={() => {
                        if (pinInput === "7419") {
                          setPinVerified(true);
                          setDeliverySettlementStatus("ARRIVED_VERIFIED");
                          setRfqSuccessToast("✅ Customer Handshake PIN #7419 Confirmed! Central Admin notified that order arrived safely.");
                          setTimeout(() => setRfqSuccessToast(null), 6000);
                        } else {
                          alert("Incorrect PIN. Must match customer's verified ID (7419).");
                        }
                      }}
                      disabled={deliverySettlementStatus !== "IN_TRANSIT"}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      Verify Customer PIN
                    </button>
                  </div>

                  {deliverySettlementStatus === "ARRIVED_VERIFIED" && (
                    <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/70 text-amber-200 text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>✅ Handshake PIN #7419 Confirmed! Arrived Safely.</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Order #TR-2026-0081 delivered safely to Tadesse Garage. <strong>Central Admin has been notified</strong> that the part arrived in good condition. The Admin will now disburse the funds on air: 92% (13,662 ETB) to Alpha Spares and your 5% commission + 350 ETB delivery fee (1,092.50 ETB) to Telebirr.
                      </p>
                    </div>
                  )}

                  {deliverySettlementStatus === "SETTLED" && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-2 font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>🚀 Air Payout Released by Central Admin!</span>
                      </div>
                      <p className="text-[11px] text-emerald-200/90">
                        Admin transferred funds over the air: <strong>1,092.50 ETB</strong> (350 ETB base + 5% commission) credited to your Telebirr (0922776655). Reference: <span className="font-mono">{airPayoutTx?.courierTx || "TB-AIR-89210"}</span>.
                      </p>
                      <div className="text-[11px] text-[#8A8F96]">
                        Courier Account Balance: <strong className="text-white font-mono">{courierBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </ProtectedPortalGuard>
        )}

        {/* =========================================================================
            6. ADMIN / OPERATIONS CLASSIFIED DESK
        ========================================================================= */}
        {currentRole === "admin" && (
          <ProtectedPortalGuard
            portalName="Central Operations Desk"
            requiredRole="admin"
            allowedRoles={["admin"]}
            currentUser={currentUser}
            onLoginPrompt={openAuth}
            onReturnHome={() => setCurrentRole("landing")}
          >
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
                  <p className="text-xs text-[#B5BAC0]">Escrow Custody &amp; Cryptographic Audit Chain</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentRole("landing")}
                className="p-2 rounded-xl bg-[#0F1012] hover:bg-[#1E2024] border border-[#3A3F45] text-[#B5BAC0] text-xs self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45]">
                <div className="text-xs text-[#B5BAC0]">Active Escrow Balance</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">428,500.00 ETB</div>
                <div className="text-[10px] text-[#8A8F96] mt-1">Held across 28 live orders</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45]">
                <div className="text-xs text-[#B5BAC0]">Platform Commission (5%)</div>
                <div className="text-2xl font-black text-blue-400 mt-1">21,425.00 ETB</div>
                <div className="text-[10px] text-[#8A8F96] mt-1">Earned this cycle</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0F1012]/95 border border-[#3A3F45]">
                <div className="text-xs text-[#B5BAC0]">Active Dispute Cases</div>
                <div className="text-2xl font-black text-[#FF6A3D] mt-1">1 Case</div>
                <div className="text-[10px] text-[#8A8F96] mt-1">Requires manual arbitration</div>
              </div>
            </div>

            {/* Admin Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-[#3A3F45] pb-2 overflow-x-auto">
              <button
                onClick={() => setAdminSubTab("settlements")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  adminSubTab === "settlements"
                    ? "bg-[#D93A10] text-white shadow-md shadow-orange-500/20"
                    : "bg-[#0F1012] text-[#B5BAC0] hover:text-white border border-[#3A3F45]"
                }`}
              >
                <span>Escrow Deliveries &amp; Air Payouts</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  deliverySettlementStatus === "ARRIVED_VERIFIED"
                    ? "bg-amber-400 text-black font-black animate-pulse"
                    : deliverySettlementStatus === "SETTLED"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}>
                  {deliverySettlementStatus === "ARRIVED_VERIFIED"
                    ? "🔔 1 Arrived Safely"
                    : deliverySettlementStatus === "SETTLED"
                    ? "✅ Settled"
                    : "1 In Transit"}
                </span>
              </button>

              <button
                onClick={() => setAdminSubTab("applications")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  adminSubTab === "applications"
                    ? "bg-[#D93A10] text-white shadow-md shadow-orange-500/20"
                    : "bg-[#0F1012] text-[#B5BAC0] hover:text-white border border-[#3A3F45]"
                }`}
              >
                <span>Merchant &amp; Rider Applications</span>
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
                  {pendingApplications.filter((a) => a.status === "PENDING").length} Pending
                </span>
              </button>

              <button
                onClick={() => setAdminSubTab("disputes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  adminSubTab === "disputes"
                    ? "bg-[#D93A10] text-white shadow-md shadow-orange-500/20"
                    : "bg-[#0F1012] text-[#B5BAC0] hover:text-white border border-[#3A3F45]"
                }`}
              >
                <span>Dispute Arbitration</span>
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono">
                  1 Case
                </span>
              </button>
            </div>

            {/* Sub-tab 0: Escrow Deliveries & Air Payout Release */}
            {adminSubTab === "settlements" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Escrow Delivery Handshake &amp; Air Payout Clearinghouse</span>
                      {deliverySettlementStatus === "ARRIVED_VERIFIED" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#B5BAC0]">
                      Orders delivered to garages and verified via customer ID code are queued here for instant over-the-air fund disbursement to merchant &amp; courier.
                    </p>
                  </div>
                </div>

                {/* Handshake Verified Alert Banner */}
                {deliverySettlementStatus === "ARRIVED_VERIFIED" && (
                  <div className="p-4 rounded-2xl bg-amber-950/70 border-2 border-amber-500/80 text-amber-200 text-xs space-y-2 shadow-2xl animate-fadeIn">
                    <div className="flex items-center gap-2 font-black text-amber-300 text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>🔔 ALERT: Order #TR-2026-0081 Arrived Safely at Destination!</span>
                    </div>
                    <p className="leading-relaxed text-amber-100/90 text-xs">
                      Customer (<strong>Tadesse Garage</strong>) has physically checked the part and entered verification ID code <strong className="font-mono bg-black/50 px-1.5 py-0.5 rounded text-amber-300">#7419</strong> on Courier Abebe Kebede&apos;s portal. The delivery is complete and confirmed safe. <strong>Please authorize passing the customer payment on air to the shop and the percentage commission to the delivery courier.</strong>
                    </p>
                  </div>
                )}

                {/* Live Settlement Card */}
                <div className={`p-6 rounded-3xl bg-[#0F1012]/95 border transition-all space-y-6 shadow-2xl ${
                  deliverySettlementStatus === "ARRIVED_VERIFIED"
                    ? "border-amber-500/70 shadow-amber-500/10"
                    : deliverySettlementStatus === "SETTLED"
                    ? "border-emerald-500/60 shadow-emerald-500/10"
                    : "border-[#3A3F45]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3A3F45] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">Order #TR-2026-0081</span>
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          deliverySettlementStatus === "SETTLED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : deliverySettlementStatus === "ARRIVED_VERIFIED"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        }`}>
                          {deliverySettlementStatus === "SETTLED"
                            ? "✅ SETTLED · DISBURSED ON AIR"
                            : deliverySettlementStatus === "ARRIVED_VERIFIED"
                            ? "🔔 ARRIVED SAFELY · PIN VERIFIED"
                            : "⏳ IN TRANSIT"}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        Toyota Hilux 1KD Alternator Assembly (80A Denso)
                      </h4>
                      <p className="text-xs text-[#B5BAC0]">
                        Customer: <strong className="text-white">Tadesse Garage (Bole)</strong> &bull; Courier: <strong className="text-white">Abebe Kebede (Motorcycle)</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#B5BAC0]">Total Buyer Escrow Held</span>
                      <div className="text-2xl font-black text-emerald-400">14,850.00 ETB</div>
                      <span className="text-[10px] text-[#8A8F96]">Telebirr &amp; Chapa Escrow Vault</span>
                    </div>
                  </div>

                  {/* 3-Way Air Disbursement Split Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Shop Payout */}
                    <div className="p-4 rounded-2xl bg-[#050506] border border-[#3A3F45] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-emerald-400" />
                          1. Shop Payout (92%)
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          13,662.00 ETB
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-[#B5BAC0]">
                        <div>Vendor: <strong className="text-white">Alpha Auto Spares</strong></div>
                        <div>Bank: <strong className="text-white">CBE (Commercial Bank)</strong></div>
                        <div>Account: <strong className="font-mono text-white">100019283746</strong></div>
                        <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                          Direct Air Payout to Merchant Bank Account
                        </div>
                      </div>
                    </div>

                    {/* 2. Courier Payout (5% + 350 ETB) */}
                    <div className="p-4 rounded-2xl bg-[#050506] border border-[#3A3F45] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Bike className="w-4 h-4 text-[#FF6A3D]" />
                          2. Courier Payout (5% + Fee)
                        </span>
                        <span className="text-xs font-mono font-black text-[#FF6A3D]">
                          1,092.50 ETB
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-[#B5BAC0]">
                        <div>Courier: <strong className="text-white">Abebe Kebede</strong></div>
                        <div>5% Commission: <strong className="font-mono text-white">742.50 ETB</strong></div>
                        <div>Base Delivery Fee: <strong className="font-mono text-white">350.00 ETB</strong></div>
                        <div>Provider: <strong className="text-white">Telebirr (0922776655)</strong></div>
                        <div className="text-[10px] text-[#FF6A3D] font-semibold pt-1">
                          Instant Air Credit to Courier Wallet
                        </div>
                      </div>
                    </div>

                    {/* 3. Platform Fee */}
                    <div className="p-4 rounded-2xl bg-[#050506] border border-[#3A3F45] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                          3. Platform Fee (3%)
                        </span>
                        <span className="text-xs font-mono font-black text-blue-400">
                          445.50 ETB
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-[#B5BAC0]">
                        <div>Clearing: <strong className="text-white">TeraSync Network</strong></div>
                        <div>Service: <strong className="text-white">Escrow &amp; Audit Chain</strong></div>
                        <div>Status: <strong className="text-emerald-400 font-semibold">Protected</strong></div>
                        <div className="text-[10px] text-blue-300 font-semibold pt-1">
                          Platform Escrow Retained Share
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification & Action Trigger */}
                  <div className="p-4 rounded-2xl bg-[#050506]/90 border border-[#3A3F45] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span>Customer Verifying Handshake ID:</span>
                        <span className="font-mono bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-black">
                          #7419
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          {deliverySettlementStatus === "ARRIVED_VERIFIED" || deliverySettlementStatus === "SETTLED" ? "✓ Verified by Garage" : "Pending Handshake"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A8F96]">
                        {deliverySettlementStatus === "SETTLED"
                          ? `Air payouts disbursed on ${airPayoutTx?.timestamp || "just now"}. CBE Tx: ${airPayoutTx?.shopTx || "CBE-AIR-982143"} | Telebirr Tx: ${airPayoutTx?.courierTx || "TB-AIR-582109"}`
                          : deliverySettlementStatus === "ARRIVED_VERIFIED"
                          ? "Handshake code matched. Admin authorization required to release the funds over the air to shop CBE & courier Telebirr."
                          : "Item is in transit. Courier will collect the customer's 4-digit ID code upon safe arrival."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {deliverySettlementStatus === "IN_TRANSIT" && (
                        <button
                          onClick={() => {
                            setPinInput("7419");
                            setPinVerified(true);
                            setDeliverySettlementStatus("ARRIVED_VERIFIED");
                            setRfqSuccessToast("✅ Simulated customer code entry (7419). Order marked arrived safely!");
                            setTimeout(() => setRfqSuccessToast(null), 5000);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#1E2024] hover:bg-[#2A2E33] border border-[#3A3F45] text-xs font-bold text-[#D0D4DA] transition"
                        >
                          Simulate Customer Handshake (#7419)
                        </button>
                      )}

                      {deliverySettlementStatus === "ARRIVED_VERIFIED" && (
                        <button
                          onClick={() => {
                            setDeliverySettlementStatus("SETTLED");
                            setShopBalance((prev) => prev + 13662);
                            setCourierBalance((prev) => prev + 1092.5);
                            const newTx = {
                              shopTx: "CBE-AIR-" + Math.floor(100000 + Math.random() * 900000),
                              courierTx: "TB-AIR-" + Math.floor(100000 + Math.random() * 900000),
                              shopAmount: 13662,
                              courierAmount: 1092.5,
                              platformFee: 445.5,
                              timestamp: new Date().toLocaleTimeString(),
                            };
                            setAirPayoutTx(newTx);
                            setRfqSuccessToast("🚀 Air Payouts Disbursed! 13,662.00 ETB passed to Alpha Spares (CBE) & 1,092.50 ETB passed to Courier Abebe (Telebirr).");
                            setTimeout(() => setRfqSuccessToast(null), 7000);
                          }}
                          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-xl shadow-emerald-600/30 animate-pulse"
                        >
                          <Zap className="w-4 h-4 fill-current text-white" />
                          <span>Approve &amp; Release Air Payouts to Shop &amp; Courier</span>
                        </button>
                      )}

                      {deliverySettlementStatus === "SETTLED" && (
                        <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Air Payouts Settled &amp; Transferred</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 1: Applications Queue */}
            {adminSubTab === "applications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Merchant &amp; Courier Onboarding Applications</h3>
                    <p className="text-xs text-[#B5BAC0]">Verify business licenses, TIN numbers, IDs, and payout credentials before activating accounts</p>
                  </div>
                  <span className="text-xs text-[#B5BAC0] font-mono">
                    Total: {pendingApplications.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {pendingApplications.map((app) => {
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
                                  ? String(prof.shopName || "Unnamed Shop")
                                  : `${String(prof.vehicleType || "Vehicle")} (${String(prof.plate || "No Plate")})`}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
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

                        {/* Details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1">
                            <span className="text-[#8A8F96] uppercase text-[10px] font-semibold block">Contact &amp; Location</span>
                            <div className="text-[#F5F5F5]">Phone: <strong className="font-mono">{app.phone}</strong></div>
                            {isShop ? (
                              <>
                                <div className="text-[#B5BAC0]">Market: <strong>{String(prof.market || "Teklehaymanot")}</strong></div>
                                <div className="text-[#B5BAC0] truncate">Address: {String(prof.street || "Addis Ababa")}</div>
                              </>
                            ) : (
                              <>
                                <div className="text-[#B5BAC0]">Coverage: <strong>{Array.isArray(prof.areas) ? prof.areas.join(", ") : "Addis Ababa"}</strong></div>
                                <div className="text-[#B5BAC0]">Plate: <strong className="font-mono">{String(prof.plate || "")}</strong></div>
                              </>
                            )}
                          </div>

                          <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1">
                            <span className="text-[#8A8F96] uppercase text-[10px] font-semibold block">Official Credentials</span>
                            {isShop ? (
                              <>
                                <div className="text-[#B5BAC0]">TIN: <strong className="font-mono text-[#F5F5F5]">{String(prof.tin || "Pending")}</strong></div>
                                <div className="text-[#B5BAC0]">License: <strong className="font-mono text-[#F5F5F5]">{String(prof.licenseNum || "Pending")}</strong></div>
                                <div className="text-[#8A8F96] text-[11px] truncate">Owner: {String(prof.ownerName || "")}</div>
                              </>
                            ) : (
                              <>
                                <div className="text-[#B5BAC0]">National ID: <strong className="font-mono text-[#F5F5F5]">{String(prof.idNumber || "Pending")}</strong></div>
                                <div className="text-[#B5BAC0]">Vehicle: {String(prof.vehicleType || "")}</div>
                              </>
                            )}
                          </div>

                          <div className="p-3 rounded-xl bg-[#050506] border border-[#3A3F45] space-y-1">
                            <span className="text-[#8A8F96] uppercase text-[10px] font-semibold block">Payout Escrow Settlement</span>
                            {isShop ? (
                              <>
                                <div className="text-[#B5BAC0]">Bank: <strong className="text-[#F5F5F5]">{String(prof.bank || "CBE")}</strong></div>
                                <div className="text-[#B5BAC0]">Account: <strong className="font-mono text-[#F5F5F5]">{String(prof.accountNumber || "—")}</strong></div>
                              </>
                            ) : (
                              <>
                                <div className="text-[#B5BAC0]">Provider: <strong className="text-[#F5F5F5]">{String(prof.payoutService || "Telebirr")}</strong></div>
                                <div className="text-[#B5BAC0]">Number: <strong className="font-mono text-[#F5F5F5]">{String(prof.payoutNumber || app.phone)}</strong></div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Photos preview if present */}
                        {Boolean(prof.shopPhoto || prof.shelfPhoto || prof.idPhoto || prof.licensePhoto) && (
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[11px] text-[#8A8F96]">Submitted Proof Photos:</span>
                            {prof.shopPhoto ? (
                              <img src={String(prof.shopPhoto)} alt="Shop" className="w-12 h-12 rounded-lg object-cover border border-[#3A3F45]" />
                            ) : null}
                            {prof.shelfPhoto ? (
                              <img src={String(prof.shelfPhoto)} alt="Shelf" className="w-12 h-12 rounded-lg object-cover border border-[#3A3F45]" />
                            ) : null}
                            {prof.idPhoto ? (
                              <img src={String(prof.idPhoto)} alt="ID" className="w-12 h-12 rounded-lg object-cover border border-[#3A3F45]" />
                            ) : null}
                            {prof.licensePhoto ? (
                              <img src={String(prof.licensePhoto)} alt="License" className="w-12 h-12 rounded-lg object-cover border border-[#3A3F45]" />
                            ) : null}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#3A3F45]">
                          <div className="text-[11px] text-[#8A8F96]">
                            {app.status === "PENDING"
                              ? "Review credentials above. Approval makes this merchant/rider live in the marketplace."
                              : app.status === "APPROVED"
                              ? "Merchant/Rider is authorized and can receive orders & requests."
                              : "Application rejected."}
                          </div>

                          <div className="flex items-center gap-2">
                            {app.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleRejectApp(app.id)}
                                  className="px-4 py-2 rounded-xl bg-[#1E2024] hover:bg-[#2A2E33] text-[#D0D4DA] text-xs font-semibold border border-[#3A3F45] transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApproveApp(app.id)}
                                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve &amp; Activate Live
                                </button>
                              </>
                            )}

                            {app.status === "APPROVED" && (
                              <button
                                onClick={() => {
                                  setCurrentUser(prof);
                                  setCurrentRole(isShop ? "vendor" : "courier");
                                }}
                                className="px-4 py-2 rounded-xl bg-[#1E2024] hover:bg-[#2A2E33] text-[#FF6A3D] text-xs font-bold border border-[#4A4F55] transition flex items-center gap-1.5"
                              >
                                Test Portal as {isShop ? "Merchant" : "Rider"} &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Disputes */}
            {adminSubTab === "disputes" && (
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
                  <button
                    onClick={() => alert("Admin requested uploaded photo verification.")}
                    className="px-4 py-2 rounded-xl bg-[#1E2024] hover:bg-[#2A2E33] text-[#D0D4DA] text-xs font-bold transition border border-[#4A4F55]"
                  >
                    Request Photos
                  </button>
                </div>
              </div>
            )}
          </div>
          </ProtectedPortalGuard>
        )}
      </main>

      {/* Thin-Line Footer */}
      <footer className="border-t border-[#3A3F45] bg-[#050506] pt-12 pb-16 sm:pb-8 text-[#B5BAC0] text-xs space-y-8 font-light">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#D93A10] flex items-center justify-center font-bold text-white text-xs">
                  ⚡
                </div>
                <span className="font-bold text-base text-[#F5F5F5] tracking-tight">TeraSync</span>
              </div>
              <p className="leading-relaxed text-xs">
                Trusted automotive spare parts clearinghouse &amp; reverse-RFQ escrow platform. Addis Ababa, Ethiopia.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-[#FF6A3D]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Protected by Telebirr &amp; Chapa Escrow</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-[#F5F5F5] text-xs uppercase tracking-wider">Catalog &amp; Portals</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => setCurrentRole("market")} className="hover:text-[#F5F5F5] transition">Exploded Systems</button></li>
                <li><button onClick={() => setCurrentRole("buyer")} className="hover:text-[#F5F5F5] transition">Garage Workbench</button></li>
                <li><button onClick={() => setCurrentRole("vendor")} className="hover:text-[#F5F5F5] transition">Merchant Console</button></li>
                <li><button onClick={() => setCurrentRole("courier")} className="hover:text-[#F5F5F5] transition">Courier Handshake</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-[#F5F5F5] text-xs uppercase tracking-wider">Addis Ababa Hubs</h4>
              <ul className="space-y-1.5">
                <li>Teklehaymanot Parts Market</li>
                <li>Kera Commercial Cluster</li>
                <li>Somali Tera Electrical Corridor</li>
                <li>Akaki Industrial Spare Zone</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-[#F5F5F5] text-xs uppercase tracking-wider">Escrow Security</h4>
              <ul className="space-y-1.5">
                <li>Cryptographic 4-Digit PIN</li>
                <li>Numbered Tamper-Evident Seals</li>
                <li>Live Shelf Proof Verification</li>
                <li>Admin Dispute Resolution</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#3A3F45]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#B5BAC0]/80">
            <div>
              &copy; 2026 TeraSync Technologies. All rights reserved. Addis Ababa, Ethiopia.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>&bull;</span>
              <span>Escrow Terms</span>
              <span>&bull;</span>
              <span>Merchant Standards</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Tab Bar (360px Optimized) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F1012]/95 backdrop-blur-md border-t border-[#3A3F45] py-2 px-6 flex justify-between items-center text-[10px]">
        <button
          onClick={() => setCurrentRole("landing")}
          className={`flex flex-col items-center gap-1 transition min-h-[44px] justify-center ${
            currentRole === "landing" ? "text-[#FF6A3D]" : "text-[#B5BAC0]"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentRole("market")}
          className={`flex flex-col items-center gap-1 transition min-h-[44px] justify-center ${
            currentRole === "market" ? "text-[#FF6A3D]" : "text-[#B5BAC0]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setCurrentRole("buyer")}
          className={`flex flex-col items-center gap-1 relative transition min-h-[44px] justify-center ${
            currentRole === "buyer" ? "text-[#FF6A3D]" : "text-[#B5BAC0]"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>My Requests</span>
          <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-[#D93A10] text-white text-[9px] font-bold">
            {rfqList.length}
          </span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              openAuth(null);
            } else {
              setCurrentRole(
                currentUser.role === "customer"
                  ? "buyer"
                  : currentUser.role === "shop"
                  ? "vendor"
                  : currentUser.role === "rider"
                  ? "courier"
                  : "admin"
              );
            }
          }}
          className={`flex flex-col items-center gap-1 transition min-h-[44px] justify-center ${
            currentRole === "vendor" || (currentUser && currentRole === (currentUser.role === "customer" ? "buyer" : currentUser.role === "shop" ? "vendor" : currentUser.role === "rider" ? "courier" : "admin"))
              ? "text-[#FF6A3D]"
              : "text-[#B5BAC0]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{currentUser ? "Portal" : "Log in"}</span>
        </button>
      </div>

      {/* Shop Post Order & Escrow Modal */}
      {orderModalPost && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOrderModalPost(null)}
          />
          <div className="relative bg-[#0F1012] border border-emerald-500/50 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#3A3F45] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Direct Shop Order &amp; Escrow</h3>
                  <p className="text-xs text-[#B5BAC0]">Secured with TeraSync 4-Digit Delivery Handshake</p>
                </div>
              </div>
              <button
                onClick={() => setOrderModalPost(null)}
                className="text-[#B5BAC0] hover:text-white p-1 rounded-full hover:bg-[#3A3F45]/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item summary */}
            <div className="p-4 rounded-2xl bg-[#15171A] border border-[#3A3F45] flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#050506] border border-[#3A3F45] p-1 shrink-0 flex items-center justify-center">
                <img
                  src={orderModalPost.image}
                  alt={orderModalPost.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-900 font-semibold">
                  {orderModalPost.condition}
                </span>
                <h4 className="text-sm font-bold text-white truncate">{orderModalPost.title}</h4>
                <p className="text-xs text-[#B5BAC0] flex items-center gap-1 truncate">
                  <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {orderModalPost.shopName} &bull; {orderModalPost.marketLocation}
                </p>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {orderModalPost.priceETB.toLocaleString()} ETB
                </div>
              </div>
            </div>

            {/* Escrow guarantee note */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-[#D0D4DA] space-y-1">
                <span className="font-bold text-white block">Protected Escrow Guarantee</span>
                <p className="text-[#B5BAC0] text-[11px] leading-relaxed">
                  Your funds are locked safely in escrow. The courier picks up the part with a numbered tamper seal. Payment is released to {orderModalPost.shopName} only after you inspect the bolt fitment and give your 4-digit PIN.
                </p>
              </div>
            </div>

            {/* Destination & Contact */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                  Delivery Destination / Workshop Address
                </label>
                <input
                  type="text"
                  value={orderDeliveryAddress}
                  onChange={(e) => setOrderDeliveryAddress(e.target.value)}
                  placeholder="e.g. Tadesse Garage, Bole Medhanialem"
                  className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B5BAC0] uppercase tracking-wider block mb-1">
                  Contact Phone for Courier Delivery
                </label>
                <input
                  type="tel"
                  value={orderContactPhone}
                  onChange={(e) => setOrderContactPhone(e.target.value)}
                  placeholder="0911223344"
                  className="w-full bg-[#15171A] border border-[#3A3F45] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] font-mono focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderModalPost(null)}
                className="flex-1 py-3 rounded-full bg-[#15171A] hover:bg-[#1E2024] border border-[#3A3F45] text-xs font-semibold text-[#B5BAC0] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="flex-[2] py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Lock Escrow ({orderModalPost.priceETB.toLocaleString()} ETB)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth & Onboarding Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialRole={authTargetRole}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthTargetRole(null);
        }}
        onAuthComplete={handleAuthComplete}
        onPendingReview={handlePendingReview}
        knownPhones={knownPhones}
        onPhoneUsed={handlePhoneUsed}
      />
    </div>
  );
}
