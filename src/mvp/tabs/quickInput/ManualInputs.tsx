import { useEffect, useState, type ReactNode } from 'react';
import { useCaseStore, type EntityRef } from '../../store/caseStore';

/**
 * Tiny styled input primitives used across the four manual-entry
 * groups. Step 15 added write-through: pass `entityRef` + `commitFieldId`
 * and the input dispatches `setManualField` on blur (and on change for
 * selects).
 *
 * Inputs without `entityRef` stay read-only-feeling — typing updates
 * local state but doesn't persist. Use that for fields whose register
 * mapping isn't covered by `model/fieldMap.ts` yet.
 */

interface BaseProps {
  id: string;
  label: string;
  /** Register IDs this input maps to. Display only — drives the small
   *  monospace badge in the label. */
  registerIds?: string;
  hint?: string;
  className?: string;
  /** Step 15 wiring — commit target. Pass both or neither. */
  entityRef?: EntityRef;
  commitFieldId?: string;
}

export interface QiTextInputProps extends BaseProps {
  type?: 'text' | 'email' | 'tel' | 'date' | 'number';
  defaultValue?: string | number;
  placeholder?: string;
}

export function QiTextInput({
  id,
  label,
  registerIds,
  type = 'text',
  defaultValue,
  placeholder,
  hint,
  entityRef,
  commitFieldId,
}: QiTextInputProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  // Local state mirrors the input for responsive typing; commit on blur.
  const [local, setLocal] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : '',
  );
  // Re-sync when the upstream default changes (e.g. user edits the
  // field on a different tab — the seeded defaultValue updates).
  useEffect(() => {
    setLocal(defaultValue !== undefined ? String(defaultValue) : '');
  }, [defaultValue]);

  function commit() {
    if (!entityRef || !commitFieldId) return;
    if (type === 'number') {
      const n = Number(local);
      if (Number.isNaN(n)) return;
      setManualField(entityRef, commitFieldId, n);
    } else {
      setManualField(entityRef, commitFieldId, local);
    }
  }

  return (
    <div className="qi-field">
      <label htmlFor={id} className="qi-field-label">
        {label}
        {registerIds && <span className="qi-field-fid">{registerIds}</span>}
      </label>
      <input
        id={id}
        type={type}
        className="qi-input"
        value={local}
        placeholder={placeholder}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && type !== 'number') {
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {hint && <div className="qi-field-hint">{hint}</div>}
    </div>
  );
}

export interface QiSelectProps extends BaseProps {
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
}

export function QiSelect({
  id,
  label,
  registerIds,
  options,
  defaultValue,
  placeholder,
  entityRef,
  commitFieldId,
}: QiSelectProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const [local, setLocal] = useState<string>(defaultValue ?? '');
  useEffect(() => {
    setLocal(defaultValue ?? '');
  }, [defaultValue]);

  function commit(next: string) {
    setLocal(next);
    if (!entityRef || !commitFieldId) return;
    setManualField(entityRef, commitFieldId, next);
  }

  return (
    <div className="qi-field">
      <label htmlFor={id} className="qi-field-label">
        {label}
        {registerIds && <span className="qi-field-fid">{registerIds}</span>}
      </label>
      <select
        id={id}
        className="qi-select"
        value={local}
        onChange={(e) => commit(e.target.value)}
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
    </div>
  );
}

export interface QiMoneyInputProps extends BaseProps {
  defaultValue?: number;
  /** Suffix shown after the input — e.g. "/ month". */
  suffix?: string;
}

export function QiMoneyInput({
  id,
  label,
  registerIds,
  defaultValue,
  suffix,
  entityRef,
  commitFieldId,
}: QiMoneyInputProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const [local, setLocal] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : '',
  );
  useEffect(() => {
    setLocal(defaultValue !== undefined ? String(defaultValue) : '');
  }, [defaultValue]);

  function commit() {
    if (!entityRef || !commitFieldId) return;
    const n = Number(local);
    if (Number.isNaN(n)) return;
    setManualField(entityRef, commitFieldId, n);
  }

  return (
    <div className="qi-field">
      <label htmlFor={id} className="qi-field-label">
        {label}
        {registerIds && <span className="qi-field-fid">{registerIds}</span>}
      </label>
      <div className="qi-money-wrap">
        <span className="qi-money-prefix">£</span>
        <input
          id={id}
          type="number"
          className="qi-input qi-money-input"
          value={local}
          step="1"
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
        />
        {suffix && <span className="qi-money-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

export function QiSubhead({ children }: { children: ReactNode }) {
  return <div className="qi-mgroup-subhead">{children}</div>;
}

export function QiFieldGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div className={`qi-field-grid cols-${columns}`}>{children}</div>
  );
}
