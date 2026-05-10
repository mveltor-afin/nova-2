/**
 * Shared primitive types used across the model.
 * Not in the original Step 2 brief but needed to keep the register types
 * self-documenting (a "DateString" reads better than a bare "string").
 */

/** ISO 8601 date — YYYY-MM-DD. */
export type DateString = string;

/** ISO 8601 datetime — YYYY-MM-DDTHH:MM:SSZ. */
export type DateTimeString = string;

/** Pounds sterling, two decimals. Stored as number for arithmetic; format for display. */
export type Money = number;

export type PhoneNumber = string;
export type EmailAddress = string;

/** RFC 4122 UUID. Every Party, Collateral, ThirdParty, Document, etc. carries one. */
export type UUID = string;

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country?: string;
  /** Optional: how long the resident has been here. Useful for previous-address rules. */
  effectiveFrom?: DateString;
}

/** Money frequency for income / expenditure rows. */
export type Frequency = 'Monthly' | 'Annual' | 'Weekly';
