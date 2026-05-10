import { useState } from 'react';
import { useCaseStore } from '../../store/caseStore';

/**
 * Universal inline-create person-reference input. Used wherever a
 * field needs to point at a third party (Property owner · Donor ·
 * Occupant 17+ · Vulnerable-customer-support contact). On commit,
 * dispatches `addPartyReference` which creates a `ThirdParty` row;
 * the new entry shows up automatically on the Connected Parties tab.
 *
 * UI states:
 *  - empty                 → italic placeholder + "Add" affordance
 *  - typing                → text input + Save / Cancel
 *  - committed             → name pill + green "→ Connected Parties record created"
 */

export type PersonRefRelationship =
  | 'PropertyOwner'
  | 'Donor'
  | 'Occupant'
  | 'VulnerableSupport'
  | 'Other';

export interface PersonReferenceProps {
  /** Optional pre-existing reference name (e.g. James Hargreaves from fixture). */
  initialValue?: string;
  /** Used as the relationship/role on the created `ThirdParty`. */
  relationship: PersonRefRelationship;
  /** Free-text scope shown in the resulting `actsFor` and the green confirmation. */
  actsFor: string;
  /** Optional placeholder when empty. */
  placeholder?: string;
  /** When `true`, render the field with the dashed-amber OBTL preview chrome. */
  obtlPreview?: boolean;
}

export default function PersonReference({
  initialValue,
  relationship,
  actsFor,
  placeholder = 'Add a name',
  obtlPreview,
}: PersonReferenceProps) {
  const addPartyReference = useCaseStore((s) => s.addPartyReference);

  const [value, setValue] = useState(initialValue ?? '');
  const [editing, setEditing] = useState(false);
  const [committedAt, setCommittedAt] = useState<number | null>(
    initialValue ? Date.now() : null,
  );

  const isCommitted = !!value && !editing;

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }
    addPartyReference({
      name: trimmed,
      role: relationship,
      actsFor,
    });
    setEditing(false);
    setCommittedAt(Date.now());
  }

  if (!isCommitted && !editing) {
    return (
      <div className={`person-ref empty ${obtlPreview ? 'obtl' : ''}`}>
        <button
          type="button"
          className="person-ref-add"
          onClick={() => setEditing(true)}
        >
          <span className="person-ref-add-plus">+</span>
          <span>{placeholder}</span>
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className={`person-ref editing ${obtlPreview ? 'obtl' : ''}`}>
        <input
          type="text"
          className="person-ref-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setEditing(false);
          }}
          placeholder={placeholder}
          autoFocus
        />
        <button type="button" className="person-ref-save" onClick={handleSave}>
          Save
        </button>
        <button
          type="button"
          className="person-ref-cancel"
          onClick={() => {
            setEditing(false);
            setValue(initialValue ?? '');
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`person-ref committed ${obtlPreview ? 'obtl' : ''}`}>
      <div className="person-ref-pill">
        <span className="person-ref-name">{value}</span>
        <button
          type="button"
          className="person-ref-edit"
          onClick={() => setEditing(true)}
          aria-label="Edit"
        >
          {PENCIL_ICON}
        </button>
      </div>
      {committedAt !== null && (
        <span className="person-ref-confirm">
          → Connected Parties record created
        </span>
      )}
    </div>
  );
}

const PENCIL_ICON = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
