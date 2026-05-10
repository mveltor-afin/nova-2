import type { UUID } from './primitives';
import type { Person } from './person';

/**
 * Polymorphic Party model. The MVP only uses `Person` (Daniel + Amara
 * Okafor in the canonical case), but the other six kinds are typed
 * up-front so that future product families (Buy-to-Let LtdCo, SPV,
 * Bridging via SoleTrader, etc.) plug in without remodelling the case
 * shape. Owner Occupier residential — the only family in the MVP —
 * only ever produces Person parties.
 */
export type ApplicantType =
  | 'Person'
  | 'SoleTrader'
  | 'LtdCo'
  | 'SPV'
  | 'LLP'
  | 'Trust';

interface PartyBase {
  /** Stable identifier for this party. Used as the `entityId` in
   *  `provenanceMap` keys (e.g. `Person:abc-123:A2`). */
  uuid: UUID;
  /** Exactly one party per case is `isPrimary: true`. Drives "Applicant 1"
   *  vs "Applicant 2" labelling and which party owns identity-level
   *  documents (passport, proof-of-address). */
  isPrimary: boolean;
}

export type Party =
  | (PartyBase & { kind: 'Person'; person: Person })
  | (PartyBase & { kind: 'SoleTrader'; soleTrader: SoleTrader })
  | (PartyBase & { kind: 'LtdCo'; ltdCo: LtdCo })
  | (PartyBase & { kind: 'SPV'; spv: SPV })
  | (PartyBase & { kind: 'LLP'; llp: LLP })
  | (PartyBase & { kind: 'Trust'; trust: Trust });

// === Designed-in non-MVP variants ===
// Typed as opaque stubs so the discriminated union compiles and
// future steps can flesh them out without breaking the Case shape.
// Intentionally not implemented for the MVP.

export interface SoleTrader {
  uuid: UUID;
}

export interface LtdCo {
  uuid: UUID;
}

export interface SPV {
  uuid: UUID;
}

export interface LLP {
  uuid: UUID;
}

export interface Trust {
  uuid: UUID;
}
