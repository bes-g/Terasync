import { Decimal } from "decimal.js";

// Configure standard precision for currency arithmetic
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface OrderFinancialSummary {
  itemPriceBirr: Decimal;
  deliveryFeeBirr: Decimal;
  totalChargedBirr: Decimal;
  commissionRate: Decimal;
  commissionBirr: Decimal;
  payoutAmountBirr: Decimal;
}

/**
 * Calculates platform commission and vendor payout amounts.
 * Subtraction guarantees that commission + payout strictly equals itemPriceBirr with zero rounding drift.
 */
export function calculateOrderFinancials(
  itemPriceBirr: string | number | Decimal,
  deliveryFeeBirr: string | number | Decimal,
  commissionRate: string | number | Decimal = "0.05",
  minPlatformFeeBirr: string | number | Decimal = "20.00",
): OrderFinancialSummary {
  const item = new Decimal(itemPriceBirr).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const delivery = new Decimal(deliveryFeeBirr).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const rate = new Decimal(commissionRate);
  const minFee = new Decimal(minPlatformFeeBirr);

  const rawCommission = item.times(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const commission = rawCommission.lessThan(minFee) ? minFee : rawCommission;

  // Payout is calculated by exact subtraction
  const payout = item.minus(commission);
  const totalCharged = item.plus(delivery);

  return {
    itemPriceBirr: item,
    deliveryFeeBirr: delivery,
    totalChargedBirr: totalCharged,
    commissionRate: rate,
    commissionBirr: commission,
    payoutAmountBirr: payout,
  };
}

export function formatBirr(amount: Decimal | string | number): string {
  const d = new Decimal(amount);
  return `${d.toFixed(2)} ETB`;
}
