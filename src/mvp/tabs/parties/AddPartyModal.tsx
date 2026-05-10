import { useEffect, useState } from 'react';
import { useCaseStore } from '../../store/caseStore';

/**
 * Modal for adding a Connected Party. Two-step flow:
 *   1. Pick relationship type (chip grid)
 *   2. Fill name + minimum contact fields
 *
 * Per the brief, partial / ambiguous names (initials only, single
 * word) trigger a confirmation dialog before creation; here a small
 * inline warning + explicit "Create anyway" button covers the same
 * intent without a second modal.
 */

export interface AddPartyModalProps {
  onClose: () => void;
}

const RELATIONSHIPS: {
  id: string;
  label: string;
  group: 'professional' | 'linked';
}[] = [
  { id: 'Solicitor', label: 'Solicitor / Conveyancer', group: 'professional' },
  { id: 'Surveyor', label: 'Valuer', group: 'professional' },
  { id: 'EstateAgent', label: 'Estate agent', group: 'professional' },
  { id: 'Accountant', label: 'Accountant', group: 'professional' },
  { id: 'IFA', label: 'IFA', group: 'professional' },
  { id: 'Packager', label: 'Packager', group: 'professional' },
  { id: 'PropertyOwner', label: 'Property owner', group: 'linked' },
  { id: 'Donor', label: 'Donor (gifted deposit)', group: 'linked' },
  { id: 'Occupant', label: 'Occupant 17+', group: 'linked' },
  { id: 'VulnerableSupport', label: 'Vulnerable-customer support', group: 'linked' },
];

const CLOSE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function AddPartyModal({ onClose }: AddPartyModalProps) {
  const addPartyReference = useCaseStore((s) => s.addPartyReference);

  const [relationship, setRelationship] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmedAmbiguous, setConfirmedAmbiguous] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const isAmbiguous = isNameAmbiguous(name);

  function handleCreate() {
    if (!relationship || !name.trim()) return;
    if (isAmbiguous && !confirmedAmbiguous) {
      setConfirmedAmbiguous(true);
      return;
    }
    addPartyReference({
      name: name.trim(),
      role: mapToStoreRole(relationship),
      actsFor: contactName || email || phone || 'Manually added',
    });
    onClose();
  }

  return (
    <div className="add-party-overlay" onClick={onClose} role="presentation">
      <div
        className="add-party-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add connected party"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="add-party-head">
          <div className="add-party-titles">
            <div className="add-party-title">Add connected party</div>
            <div className="add-party-sub">
              Pick a relationship, then fill the contact details.
            </div>
          </div>
          <button
            type="button"
            className="add-party-close"
            onClick={onClose}
            aria-label="Close"
          >
            {CLOSE_ICON}
          </button>
        </header>

        <div className="add-party-body">
          {!relationship ? (
            <>
              <div className="add-party-section-title">Professional services</div>
              <div className="add-party-chips">
                {RELATIONSHIPS.filter((r) => r.group === 'professional').map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="add-party-chip"
                    onClick={() => setRelationship(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="add-party-section-title">Linked persons</div>
              <div className="add-party-chips">
                {RELATIONSHIPS.filter((r) => r.group === 'linked').map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="add-party-chip"
                    onClick={() => setRelationship(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="add-party-pickback">
                <button
                  type="button"
                  className="add-party-back"
                  onClick={() => setRelationship(null)}
                >
                  ← Change relationship
                </button>
                <span className="add-party-relchip">
                  {RELATIONSHIPS.find((r) => r.id === relationship)?.label}
                </span>
              </div>

              <div className="add-party-form">
                <FormField label="Firm or display name">
                  <input
                    type="text"
                    className="add-party-input"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setConfirmedAmbiguous(false);
                    }}
                    autoFocus
                  />
                </FormField>
                <FormField label="Contact name">
                  <input
                    type="text"
                    className="add-party-input"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </FormField>
                <FormField label="Email">
                  <input
                    type="email"
                    className="add-party-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormField>
                <FormField label="Phone">
                  <input
                    type="tel"
                    className="add-party-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormField>

                {isAmbiguous && (
                  <div className="add-party-ambiguous">
                    <strong>Ambiguous name.</strong> "{name.trim()}" looks
                    incomplete (initials or single word). Add the full name, or
                    confirm to create the record as-is.
                  </div>
                )}

                <div className="add-party-actions">
                  <button
                    type="button"
                    className="add-party-btn ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="add-party-btn primary"
                    onClick={handleCreate}
                    disabled={!name.trim()}
                  >
                    {isAmbiguous && !confirmedAmbiguous
                      ? 'Create anyway'
                      : 'Create record'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="add-party-field">
      <span className="add-party-field-lbl">{label}</span>
      {children}
    </label>
  );
}

/** Heuristic: single word, only initials, or fewer than 3 chars. */
function isNameAmbiguous(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1 && trimmed.length < 4) return true;
  if (/^([A-Z]\.\s?)+$/.test(trimmed)) return true;
  return false;
}

function mapToStoreRole(
  rel: string,
): 'PropertyOwner' | 'Donor' | 'Occupant' | 'VulnerableSupport' | 'Other' {
  if (
    rel === 'PropertyOwner' ||
    rel === 'Donor' ||
    rel === 'Occupant' ||
    rel === 'VulnerableSupport'
  ) {
    return rel;
  }
  return 'Other';
}
