import { useShallow } from 'zustand/react/shallow';
import { useCaseStore, type EntityRef } from '../../store/caseStore';
import { countGroup } from '../../rules/fieldStatus';
import ManualEntryGroup from './ManualEntryGroup';
import {
  QiTextInput,
  QiSelect,
  QiMoneyInput,
  QiSubhead,
  QiFieldGrid,
} from './ManualInputs';
import type { Case } from '../../model/case';
import type { Person } from '../../model/person';

// Step 15 — every Qi* input takes an `entityRef` + `commitFieldId`
// so it can dispatch `setManualField` on blur. Helpers below keep the
// call sites tidy.
function personRef(p: Person): EntityRef {
  return { entityType: 'Person', entityId: p.uuid };
}

/**
 * The right column of the two-mode entry block — four collapsible
 * groups stacked vertically. Each group declares its expected
 * register IDs so the drain chip stays in sync as values are
 * populated by document extraction or manual entry.
 */
export default function ManualEntry() {
  const caseState = useCaseStore(useShallow((s) => s.case));

  const summaries = computeSummaries(caseState);
  const persons = caseState.parties
    .filter((p) => p.kind === 'Person')
    .map((p) => (p as { person: Person }).person);

  return (
    <div className="qi-manual-stack">
      <ManualEntryGroup
        id="applicants"
        name="Applicant details"
        icon={ICON_USER}
        summary={summaries.applicants}
        defaultOpen={true}
      >
        <ApplicantDetails persons={persons} />
      </ManualEntryGroup>

      <ManualEntryGroup
        id="property-loan"
        name="Property & loan"
        icon={ICON_HOME}
        summary={summaries.property}
      >
        <PropertyAndLoan caseState={caseState} />
      </ManualEntryGroup>

      <ManualEntryGroup
        id="employment-income"
        name="Employment & income"
        icon={ICON_BRIEFCASE}
        summary={summaries.employment}
      >
        <EmploymentAndIncome persons={persons} caseState={caseState} />
      </ManualEntryGroup>

      <ManualEntryGroup
        id="third-parties"
        name="Solicitor & third parties"
        icon={ICON_USERS}
        summary={summaries.thirdParties}
      >
        <ThirdPartiesGroup caseState={caseState} />
      </ManualEntryGroup>
    </div>
  );
}

// ============================================================
// Group 1 · Applicant details
// A1, A2, A5, A11, A14, A16, A17, A19, A24
// ============================================================

function ApplicantDetails({ persons }: { persons: Person[] }) {
  return (
    <>
      {persons.map((p, i) => (
        <div key={p.uuid} className="qi-applicant-block">
          <QiSubhead>
            Applicant {i + 1} · {p.firstName} {p.lastName}
          </QiSubhead>

          {/* A1: Title */}
          <QiFieldGrid columns={3}>
            <QiSelect
              id={`a1-${p.uuid}`}
              label="Title"
              registerIds="A1"
              defaultValue={p.title}
              entityRef={personRef(p)}
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
            {/* A2: First name + Last name */}
            <QiTextInput
              id={`a2-first-${p.uuid}`}
              label="First name"
              registerIds="A2"
              defaultValue={p.firstName}
              entityRef={personRef(p)}
              commitFieldId="A2"
            />
            <QiTextInput
              id={`a4-last-${p.uuid}`}
              label="Last name"
              registerIds="A4"
              defaultValue={p.lastName}
              entityRef={personRef(p)}
              commitFieldId="A4"
            />
          </QiFieldGrid>

          <QiFieldGrid columns={2}>
            {/* A5: Previous names */}
            <QiTextInput
              id={`a5-${p.uuid}`}
              label="Previous names"
              registerIds="A5"
              defaultValue={p.previousNames?.[0] ?? ''}
              placeholder="Maiden, deed-poll…"
              entityRef={personRef(p)}
              commitFieldId="A5"
            />
            {/* A11: Nationality */}
            <QiTextInput
              id={`a11-${p.uuid}`}
              label="Nationality"
              registerIds="A11"
              defaultValue={p.nationality}
              entityRef={personRef(p)}
              commitFieldId="A11"
            />
          </QiFieldGrid>

          <QiFieldGrid columns={2}>
            {/* A16-A17: Passport */}
            <QiTextInput
              id={`a16-${p.uuid}`}
              label="Passport number"
              registerIds="A16"
              defaultValue={p.passportNumber ?? ''}
              entityRef={personRef(p)}
              commitFieldId="A16"
            />
            <QiTextInput
              id={`a17-${p.uuid}`}
              label="Passport expiry"
              registerIds="A17"
              type="date"
              defaultValue={p.passportExpiry ?? ''}
              entityRef={personRef(p)}
              commitFieldId="A17"
            />
          </QiFieldGrid>

          <QiFieldGrid columns={2}>
            {/* A19: Mobile + visa-status (A14) shown when non-British */}
            <QiTextInput
              id={`a19-${p.uuid}`}
              label="Mobile"
              registerIds="A19"
              type="tel"
              defaultValue={p.mobile}
              entityRef={personRef(p)}
              commitFieldId="A19"
            />
            {/* A14: Visa / residency status — surfaces conditionally
                  (e.g. when nationality ≠ "British"). The brief calls this
                  out as "A19 (visa where applicable)" — we render here. */}
            <QiSelect
              id={`a14-${p.uuid}`}
              label="UK residency status"
              registerIds="A14"
              defaultValue={p.ukResidencyStatus ?? 'British Citizen'}
              entityRef={personRef(p)}
              commitFieldId="A14"
              options={[
                { value: 'British Citizen', label: 'British Citizen' },
                { value: 'Settled (ILR)', label: 'Settled (ILR)' },
                { value: 'Pre-Settled', label: 'Pre-Settled' },
                { value: 'Skilled Worker Visa', label: 'Skilled Worker Visa' },
                { value: 'Other Visa', label: 'Other Visa' },
                { value: 'Non-Resident', label: 'Non-Resident' },
              ]}
            />
          </QiFieldGrid>

          {/* A24: Residential status */}
          <QiFieldGrid columns={1}>
            <QiSelect
              id={`a24-${p.uuid}`}
              label="Residential status at current address"
              registerIds="A24"
              defaultValue={p.residentialStatus}
              entityRef={personRef(p)}
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
          </QiFieldGrid>
        </div>
      ))}
    </>
  );
}

// ============================================================
// Group 2 · Property & loan
// P1, P5, P9, P12, M1, M5  (M6 loan amount, M7 term, M17 broker fee +
// M18/M19 fee handling live on the shared Configuration Strip mounted
// at the top of the Quick Input page — see Step 14)
// ============================================================

function PropertyAndLoan({ caseState }: { caseState: Case }) {
  const c = caseState.collaterals[0];
  const arr = caseState.arrangement;
  const colRef: EntityRef | undefined = c
    ? { entityType: 'Collateral', entityId: c.uuid }
    : undefined;
  const arrRef: EntityRef = { entityType: 'Arrangement', entityId: arr.uuid };

  return (
    <>
      <QiSubhead>Security · {c?.address.line1 ?? '—'}</QiSubhead>

      {/* P1: Property address */}
      <QiFieldGrid columns={1}>
        <QiTextInput
          id="p1"
          label="Property address (line 1)"
          registerIds="P1"
          defaultValue={c?.address.line1 ?? ''}
          entityRef={colRef}
          commitFieldId="P1"
        />
      </QiFieldGrid>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="p1-city"
          label="City"
          registerIds="P1"
          defaultValue={c?.address.city ?? ''}
          entityRef={colRef}
          commitFieldId="P1.city"
        />
        <QiTextInput
          id="p1-postcode"
          label="Postcode"
          registerIds="P1"
          defaultValue={c?.address.postcode ?? ''}
          entityRef={colRef}
          commitFieldId="P1.postcode"
        />
      </QiFieldGrid>

      <QiFieldGrid columns={3}>
        {/* P5: Lease years remaining */}
        <QiTextInput
          id="p5"
          label="Lease years remaining"
          registerIds="P5"
          type="number"
          defaultValue={c?.leaseYearsRemaining ?? ''}
          hint={c?.tenure !== 'Freehold' ? undefined : 'Freehold — leave blank'}
          entityRef={colRef}
          commitFieldId="P5"
        />
        {/* P9: Bedrooms */}
        <QiTextInput
          id="p9"
          label="Bedrooms"
          registerIds="P9"
          type="number"
          defaultValue={c?.bedrooms ?? ''}
          entityRef={colRef}
          commitFieldId="P9"
        />
        {/* P12: Flood risk */}
        <QiSelect
          id="p12"
          label="Flood risk"
          registerIds="P12"
          defaultValue={c?.floodRisk ?? ''}
          placeholder="Select…"
          entityRef={colRef}
          commitFieldId="P12"
          options={[
            { value: 'None', label: 'None' },
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
          ]}
        />
      </QiFieldGrid>

      <QiSubhead>Mortgage</QiSubhead>

      <QiFieldGrid columns={2}>
        {/* M1: Arrangement reference (read-only — Afin allocates this) */}
        <QiTextInput
          id="m1"
          label="Arrangement reference"
          registerIds="M1"
          defaultValue={arr.arrangementReference}
          hint="System-allocated"
          entityRef={arrRef}
          commitFieldId="M1"
        />
        {/* M5: Repayment type */}
        <QiSelect
          id="m5"
          label="Repayment type"
          registerIds="M5"
          defaultValue={arr.repaymentType}
          entityRef={arrRef}
          commitFieldId="M5"
          options={[
            { value: 'Capital & Interest', label: 'Capital & Interest' },
            { value: 'Interest Only', label: 'Interest Only' },
            { value: 'Part-and-Part', label: 'Part-and-Part' },
          ]}
        />
      </QiFieldGrid>
    </>
  );
}

// ============================================================
// Group 3 · Employment & income (incl. expenditure E1–E14)
// A41-A44 + E1–E14
// ============================================================

function EmploymentAndIncome({
  persons,
  caseState,
}: {
  persons: Person[];
  caseState: Case;
}) {
  return (
    <>
      {persons.map((p, i) => (
        <div key={p.uuid} className="qi-applicant-block">
          <QiSubhead>
            Applicant {i + 1} · {p.firstName} {p.lastName}
          </QiSubhead>

          <QiFieldGrid columns={2}>
            {/* A41: Employment status */}
            <QiSelect
              id={`a41-${p.uuid}`}
              label="Employment status"
              registerIds="A41"
              defaultValue={p.employment?.employmentStatus ?? 'Employed'}
              entityRef={personRef(p)}
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
            {/* A42: Employer name */}
            <QiTextInput
              id={`a42-${p.uuid}`}
              label="Employer name"
              registerIds="A42"
              defaultValue={p.employment?.employerName ?? ''}
              entityRef={personRef(p)}
              commitFieldId="A42"
            />
          </QiFieldGrid>

          <QiFieldGrid columns={2}>
            {/* A43: Employer address */}
            <QiTextInput
              id={`a43-${p.uuid}`}
              label="Employer address"
              registerIds="A43"
              defaultValue={p.employment?.employerAddress?.line1 ?? ''}
              entityRef={personRef(p)}
              commitFieldId="A43"
            />
            {/* A44: Employer phone */}
            <QiTextInput
              id={`a44-${p.uuid}`}
              label="Employer phone"
              registerIds="A44"
              type="tel"
              defaultValue={p.employment?.employerPhone ?? ''}
              entityRef={personRef(p)}
              commitFieldId="A44"
            />
          </QiFieldGrid>
        </div>
      ))}

      {/* E1–E14: Expenditure (joint household) */}
      <QiSubhead>Monthly expenditure (joint household)</QiSubhead>
      <QiFieldGrid columns={2}>
        <ExpenditureRow caseState={caseState} fieldId="E1" label="Council Tax" category="CouncilTax" />
        <ExpenditureRow caseState={caseState} fieldId="E2" label="Utilities" category="Utilities" />
        <ExpenditureRow caseState={caseState} fieldId="E3" label="Insurance" category="Insurance" />
        <ExpenditureRow caseState={caseState} fieldId="E4" label="Childcare" category="Childcare" />
        <ExpenditureRow caseState={caseState} fieldId="E5" label="School / private fees" category="SchoolFees" />
        <ExpenditureRow caseState={caseState} fieldId="E6" label="Travel & commuting" category="Travel" />
        <ExpenditureRow caseState={caseState} fieldId="E7" label="Food & housekeeping" category="Food" />
        <ExpenditureRow caseState={caseState} fieldId="E8" label="Mobile / broadband / TV" category="Communications" />
        <ExpenditureRow caseState={caseState} fieldId="E9" label="Subscriptions" category="Subscriptions" />
        <ExpenditureRow caseState={caseState} fieldId="E10" label="Pension contributions (post-tax)" category="PensionContributions" />
        <ExpenditureRow caseState={caseState} fieldId="E11" label="Maintenance paid" category="MaintenancePaid" />
        <ExpenditureRow caseState={caseState} fieldId="E12" label="Charitable giving" category="CharitableGiving" />
        <ExpenditureRow caseState={caseState} fieldId="E13" label="Ground rent / service charge" category="GroundRentServiceCharge" />
        <ExpenditureRow caseState={caseState} fieldId="E14" label="Other essential expenditure" category="OtherExpenditure" />
      </QiFieldGrid>
    </>
  );
}

function ExpenditureRow({
  caseState,
  fieldId,
  label,
  category,
}: {
  caseState: Case;
  fieldId: string;
  label: string;
  category: string;
}) {
  const item = caseState.financialItems.find(
    (i) => i.kind === 'Expenditure' && i.category === category,
  );
  const amount =
    item && item.kind === 'Expenditure' ? item.amount : undefined;
  return (
    <QiMoneyInput
      id={`${fieldId.toLowerCase()}-amount`}
      label={label}
      registerIds={fieldId}
      defaultValue={amount}
      suffix="/ month"
    />
  );
}

// ============================================================
// Group 4 · Solicitor & third parties
// T2 (Surveyor), T3 (Estate agent)
// ============================================================

function ThirdPartiesGroup({ caseState }: { caseState: Case }) {
  const surveyor = caseState.thirdParties.find((tp) => tp.role === 'Surveyor');
  const estateAgent = caseState.thirdParties.find((tp) => tp.role === 'EstateAgent');

  return (
    <>
      {/* T2: Surveyor */}
      <QiSubhead>Surveyor (T2)</QiSubhead>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t2-firm"
          label="Firm"
          registerIds="T2"
          defaultValue={surveyor?.name ?? ''}
          placeholder="Add when survey is booked"
        />
        <QiTextInput
          id="t2-contact"
          label="Contact name"
          registerIds="T2"
          defaultValue={surveyor?.contactName ?? ''}
        />
      </QiFieldGrid>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t2-email"
          label="Email"
          registerIds="T2"
          type="email"
          defaultValue={surveyor?.email ?? ''}
        />
        <QiTextInput
          id="t2-phone"
          label="Phone"
          registerIds="T2"
          type="tel"
          defaultValue={surveyor?.phone ?? ''}
        />
      </QiFieldGrid>

      {/* T3: Estate agent */}
      <QiSubhead>Estate agent (T3)</QiSubhead>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t3-firm"
          label="Firm"
          registerIds="T3"
          defaultValue={estateAgent?.name ?? ''}
        />
        <QiTextInput
          id="t3-contact"
          label="Contact name"
          registerIds="T3"
          defaultValue={estateAgent?.contactName ?? ''}
        />
      </QiFieldGrid>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t3-email"
          label="Email"
          registerIds="T3"
          type="email"
          defaultValue={estateAgent?.email ?? ''}
        />
        <QiTextInput
          id="t3-phone"
          label="Phone"
          registerIds="T3"
          type="tel"
          defaultValue={estateAgent?.phone ?? ''}
        />
      </QiFieldGrid>
    </>
  );
}

// ============================================================
// Drain summaries — declared inline so the field lists stay close
// to the inputs they describe.
// ============================================================

function computeSummaries(c: Case) {
  return {
    applicants: countGroup(c, [
      { fieldId: 'A1', partyScoped: true },
      { fieldId: 'A2', partyScoped: true },
      { fieldId: 'A4', partyScoped: true },
      { fieldId: 'A5', partyScoped: true },
      { fieldId: 'A11', partyScoped: true },
      { fieldId: 'A14', partyScoped: true },
      { fieldId: 'A16', partyScoped: true },
      { fieldId: 'A17', partyScoped: true },
      { fieldId: 'A19', partyScoped: true },
      { fieldId: 'A24', partyScoped: true },
    ]),
    property: countGroup(c, [
      { fieldId: 'P1' },
      { fieldId: 'P5' },
      { fieldId: 'P9' },
      { fieldId: 'P12' },
      { fieldId: 'M1' },
      { fieldId: 'M5' },
      // Strip-owned fields contribute to the group's drain count.
      // P16 property value + D1 deposit are the new primary inputs
      // (Step 14b — M6 loan now derived, no longer authored). M7 term +
      // M18/M19 handling defaults read populated; M17 broker fee reads
      // as missing at £0 (per existing convention).
      { fieldId: 'P16' },
      { fieldId: 'D1' },
      { fieldId: 'M7' },
      { fieldId: 'M17' },
      { fieldId: 'M18' },
      { fieldId: 'M19' },
    ]),
    employment: countGroup(c, [
      { fieldId: 'A41', partyScoped: true },
      { fieldId: 'A42', partyScoped: true },
      { fieldId: 'A43', partyScoped: true },
      { fieldId: 'A44', partyScoped: true },
      // E1–E14 — joint household
      { fieldId: 'E1' },
      { fieldId: 'E2' },
      { fieldId: 'E3' },
      { fieldId: 'E4' },
      { fieldId: 'E5' },
      { fieldId: 'E6' },
      { fieldId: 'E7' },
      { fieldId: 'E8' },
      { fieldId: 'E9' },
      { fieldId: 'E10' },
      { fieldId: 'E11' },
      { fieldId: 'E12' },
      { fieldId: 'E13' },
      { fieldId: 'E14' },
    ]),
    thirdParties: countGroup(c, [
      { fieldId: 'T2' },
      { fieldId: 'T3' },
    ]),
  };
}

// ============================================================
// Icons (lucide-style 14px stroke)
// ============================================================

const ICON_USER = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ICON_HOME = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ICON_BRIEFCASE = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ICON_USERS = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
