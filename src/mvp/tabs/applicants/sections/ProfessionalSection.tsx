import { GlassCard } from '../../../components/atoms';
import RegFieldRow from '../RegFieldRow';

/**
 * Professional sub-tab (overflow). The same A57–A62 fields the
 * Employment section nests inline — surfaced here so the broker can
 * always reach them, even when the inline nudge hasn't fired.
 */
export default function ProfessionalSection({ partyUuid }: { partyUuid: string }) {
  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Professional</h3>
      <p className="section-sub">
        These fields drive Premier Professional eligibility. The primary
        entry path is the inline expansion under Employment when the
        occupation matches the codeset; this overflow surfaces them
        unconditionally.
      </p>
      <div className="fields applicants-section__grid">
        <RegFieldRow
          fieldId="A57"
          label="Expected retirement age"
          partyUuid={partyUuid}
          inputType="number"
        />
        <RegFieldRow
          fieldId="A58"
          label="Within 10 years of retirement"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A59"
          label="Professional category"
          partyUuid={partyUuid}
        />
        <RegFieldRow
          fieldId="A60"
          label="Professional body"
          partyUuid={partyUuid}
        />
        <RegFieldRow
          fieldId="A61"
          label="Membership number"
          partyUuid={partyUuid}
        />
        <RegFieldRow
          fieldId="A62"
          label="Qualification date"
          partyUuid={partyUuid}
          inputType="date"
        />
      </div>
    </GlassCard>
  );
}
