import { useEffect, useState } from 'react';
import { GlassCard } from '../../../components/atoms';
import { useCaseStore } from '../../../store/caseStore';
import type { ContextChoice } from '../ContextSwitcher';
import type { IncomeCategory, Income } from '../../../model/financial';

const INCOME_ROWS: { fieldId: string; label: string; category: IncomeCategory }[] = [
  { fieldId: 'I1', label: 'Salary (gross)', category: 'Salary' },
  { fieldId: 'I2', label: 'Bonus', category: 'Bonus' },
  { fieldId: 'I3', label: 'Overtime', category: 'Overtime' },
  { fieldId: 'I4', label: 'Commission', category: 'Commission' },
  { fieldId: 'I5', label: 'Allowances', category: 'Allowances' },
  { fieldId: 'I6', label: 'Self-employed profit', category: 'SelfEmployedProfit' },
  { fieldId: 'I7', label: "Director's dividends", category: 'Dividends' },
  { fieldId: 'I8', label: "Director's salary", category: 'DirectorSalary' },
  { fieldId: 'I9', label: 'Rental income', category: 'Rental' },
  { fieldId: 'I10', label: 'State pension', category: 'StatePension' },
  { fieldId: 'I11', label: 'Private pension', category: 'PrivatePension' },
  { fieldId: 'I12', label: 'Workplace pension', category: 'WorkplacePension' },
  { fieldId: 'I13', label: 'Investment income', category: 'InvestmentIncome' },
  { fieldId: 'I14', label: 'Trust income', category: 'TrustIncome' },
  { fieldId: 'I15', label: 'Maintenance received', category: 'Maintenance' },
  { fieldId: 'I16', label: 'Child Benefit', category: 'ChildBenefit' },
  { fieldId: 'I17', label: 'Universal Credit', category: 'UniversalCredit' },
  { fieldId: 'I18', label: 'Disability benefit', category: 'DisabilityBenefit' },
];

export default function IncomeSection({ context }: { context: ContextChoice }) {
  const items = useCaseStore((s) => s.case.financialItems);

  return (
    <GlassCard padding="lg" className="applicant-section">
      <h3 className="section-title">Income</h3>
      <div className="fields applicants-section__grid">
        {INCOME_ROWS.map((row) => {
          const match = items.find(
            (i): i is Income =>
              i.kind === 'Income' &&
              i.category === row.category &&
              (context === 'joint' ? true : i.partyUuid === context),
          );
          return (
            <IncomeRow
              key={row.fieldId}
              label={row.label}
              fieldId={row.fieldId}
              category={row.category}
              partyUuid={context === 'joint' ? undefined : context}
              amount={match?.amount}
            />
          );
        })}
      </div>
    </GlassCard>
  );
}

function IncomeRow({
  label,
  fieldId,
  category,
  partyUuid,
  amount,
}: {
  label: string;
  fieldId: string;
  category: IncomeCategory;
  partyUuid: string | undefined;
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
    setAmount({ kind: 'Income', category, partyUuid, amount: n });
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
