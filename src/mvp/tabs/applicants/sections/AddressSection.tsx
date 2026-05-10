import { GlassCard } from '../../../components/atoms';
import RegFieldRow from '../RegFieldRow';

const RESIDENTIAL_OPTIONS = [
  { value: 'Owner', label: 'Owner' },
  { value: 'Mortgaged', label: 'Mortgaged' },
  { value: 'Tenant (Private)', label: 'Tenant (Private)' },
  { value: 'Tenant (Council/HA)', label: 'Tenant (Council/HA)' },
  { value: 'Living with parents', label: 'Living with parents' },
  { value: 'Other', label: 'Other' },
];

export default function AddressSection({ partyUuid }: { partyUuid: string }) {
  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Address</h3>
      <div className="fields applicants-section__grid">
        <RegFieldRow
          fieldId="A23"
          label="Address line 1"
          partyUuid={partyUuid}
          colSpan="full"
        />
        <RegFieldRow
          fieldId="A23.line2"
          label="Address line 2"
          partyUuid={partyUuid}
          colSpan="full"
        />
        <RegFieldRow
          fieldId="A23.city"
          label="City"
          partyUuid={partyUuid}
        />
        <RegFieldRow
          fieldId="A23.postcode"
          label="Postcode"
          partyUuid={partyUuid}
        />
        <RegFieldRow
          fieldId="A24"
          label="Residential status"
          partyUuid={partyUuid}
          inputType="select"
          options={RESIDENTIAL_OPTIONS}
        />
        <RegFieldRow
          fieldId="A25"
          label="Date moved in"
          partyUuid={partyUuid}
          inputType="date"
        />
        <RegFieldRow
          fieldId="A27"
          label="Number of dependants"
          partyUuid={partyUuid}
          inputType="number"
        />
      </div>
    </GlassCard>
  );
}
