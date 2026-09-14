/**
 * Core Enums for Automotive Electrical Spare Parts Platform
 */

export const ElectricalCategory = {
  ALTERNATOR_CHARGING: "ALTERNATOR_CHARGING",
  STARTER_MOTOR: "STARTER_MOTOR",
  ECU_ENGINE_MANAGEMENT: "ECU_ENGINE_MANAGEMENT",
  SENSORS_ACTUATORS: "SENSORS_ACTUATORS",
  LIGHTING_SIGNALING: "LIGHTING_SIGNALING",
  RELAYS_FUSE_HARNESS: "RELAYS_FUSE_HARNESS",
  SWITCHES_CLOCKSPRING: "SWITCHES_CLOCKSPRING",
} as const;
export type ElectricalCategory = (typeof ElectricalCategory)[keyof typeof ElectricalCategory];

export const VoltageSystem = {
  VOLT_12: "12V",
  VOLT_24: "24V",
} as const;
export type VoltageSystem = (typeof VoltageSystem)[keyof typeof VoltageSystem];

export const PartCondition = {
  GENUINE_NEW: "GENUINE_NEW",
  OEM_NEW: "OEM_NEW",
  USED_ORIGINAL: "USED_ORIGINAL",
  AFTERMARKET_CLONE: "AFTERMARKET_CLONE",
} as const;
export type PartCondition = (typeof PartCondition)[keyof typeof PartCondition];

export const MarketArea = {
  TEKLEHAYMANOT: "TEKLEHAYMANOT",
  KERA: "KERA",
  SOMALI_TERA: "SOMALI_TERA",
  AKAKI: "AKAKI",
  PIASSA: "PIASSA",
  OTHER: "OTHER",
} as const;
export type MarketArea = (typeof MarketArea)[keyof typeof MarketArea];

export const Urgency = {
  CRITICAL_SAME_DAY: "CRITICAL_SAME_DAY",
  STANDARD_24H: "STANDARD_24H",
} as const;
export type Urgency = (typeof Urgency)[keyof typeof Urgency];

export const ManufacturerBrand = {
  DENSO: "DENSO",
  BOSCH: "BOSCH",
  VALEO: "VALEO",
  MITSUBISHI_ELECTRIC: "MITSUBISHI_ELECTRIC",
  HITACHI: "HITACHI",
  DELCO_REMY: "DELCO_REMY",
  TOYOTA_GENUINE: "TOYOTA_GENUINE",
  ISUZU_GENUINE: "ISUZU_GENUINE",
  AFTERMARKET_GENERIC: "AFTERMARKET_GENERIC",
} as const;
export type ManufacturerBrand = (typeof ManufacturerBrand)[keyof typeof ManufacturerBrand];
