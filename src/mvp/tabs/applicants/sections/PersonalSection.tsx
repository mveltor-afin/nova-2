import { GlassCard } from '../../../components/atoms';
import RegFieldRow from '../RegFieldRow';

const TITLE_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Mx', label: 'Mx' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Other', label: 'Other' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const MARITAL_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Civil Partnership', label: 'Civil Partnership' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Separated', label: 'Separated' },
  { value: 'Cohabiting', label: 'Cohabiting' },
];

const RESIDENCY_OPTIONS = [
  { value: 'British Citizen', label: 'British Citizen' },
  { value: 'Settled (ILR)', label: 'Settled (ILR)' },
  { value: 'Pre-Settled', label: 'Pre-Settled' },
  { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
  { value: 'Other Visa', label: 'Other Visa' },
  { value: 'Non-Resident', label: 'Non-Resident' },
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'SMS', label: 'SMS' },
  { value: 'Post', label: 'Post' },
];

export default function PersonalSection({ partyUuid }: { partyUuid: string }) {
  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Personal</h3>
      <div className="fields applicants-section__grid">
        <RegFieldRow
          fieldId="A1"
          label="Title"
          partyUuid={partyUuid}
          inputType="select"
          options={TITLE_OPTIONS}
        />
        <RegFieldRow
          fieldId="A9"
          label="Gender"
          partyUuid={partyUuid}
          inputType="select"
          options={GENDER_OPTIONS}
        />
        <RegFieldRow fieldId="A2" label="First name" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A4" label="Last name" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A3" label="Middle names" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A5" label="Previous names" partyUuid={partyUuid} />
        <RegFieldRow
          fieldId="A6"
          label="Date of birth"
          partyUuid={partyUuid}
          inputType="date"
        />
        <RegFieldRow
          fieldId="A10"
          label="Marital status"
          partyUuid={partyUuid}
          inputType="select"
          options={MARITAL_OPTIONS}
        />
        <RegFieldRow fieldId="A7" label="Place of birth" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A8" label="Country of birth" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A11" label="Nationality" partyUuid={partyUuid} />
        <RegFieldRow fieldId="A13" label="Country of residence" partyUuid={partyUuid} />
        <RegFieldRow
          fieldId="A14"
          label="UK residency status"
          partyUuid={partyUuid}
          inputType="select"
          options={RESIDENCY_OPTIONS}
        />
        <RegFieldRow fieldId="A15" label="NI number" partyUuid={partyUuid} />
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
        <RegFieldRow
          fieldId="A22"
          label="Preferred contact method"
          partyUuid={partyUuid}
          inputType="select"
          options={CONTACT_METHOD_OPTIONS}
          colSpan="full"
        />
      </div>
    </GlassCard>
  );
}
