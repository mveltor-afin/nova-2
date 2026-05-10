import {
  GlassCard,
  ConditionalField,
  FieldRow,
} from '../../../components/atoms';
import RegFieldRow from '../../applicants/RegFieldRow';
import PersonReference from '../PersonReference';
import { useCaseStore } from '../../../store/caseStore';
import type { Collateral } from '../../../model/collateral';

/**
 * Property sub-tab — the broad attributes plus the OBTL designed-in
 * fields rendered as dashed-amber preview rows. The brief calls out
 * two examples that must render exactly:
 *   "Discounted purchase rate · 3.25% · — OBTL only"
 *   "Property owners · Mr James Hargreaves · — OBTL only · → Connected Parties record created"
 */
export default function PropertySection({ collateralUuid }: { collateralUuid: string }) {
  const collateral = useCaseStore((s) =>
    s.case.collaterals.find((c) => c.uuid === collateralUuid),
  ) as Collateral | undefined;

  // James Hargreaves is auto-created in the fixture as the property
  // owner of the additional security. Reflect that here so the green
  // confirmation lights up on first render.
  const isAdditional = useCaseStore(
    (s) => s.case.collaterals[0]?.uuid !== collateralUuid,
  );
  const propertyOwnerInitial = isAdditional ? 'Mr James Hargreaves' : undefined;

  return (
    <GlassCard padding="lg" className="security-section">
      <h3 className="section-title">Property</h3>
      <div className="fields">
        <RegFieldRow
          fieldId="P5"
          label="Lease years remaining"
          partyUuid={collateralUuid}
          entityType="Collateral"
          value={collateral?.leaseYearsRemaining}
          hint={collateral?.tenure === 'Freehold' ? 'Freehold — N/A' : undefined}
        />
        <RegFieldRow
          fieldId="P7"
          label="New build"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <RegFieldRow
          fieldId="P9"
          label="Bedrooms"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <RegFieldRow
          fieldId="P10"
          label="Construction type"
          partyUuid={collateralUuid}
          entityType="Collateral"
        />
        <RegFieldRow
          fieldId="P21"
          label="Property use"
          partyUuid={collateralUuid}
          entityType="Collateral"
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
      </div>

      {/* === OBTL designed-in preview === */}
      <div className="obtl-preview-block">
        <div className="obtl-preview-header">
          <span className="obtl-preview-eyebrow">OBTL · designed-in</span>
          <span className="obtl-preview-note">
            These fields render only when the product family is Buy-to-Let;
            shown here as the v3 reference state.
          </span>
        </div>

        <div className="fields">
          <ConditionalField fieldId="S3" forceObtlStyle>
            <FieldRow
              label="Discounted purchase rate"
              labelSuffix="— OBTL only"
              value="3.25%"
              state="populated"
              provenance={{
                source: 'manual',
                enteredBy: 'A. Okafor (broker)',
              }}
            />
          </ConditionalField>

          <ConditionalField fieldId="S4" forceObtlStyle>
            <div className="field">
              <span className="lbl">
                Property owners
                <span className="lbl-suffix">— OBTL only</span>
              </span>
              <PersonReference
                initialValue={propertyOwnerInitial}
                relationship="PropertyOwner"
                actsFor={
                  collateral
                    ? `${collateral.address.line1}, ${collateral.address.postcode}`
                    : 'Additional security'
                }
                placeholder="Add property owner"
                obtlPreview
              />
            </div>
          </ConditionalField>

          <ConditionalField fieldId="S5" forceObtlStyle>
            <FieldRow
              label="UK representative"
              labelSuffix="— OBTL only"
              state="missing"
              placeholder="Required when overseas owner"
              hint="Captures a UK-based contact for service of notice"
              onTypeIn={() => {}}
            />
          </ConditionalField>

          <ConditionalField fieldId="S6" forceObtlStyle>
            <FieldRow
              label="Managing agent"
              labelSuffix="— OBTL only"
              state="missing"
              placeholder="Optional"
              onTypeIn={() => {}}
            />
          </ConditionalField>
        </div>
      </div>
    </GlassCard>
  );
}
