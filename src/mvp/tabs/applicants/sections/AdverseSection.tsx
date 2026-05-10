import { GlassCard } from '../../../components/atoms';
import RegFieldRow from '../RegFieldRow';

/**
 * Adverse history sub-tab — broker-asserted booleans (A30/A32/A34/
 * A36/A38/A39/A40) plus C4/C5 consents. Step 19b made them editable
 * via `setManualField`; the underlying writers live on
 * `personFieldMap` and stamp Manual provenance.
 */
export default function AdverseSection({ partyUuid }: { partyUuid: string }) {
  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Adverse history</h3>
      <p className="section-sub adverse-note">
        Broker-asserted only. Adverse-history fields are never auto-extracted —
        the broker confirms each row directly with the applicant.
      </p>

      <div className="fields applicants-section__grid">
        <RegFieldRow
          fieldId="A30"
          label="Has CCJ"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A32"
          label="Has defaults"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A34"
          label="Bankruptcy"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A36"
          label="IVA / DMP"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A38"
          label="Repossession"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A39"
          label="Mortgage arrears"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="A40"
          label="Payday loans (last 12 mo)"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="C4"
          label="Credit search consent"
          partyUuid={partyUuid}
          inputType="boolean"
        />
        <RegFieldRow
          fieldId="C5"
          label="Adverse sharing consent"
          partyUuid={partyUuid}
          inputType="boolean"
          colSpan="full"
        />
      </div>
    </GlassCard>
  );
}
