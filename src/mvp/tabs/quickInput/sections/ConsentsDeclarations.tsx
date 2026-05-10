import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../../../store/caseStore';
import SectionGroup from '../SectionGroup';

interface ConsentTile {
  id: string;
  label: string;
  description: string;
}

const CONSENT_TILES: ConsentTile[] = [
  {
    id: 'CreditSearchConsent',
    label: 'Consent to credit search',
    description:
      'Authorises Afin to perform an identity + credit search at DIP and at full app.',
  },
  {
    id: 'OpenBanking',
    label: 'Open Banking consent',
    description:
      'Allows Afin to retrieve transaction history for affordability assessment.',
  },
  {
    id: 'MarketingConsent',
    label: 'Marketing communications',
    description:
      'Optional — Afin may send product updates and rate change notices.',
  },
];

export default function ConsentsDeclarationsSection() {
  const { assertions } = useCaseStore(
    useShallow((s) => ({ assertions: s.case.consentAssertions })),
  );
  const assertConsent = useCaseStore((s) => s.assertConsent);

  const total = CONSENT_TILES.length;
  const populated = CONSENT_TILES.filter((t) => assertions[t.id]).length;

  return (
    <SectionGroup
      id="consents"
      name="Consents & declarations"
      icon={ICON}
      populated={populated}
      total={total}
    >
      <div className="qi-consent-tiles">
        {CONSENT_TILES.map((t) => {
          const granted = !!assertions[t.id];
          return (
            <div
              key={t.id}
              className={`qi-consent-tile ${granted ? 'is-granted' : ''}`}
            >
              <div className="qi-consent-tile__text">
                <div className="qi-consent-tile__label">{t.label}</div>
                <div className="qi-consent-tile__desc">{t.description}</div>
              </div>
              <button
                type="button"
                className={`dc-btn ${granted ? 'ghost' : 'primary'}`}
                onClick={() => assertConsent(t.id, !granted)}
              >
                {granted ? 'Granted' : 'Grant consent'}
              </button>
            </div>
          );
        })}
      </div>
    </SectionGroup>
  );
}

const ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 14l2 2 4-4" />
  </svg>
);
