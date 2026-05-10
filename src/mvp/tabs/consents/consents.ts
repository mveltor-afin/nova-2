/**
 * Static configuration for the Consents-tab tiles. Tile ids are
 * stored on `case.consentAssertions` as boolean toggles; the
 * preferred-payment-date item additionally writes
 * `case.preferredPaymentDate` (Step 21).
 */

export type ConsentVariant = 'standard' | 'conditional' | 'btl-only' | 'gating';

/** Step 21 — split confirm-button items from checkbox toggles and the
 *  date picker. Drives ConsentCard's action-area renderer. */
export type ConsentActionType =
  | 'confirm-button'
  | 'checkbox'
  | 'date-picker';

export interface ConsentTile {
  id: string;
  /** C / S register reference. */
  registerId: string;
  title: string;
  body: string;
  /** Helper line shown beneath the title (small italic). */
  subLabel?: string;
  variant: ConsentVariant;
  /** Action label for the primary button when not yet asserted. */
  actionLabel: string;
  /** Label rendered when already asserted (ghost button). */
  assertedLabel?: string;
  /** When true, this tile only renders for a specific product family. */
  visibleWhen?: 'oo' | 'btl';
  /** Step 21 — UI surface for the action. Defaults to 'confirm-button'. */
  actionType?: ConsentActionType;
}

export const CONSENT_TILES: ConsentTile[] = [
  {
    id: 'OpenBanking',
    registerId: 'C8',
    title: 'Open Banking consent',
    body: 'Allow Nova to fetch transaction history from joint and personal accounts to verify income and expenditure.',
    variant: 'standard',
    actionLabel: 'Confirm',
    assertedLabel: 'Confirmed',
    actionType: 'checkbox',
  },
  {
    id: 'VulnerabilityFlag',
    registerId: 'C-VUL',
    title: 'Vulnerability flag',
    body: "Mark this case as needing additional support. Nova will route a support contact and add Afin's vulnerability protocol.",
    variant: 'standard',
    actionLabel: 'Confirm',
    actionType: 'checkbox',
  },
  {
    id: 'IncomeReductionExpectation',
    registerId: 'C-IR',
    title: 'Income reduction expectation',
    body: 'Confirm whether the applicant expects a material reduction in income within the term (e.g. retirement, parental leave).',
    subLabel: 'Residential / RB only.',
    variant: 'conditional',
    actionLabel: 'Confirm',
    actionType: 'checkbox',
  },
  {
    id: 'CriminalConvictionDeclaration',
    registerId: 'C-CC',
    title: 'Criminal-conviction declaration',
    body: 'Both applicants assert no unspent criminal convictions. Daniel: No · Amara: No.',
    variant: 'standard',
    actionLabel: 'Confirm',
    assertedLabel: 'Confirmed',
    actionType: 'confirm-button',
  },
  {
    id: 'PreferredPaymentDate',
    registerId: 'C-PD',
    title: 'Preferred payment date',
    body: 'Pick the day of the month the standing order debits.',
    variant: 'standard',
    actionLabel: 'Confirm',
    assertedLabel: 'Confirmed',
    actionType: 'date-picker',
  },
  {
    id: 'IntentToOverpay',
    registerId: 'C-OV',
    title: 'Intent to make overpayments',
    body: 'Capture whether the applicants plan to overpay (lump sums or regular). Affects ERC modelling and product fit.',
    variant: 'standard',
    actionLabel: 'Confirm',
    actionType: 'checkbox',
  },
  {
    id: 'BTLPropertyObligations',
    registerId: 'S8',
    title: 'BTL property obligations',
    body: 'Acknowledge the landlord obligations (HMO licence where applicable, energy efficiency, deposit protection).',
    subLabel: 'BTL only — shown for illustration.',
    variant: 'btl-only',
    actionLabel: 'Confirm',
    visibleWhen: 'btl',
    actionType: 'confirm-button',
  },
  {
    id: 'ApplicationDeclaration',
    registerId: 'C9',
    title: 'Application Declaration',
    body: 'The applicants declare that the information provided is true and complete. Gates submission to the underwriter.',
    variant: 'gating',
    actionLabel: 'Confirm',
    actionType: 'confirm-button',
  },
];
