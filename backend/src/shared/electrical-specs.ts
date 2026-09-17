import { z } from "zod";
import {
  ElectricalCategory,
  VoltageSystem,
  PartCondition,
  MarketArea,
  ManufacturerBrand,
} from "./enums.js";

// 1. Manufacturer Technical Spec Schema
export const ManufacturerSpecSchema = z.object({
  brand: z.nativeEnum(ManufacturerBrand),
  productionSku: z.string().min(3),
  oemCertifications: z.array(z.string()).default([]),
  isOemApproved: z.boolean().default(true),
});
export type ManufacturerSpec = z.infer<typeof ManufacturerSpecSchema>;

// 2. Compatibility & Vehicle Application Schema
export const VehicleCompatibilitySchema = z.object({
  make: z.string().min(2),
  model: z.string().min(2),
  startYear: z.number().int().min(1950),
  endYear: z.number().int().max(2035),
  engineModel: z.string().min(2),
  chassisCode: z.string().optional(),
});
export type VehicleCompatibility = z.infer<typeof VehicleCompatibilitySchema>;

// 3. Electrical Technical Details Schema
export const ElectricalTechnicalSpecSchema = z.object({
  voltage: z.nativeEnum(VoltageSystem).default(VoltageSystem.VOLT_12),
  amperage: z.number().positive().optional(), // For alternators (e.g., 80A, 100A, 120A)
  pinCount: z.number().int().positive().optional(), // For plugs (e.g., 3-pin, 4-pin round, oval)
  teethCount: z.number().int().positive().optional(), // For starter pinions (e.g., 9T, 10T)
  pulleyGrooves: z.number().int().positive().optional(), // For alternator pulleys (e.g., 7PK)
  kwRating: z.number().positive().optional(), // For starter motors (e.g., 2.0 kW)
  plugType: z.string().optional(), // "Round 4-pin", "Oval 3-pin", "Square 2-pin"
});
export type ElectricalTechnicalSpec = z.infer<typeof ElectricalTechnicalSpecSchema>;

// 4. Parts Feed Item Schema (Matches diagram PARTS FEED)
export const PartsFeedItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5),
  category: z.nativeEnum(ElectricalCategory),
  compatibility: z.array(VehicleCompatibilitySchema),
  technicalSpec: ElectricalTechnicalSpecSchema,
  manufacturer: ManufacturerSpecSchema,
  condition: z.nativeEnum(PartCondition),
  marketArea: z.nativeEnum(MarketArea),
  estimatedPriceMinBirr: z.number().positive(),
  estimatedPriceMaxBirr: z.number().positive(),
  stockCount: z.number().int().min(0),
  image: z.string().min(1),
});
export type PartsFeedItem = z.infer<typeof PartsFeedItemSchema>;

// 5. Garage Saved Vehicle Schema (Matches diagram USERS -> Garage)
export const GarageVehicleSchema = z.object({
  id: z.string().min(1),
  make: z.string(),
  model: z.string(),
  year: z.number().int(),
  engineModel: z.string(),
  vinOrChassis: z.string().min(5),
  plateNumber: z.string().min(4),
  voltageSystem: z.nativeEnum(VoltageSystem).default(VoltageSystem.VOLT_12),
});
export type GarageVehicle = z.infer<typeof GarageVehicleSchema>;
