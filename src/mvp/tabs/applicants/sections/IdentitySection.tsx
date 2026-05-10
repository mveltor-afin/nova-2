import { GlassCard } from '../../../components/atoms';
import RegFieldRow from '../RegFieldRow';
import { useCaseStore } from '../../../store/caseStore';
import type { Person } from '../../../model/person';

const RESIDENCY_OPTIONS = [
  { value: 'British Citizen', label: 'British Citizen' },
  { value: 'Settled (ILR)', label: 'Settled (ILR)' },
  { value: 'Pre-Settled', label: 'Pre-Settled' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Other Visa', label: 'Other Visa' },
  { value: 'Non-Resident', label: 'Non-Resident' },
];

export default function IdentitySection({ partyUuid }: { partyUuid: string }) {
  const person = useCaseStore((s) => {
    const party = s.case.parties.find((p) => p.uuid === partyUuid);
    if (!party || party.kind !== 'Person') return undefined;
    return party.person;
  }) as Person | undefined;

  const isUKNational = person?.nationality === 'British';

  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Identity</h3>
      <div className="fields applicants-section__grid">
        <RegFieldRow
          fieldId="A19"
          label="Mobile"
          partyUuid={partyUuid}
          inputType="tel"
        />
        <RegFieldRow
          fieldId="A21"
          label="Email"
          partyUuid={partyUuid}
          inputType="email"
        />
        <RegFieldRow fieldId="A15" label="NI number" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A16" label="Passport number" partyUuid={partyUuid} />
        <RegFieldRow
          fieldId="A17"
          label="Passport expiry"
          partyUuid={partyUuid}
          inputType="date"
        />
        <RegFieldRow fieldId="A11" label="Nationality" partyUuid={partyUuid} />

        {!isUKNational && (
          <RegFieldRow
            fieldId="A14"
            label="UK residency status"
            labelSuffix="— visa block"
            partyUuid={partyUuid}
            inputType="select"
            options={RESIDENCY_OPTIONS}
            colSpan="full"
          />
        )}
      </div>
    </GlassCard>
  );
}
