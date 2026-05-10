import { useState, useMemo, useRef, useEffect } from 'react';
import { useCaseStore } from '../store/caseStore';
import ApplicantList from './applicants/ApplicantList';
import SubTabPills, { type SubTabId } from './applicants/SubTabPills';
import ContextSwitcher, { type ContextChoice } from './applicants/ContextSwitcher';
import PersonalSection from './applicants/sections/PersonalSection';
import AddressSection from './applicants/sections/AddressSection';
import IdentitySection from './applicants/sections/IdentitySection';
import EmploymentSection from './applicants/sections/EmploymentSection';
import IncomeSection from './applicants/sections/IncomeSection';
import ExpenditureSection from './applicants/sections/ExpenditureSection';
import LiabilitiesSection from './applicants/sections/LiabilitiesSection';
import AdverseSection from './applicants/sections/AdverseSection';
import ProfessionalSection from './applicants/sections/ProfessionalSection';

/**
 * Applicants tab — Standalone v3 chapter 3.
 *  · Applicant cards at top (Daniel + Amara + Add)
 *  · Five sub-tab pills + overflow with hint
 *  · Per-applicant context switcher (Joint surfaces on affordability)
 *  · One sub-section per pill, populated from the case
 */
export default function ApplicantsTab() {
  const parties = useCaseStore((s) => s.case.parties);
  const primary = parties.find((p) => p.isPrimary);

  const [selectedPartyUuid, setSelectedPartyUuid] = useState(
    primary?.uuid ?? parties[0]?.uuid ?? '',
  );
  const [subTab, setSubTab] = useState<SubTabId>('personal');
  const [contextChoice, setContextChoice] = useState<ContextChoice>(
    primary?.uuid ?? '',
  );

  function handleSelectApplicant(uuid: string) {
    setSelectedPartyUuid(uuid);
    setContextChoice(uuid);
  }

  // Step 19 — switch context to a newly-added second applicant the
  // moment they appear. We compare against the previously-rendered
  // applicant set to detect appends.
  const applicantCount = parties.filter((p) => p.kind === 'Person').length;
  const prevCountRef = useRef(applicantCount);
  useEffect(() => {
    if (applicantCount > prevCountRef.current) {
      const newest = [...parties]
        .reverse()
        .find((p) => p.kind === 'Person');
      if (newest) {
        setSelectedPartyUuid(newest.uuid);
        setContextChoice(newest.uuid);
        setSubTab('personal');
      }
    }
    prevCountRef.current = applicantCount;
  }, [applicantCount, parties]);

  // Drive the coral attention dots: a pill needs attention if any
  // proposed extraction targets a field on that section. Simple
  // heuristic that's good enough for the demo.
  const attentionSet = useMemo<Set<SubTabId>>(() => {
    const s = new Set<SubTabId>();
    // Conflict on A51 (basic salary, Employment) when conflict is injected.
    // The store mutators will toggle this on/off via the dev panel.
    s.add('employment');
    return s;
  }, []);

  // The context switcher's effective party for sub-tabs that don't
  // honour 'joint' (everything except Income / Expenditure / Liabilities).
  const sectionPartyUuid =
    contextChoice === 'joint' ? selectedPartyUuid : contextChoice;

  return (
    <div className="applicants-page">
      <ApplicantList
        selectedPartyUuid={selectedPartyUuid}
        onSelect={handleSelectApplicant}
      />

      <div className="applicant-record">
        <ContextSwitcher
          selected={contextChoice}
          onSelect={setContextChoice}
          subTab={subTab}
        />

        <SubTabPills
          active={subTab}
          onChange={setSubTab}
          attentionSet={attentionSet}
        />

        {subTab === 'personal' && <PersonalSection partyUuid={sectionPartyUuid} />}
        {subTab === 'address' && <AddressSection partyUuid={sectionPartyUuid} />}
        {subTab === 'identity' && <IdentitySection partyUuid={sectionPartyUuid} />}
        {subTab === 'employment' && <EmploymentSection partyUuid={sectionPartyUuid} />}
        {subTab === 'income' && <IncomeSection context={contextChoice} />}
        {subTab === 'expenditure' && <ExpenditureSection />}
        {subTab === 'liabilities' && <LiabilitiesSection context={contextChoice} />}
        {subTab === 'adverse' && <AdverseSection partyUuid={sectionPartyUuid} />}
        {subTab === 'professional' && <ProfessionalSection partyUuid={sectionPartyUuid} />}
      </div>
    </div>
  );
}
