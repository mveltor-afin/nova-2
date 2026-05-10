import { useEffect, useState } from 'react';
import { GlassCard } from '../../../components/atoms';
import { useCaseStore } from '../../../store/caseStore';
import type { ExpenditureCategory, Expenditure } from '../../../model/financial';

const E_ROWS: { fieldId: string; label: string; category: ExpenditureCategory }[] = [
  { fieldId: 'E1', label: 'Council Tax', category: 'CouncilTax' },
  { fieldId: 'E2', label: 'Utilities (gas, electric, water)', category: 'Utilities' },
  { fieldId: 'E3', label: 'Buildings & contents insurance', category: 'Insurance' },
  { fieldId: 'E4', label: 'Childcare', category: 'Childcare' },
  { fieldId: 'E5', label: 'School / private fees', category: 'SchoolFees' },
  { fieldId: 'E6', label: 'Travel & commuting', category: 'Travel' },
  { fieldId: 'E7', label: 'Food & housekeeping', category: 'Food' },
  { fieldId: 'E8', label: 'Mobile / broadband / TV', category: 'Communications' },
  { fieldId: 'E9', label: 'Subscriptions', category: 'Subscriptions' },
  { fieldId: 'E10', label: 'Pension contributions (post-tax)', category: 'PensionContributions' },
  { fieldId: 'E11', label: 'Maintenance paid', category: 'MaintenancePaid' },
  { fieldId: 'E12', label: 'Charitable giving', category: 'CharitableGiving' },
  { fieldId: 'E13', label: 'Ground rent / service charge', category: 'GroundRentServiceCharge' },
  { fieldId: 'E14', label: 'Other essential expenditure', category: 'OtherExpenditure' },
];

export default function ExpenditureSection() {
  const items = useCaseStore((s) => s.case.financialItems);

  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Expenditure · joint household</h3>
      <p className="section-sub">
        Monthly figures. Defaults pulled from joint bank-statement extraction;
        broker-confirmed values stick.
      </p>
      <div className="fields applicants-section__grid">
        {E_ROWS.map((row) => {
          const match = items.find(
            (i): i is Expenditure =>
              i.kind === 'Expenditure' && i.category === row.category,
          );
          return (
            <ExpenditureRow
              key={row.fieldId}
              fieldId={row.fieldId}
              label={row.label}
              category={row.category}
              amount={match?.amount}
            />
          );
        })}
      </div>
    </GlassCard>
  );
}

function ExpenditureRow({
  fieldId,
  label,
  category,
  amount,
}: {
  fieldId: string;
  label: string;
  category: ExpenditureCategory;
  amount: number | undefined;
}) {
  const setAmount = useCaseStore((s) => s.setFinancialItemAmount);
  const [local, setLocal] = useState<string>(
    amount !== undefined ? String(amount) : '',
  );
  useEffect(() => {
    setLocal(amount !== undefined ? String(amount) : '');
  }, [amount]);

  function commit() {
    const n = Number(local);
    if (Number.isNaN(n)) return;
    setAmount({ kind: 'Expenditure', category, amount: n });
  }

  return (
    <div className="field field--editable">
      <span className="lbl">
        {label}
        <span className="lbl-suffix">{fieldId}</span>
      </span>
      <div className="qi-money-wrap reg-field-input">
        <span className="qi-money-prefix">£</span>
        <input
          type="number"
          className="qi-input qi-money-input"
          value={local}
          placeholder="—"
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
        />
        <span className="qi-money-suffix">/ month</span>
      </div>
    </div>
  );
}
