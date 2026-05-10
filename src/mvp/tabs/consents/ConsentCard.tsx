import { Chip } from '../../components/atoms';
import { useCaseStore } from '../../store/caseStore';
import PaymentDatePicker from './PaymentDatePicker';
import type { ConsentTile } from './consents';

/**
 * One consent tile. Step 21 added three action variants:
 *   - confirm-button (default — categorical attestation)
 *   - checkbox       (toggleable assert/withdraw)
 *   - date-picker    (preferred-payment-day surface)
 *
 * Visual variants drive the card chrome:
 *   standard      – default card
 *   conditional   – dashed-amber left border (parent product only)
 *   btl-only      – greyed-out illustrative state (opacity 0.5)
 *   gating        – heavy stone-1 border + cream wash + coral
 *                   "Required" chip; the Application Declaration row
 */
export interface ConsentCardProps {
  tile: ConsentTile;
}

export default function ConsentCard({ tile }: ConsentCardProps) {
  const asserted = useCaseStore(
    (s) => !!s.case.consentAssertions[tile.id],
  );
  const assertConsent = useCaseStore((s) => s.assertConsent);

  const isHiddenBTL = tile.variant === 'btl-only';
  const isGating = tile.variant === 'gating';
  const isConditional = tile.variant === 'conditional';
  const actionType = tile.actionType ?? 'confirm-button';

  const cls = [
    'consent-card',
    isConditional ? 'conditional' : '',
    isHiddenBTL ? 'btl-only' : '',
    isGating ? 'gating' : '',
    asserted ? 'asserted' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cls}>
      <div className="consent-card-text">
        <div className="consent-card-head">
          <h4 className="consent-card-title">{tile.title}</h4>
          <span className="consent-card-rid">{tile.registerId}</span>
        </div>
        <p className="consent-card-body">{tile.body}</p>
        {tile.subLabel && (
          <span className="consent-card-sub">{tile.subLabel}</span>
        )}
      </div>

      <div className="consent-card-aside">
        <StateChip
          tile={tile}
          asserted={asserted}
          hiddenBTL={isHiddenBTL}
          actionType={actionType}
        />
        {!isHiddenBTL && (
          <ActionArea
            tile={tile}
            asserted={asserted}
            actionType={actionType}
            onAssert={() => assertConsent(tile.id, true)}
            onWithdraw={() => assertConsent(tile.id, false)}
          />
        )}
      </div>
    </article>
  );
}

function StateChip({
  tile,
  asserted,
  hiddenBTL,
  actionType,
}: {
  tile: ConsentTile;
  asserted: boolean;
  hiddenBTL: boolean;
  actionType: NonNullable<ConsentTile['actionType']>;
}) {
  if (hiddenBTL) return <Chip tone="neutral">Hidden</Chip>;
  if (tile.variant === 'gating' && !asserted) {
    return <Chip tone="coral">Required — gates submission</Chip>;
  }
  if (actionType === 'date-picker') return <Chip tone="green">Asserted</Chip>;
  if (asserted) {
    return (
      <Chip tone="green">
        {actionType === 'confirm-button' && tile.variant === 'gating'
          ? 'Confirmed'
          : actionType === 'confirm-button'
            ? 'Confirmed'
            : 'Asserted'}
      </Chip>
    );
  }
  return <Chip tone="neutral">Pending</Chip>;
}

function ActionArea({
  tile,
  asserted,
  actionType,
  onAssert,
  onWithdraw,
}: {
  tile: ConsentTile;
  asserted: boolean;
  actionType: NonNullable<ConsentTile['actionType']>;
  onAssert: () => void;
  onWithdraw: () => void;
}) {
  if (actionType === 'date-picker') {
    return <PaymentDatePicker />;
  }
  if (actionType === 'checkbox') {
    return (
      <label className="consent-item__action--checkbox">
        <input
          type="checkbox"
          checked={asserted}
          onChange={(e) => (e.target.checked ? onAssert() : onWithdraw())}
        />
        <span>{asserted ? 'Asserted' : 'Tick to assert'}</span>
      </label>
    );
  }
  if (asserted) {
    return (
      <button
        type="button"
        className="consent-action ghost asserted"
        onClick={onWithdraw}
      >
        {tile.assertedLabel ?? 'Confirmed'}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`consent-action ${tile.variant === 'gating' ? 'gating' : 'primary'}`}
      onClick={onAssert}
    >
      {tile.actionLabel}
    </button>
  );
}
