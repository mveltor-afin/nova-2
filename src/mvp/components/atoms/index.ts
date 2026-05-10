/**
 * Barrel re-exports for the workspace atoms. Every tab imports from
 * `components/atoms`; individual files stay private.
 */

export { default as GlassCard } from './GlassCard';
export type { GlassCardProps } from './GlassCard';

export { default as Provenance } from './Provenance';
export type {
  ProvenanceProps,
  ProvenanceMethod,
  ProvenanceDocSource,
  ProvenanceSourceMeta,
} from './Provenance';

export { default as FieldRow } from './FieldRow';
export type { FieldRowProps, FieldRowState } from './FieldRow';

export { default as ConditionalField } from './ConditionalField';
export type { ConditionalFieldProps } from './ConditionalField';

export { default as NudgeCard } from './NudgeCard';
export type { NudgeCardProps } from './NudgeCard';

export { default as Pip } from './Pip';
export type { PipProps, PipVariant } from './Pip';

export { default as ConfidencePill, bandFor } from './ConfidencePill';
export type { ConfidencePillProps } from './ConfidencePill';

export { default as Chip } from './Chip';
export type { ChipProps, ChipTone } from './Chip';

export { default as DropZone } from './DropZone';
export type { DropZoneProps } from './DropZone';
