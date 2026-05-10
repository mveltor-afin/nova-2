import { useShallow } from 'zustand/react/shallow';
import { useCaseStore, type EntityRef } from '../../../store/caseStore';
import SectionGroup from '../SectionGroup';
import {
  QiTextInput,
  QiSelect,
  QiSubhead,
  QiFieldGrid,
} from '../ManualInputs';
import RegFieldRow from '../../applicants/RegFieldRow';
import { phaseMode } from '../../../model/quickInputFields';
import { isFieldPopulated } from '../../../rules/fieldStatus';
import type { Person } from '../../../model/person';
import type { Phase } from '../../../model/case';

const APPLICANT_FIELDS = [
  'A1', 'A2', 'A4', 'A6', 'A10', 'A11', 'A13', 'A19', 'A21',
  'A23', 'A23.city', 'A23.postcode', 'A24', 'A25',
];

export default function ApplicantsSection() {
  const { caseRef, phase } = useCaseStore(
    useShallow((s) => ({ caseRef: s.case, phase: s.case.phase })),
  );

  const persons = caseRef.parties
    .filter((p) => p.kind === 'Person')
    .map((p) => (p as { uuid: string; person: Person }));

  const visible = APPLICANT_FIELDS.filter((f) => phaseMode(f, phase) !== 'hidden');
  let total = 0;
  let populated = 0;
  for (const party of persons) {
    for (const f of visible) {
      total++;
      if (isFieldPopulated(caseRef, f, party.uuid)) populated++;
    }
  }

  return (
    <SectionGroup
      id="applicants"
      name="Applicants"
      icon={ICON}
      populated={populated}
      total={total}
    >
      {persons.map((p, i) => (
        <ApplicantBlock
          key={p.uuid}
          uuid={p.uuid}
          person={p.person}
          index={i + 1}
          phase={phase}
        />
      ))}
    </SectionGroup>
  );
}

function ApplicantBlock({
  uuid,
  person,
  index,
  phase,
}: {
  uuid: string;
  person: Person;
  index: number;
  phase: Phase;
}) {
  const ref: EntityRef = { entityType: 'Person', entityId: uuid };

  return (
    <div className="qi-applicant-block">
      <QiSubhead>
        Applicant {index} · {person.firstName} {person.lastName}
      </QiSubhead>

      <QiFieldGrid columns={3}>
        <PhaseField phase={phase} fieldId="A1" partyUuid={uuid}>
          <QiSelect
            id={`a1-${uuid}`}
            label="Title"
            registerIds="A1"
            defaultValue={person.title}
            entityRef={ref}
            commitFieldId="A1"
            options={[
              { value: 'Mr', label: 'Mr' },
              { value: 'Mrs', label: 'Mrs' },
              { value: 'Miss', label: 'Miss' },
              { value: 'Ms', label: 'Ms' },
              { value: 'Mx', label: 'Mx' },
              { value: 'Dr', label: 'Dr' },
            ]}
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A2" partyUuid={uuid}>
          <QiTextInput
            id={`a2-${uuid}`}
            label="First name"
            registerIds="A2"
            defaultValue={person.firstName}
            entityRef={ref}
            commitFieldId="A2"
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A4" partyUuid={uuid}>
          <QiTextInput
            id={`a4-${uuid}`}
            label="Last name"
            registerIds="A4"
            defaultValue={person.lastName}
            entityRef={ref}
            commitFieldId="A4"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={3}>
        <PhaseField phase={phase} fieldId="A6" partyUuid={uuid}>
          <QiTextInput
            id={`a6-${uuid}`}
            label="Date of birth"
            registerIds="A6"
            type="date"
            defaultValue={person.dateOfBirth}
            entityRef={ref}
            commitFieldId="A6"
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A10" partyUuid={uuid}>
          <QiSelect
            id={`a10-${uuid}`}
            label="Marital status"
            registerIds="A10"
            defaultValue={person.maritalStatus}
            entityRef={ref}
            commitFieldId="A10"
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Civil Partnership', label: 'Civil Partnership' },
              { value: 'Divorced', label: 'Divorced' },
              { value: 'Widowed', label: 'Widowed' },
              { value: 'Separated', label: 'Separated' },
              { value: 'Cohabiting', label: 'Cohabiting' },
            ]}
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A11" partyUuid={uuid}>
          <QiTextInput
            id={`a11-${uuid}`}
            label="Nationality"
            registerIds="A11"
            defaultValue={person.nationality}
            entityRef={ref}
            commitFieldId="A11"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={2}>
        <PhaseField phase={phase} fieldId="A13" partyUuid={uuid}>
          <QiTextInput
            id={`a13-${uuid}`}
            label="Country of residence"
            registerIds="A13"
            defaultValue={person.countryOfResidence}
            entityRef={ref}
            commitFieldId="A13"
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A19" partyUuid={uuid}>
          <QiTextInput
            id={`a19-${uuid}`}
            label="Mobile"
            registerIds="A19"
            type="tel"
            defaultValue={person.mobile}
            entityRef={ref}
            commitFieldId="A19"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={1}>
        <PhaseField phase={phase} fieldId="A21" partyUuid={uuid}>
          <QiTextInput
            id={`a21-${uuid}`}
            label="Email"
            registerIds="A21"
            type="email"
            defaultValue={person.email}
            entityRef={ref}
            commitFieldId="A21"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={1}>
        <PhaseField phase={phase} fieldId="A23" partyUuid={uuid}>
          <QiTextInput
            id={`a23-${uuid}`}
            label="Current address (line 1)"
            registerIds="A23"
            defaultValue={person.currentAddress?.line1 ?? ''}
            entityRef={ref}
            commitFieldId="A23"
          />
        </PhaseField>
      </QiFieldGrid>
      <QiFieldGrid columns={2}>
        <PhaseField phase={phase} fieldId="A23.city" partyUuid={uuid}>
          <QiTextInput
            id={`a23-city-${uuid}`}
            label="City"
            registerIds="A23"
            defaultValue={person.currentAddress?.city ?? ''}
            entityRef={ref}
            commitFieldId="A23.city"
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A23.postcode" partyUuid={uuid}>
          <QiTextInput
            id={`a23-pc-${uuid}`}
            label="Postcode"
            registerIds="A23"
            defaultValue={person.currentAddress?.postcode ?? ''}
            entityRef={ref}
            commitFieldId="A23.postcode"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={2}>
        <PhaseField phase={phase} fieldId="A24" partyUuid={uuid}>
          <QiSelect
            id={`a24-${uuid}`}
            label="Residential status"
            registerIds="A24"
            defaultValue={person.residentialStatus}
            entityRef={ref}
            commitFieldId="A24"
            options={[
              { value: 'Owner', label: 'Owner' },
              { value: 'Mortgaged', label: 'Mortgaged' },
              { value: 'Tenant (Private)', label: 'Tenant (Private)' },
              { value: 'Tenant (Council/HA)', label: 'Tenant (Council/HA)' },
              { value: 'Living with parents', label: 'Living with parents' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A25" partyUuid={uuid}>
          <QiTextInput
            id={`a25-${uuid}`}
            label="Moved-in date"
            registerIds="A25"
            type="date"
            defaultValue={person.movedInDate}
            entityRef={ref}
            commitFieldId="A25"
          />
        </PhaseField>
      </QiFieldGrid>
    </div>
  );
}

function PhaseField({
  phase,
  fieldId,
  partyUuid,
  children,
}: {
  phase: Phase;
  fieldId: string;
  partyUuid?: string;
  children: React.ReactNode;
}) {
  const mode = phaseMode(fieldId, phase);
  if (mode === 'hidden') return null;
  if (mode === 'locked') {
    return (
      <RegFieldRow
        fieldId={fieldId.split('.')[0]}
        label={fieldId}
        partyUuid={partyUuid}
        entityType="Person"
        forceState="locked"
      />
    );
  }
  return <>{children}</>;
}

const ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
