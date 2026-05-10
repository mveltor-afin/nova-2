import { useState, useEffect } from 'react';
import { GlassCard, NudgeCard } from '../../../components/atoms';
import RegFieldRow from '../RegFieldRow';
import { useCaseStore } from '../../../store/caseStore';
import type { Person } from '../../../model/person';

/**
 * Employment sub-tab — A41–A56, plus the nested Professional
 * sub-section (A57–A61) which expands when the broker's typed
 * Occupation matches the Professional codeset, OR when the section
 * is opened manually.
 *
 * Per v3 chapter 3 annotation 3, the nested Professional sub-section
 * uses the yellow-bordered card recipe:
 *   border: 1px solid rgba(242,179,61,0.28);
 *   background: rgba(242,179,61,0.04);
 *
 * Daniel's case demonstrates this — Occupation = "Solicitor" matches
 * the codeset → inline nudge fires → nested section auto-expands.
 */

// Subset of the AFIN Professional codeset for the MVP nudge logic.
const PROFESSIONAL_CODESET = new Set([
  'Solicitor',
  'Barrister',
  'Doctor',
  'Surgeon',
  'Dentist',
  'Vet',
  'Pharmacist',
  'Optometrist',
  'Architect',
  'Chartered Engineer',
  'Chartered Accountant',
  'Actuary',
]);

function isQualifyingProfession(jobTitle: string | undefined): boolean {
  if (!jobTitle) return false;
  return PROFESSIONAL_CODESET.has(jobTitle.trim());
}

export default function EmploymentSection({ partyUuid }: { partyUuid: string }) {
  const person = useCaseStore((s) => {
    const party = s.case.parties.find((p) => p.uuid === partyUuid);
    if (!party || party.kind !== 'Person') return undefined;
    return party.person;
  }) as Person | undefined;

  const employment = person?.employment;
  const isQualifying = isQualifyingProfession(employment?.jobTitle);

  // Auto-expand when the occupation matches; collapse when switching to
  // a non-qualifying applicant. Manual toggles are preserved within the
  // same applicant context (deps don't fire mid-view).
  const [profOpen, setProfOpen] = useState(isQualifying);
  useEffect(() => {
    setProfOpen(isQualifying);
  }, [isQualifying, partyUuid]);

  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Employment</h3>

      <div className="fields applicants-section__grid">
        <RegFieldRow
          fieldId="A41"
          label="Employment status"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="select"
          options={[
            { value: 'Employed', label: 'Employed' },
            { value: 'Self-Employed', label: 'Self-Employed' },
            { value: 'Director', label: 'Director' },
            { value: 'Contractor', label: 'Contractor' },
            { value: 'Retired', label: 'Retired' },
            { value: 'Unemployed', label: 'Unemployed' },
            { value: 'Homemaker', label: 'Homemaker' },
            { value: 'Student', label: 'Student' },
            { value: 'Other', label: 'Other' },
          ]}
        />
        <RegFieldRow
          fieldId="A42"
          label="Employer name"
          partyUuid={partyUuid}
          entityType="Person"
          colSpan="full"
        />
        <RegFieldRow
          fieldId="A43"
          label="Employer address"
          partyUuid={partyUuid}
          entityType="Person"
          colSpan="full"
        />
        <RegFieldRow
          fieldId="A44"
          label="Employer phone"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="tel"
        />
        <RegFieldRow
          fieldId="A45"
          label="Industry"
          partyUuid={partyUuid}
          entityType="Person"
        />
        <RegFieldRow
          fieldId="A46"
          label="Job title"
          partyUuid={partyUuid}
          entityType="Person"
        />
        <RegFieldRow
          fieldId="A47"
          label="Start date"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="date"
        />
        <RegFieldRow
          fieldId="A51"
          label="Basic income"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="money"
        />
        <RegFieldRow
          fieldId="A52"
          label="Income frequency"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="select"
          options={[
            { value: 'Annual', label: 'Annual' },
            { value: 'Monthly', label: 'Monthly' },
            { value: 'Weekly', label: 'Weekly' },
            { value: 'Daily', label: 'Daily' },
          ]}
        />
        <RegFieldRow
          fieldId="A53"
          label="Variable income (annual)"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="money"
        />
        <RegFieldRow
          fieldId="A54"
          label="Variable income guaranteed"
          partyUuid={partyUuid}
          entityType="Person"
          inputType="boolean"
        />
      </div>

      {isQualifying && (
        <NudgeCard
          eyebrow="ELIGIBILITY"
          title="This occupation may qualify for AFIN Professional terms"
          body={
            <>
              <b>{employment?.jobTitle}</b> is on the Professional codeset.
              Capture qualification details below to unlock Premier Professional pricing.
            </>
          }
          actionLabel={profOpen ? 'Section open' : 'Capture details'}
          onAction={() => setProfOpen(true)}
        />
      )}

      <ProfessionalNested
        partyUuid={partyUuid}
        open={profOpen}
        onToggle={() => setProfOpen((o) => !o)}
        autoOpenedByCodeset={isQualifying}
      />
    </GlassCard>
  );
}

function ProfessionalNested({
  partyUuid,
  open,
  onToggle,
  autoOpenedByCodeset,
}: {
  partyUuid: string;
  open: boolean;
  onToggle: () => void;
  autoOpenedByCodeset: boolean;
}) {
  return (
    <section className={`prof-nested ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="prof-nested-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="prof-nested-eyebrow">PROFESSIONAL DETAILS</span>
        <span className="prof-nested-title">Qualification &amp; registering body</span>
        {autoOpenedByCodeset && (
          <span className="prof-nested-badge">Auto-expanded · occupation match</span>
        )}
        <span className={`prof-nested-chev ${open ? 'rotated' : ''}`} aria-hidden="true">
          {CHEVRON}
        </span>
      </button>
      {open && (
        <div className="prof-nested-body">
          <div className="fields applicants-section__grid">
            <RegFieldRow
              fieldId="A59"
              label="Professional qualification"
              partyUuid={partyUuid}
              entityType="Person"
              hint="Pick from the AFIN Professional codeset"
            />
            <RegFieldRow
              fieldId="A62"
              label="Qualification date"
              partyUuid={partyUuid}
              entityType="Person"
              inputType="date"
              hint="Required to evidence eligibility"
            />
            <RegFieldRow
              fieldId="A60"
              label="Professional body"
              partyUuid={partyUuid}
              entityType="Person"
              hint="e.g. SRA, GMC, ICAEW"
            />
            <RegFieldRow
              fieldId="A61"
              label="Membership number"
              partyUuid={partyUuid}
              entityType="Person"
              hint="From the regulator's register"
            />
          </div>
        </div>
      )}
    </section>
  );
}

const CHEVRON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
