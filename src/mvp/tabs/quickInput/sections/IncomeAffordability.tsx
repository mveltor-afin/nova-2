import { useShallow } from 'zustand/react/shallow';
import { useCaseStore, type EntityRef } from '../../../store/caseStore';
import SectionGroup from '../SectionGroup';
import {
  QiTextInput,
  QiSelect,
  QiMoneyInput,
  QiSubhead,
  QiFieldGrid,
} from '../ManualInputs';
import RegFieldRow from '../../applicants/RegFieldRow';
import { phaseMode } from '../../../model/quickInputFields';
import { isFieldPopulated } from '../../../rules/fieldStatus';
import type { Person } from '../../../model/person';
import type { Phase } from '../../../model/case';

const EMPLOYMENT_FIELDS = ['A41', 'A42', 'A46', 'A47', 'A51', 'A52'];
const EXPENDITURE_FIELDS = [
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7',
  'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14',
];

const EXPENDITURE_LABELS: Record<string, { label: string; category: string }> = {
  E1: { label: 'Council Tax', category: 'CouncilTax' },
  E2: { label: 'Utilities', category: 'Utilities' },
  E3: { label: 'Insurance', category: 'Insurance' },
  E4: { label: 'Childcare', category: 'Childcare' },
  E5: { label: 'School / private fees', category: 'SchoolFees' },
  E6: { label: 'Travel & commuting', category: 'Travel' },
  E7: { label: 'Food & housekeeping', category: 'Food' },
  E8: { label: 'Mobile / broadband / TV', category: 'Communications' },
  E9: { label: 'Subscriptions', category: 'Subscriptions' },
  E10: { label: 'Pension contributions', category: 'PensionContributions' },
  E11: { label: 'Maintenance paid', category: 'MaintenancePaid' },
  E12: { label: 'Charitable giving', category: 'CharitableGiving' },
  E13: { label: 'Ground rent / service charge', category: 'GroundRentServiceCharge' },
  E14: { label: 'Other essential', category: 'OtherExpenditure' },
};

export default function IncomeAffordabilitySection() {
  const { caseRef, phase, depositSources, giftLetterHeld } = useCaseStore(
    useShallow((s) => ({
      caseRef: s.case,
      phase: s.case.phase,
      depositSources: s.case.arrangement.depositSources,
      giftLetterHeld: s.case.arrangement.giftLetterHeld,
    })),
  );

  const persons = caseRef.parties
    .filter((p) => p.kind === 'Person')
    .map((p) => (p as { uuid: string; person: Person }));

  const visibleEmployment = EMPLOYMENT_FIELDS.filter(
    (f) => phaseMode(f, phase) !== 'hidden',
  );
  const visibleExpenditure = EXPENDITURE_FIELDS.filter(
    (f) => phaseMode(f, phase) !== 'hidden',
  );

  let total = 0;
  let populated = 0;
  for (const party of persons) {
    for (const f of visibleEmployment) {
      total++;
      if (isFieldPopulated(caseRef, f, party.uuid)) populated++;
    }
  }
  for (const f of visibleExpenditure) {
    total++;
    if (isFieldPopulated(caseRef, f)) populated++;
  }
  // Deposit source (D2) shows at all phases.
  total++;
  if ((depositSources?.length ?? 0) > 0) populated++;
  if (depositSources?.includes('Gift')) {
    total++;
    if (giftLetterHeld) populated++;
  }

  return (
    <SectionGroup
      id="income-affordability"
      name="Income & affordability"
      icon={ICON}
      populated={populated}
      total={total}
    >
      {persons.map((p, i) => (
        <EmploymentBlock
          key={p.uuid}
          uuid={p.uuid}
          person={p.person}
          index={i + 1}
          phase={phase}
        />
      ))}

      <QiSubhead>Source of deposit</QiSubhead>
      <QiFieldGrid columns={2}>
        <QiSelect
          id="d2"
          label="Source of deposit"
          registerIds="D2"
          defaultValue={depositSources?.[0] ?? ''}
          placeholder="Select…"
          options={[
            { value: 'Savings', label: 'Savings' },
            { value: 'Gift', label: 'Gift' },
            { value: 'Sale of Property', label: 'Sale of Property' },
            { value: 'Inheritance', label: 'Inheritance' },
            { value: 'Equity from Other Property', label: 'Equity from Other Property' },
            { value: 'Help to Buy ISA / LISA', label: 'Help to Buy ISA / LISA' },
            { value: 'Bonus / Lump Sum', label: 'Bonus / Lump Sum' },
            { value: 'Other', label: 'Other' },
          ]}
        />
        {depositSources?.includes('Gift') && (
          <QiSelect
            id="d4"
            label="Gift letter held?"
            registerIds="D4"
            defaultValue={giftLetterHeld ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        )}
      </QiFieldGrid>

      {visibleExpenditure.length > 0 && (
        <>
          <QiSubhead>Monthly expenditure (joint household)</QiSubhead>
          <QiFieldGrid columns={2}>
            {visibleExpenditure.map((f) => {
              const meta = EXPENDITURE_LABELS[f];
              const item = caseRef.financialItems.find(
                (i) => i.kind === 'Expenditure' && i.category === meta.category,
              );
              const amount =
                item && item.kind === 'Expenditure' ? item.amount : undefined;
              return (
                <QiMoneyInput
                  key={f}
                  id={`${f.toLowerCase()}-amount`}
                  label={meta.label}
                  registerIds={f}
                  defaultValue={amount}
                  suffix="/ month"
                />
              );
            })}
          </QiFieldGrid>
        </>
      )}
    </SectionGroup>
  );
}

function EmploymentBlock({
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
  const m41 = phaseMode('A41', phase);
  if (m41 === 'hidden') return null;

  return (
    <div className="qi-applicant-block">
      <QiSubhead>
        Applicant {index} · {person.firstName} — Employment & income
      </QiSubhead>

      <QiFieldGrid columns={2}>
        <PhaseField phase={phase} fieldId="A41" partyUuid={uuid}>
          <QiSelect
            id={`a41-${uuid}`}
            label="Employment status"
            registerIds="A41"
            defaultValue={person.employment?.employmentStatus ?? 'Employed'}
            entityRef={ref}
            commitFieldId="A41"
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
        </PhaseField>
        <PhaseField phase={phase} fieldId="A42" partyUuid={uuid}>
          <QiTextInput
            id={`a42-${uuid}`}
            label="Employer name"
            registerIds="A42"
            defaultValue={person.employment?.employerName ?? ''}
            entityRef={ref}
            commitFieldId="A42"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={2}>
        <PhaseField phase={phase} fieldId="A46" partyUuid={uuid}>
          <QiTextInput
            id={`a46-${uuid}`}
            label="Job title"
            registerIds="A46"
            defaultValue={person.employment?.jobTitle ?? ''}
            entityRef={ref}
            commitFieldId="A46"
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A47" partyUuid={uuid}>
          <QiTextInput
            id={`a47-${uuid}`}
            label="Start date"
            registerIds="A47"
            type="date"
            defaultValue={person.employment?.startDate ?? ''}
            entityRef={ref}
            commitFieldId="A47"
          />
        </PhaseField>
      </QiFieldGrid>

      <QiFieldGrid columns={2}>
        <PhaseField phase={phase} fieldId="A51" partyUuid={uuid}>
          <QiMoneyInput
            id={`a51-${uuid}`}
            label="Basic income"
            registerIds="A51"
            defaultValue={person.employment?.basicIncome}
            suffix="/ month"
            entityRef={ref}
            commitFieldId="A51"
          />
        </PhaseField>
        <PhaseField phase={phase} fieldId="A52" partyUuid={uuid}>
          <QiSelect
            id={`a52-${uuid}`}
            label="Frequency"
            registerIds="A52"
            defaultValue={person.employment?.basicIncomeFrequency ?? 'Monthly'}
            entityRef={ref}
            commitFieldId="A52"
            options={[
              { value: 'Annual', label: 'Annual' },
              { value: 'Monthly', label: 'Monthly' },
              { value: 'Weekly', label: 'Weekly' },
              { value: 'Daily', label: 'Daily' },
            ]}
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
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
