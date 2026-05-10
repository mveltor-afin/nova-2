/**
 * Pure derived helpers for Configuration-Strip values that update
 * live as the broker edits inputs. Take primitives in, return
 * primitives out — safe to call inline in render. **Do not** wrap
 * any of these in a Zustand selector that would recompute on every
 * render; they're cheap, but the v5 useShallow trap is real.
 */

import type { Arrangement } from './arrangement';

/**
 * Step 14b: loan amount is derived. Brokers edit property value +
 * deposit; loan = max(0, propertyValue - depositAmount). Clamped to
 * zero when deposit ≥ property (silent — brief 14b decision).
 */
export function selectLoanAmount(
  arrangement: Arrangement,
  propertyValue: number | undefined,
): number {
  const pv = propertyValue ?? 0;
  return Math.max(0, pv - arrangement.depositAmount);
}

/**
 * Strip-level effective loan = derived loan + capitalised broker fee.
 * Product-fee capitalisation does NOT roll up here — its impact is
 * shown per-product on each DIP card's pricing breakdown (Step 14
 * decision 3).
 */
export function selectEffectiveLoan(
  arrangement: Arrangement,
  propertyValue: number | undefined,
): number {
  const brokerSlice =
    arrangement.brokerFeeHandling === 'capitalise'
      ? arrangement.brokerFee
      : 0;
  return selectLoanAmount(arrangement, propertyValue) + brokerSlice;
}

/** Strip-level effective LTV (%). Returns 0 when the property value
 *  is missing or zero — caller decides how to render that. */
export function selectEffectiveLtv(
  arrangement: Arrangement,
  propertyValue: number | undefined,
): number {
  if (!propertyValue || propertyValue <= 0) return 0;
  return (selectEffectiveLoan(arrangement, propertyValue) / propertyValue) * 100;
}
