import { GlassCard, FieldRow } from '../../../components/atoms';
import PersonReference from '../PersonReference';
import { useCaseStore } from '../../../store/caseStore';
import type { Collateral } from '../../../model/collateral';

/**
 * Occupancy sub-tab — P24–P28. Includes the inline PersonReference for
 * Occupants 17+ (auto-creates Connected Parties row).
 */
export default function OccupancySection({ collateralUuid }: { collateralUuid: string }) {
  const collateral = useCaseStore((s) =>
    s.case.collaterals.find((c) => c.uuid === collateralUuid),
  ) as Collateral | undefined;
  const thirdParties = useCaseStore((s) => s.case.thirdParties);

  // Use Chidera as the seeded Occupant 17+ (created in fixtures).
  const seededOccupant = thirdParties.find((tp) =>
    tp.actsFor?.toLowerCase().includes('occupant'),
  );

  return (
    <GlassCard padding="lg" className="security-section">
      <h3 className="section-title">Occupancy</h3>
      <div className="fields">
        <FieldRow
          label="Property use"
          labelSuffix="P24"
          value={collateral?.propertyUse}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="Currently tenanted"
          labelSuffix="P25"
          value={collateral?.isCurrentlyTenanted ? 'Yes' : 'No'}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="Existing tenancy type"
          labelSuffix="P26"
          state={collateral?.existingTenancyType ? 'populated' : 'missing'}
          value={collateral?.existingTenancyType}
          placeholder="If currently tenanted"
          onTypeIn={() => {}}
        />
        <FieldRow
          label="Occupancy at completion"
          labelSuffix="P27"
          value={
            collateral?.propertyUse === 'Owner Occupier'
              ? 'Owner-occupied'
              : 'Investment / let'
          }
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <div className="field">
          <span className="lbl">
            Occupants 17+
            <span className="lbl-suffix">P28</span>
          </span>
          <PersonReference
            initialValue={seededOccupant?.name}
            relationship="Occupant"
            actsFor={
              collateral
                ? `${collateral.address.line1}, ${collateral.address.postcode}`
                : 'Property'
            }
            placeholder="Add adult occupant"
          />
        </div>
      </div>
    </GlassCard>
  );
}
