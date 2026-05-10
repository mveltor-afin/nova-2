import { GlassCard, FieldRow } from '../../../components/atoms';
import RegFieldRow from '../../applicants/RegFieldRow';
import { useCaseStore } from '../../../store/caseStore';
import type { Collateral } from '../../../model/collateral';

/**
 * Tenure sub-tab — addressing fields, tenure, lease detail, and (when
 * remortgage) the existing-mortgage fields P30–P33. M9 is the existing-
 * lender rate type when applicable.
 */
export default function TenureSection({ collateralUuid }: { collateralUuid: string }) {
  const collateral = useCaseStore((s) =>
    s.case.collaterals.find((c) => c.uuid === collateralUuid),
  ) as Collateral | undefined;
  const applicationType = useCaseStore(
    (s) => s.case.arrangement.applicationType,
  );
  const isLeasehold = collateral?.tenure !== 'Freehold';
  const isRemortgage = applicationType === 'Remortgage';

  return (
    <GlassCard padding="lg" className="security-section">
      <h3 className="section-title">Tenure</h3>
      <div className="fields">
        <FieldRow
          label="Address line 1"
          labelSuffix="P1"
          value={collateral?.address.line1}
          state={collateral?.address.line1 ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="City"
          labelSuffix="P1"
          value={collateral?.address.city}
          state={collateral?.address.city ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="Postcode"
          labelSuffix="P1"
          value={collateral?.address.postcode}
          state={collateral?.address.postcode ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <RegFieldRow
          fieldId="P4"
          label="Tenure"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <RegFieldRow
          fieldId="P6"
          label="Property type"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <FieldRow
          label="UPRN"
          labelSuffix="P2"
          value={collateral?.uprn ?? '—'}
          state={collateral?.uprn ? 'populated' : 'missing'}
          provenance={
            collateral?.uprn
              ? { source: 'manual', enteredBy: 'Land Registry pull' }
              : undefined
          }
        />
        <FieldRow
          label="Title number"
          labelSuffix="P3"
          value={collateral?.titleNumber}
          state={collateral?.titleNumber ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'Land Registry pull' }}
        />

        {isLeasehold && (
          <>
            <RegFieldRow
              fieldId="P5"
              label="Lease years remaining"
              partyUuid={collateralUuid}
              entityType="Collateral"
            />
          </>
        )}

        <RegFieldRow
          fieldId="P12"
          label="Flood risk"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <FieldRow
          label="Listed / Conservation Area"
          labelSuffix="P13"
          value={collateral?.isListedOrConservation ? 'Yes' : 'No'}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        {collateral?.isListedOrConservation && (
          <FieldRow
            label="Listed grade"
            labelSuffix="P14"
            value={collateral.listedGrade}
            state="populated"
            provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
          />
        )}

        {isRemortgage && (
          <>
            <FieldRow
              label="Existing lender"
              labelSuffix="P30"
              state="missing"
              placeholder="Remortgage detail"
              onTypeIn={() => {}}
            />
            <FieldRow
              label="Existing balance"
              labelSuffix="P31"
              state="missing"
              placeholder="—"
              onTypeIn={() => {}}
            />
            <FieldRow
              label="Existing rate type"
              labelSuffix="M9"
              state="missing"
              placeholder="—"
              onTypeIn={() => {}}
            />
          </>
        )}
      </div>
    </GlassCard>
  );
}
