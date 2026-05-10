import type { ReactNode } from 'react';
import { useCaseStore } from '../../store/caseStore';
import { shouldShow, type ShouldShowContext } from '../../rules/visibility';

/**
 * Wrapper that gates a field on `rules/visibility.ts` and applies the
 * Standalone v3 OBTL dashed-amber treatment when:
 *   - `obtlConditional` is set on the wrapper, AND
 *   - the case's `arrangement.productFamily` is `'Buy-to-Let'`
 *
 * The label suffix (" — OBTL only") is intentionally NOT injected by
 * this component — pass `labelSuffix=" — OBTL only"` to the wrapped
 * `<FieldRow />` instead. Two coordinated props is uglier in the
 * call-site than one, but it keeps `ConditionalField` agnostic about
 * its child shape.
 */
export interface ConditionalFieldProps {
  /** Register field ID, e.g. `"P22"`. Hidden when shouldShow returns false. */
  fieldId: string;
  /** Forwarded to `shouldShow` for party-/collateral-scoped rules. */
  context?: ShouldShowContext;
  /** Apply the dashed-amber wrapper when OBTL is the selected family. */
  obtlConditional?: boolean;
  /** Force the OBTL dashed-amber treatment regardless of product family.
   *  Used on Security to render OBTL designed-in fields as a preview
   *  even when Owner Occupier is the active family. */
  forceObtlStyle?: boolean;
  children: ReactNode;
}

export default function ConditionalField({
  fieldId,
  context,
  obtlConditional,
  forceObtlStyle,
  children,
}: ConditionalFieldProps) {
  const caseState = useCaseStore((s) => s.case);
  const productFamily = useCaseStore((s) => s.case.arrangement.productFamily);

  const visible = shouldShow(fieldId, caseState, context);
  if (!visible) return null;

  const isOBTL = productFamily === 'Buy-to-Let';
  const obtlActive = forceObtlStyle || (!!obtlConditional && isOBTL);

  if (!obtlActive) {
    return <>{children}</>;
  }

  return <div className="cond-field obtl-active">{children}</div>;
}
