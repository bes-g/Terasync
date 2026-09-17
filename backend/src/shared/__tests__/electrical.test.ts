import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";
import {
  calculateOrderFinancials,
  formatBirr,
  ElectricalCategory,
  VoltageSystem,
  PartCondition,
  MarketArea,
  ManufacturerBrand,
  PartsFeedItemSchema,
  GarageVehicleSchema,
} from "../index.js";

describe("Automotive Electrical Shared Module", () => {
  describe("Money and Escrow Arithmetic (decimal.js)", () => {
    it("should calculate commission and vendor payout with exact subtraction invariant", () => {
      const result = calculateOrderFinancials("14500.00", "350.00", "0.05", "20.00");

      // 14500 * 0.05 = 725.00
      expect(result.commissionBirr.toString()).toBe("725");
      // 14500 - 725 = 13775.00
      expect(result.payoutAmountBirr.toString()).toBe("13775");
      // Total charged = 14500 + 350 = 14850.00
      expect(result.totalChargedBirr.toString()).toBe("14850");

      // Invariant: commission + payout === itemPrice
      expect(result.commissionBirr.plus(result.payoutAmountBirr).equals(result.itemPriceBirr)).toBe(true);
    });

    it("should enforce minimum platform fee on small electrical part orders", () => {
      // 100 ETB relay with 5% = 5 ETB, but minimum platform fee is 20 ETB
      const result = calculateOrderFinancials("100.00", "150.00", "0.05", "20.00");

      expect(result.commissionBirr.toString()).toBe("20");
      expect(result.payoutAmountBirr.toString()).toBe("80");
      expect(result.totalChargedBirr.toString()).toBe("250");
    });

    it("should format birr amounts properly", () => {
      expect(formatBirr(new Decimal("14500.5"))).toBe("14500.50 ETB");
    });
  });

  describe("Electrical Parts Feed and Compatibility Validation", () => {
    it("should validate a complete Denso Alternator feed item for Toyota Hilux", () => {
      const validAlternator = {
        id: "ALT-HILUX-1KD",
        title: "Toyota Hilux 1KD-FTV Alternator 12V 80A Denso",
        category: ElectricalCategory.ALTERNATOR_CHARGING,
        compatibility: [
          {
            make: "Toyota",
            model: "Hilux",
            startYear: 2005,
            endYear: 2020,
            engineModel: "1KD-FTV",
            chassisCode: "KUN26",
          },
        ],
        technicalSpec: {
          voltage: VoltageSystem.VOLT_12,
          amperage: 80,
          pinCount: 4,
          pulleyGrooves: 7,
          plugType: "Round 4-pin",
        },
        manufacturer: {
          brand: ManufacturerBrand.DENSO,
          productionSku: "104210-9010",
          oemCertifications: ["ISO/TS 16949", "Toyota Certified OEM"],
          isOemApproved: true,
        },
        condition: PartCondition.GENUINE_NEW,
        marketArea: MarketArea.TEKLEHAYMANOT,
        estimatedPriceMinBirr: 12000,
        estimatedPriceMaxBirr: 15500,
        stockCount: 8,
        image: "/images/gear-precision.jpg",
      };

      const parsed = PartsFeedItemSchema.safeParse(validAlternator);
      expect(parsed.success).toBe(true);
    });

    it("should validate a garage user's saved vehicle profile", () => {
      const garageCar = {
        id: "VEH-001",
        make: "Toyota",
        model: "Hilux Revo",
        year: 2018,
        engineModel: "1GD-FTV",
        vinOrChassis: "AHTER39G409012345",
        plateNumber: "3-B48102",
        voltageSystem: VoltageSystem.VOLT_12,
      };

      const parsed = GarageVehicleSchema.safeParse(garageCar);
      expect(parsed.success).toBe(true);
    });
  });
});
