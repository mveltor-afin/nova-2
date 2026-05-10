import { useShallow } from 'zustand/react/shallow';
import { useCaseStore, type EntityRef } from '../../../store/caseStore';
import ConfigurationStrip from '../../../components/ConfigurationStrip';
import ProductPicker from '../ProductPicker';
import SectionGroup from '../SectionGroup';
import { QiSelect, QiTextInput, QiFieldGrid } from '../ManualInputs';
import RegFieldRow from '../../applicants/RegFieldRow';
import { phaseMode } from '../../../model/quickInputFields';
import { isFieldPopulated } from '../../../rules/fieldStatus';

/**
 * Loan group — Configuration Strip first, then product picker and the
 * remaining loan-shape fields. Drain count includes the strip's six
 * controls (P16, D1, M7, M17, M18, M19), the picker (M4), repayment
 * type (M5), and loan purpose (M2). IO vehicle is conditional and
 * doesn't gate the count when hidden.
 */
const LOAN_FIELDS = ['P16', 'D1', 'M7', 'M17', 'M18', 'M19', 'M4', 'M5', 'M2'];

export default function LoanSection({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { caseRef, repaymentType, applicationType, selectedCode, phase, arrangementId } =
    useCaseStore(
      useShallow((s) => ({
        caseRef: s.case,
        repaymentType: s.case.arrangement.repaymentType,
        applicationType: s.case.arrangement.applicationType,
        selectedCode: s.case.arrangement.selectedProductCode,
        phase: s.case.phase,
        arrangementId: s.case.arrangement.uuid,
      })),
    );

  const arrRef: EntityRef = { entityType: 'Arrangement', entityId: arrangementId };

  let populated = 0;
  for (const f of LOAN_FIELDS) {
    if (f === 'M4') {
      if (selectedCode) populated++;
    } else if (isFieldPopulated(caseRef, f)) {
      populated++;
    }
  }
  const showIOVehicle = repaymentType === 'Interest Only';
  const total = LOAN_FIELDS.length + (showIOVehicle ? 1 : 0);
  if (showIOVehicle && (caseRef.arrangement.partAndPartInterestOnlyAmount ?? 0) > 0) {
    populated++;
  }

  const m5Mode = phaseMode('M5', phase);
  const m2Mode = phaseMode('M2', phase);

  return (
    <SectionGroup
      id="loan"
      name="Loan"
      icon={ICON}
      populated={populated}
      total={total}
      defaultOpen={defaultOpen}
      subtitle={
        phase !== 'dip' ? (
          <>Strip controls stay editable for what-if exploration; numbered fields locked at DIP submission.</>
        ) : undefined
      }
    >
      <div className="qi-loan__strip">
        <ConfigurationStrip />
      </div>

      <ProductPicker />

      <QiFieldGrid columns={2}>
        {m5Mode === 'editable' ? (
          <QiSelect
            id="m5"
            label="Repayment type"
            registerIds="M5"
            defaultValue={repaymentType}
            entityRef={arrRef}
            commitFieldId="M5"
            options={[
              { value: 'Capital & Interest', label: 'Capital & Interest' },
              { value: 'Interest Only', label: 'Interest Only' },
              { value: 'Part-and-Part', label: 'Part-and-Part' },
            ]}
          />
        ) : m5Mode === 'locked' ? (
          <RegFieldRow
            fieldId="M5"
            label="Repayment type"
            entityType="Arrangement"
            partyUuid={arrangementId}
            forceState="locked"
          />
        ) : null}

        {m2Mode === 'editable' ? (
          <QiSelect
            id="m2"
            label="Loan purpose"
            registerIds="M2"
            defaultValue={applicationType}
            entityRef={arrRef}
            commitFieldId="M2"
            options={[
              { value: 'Purchase', label: 'Purchase' },
              { value: 'Remortgage', label: 'Remortgage' },
              { value: 'Further Advance', label: 'Further Advance' },
              { value: 'Product Transfer', label: 'Product Transfer' },
            ]}
          />
        ) : m2Mode === 'locked' ? (
          <RegFieldRow
            fieldId="M2"
            label="Loan purpose"
            entityType="Arrangement"
            partyUuid={arrangementId}
            forceState="locked"
          />
        ) : null}
      </QiFieldGrid>

      {showIOVehicle && (
        <QiFieldGrid columns={1}>
          <QiTextInput
            id="m16-io-vehicle"
            label="Interest-only repayment vehicle"
            hint="Endowment, ISA, sale of asset, or other plan."
            registerIds="M16"
          />
        </QiFieldGrid>
      )}
    </SectionGroup>
  );
}

const ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M9 10h4.5a2 2 0 0 1 0 4H9" />
  </svg>
);
