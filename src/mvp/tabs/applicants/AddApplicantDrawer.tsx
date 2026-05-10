import { useState } from 'react';
import Drawer from '../../components/drawers/Drawer';
import { useCaseStore } from '../../store/caseStore';

/**
 * Step 19 — minimal-fields drawer for the second-applicant flow.
 * Three required inputs: Title · Full name · Date of birth. On
 * submit, a Person is appended to `case.parties`; the broker
 * continues filling in the regular Personal / Employment / Adverse
 * sub-tabs with the new applicant selected.
 */
export interface AddApplicantDrawerProps {
  /** Optional callback fired with the new applicant's uuid after a
   *  successful submit, so the parent can switch context. */
  onCreated?: (uuid: string) => void;
}

const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms', 'Mx', 'Dr'];

export default function AddApplicantDrawer({ onCreated }: AddApplicantDrawerProps) {
  const closeDrawer = useCaseStore((s) => s.closeDrawer);
  const addApplicant = useCaseStore((s) => s.addApplicant);

  const [title, setTitle] = useState<string>('Mr');
  const [fullName, setFullName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [error, setError] = useState<string | undefined>();

  function handleSubmit() {
    setError(undefined);
    const trimmed = fullName.trim();
    if (!trimmed) {
      setError('Full name is required');
      return;
    }
    if (!dob) {
      setError('Date of birth is required');
      return;
    }
    const parts = trimmed.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '—';
    const result = addApplicant({ title, firstName, lastName, dateOfBirth: dob });
    if (!result.ok) {
      setError('Maximum 2 applicants per case');
      return;
    }
    onCreated?.(result.uuid);
    closeDrawer();
  }

  return (
    <Drawer
      title="Add second applicant"
      subtitle="Capture identity now — the rest is filled in below."
      onClose={closeDrawer}
      width={460}
      variant="add-applicant-drawer"
      footer={
        <div className="add-applicant-drawer__footer">
          <button
            type="button"
            className="dc-btn ghost"
            onClick={closeDrawer}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dc-btn primary"
            onClick={handleSubmit}
          >
            Add applicant
          </button>
        </div>
      }
    >
      <form
        className="add-applicant-drawer__form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="qi-field">
          <label className="qi-field-label" htmlFor="aa-title">Title</label>
          <select
            id="aa-title"
            className="qi-select"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          >
            {TITLES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="qi-field">
          <label className="qi-field-label" htmlFor="aa-name">Full name</label>
          <input
            id="aa-name"
            type="text"
            className="qi-input"
            value={fullName}
            placeholder="Forename Surname"
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="qi-field">
          <label className="qi-field-label" htmlFor="aa-dob">Date of birth</label>
          <input
            id="aa-dob"
            type="date"
            className="qi-input"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        {error && <div className="add-applicant-drawer__error" role="alert">{error}</div>}
      </form>
    </Drawer>
  );
}
