import { useState } from 'react';
import { useCaseStore } from '../store/caseStore';
import { Chip } from '../components/atoms';
import AddPartyModal from './parties/AddPartyModal';
import { FIXTURE_IDS } from '../mock/fixtures';
import type { ThirdParty } from '../model/thirdparty';

/**
 * Connected Parties — Standalone v3 chapter 6.
 *
 * Two visible groups: Professional services and Linked persons. The
 * six fixture entries render with the v3 brief's exact display text
 * (firm names, phone numbers, FCA refs etc.) — those strings live in
 * `SEEDED_DISPLAY` below and override what the underlying ThirdParty
 * record carries. Anything added at runtime via `addPartyReference`
 * (Security tab PersonReference, or the Add modal) merges into the
 * Linked-persons group at the bottom.
 *
 * The OBTL group (UK representative · Managing agent) is wired
 * conditionally on `productFamily === 'Buy-to-Let'` and never renders
 * in MVP, per the brief.
 */

interface SeededCard {
  uuid: string;
  group: 'professional' | 'linked';
  name: string;
  chip: string;
  details: React.ReactNode;
  /** Origin chip ("Added from Security · Property owner" etc.). */
  origin?: string;
  /** Dressed style for placeholder cards (e.g. TBC valuer). */
  placeholder?: boolean;
}

const SEEDED_DISPLAY: SeededCard[] = [
  {
    uuid: FIXTURE_IDS.tpSarahChen,
    group: 'professional',
    name: 'Sarah Chen',
    chip: 'Solicitor / Conveyancer',
    details: 'Ashford & Partners LLP · 020 7946 0958 · sarah.chen@ashfordpartners.co.uk',
  },
  {
    uuid: 'tbc-valuer',
    group: 'professional',
    name: 'TBC',
    chip: 'Valuer',
    details: (
      <em className="party-card-tbc">
        Not yet assigned — will be populated after DIP acceptance
      </em>
    ),
    placeholder: true,
  },
  {
    uuid: FIXTURE_IDS.tpMarcusWebb,
    group: 'professional',
    name: 'Marcus Webb',
    chip: 'Estate agent',
    details: 'Foxtons Camberwell · 020 7924 1100',
  },
  {
    uuid: FIXTURE_IDS.tpAOkafor,
    group: 'professional',
    name: 'A. Okafor (self)',
    chip: 'Credit intermediary',
    details: 'FCA ref 123456 · Okafor Financial Services Ltd',
  },
  {
    uuid: FIXTURE_IDS.tpHargreaves,
    group: 'linked',
    name: 'Mr James Hargreaves',
    chip: 'Property owner',
    details: 'Relationship to security: owner of 17 Camberwell Grove (OBTL)',
    origin: 'Added from Security · Property owner',
  },
  {
    uuid: FIXTURE_IDS.tpElizabeth,
    group: 'linked',
    name: 'Elizabeth Okafor',
    chip: 'Donor (gifted deposit)',
    details: 'Relationship to applicant: Mother of Daniel Okafor · Gift amount £40,000',
    origin: 'Added from Quick input · Source of deposit',
  },
  {
    uuid: FIXTURE_IDS.tpChidera,
    group: 'linked',
    name: 'Chidera Okafor',
    chip: 'Occupant 17+',
    details: 'Son, age 19 · Will reside at 17 Camberwell Grove',
  },
];

const SEEDED_UUIDS = new Set(SEEDED_DISPLAY.map((s) => s.uuid));

export default function ConnectedPartiesTab() {
  const thirdParties = useCaseStore((s) => s.case.thirdParties);
  const productFamily = useCaseStore((s) => s.case.arrangement.productFamily);
  const openDrawer = useCaseStore((s) => s.openDrawer);
  const [addOpen, setAddOpen] = useState(false);

  const showOBTLGroup = productFamily === 'Buy-to-Let';

  // Dynamic additions — anything added via PersonReference / AddPartyModal
  // that isn't part of the seeded fixture set.
  const dynamicAdditions = thirdParties.filter(
    (tp) => !SEEDED_UUIDS.has(tp.uuid),
  );

  const professional = SEEDED_DISPLAY.filter((s) => s.group === 'professional');
  const linked = SEEDED_DISPLAY.filter((s) => s.group === 'linked');

  return (
    <div className="parties-page">
      <div className="parties-section">
        <PartyGroup title="Professional services" cards={professional} onExpand={(uuid) =>
          openDrawer({ kind: 'party-details', partyUuid: uuid })
        } />

        <PartyGroup
          title="Linked persons"
          cards={linked}
          dynamicAdditions={dynamicAdditions}
          onExpand={(uuid) =>
            openDrawer({ kind: 'party-details', partyUuid: uuid })
          }
        />

        {showOBTLGroup && (
          // Designed-in. In MVP `productFamily` is Owner Occupier so this
          // never renders — the conditional logic is what the brief asks
          // us to ship. The dashed-amber treatment matches the OBTL
          // preview block on Security.
          <div className="parties-group-obtl">
            <div className="parties-group-head obtl">
              <span className="parties-group-title">OBTL · designed-in</span>
              <span className="parties-group-note">
                Surfaces only when product family is Buy-to-Let
              </span>
            </div>
            <div className="party-card placeholder obtl">
              <div className="party-card-name">UK representative</div>
              <div className="party-card-chip">
                <Chip tone="amber">UK representative · OBTL only</Chip>
              </div>
              <div className="party-card-details">
                <em>Required when overseas owner</em>
              </div>
            </div>
            <div className="party-card placeholder obtl">
              <div className="party-card-name">Managing agent</div>
              <div className="party-card-chip">
                <Chip tone="amber">Managing agent · OBTL only</Chip>
              </div>
              <div className="party-card-details">
                <em>Optional</em>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn btn-ghost btn-add-party"
          onClick={() => setAddOpen(true)}
        >
          <span className="btn-add-party-plus">+</span>
          <span>Add connected party</span>
        </button>
      </div>

      {addOpen && <AddPartyModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}

// ============================================================
// Group + cards
// ============================================================

function PartyGroup({
  title,
  cards,
  dynamicAdditions,
  onExpand,
}: {
  title: string;
  cards: SeededCard[];
  dynamicAdditions?: ThirdParty[];
  onExpand: (uuid: string) => void;
}) {
  return (
    <div className="party-group">
      <div className="parties-group-head">
        <span className="parties-group-title">{title}</span>
      </div>
      {cards.map((c) => (
        <PartyCard key={c.uuid} card={c} onExpand={() => onExpand(c.uuid)} />
      ))}
      {dynamicAdditions?.map((tp) => (
        <PartyCard
          key={tp.uuid}
          card={cardFromThirdParty(tp)}
          onExpand={() => onExpand(tp.uuid)}
        />
      ))}
    </div>
  );
}

function PartyCard({
  card,
  onExpand,
}: {
  card: SeededCard;
  onExpand: () => void;
}) {
  return (
    <article className={`party-card ${card.placeholder ? 'placeholder' : ''}`}>
      <div className="party-card-name">{card.name}</div>
      <div className="party-card-chip">
        <Chip tone="neutral">{card.chip}</Chip>
      </div>
      <div className="party-card-details">{card.details}</div>
      {card.origin && (
        <span className="p-source">
          <span className="p-source-arrow">↳</span>
          {card.origin}
        </span>
      )}
      <button type="button" className="party-expand" onClick={onExpand}>
        {card.placeholder ? 'Edit' : 'Expand'}
      </button>
    </article>
  );
}

function cardFromThirdParty(tp: ThirdParty): SeededCard {
  // Inline-created entries store their relationship in the `actsFor`
  // string ("Property owner · ..." etc.). Pull a friendly chip out of
  // it; falls back to the raw role.
  const chip = roleChipFromActsFor(tp.actsFor) ?? tp.role;
  return {
    uuid: tp.uuid,
    group: 'linked',
    name: tp.name,
    chip,
    details: tp.actsFor ?? '',
    origin: 'Added inline · Connected Parties',
  };
}

function roleChipFromActsFor(actsFor: string | undefined): string | undefined {
  if (!actsFor) return undefined;
  const head = actsFor.split('·')[0]?.trim();
  return head;
}
