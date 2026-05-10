import { GlassCard, FieldRow } from '../../../components/atoms';
import { useCaseStore } from '../../../store/caseStore';
import type { Collateral } from '../../../model/collateral';

/**
 * Insurance sub-tab — P29–P31. Buildings & contents insurance + EPC
 * placeholders. (EPC is technically P26 in the Step 2 model; the brief
 * places EPC under Occupancy. Both reference the same value on the
 * model — kept here as part of insurance for v3 fidelity.)
 */
export default function InsuranceSection({ collateralUuid }: { collateralUuid: string }) {
  const collateral = useCaseStore((s) =>
    s.case.collaterals.find((c) => c.uuid === collateralUuid),
  ) as Collateral | undefined;

  return (
    <GlassCard padding="lg" className="security-section">
      <h3 className="section-title">Insurance</h3>
      <div className="fields">
        <FieldRow
          label="Buildings sum insured"
          labelSuffix="P29"
          state="missing"
          placeholder="Required for completion"
          onTypeIn={() => {}}
        />
        <FieldRow
          label="Insurer"
          labelSuffix="P30"
          state="missing"
          placeholder="Provider name"
          onTypeIn={() => {}}
        />
        <FieldRow
          label="Renewal date"
          labelSuffix="P31"
          state="missing"
          placeholder="—"
          onTypeIn={() => {}}
        />
        <FieldRow
          label="EPC rating"
          value={collateral?.epcRating}
          state={collateral?.epcRating ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'EPC register pull' }}
        />
        <FieldRow
          label="Heating type"
          value={collateral?.heatingType}
          state={collateral?.heatingType ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
      </div>
    </GlassCard>
  );
}
