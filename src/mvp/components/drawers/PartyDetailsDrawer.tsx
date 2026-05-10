import { useState, useEffect } from 'react';
import Drawer from './Drawer';
import { useCaseStore } from '../../store/caseStore';

/**
 * Side-drawer that opens from a Connected Parties card's Expand
 * button. Shows the party's contact fields editable. Solicitor /
 * Surveyor / Accountant variants surface the role-specific extras
 * (regulator number, on-panel flag, RICS number) via the
 * `roleDetails` discriminated property on `ThirdParty`.
 *
 * Updates are kept local to this drawer for the MVP — the brief
 * doesn't require persistence beyond Step 10. Save is a no-op visual.
 */
export default function PartyDetailsDrawer() {
  const drawer = useCaseStore((s) => s.drawer);
  const closeDrawer = useCaseStore((s) => s.closeDrawer);
  const thirdParties = useCaseStore((s) => s.case.thirdParties);

  if (drawer.kind !== 'party-details') return null;
  const partyUuid = drawer.partyUuid;

  // Sentinel for the TBC valuer placeholder card.
  if (partyUuid === 'tbc-valuer') {
    return (
      <Drawer
        title="Valuer · TBC"
        subtitle="Will be populated after DIP acceptance"
        width={480}
        onClose={closeDrawer}
        variant="party-details-drawer"
      >
        <div className="party-empty">
          The lender allocates a panel valuer once the DIP is approved and a
          valuation is instructed. No fields to capture yet.
        </div>
      </Drawer>
    );
  }

  const party = thirdParties.find((tp) => tp.uuid === partyUuid);
  if (!party) {
    return (
      <Drawer title="Party" onClose={closeDrawer} width={480}>
        <div className="party-empty">Record not found.</div>
      </Drawer>
    );
  }

  return <DrawerInner key={party.uuid} />;
}

function DrawerInner() {
  const drawer = useCaseStore((s) => s.drawer);
  const thirdParties = useCaseStore((s) => s.case.thirdParties);
  const closeDrawer = useCaseStore((s) => s.closeDrawer);

  if (drawer.kind !== 'party-details') return null;
  const party = thirdParties.find((tp) => tp.uuid === drawer.partyUuid);
  if (!party) return null;

  const [name, setName] = useState(party.name);
  const [contactName, setContactName] = useState(party.contactName ?? '');
  const [email, setEmail] = useState(party.email ?? '');
  const [phone, setPhone] = useState(party.phone ?? '');
  const [actsFor, setActsFor] = useState(party.actsFor ?? '');
  const [addressLine1, setAddressLine1] = useState(party.address?.line1 ?? '');
  const [addressCity, setAddressCity] = useState(party.address?.city ?? '');
  const [addressPostcode, setAddressPostcode] = useState(party.address?.postcode ?? '');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const setManualField = useCaseStore((s) => s.setManualField);

  useEffect(() => {
    if (savedAt === null) return;
    const t = window.setTimeout(() => setSavedAt(null), 2400);
    return () => window.clearTimeout(t);
  }, [savedAt]);

  function handleSave() {
    // Step 15: dispatch a setManualField per dirty field. Provenance
    // stamps land on the same provenance map keys that any future
    // audit pass reads. Re-narrowing inside the closure since TS
    // doesn't preserve the early-return narrowing across function
    // expressions.
    const p = party;
    if (!p) return;
    const ref = { entityType: 'ThirdParty' as const, entityId: p.uuid };
    if (name !== p.name) setManualField(ref, 'name', name);
    if (contactName !== (p.contactName ?? ''))
      setManualField(ref, 'contactName', contactName);
    if (email !== (p.email ?? '')) setManualField(ref, 'email', email);
    if (phone !== (p.phone ?? '')) setManualField(ref, 'phone', phone);
    if (actsFor !== (p.actsFor ?? ''))
      setManualField(ref, 'actsFor', actsFor);
    if (addressLine1 !== (p.address?.line1 ?? ''))
      setManualField(ref, 'address.line1', addressLine1);
    if (addressCity !== (p.address?.city ?? ''))
      setManualField(ref, 'address.city', addressCity);
    if (addressPostcode !== (p.address?.postcode ?? ''))
      setManualField(ref, 'address.postcode', addressPostcode);
    setSavedAt(Date.now());
  }

  return (
    <Drawer
      title={party.name}
      subtitle={prettyRole(party.role)}
      width={480}
      onClose={closeDrawer}
      variant="party-details-drawer"
      footer={
        <div className="party-foot">
          {savedAt !== null && (
            <span className="party-saved">Saved · changes flagged for audit</span>
          )}
          <div className="party-foot-actions">
            <button type="button" className="party-btn ghost" onClick={closeDrawer}>
              Close
            </button>
            <button type="button" className="party-btn primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      }
    >
      <div className="party-fields">
        <Field label="Firm / display name">
          <input
            type="text"
            className="party-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Contact name">
          <input
            type="text"
            className="party-input"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="party-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            className="party-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label="Acts for / scope">
          <input
            type="text"
            className="party-input"
            value={actsFor}
            onChange={(e) => setActsFor(e.target.value)}
          />
        </Field>

        <div className="party-fields-divider">Address</div>

        <Field label="Address line 1">
          <input
            type="text"
            className="party-input"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />
        </Field>
        <Field label="City">
          <input
            type="text"
            className="party-input"
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
          />
        </Field>
        <Field label="Postcode">
          <input
            type="text"
            className="party-input"
            value={addressPostcode}
            onChange={(e) => setAddressPostcode(e.target.value)}
          />
        </Field>

        {/* Solicitor extras — T1 sub-fields. */}
        {party.role === 'Solicitor' && party.roleDetails && 'regulatorNumber' in party.roleDetails && (
          <>
            <div className="party-fields-divider">Solicitor regulator (T1)</div>
            <Field label="SRA / Law Society number">
              <input
                type="text"
                className="party-input"
                defaultValue={party.roleDetails.regulatorNumber ?? ''}
              />
            </Field>
            <Field label="On lender panel">
              <input
                type="text"
                className="party-input"
                readOnly
                value={party.roleDetails.onLenderPanel ? 'Yes' : 'No'}
              />
            </Field>
          </>
        )}
        {party.role === 'Surveyor' && party.roleDetails && 'ricsNumber' in party.roleDetails && (
          <>
            <div className="party-fields-divider">Surveyor regulator (T2)</div>
            <Field label="RICS number">
              <input
                type="text"
                className="party-input"
                defaultValue={party.roleDetails.ricsNumber ?? ''}
              />
            </Field>
          </>
        )}
      </div>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="party-field">
      <span className="party-field-lbl">{label}</span>
      {children}
    </label>
  );
}

function prettyRole(role: string): string {
  switch (role) {
    case 'Solicitor':
      return 'Solicitor / Conveyancer';
    case 'EstateAgent':
      return 'Estate agent';
    case 'MortgageBroker':
      return 'Credit intermediary';
    case 'Surveyor':
      return 'Valuer';
    case 'Accountant':
      return 'Accountant';
    case 'Other':
      return 'Linked person';
    default:
      return role;
  }
}
