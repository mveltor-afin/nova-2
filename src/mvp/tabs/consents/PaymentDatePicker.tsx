import { useCaseStore } from '../../store/caseStore';

/**
 * Step 21 — compact 1-28 day picker for the standing-order debit
 * date. Capped at 28 deliberately — Feb edge cases without complex
 * fallbacks. The lender confirms the actual day post-completion;
 * this is the broker's preference.
 */
export default function PaymentDatePicker() {
  const day = useCaseStore((s) => s.case.preferredPaymentDate ?? 1);
  const setDay = useCaseStore((s) => s.setPreferredPaymentDate);

  return (
    <div className="consent-item__action--date">
      <select
        className="consent-item__date-picker"
        value={day}
        onChange={(e) => setDay(Number(e.target.value))}
        aria-label="Preferred payment day"
      >
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {ordinal(d)}
          </option>
        ))}
      </select>
      <span className="consent-item__date-caption">
        Lender confirms availability post-completion
      </span>
    </div>
  );
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
