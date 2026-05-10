import { GlassCard, FieldRow, Chip } from '../../../components/atoms';
import { useCaseStore } from '../../../store/caseStore';
import type { ContextChoice } from '../ContextSwitcher';
import type { Liability } from '../../../model/financial';

/**
 * Liabilities sub-tab — L1 count picker, L2/L3 aggregates, then per-debt
 * detail rows L4–L11 (up to 5 debts). The MVP renders the count + a
 * compact debt list with each debt's L4–L11 fields collapsed into a
 * one-row summary (full per-debt drawer is a Step 8+ addition).
 */
export default function LiabilitiesSection({ context }: { context: ContextChoice }) {
  const items = useCaseStore((s) => s.case.financialItems);

  const liabilities = items.filter(
    (i): i is Liability =>
      i.kind === 'Liability' &&
      (context === 'joint' ? true : i.partyUuid === context),
  );

  const totalBalance = liabilities.reduce((sum, l) => sum + l.balance, 0);
  const totalMonthly = liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);

  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Liabilities</h3>

      <div className="fields applicants-section__grid">
        <FieldRow
          label="Number of debts"
          labelSuffix="L1"
          value={liabilities.length.toString()}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'A. Okafor (broker)' }}
        />
        <FieldRow
          label="Total outstanding balance"
          labelSuffix="L2 · derived"
          value={`£${totalBalance.toLocaleString('en-GB')}`}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'Computed' }}
        />
        <FieldRow
          label="Total monthly payments"
          labelSuffix="L3 · derived"
          value={`£${totalMonthly.toLocaleString('en-GB')} / month`}
          state="populated"
          provenance={{ source: 'manual', enteredBy: 'Computed' }}
        />
      </div>

      {liabilities.length > 0 && (
        <div className="liab-list">
          <h4 className="liab-list-title">Per-debt detail</h4>
          {liabilities.slice(0, 5).map((l, i) => (
            <article key={l.uuid} className="liab-row">
              <div className="liab-row-head">
                <span className="liab-row-index">#{i + 1}</span>
                <Chip tone="neutral">{prettyCategory(l.category)}</Chip>
                <span className="liab-row-label">{l.label ?? '—'}</span>
              </div>
              <div className="liab-row-meta">
                <span>
                  L4 Balance · <strong>£{l.balance.toLocaleString('en-GB')}</strong>
                </span>
                <span>
                  L5 Monthly · <strong>£{l.monthlyPayment.toLocaleString('en-GB')}</strong>
                </span>
                {l.endDate && (
                  <span>
                    L6 End date · <strong>{l.endDate}</strong>
                  </span>
                )}
                <span>
                  L11 Repaid on completion · <strong>{l.toBeRepaidOnCompletion ? 'Yes' : 'No'}</strong>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function prettyCategory(c: string): string {
  return c.replace(/([A-Z])/g, ' $1').trim();
}
