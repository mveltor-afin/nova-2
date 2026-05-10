import type { DateTimeString, UUID } from './primitives';

/**
 * Consent — C1–C9 on the register, minus C4 and C5 which travel with
 * `AdverseHistory` (since their wording is paired with the adverse
 * declaration). The remaining seven are case-level consents stored
 * as a flat array on `Case.consents`.
 *
 * Each consent records *who* gave it (party UUID) and *when*; the
 * signed-off boolean lives on the row itself.
 */
export type ConsentKind =
  /** C1 Privacy notice acknowledged. */
  | 'PrivacyNotice'
  /** C2 Data sharing with broker network / panel. */
  | 'BrokerDataSharing'
  /** C3 Marketing opt-in (granular). */
  | 'Marketing'
  /** C6 Anti-money-laundering: ID & address verification consent. */
  | 'AML_ID'
  /** C7 Property data: Land Registry / EPC pull. */
  | 'PropertyDataPull'
  /** C8 Open Banking: account information access. */
  | 'OpenBanking'
  /** C9 Source of funds declaration. */
  | 'SourceOfFunds';

export interface Consent {
  uuid: UUID;
  kind: ConsentKind;
  /** Party who granted the consent. For joint applications each
   *  applicant signs their own row, so two consents of the same
   *  `kind` may exist with different `partyUuid`. */
  partyUuid: UUID;
  /** Whether consent has been granted. `false` is a meaningful
   *  state ("explicitly declined") — distinct from "not yet asked"
   *  which is a missing row. */
  granted: boolean;
  /** When consent was given / declined. */
  timestamp?: DateTimeString;
  /** Free-text channel — where the consent was recorded
   *  (e.g. "Fact-find form, page 7", "Verbal, call 2026-04-22"). */
  channel?: string;
}
