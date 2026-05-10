import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../../../store/caseStore';
import SectionGroup from '../SectionGroup';
import {
  QiTextInput,
  QiSubhead,
  QiFieldGrid,
} from '../ManualInputs';
import type { ThirdParty } from '../../../model/thirdparty';

export default function ThirdPartiesSection() {
  const thirdParties = useCaseStore(
    useShallow((s) => s.case.thirdParties),
  );
  const solicitor = thirdParties.find((tp) => tp.role === 'Solicitor');
  const broker = thirdParties.find((tp) => tp.role === 'MortgageBroker');
  const valuer = thirdParties.find((tp) => tp.role === 'Surveyor');

  const fields: Array<ThirdParty | undefined> = [solicitor, broker, valuer];
  const populated = fields.filter((tp) => !!tp?.name).length;
  const total = fields.length;

  return (
    <SectionGroup
      id="third-parties"
      name="Third parties"
      icon={ICON}
      populated={populated}
      total={total}
    >
      <QiSubhead>Solicitor</QiSubhead>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t-solicitor-firm"
          label="Firm"
          defaultValue={solicitor?.name ?? ''}
        />
        <QiTextInput
          id="t-solicitor-contact"
          label="Contact name"
          defaultValue={solicitor?.contactName ?? ''}
        />
      </QiFieldGrid>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t-solicitor-email"
          label="Email"
          type="email"
          defaultValue={solicitor?.email ?? ''}
        />
        <QiTextInput
          id="t-solicitor-phone"
          label="Phone"
          type="tel"
          defaultValue={solicitor?.phone ?? ''}
        />
      </QiFieldGrid>

      <QiSubhead>Broker fee recipient</QiSubhead>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t-broker-firm"
          label="Firm"
          defaultValue={broker?.name ?? ''}
        />
        <QiTextInput
          id="t-broker-contact"
          label="Contact name"
          defaultValue={broker?.contactName ?? ''}
        />
      </QiFieldGrid>

      <QiSubhead>Valuer</QiSubhead>
      <QiFieldGrid columns={2}>
        <QiTextInput
          id="t-valuer-firm"
          label="Firm"
          defaultValue={valuer?.name ?? ''}
          placeholder="TBC at DIP"
          hint="Usually allocated post-DIP."
        />
        <QiTextInput
          id="t-valuer-contact"
          label="Contact name"
          defaultValue={valuer?.contactName ?? ''}
        />
      </QiFieldGrid>
    </SectionGroup>
  );
}

const ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
