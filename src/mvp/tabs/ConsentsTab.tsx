import { useCaseStore } from '../store/caseStore';
import ConsentCard from './consents/ConsentCard';
import { CONSENT_TILES } from './consents/consents';

/**
 * Consents tab — Standalone v3 chapter 7. Eight tiles in a single
 * `.consents-section`. BTL-only tiles render dimmed when the active
 * product family is not Buy-to-Let; conditional tiles always show
 * with the dashed-amber left border.
 */
export default function ConsentsTab() {
  const productFamily = useCaseStore(
    (s) => s.case.arrangement.productFamily,
  );

  // Hide BTL tiles when product is not BTL — but the brief explicitly
  // wants the BTL row rendered for illustration even on Owner Occupier
  // ("Hidden in active state because product family = OO"). Keep all
  // tiles in the list; the card chrome dims the BTL row.
  const tiles = CONSENT_TILES.filter((t) => {
    if (t.visibleWhen === 'btl') return true; // shown dimmed on OO
    return true;
  });
  void productFamily;

  return (
    <div className="consents-page">
      <header className="consents-head">
        <h2 className="consents-title">Consents &amp; declarations</h2>
        <p className="consents-sub">
          Mandatory items both applicants must assert before submission. The
          Application Declaration is the gating consent.
        </p>
      </header>

      <section className="consents-section">
        {tiles.map((tile) => (
          <ConsentCard key={tile.id} tile={tile} />
        ))}
      </section>
    </div>
  );
}
