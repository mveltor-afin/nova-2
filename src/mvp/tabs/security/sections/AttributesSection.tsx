import { GlassCard, FieldRow } from '../../../components/atoms';
import RegFieldRow from '../../applicants/RegFieldRow';
import { useCaseStore } from '../../../store/caseStore';
import type { Collateral } from '../../../model/collateral';

/**
 * Attributes sub-tab — physical + valuation attributes. M11 (new build)
 * is fixed by the brief as M-series here even though our model carries
 * it on Collateral; field-id labels follow the brief literally.
 */
export default function AttributesSection({ collateralUuid }: { collateralUuid: string }) {
  const collateral = useCaseStore((s) =>
    s.case.collaterals.find((c) => c.uuid === collateralUuid),
  ) as Collateral | undefined;

  return (
    <GlassCard padding="lg" className="security-section">
      <h3 className="section-title">Attributes</h3>
      <div className="fields">
        <FieldRow
          label="Year built"
          labelSuffix="P15"
          value={collateral?.yearBuilt}
          state={collateral?.yearBuilt ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <RegFieldRow
          fieldId="P16"
          label="Estimated value"
          partyUuid={collateralUuid}
          entityType="Collateral"
          value={
            collateral?.estimatedValue
              ? `£${collateral.estimatedValue.toLocaleString('en-GB')}`
              : undefined
          }
        />
        <RegFieldRow
          fieldId="P17"
          label="Purchase price"
          partyUuid={collateralUuid}
          entityType="Collateral"
          value={
            collateral?.purchasePrice
              ? `£${collateral.purchasePrice.toLocaleString('en-GB')}`
              : undefined
          }
        />
        <FieldRow
          label="Surveyed value"
          labelSuffix="P18"
          value={
            collateral?.surveyedValue
              ? `£${collateral.surveyedValue.toLocaleString('en-GB')}`
              : undefined
          }
          state={collateral?.surveyedValue ? 'populated' : 'missing'}
          provenance={{
            source: { documentLabel: 'valuation.pdf', pageNumber: 3 },
            confidence: 0.91,
            extractionMethod: 'AI text',
          }}
        />
        <FieldRow
          label="Last valuation date"
          labelSuffix="P19"
          value={collateral?.lastValuationDate}
          state={collateral?.lastValuationDate ? 'populated' : 'missing'}
          provenance={{
            source: { documentLabel: 'valuation.pdf', pageNumber: 1 },
            confidence: 0.95,
            extractionMethod: 'AI text',
          }}
        />
        <FieldRow
          label="Valuation type"
          labelSuffix="P20"
          value={collateral?.valuationType}
          state={collateral?.valuationType ? 'populated' : 'missing'}
          provenance={{
            source: { documentLabel: 'valuation.pdf', pageNumber: 1 },
            confidence: 0.95,
            extractionMethod: 'AI text',
          }}
        />
        <RegFieldRow
          fieldId="P21"
          label="Property use"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <FieldRow
          label="Number of units"
          labelSuffix="P22"
          state={collateral?.numberOfUnits ? 'populated' : 'missing'}
          value={collateral?.numberOfUnits}
          placeholder="HMO / multi-unit only"
          hint="BTL conditional"
          onTypeIn={() => {}}
        />
        <FieldRow
          label="HMO licence"
          labelSuffix="P23"
          value={collateral?.hasHMOLicence ? 'Yes' : 'No'}
          state={collateral?.hasHMOLicence !== undefined ? 'populated' : 'missing'}
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="New build"
          labelSuffix="M11"
          value={collateral?.isNewBuild ? 'Yes' : 'No'}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="BTL portfolio size"
          labelSuffix="M16"
          state="missing"
          placeholder="BTL only"
          hint="Surfaces when product family = Buy-to-Let"
          onTypeIn={() => {}}
        />
      </div>
    </GlassCard>
  );
}
