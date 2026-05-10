import { useShallow } from 'zustand/react/shallow';
import { useCaseStore, type EntityRef } from '../../../store/caseStore';
import SectionGroup from '../SectionGroup';
import { QiTextInput, QiSelect, QiMoneyInput, QiFieldGrid, QiSubhead } from '../ManualInputs';
import RegFieldRow from '../../applicants/RegFieldRow';
import { phaseMode } from '../../../model/quickInputFields';
import { isFieldPopulated } from '../../../rules/fieldStatus';
import { shouldShow } from '../../../rules/visibility';

/**
 * Property group — address + tenure + attributes for the indicative
 * collateral. Property value (P16) is owned by the Configuration
 * Strip in the Loan group above and never appears here, by design.
 */
const PROPERTY_FIELDS = [
  'P1', 'P4', 'P5', 'P6', 'P9', 'P7', 'P10', 'P12', 'P17', 'P21',
];

export default function PropertySection() {
  const { caseRef, collateral, phase } = useCaseStore(
    useShallow((s) => ({
      caseRef: s.case,
      collateral: s.case.collaterals[0],
      phase: s.case.phase,
    })),
  );
  if (!collateral) return null;

  const colRef: EntityRef = { entityType: 'Collateral', entityId: collateral.uuid };

  const visible = PROPERTY_FIELDS.filter(
    (f) =>
      phaseMode(f, phase) !== 'hidden' &&
      shouldShow(f, caseRef, { collateralUuid: collateral.uuid }),
  );
  const populated = visible.filter((f) => isFieldPopulated(caseRef, f)).length;

  return (
    <SectionGroup
      id="property"
      name="Property"
      icon={ICON}
      populated={populated}
      total={visible.length}
    >
      <QiSubhead>Security · {collateral.address.line1}</QiSubhead>

      <QiFieldGrid columns={1}>
        <Editable phase={phase} fieldId="P1">
          <QiTextInput
            id="p1"
            label="Property address (line 1)"
            registerIds="P1"
            defaultValue={collateral.address.line1}
            entityRef={colRef}
            commitFieldId="P1"
          />
        </Editable>
      </QiFieldGrid>
      <QiFieldGrid columns={2}>
        <Editable phase={phase} fieldId="P1.city">
          <QiTextInput
            id="p1-city"
            label="City"
            registerIds="P1"
            defaultValue={collateral.address.city}
            entityRef={colRef}
            commitFieldId="P1.city"
          />
        </Editable>
        <Editable phase={phase} fieldId="P1.postcode">
          <QiTextInput
            id="p1-postcode"
            label="Postcode"
            registerIds="P1"
            defaultValue={collateral.address.postcode}
            entityRef={colRef}
            commitFieldId="P1.postcode"
          />
        </Editable>
      </QiFieldGrid>

      <QiFieldGrid columns={3}>
        <Editable phase={phase} fieldId="P4">
          <QiSelect
            id="p4"
            label="Tenure"
            registerIds="P4"
            defaultValue={collateral.tenure ?? ''}
            placeholder="Select…"
            entityRef={colRef}
            commitFieldId="P4"
            options={[
              { value: 'Freehold', label: 'Freehold' },
              { value: 'Leasehold', label: 'Leasehold' },
              { value: 'Share of Freehold', label: 'Share of Freehold' },
            ]}
          />
        </Editable>
        {shouldShow('P5', caseRef, { collateralUuid: collateral.uuid }) && (
          <Editable phase={phase} fieldId="P5">
            <QiTextInput
              id="p5"
              label="Years on lease"
              registerIds="P5"
              type="number"
              defaultValue={collateral.leaseYearsRemaining ?? ''}
              entityRef={colRef}
              commitFieldId="P5"
            />
          </Editable>
        )}
        <Editable phase={phase} fieldId="P6">
          <QiSelect
            id="p6"
            label="Property type"
            registerIds="P6"
            defaultValue={collateral.propertyType ?? ''}
            placeholder="Select…"
            entityRef={colRef}
            commitFieldId="P6"
            options={[
              { value: 'Detached', label: 'Detached' },
              { value: 'Semi-Detached', label: 'Semi-Detached' },
              { value: 'Terraced', label: 'Terraced' },
              { value: 'Flat', label: 'Flat' },
              { value: 'Maisonette', label: 'Maisonette' },
              { value: 'Bungalow', label: 'Bungalow' },
            ]}
          />
        </Editable>
      </QiFieldGrid>

      <QiFieldGrid columns={3}>
        <Editable phase={phase} fieldId="P9">
          <QiTextInput
            id="p9"
            label="Bedrooms"
            registerIds="P9"
            type="number"
            defaultValue={collateral.bedrooms ?? ''}
            entityRef={colRef}
            commitFieldId="P9"
          />
        </Editable>
        <Editable phase={phase} fieldId="P10">
          <QiSelect
            id="p10"
            label="Construction type"
            registerIds="P10"
            defaultValue={collateral.constructionType ?? ''}
            placeholder="Select…"
            entityRef={colRef}
            commitFieldId="P10"
            options={[
              { value: 'Standard', label: 'Standard' },
              { value: 'Non-Standard', label: 'Non-Standard' },
            ]}
          />
        </Editable>
        <Editable phase={phase} fieldId="P12">
          <QiSelect
            id="p12"
            label="Flood risk"
            registerIds="P12"
            defaultValue={collateral.floodRisk ?? ''}
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
        </Editable>
      </QiFieldGrid>

      {shouldShow('P17', caseRef) && (
        <QiFieldGrid columns={2}>
          <Editable phase={phase} fieldId="P17">
            <QiMoneyInput
              id="p17"
              label="Purchase price"
              registerIds="P17"
              defaultValue={collateral.purchasePrice}
              entityRef={colRef}
              commitFieldId="P17"
            />
          </Editable>
          <Editable phase={phase} fieldId="P21">
            <QiSelect
              id="p21"
              label="Property use"
              registerIds="P21"
              defaultValue={collateral.propertyUse ?? ''}
              placeholder="Select…"
              entityRef={colRef}
              commitFieldId="P21"
              options={[
                { value: 'Owner Occupier', label: 'Owner Occupier' },
                { value: 'Buy-to-Let', label: 'Buy-to-Let' },
                { value: 'Holiday Let', label: 'Holiday Let' },
                { value: 'Second Home', label: 'Second Home' },
              ]}
            />
          </Editable>
        </QiFieldGrid>
      )}
    </SectionGroup>
  );
}

function Editable({
  phase,
  fieldId,
  children,
}: {
  phase: import('../../../model/case').Phase;
  fieldId: string;
  children: React.ReactNode;
}) {
  const mode = phaseMode(fieldId, phase);
  if (mode === 'hidden') return null;
  if (mode === 'locked') {
    return (
      <RegFieldRow
        fieldId={fieldId.split('.')[0]}
        label={fieldId}
        entityType="Collateral"
        forceState="locked"
      />
    );
  }
  return <>{children}</>;
}

const ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
