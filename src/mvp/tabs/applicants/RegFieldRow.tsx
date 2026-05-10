import { useEffect, useState, type ReactNode } from 'react';
import { FieldRow, type FieldRowState } from '../../components/atoms';
import Provenance, { type ProvenanceProps } from '../../components/atoms/Provenance';
import { useCaseStore, type EntityRef } from '../../store/caseStore';
import { readField, isFieldPopulated } from '../../rules/fieldStatus';
import type { Provenance as ProvenanceRecord } from '../../model/provenance';
import type { Case } from '../../model/case';

/**
 * Step 19b — RegFieldRow now defaults to **editable**. For populated /
 * missing / manual-override states it renders a labelled input that
 * commits via `setManualField` on blur, with the optional provenance
 * footer below. Locked / conflict / awaiting-review states still
 * fall through to the read-only `<FieldRow />` (those carry richer
 * affordances — Resolve buttons, lock badges, accept/reject pairs).
 *
 * Provenance footer behaviour (Step 15):
 *  - source 'Manual' → footer hidden (the input itself is the
 *    canonical broker entry; no point repeating "manual" beneath).
 *  - source 'Document' / 'Derived' / 'manual-override' → footer shown.
 */
export type RegInputType =
  | 'text'
  | 'select'
  | 'date'
  | 'tel'
  | 'email'
  | 'number'
  | 'money'
  | 'boolean';

export interface RegFieldRowProps {
  fieldId: string;
  label: string;
  partyUuid?: string;
  /** What entity bucket this field belongs to in the provenance map.
   *  Defaults to 'Person'. Use 'Collateral', 'Arrangement', etc.
   *  Mapped onto an `EntityRef` for the writer dispatch. */
  entityType?: string;
  /** Override displayed value (only consulted in read-only states). */
  value?: ReactNode;
  /** Override the state (rare; mainly for synthesised states). */
  forceState?: FieldRowState;
  /** Optional small italic suffix appended to the label. */
  labelSuffix?: ReactNode;
  /** Helper text shown below the input (also drives FieldRow hint
   *  in read-only fallback states). */
  hint?: string;
  /** Step 19 — column span inside a 2-column section grid. */
  colSpan?: 'half' | 'full';
  /** Input kind. Defaults to 'text'. */
  inputType?: RegInputType;
  /** Required when `inputType === 'select'`. */
  options?: { value: string; label: string }[];
  /** Optional placeholder (text inputs only). */
  placeholder?: string;
  /** Force read-only rendering even when the state would normally be
   *  editable. Useful for synthesised display values (e.g. derived
   *  full-address strings). */
  readOnly?: boolean;
}

export default function RegFieldRow({
  fieldId,
  label,
  partyUuid,
  entityType = 'Person',
  value,
  forceState,
  labelSuffix,
  hint,
  colSpan = 'half',
  inputType = 'text',
  options,
  placeholder,
  readOnly = false,
}: RegFieldRowProps) {
  const caseState = useCaseStore((s) => s.case);
  const openDrawer = useCaseStore((s) => s.openDrawer);
  const setManualField = useCaseStore((s) => s.setManualField);

  const resolvedPartyUuid = partyUuid ?? primaryUuid(caseState);

  const rawValue = readField(caseState, fieldId, resolvedPartyUuid);
  const populated = isFieldPopulated(caseState, fieldId, resolvedPartyUuid);

  const provKey = `${entityType}:${resolvedPartyUuid}:${fieldId}`;
  const prov = caseState.provenanceMap[provKey];

  const state: FieldRowState = (() => {
    if (forceState) return forceState;
    if (!populated) return 'missing';
    if (prov?.source === 'Locked') return 'locked';
    if (prov?.source === 'manual-override') return 'manual-override';
    if (prov?.source === 'Manual') {
      const wasOverridden = caseState.extractions.some(
        (e) =>
          e.targetEntity === entityType &&
          e.targetEntityId === resolvedPartyUuid &&
          e.targetAttribute === fieldId &&
          e.status === 'Overridden',
      );
      return wasOverridden ? 'manual-override' : 'populated';
    }
    return 'populated';
  })();

  const provenanceProps = state === 'missing' ? undefined : provFor(prov);
  const className = colSpan === 'full' ? 'applicants-section__field--full' : undefined;

  // Read-only fallback path covers the workflow-rich states. The
  // Resolve / Accept / Reject affordances live there and depend on
  // FieldRow's existing render — overlaying an input would mask them.
  const readOnlyState =
    readOnly ||
    state === 'locked' ||
    state === 'conflict' ||
    state === 'awaiting-review';

  if (readOnlyState) {
    const displayValue =
      value ?? (rawValue !== undefined ? formatValue(rawValue) : undefined);
    return (
      <FieldRow
        label={label}
        labelSuffix={labelSuffix}
        value={displayValue}
        state={state}
        className={className}
        provenance={provenanceProps && wireProvenanceClick(provenanceProps, prov, openDrawer)}
        hint={hint}
      />
    );
  }

  const ref: EntityRef = entityRefFor(entityType, resolvedPartyUuid);
  const showProvenance =
    state === 'manual-override' ||
    prov?.source === 'Document' ||
    prov?.source === 'Derived' ||
    prov?.source === 'Locked';

  return (
    <EditableRegFieldRow
      label={label}
      labelSuffix={labelSuffix}
      hint={hint}
      className={className}
      state={state}
      inputType={inputType}
      options={options}
      placeholder={placeholder}
      rawValue={rawValue}
      onCommit={(v) => setManualField(ref, fieldId, v)}
      provenance={
        showProvenance && provenanceProps
          ? wireProvenanceClick(provenanceProps, prov, openDrawer)
          : undefined
      }
    />
  );
}

interface EditableRegFieldRowProps {
  label: string;
  labelSuffix?: ReactNode;
  hint?: string;
  className?: string;
  state: FieldRowState;
  inputType: RegInputType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  rawValue: unknown;
  onCommit: (value: unknown) => void;
  provenance?: ProvenanceProps;
}

function EditableRegFieldRow({
  label,
  labelSuffix,
  hint,
  className,
  state,
  inputType,
  options,
  placeholder,
  rawValue,
  onCommit,
  provenance,
}: EditableRegFieldRowProps) {
  const [local, setLocal] = useState<string>(stringValue(rawValue, inputType));

  useEffect(() => {
    setLocal(stringValue(rawValue, inputType));
  }, [rawValue, inputType]);

  function commit() {
    if (inputType === 'number' || inputType === 'money') {
      const n = Number(local);
      if (Number.isNaN(n)) return;
      onCommit(n);
      return;
    }
    if (inputType === 'boolean') {
      onCommit(local === 'true');
      return;
    }
    onCommit(local);
  }

  function commitImmediate(next: string) {
    setLocal(next);
    if (inputType === 'number' || inputType === 'money') {
      const n = Number(next);
      if (!Number.isNaN(n)) onCommit(n);
    } else if (inputType === 'boolean') {
      onCommit(next === 'true');
    } else {
      onCommit(next);
    }
  }

  const stateClass =
    state === 'manual-override' ? 'manual-override' : '';
  const cls = ['field', 'field--editable', stateClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      {state === 'manual-override' && (
        <div className="field-override-banner" role="note">
          Manual override · differs from extracted value
        </div>
      )}
      <span className="lbl">
        {label}
        {labelSuffix && <span className="lbl-suffix">{labelSuffix}</span>}
      </span>

      {inputType === 'select' && options ? (
        <select
          className="qi-select reg-field-input"
          value={local}
          onChange={(e) => commitImmediate(e.target.value)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : inputType === 'boolean' ? (
        <select
          className="qi-select reg-field-input"
          value={local || 'false'}
          onChange={(e) => commitImmediate(e.target.value)}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : inputType === 'money' ? (
        <div className="qi-money-wrap reg-field-input">
          <span className="qi-money-prefix">£</span>
          <input
            type="number"
            className="qi-input qi-money-input"
            value={local}
            placeholder={placeholder}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={commit}
          />
        </div>
      ) : (
        <input
          type={
            inputType === 'date'
              ? 'date'
              : inputType === 'tel'
                ? 'tel'
                : inputType === 'email'
                  ? 'email'
                  : inputType === 'number'
                    ? 'number'
                    : 'text'
          }
          className="qi-input reg-field-input"
          value={local}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputType !== 'number') {
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      )}

      {hint && <span className="hint">{hint}</span>}
      {provenance && <Provenance {...provenance} />}
    </div>
  );
}

function entityRefFor(entityType: string, entityId: string): EntityRef {
  switch (entityType) {
    case 'Collateral':
      return { entityType: 'Collateral', entityId };
    case 'Arrangement':
      return { entityType: 'Arrangement', entityId };
    case 'ThirdParty':
      return { entityType: 'ThirdParty', entityId };
    default:
      return { entityType: 'Person', entityId };
  }
}

function wireProvenanceClick(
  provenanceProps: ProvenanceProps,
  prov: ProvenanceRecord | undefined,
  openDrawer: (d: import('../../store/caseStore').DrawerState) => void,
): ProvenanceProps {
  if (
    provenanceProps.source !== 'manual' &&
    provenanceProps.source !== 'dip-locked' &&
    provenanceProps.source !== 'updated-post-dip' &&
    prov?.source === 'Document' &&
    prov.documentId
  ) {
    return {
      ...provenanceProps,
      onClick: () =>
        openDrawer({
          kind: 'source-evidence',
          documentId: prov.documentId!,
          pageNumber: prov.pageNumber,
          snippet: prov.evidenceSnippet,
        }),
    };
  }
  return provenanceProps;
}

function primaryUuid(c: Case): string {
  const primary = c.parties.find((p) => p.isPrimary);
  return primary?.uuid ?? '';
}

function provFor(prov: ProvenanceRecord | undefined): ProvenanceProps | undefined {
  if (!prov) return undefined;
  if (prov.source === 'Document') {
    return {
      source: {
        documentLabel: prov.documentLabel ?? 'Document',
        pageNumber: prov.pageNumber,
      },
      confidence: prov.confidence !== undefined ? prov.confidence / 100 : undefined,
      extractionMethod: methodFor(prov.method),
    };
  }
  if (prov.source === 'manual-override') {
    return {
      source: {
        documentLabel: prov.documentLabel ?? 'Document',
        pageNumber: prov.pageNumber,
      },
      confidence: prov.confidence !== undefined ? prov.confidence / 100 : undefined,
      extractionMethod: methodFor(prov.method),
      overridden: true,
    };
  }
  if (prov.source === 'Manual') {
    return {
      source: 'manual',
      enteredBy: prov.enteredBy,
      enteredAt: prov.enteredAt,
    };
  }
  if (prov.source === 'Locked') {
    return { source: 'dip-locked', lockedAt: prov.lockedAt };
  }
  if (prov.source === 'Derived') {
    return {
      source: 'manual',
      enteredBy: 'Computed',
      enteredAt: undefined,
    };
  }
  return undefined;
}

function methodFor(
  m: 'AI text' | 'OCR' | 'AI image' | undefined,
): 'AI text' | 'OCR-assisted' | 'manual' | undefined {
  if (m === 'AI text') return 'AI text';
  if (m === 'OCR') return 'OCR-assisted';
  if (m === 'AI image') return 'AI text';
  return undefined;
}

function stringValue(v: unknown, inputType: RegInputType): string {
  if (v === undefined || v === null) return inputType === 'boolean' ? 'false' : '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function formatValue(v: unknown): ReactNode {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return v.toLocaleString('en-GB');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}
