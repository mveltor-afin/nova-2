import IdentityBar from './quickInput/IdentityBar';
import TallyBar from './quickInput/TallyBar';
import QuickInputFooter from './quickInput/QuickInputFooter';
import LoanSection from './quickInput/sections/Loan';
import PropertySection from './quickInput/sections/Property';
import ApplicantsSection from './quickInput/sections/Applicants';
import IncomeAffordabilitySection from './quickInput/sections/IncomeAffordability';
import ThirdPartiesSection from './quickInput/sections/ThirdParties';
import ConsentsDeclarationsSection from './quickInput/sections/ConsentsDeclarations';
import { DropZone } from '../components/atoms';
import { useCaseStore } from '../store/caseStore';
import {
  buildPlaceholderDoc,
  simulateAIPipeline,
} from './documents/aiPipeline';

/**
 * Step 18 — Quick Input restructured. Order:
 *   1. Identity bar
 *   2. Document drop drawer (shared with /documents — Step 17)
 *   3. Six manual-input groups (Loan, Property, Applicants, Income &
 *      affordability, Third parties, Consents & declarations)
 *   4. Tally bar + footer
 *
 * The Configuration Strip (Step 14b) lives inside the Loan section,
 * not at the top of the page — it's part of that group conceptually
 * and counted in its drain count.
 */
export default function QuickInputTab() {
  const addDocument = useCaseStore((s) => s.addDocument);

  function handleFiles(files: File[]) {
    files.forEach((f) => {
      const placeholder = buildPlaceholderDoc(f);
      addDocument(placeholder);
      simulateAIPipeline(placeholder.uuid);
    });
  }

  return (
    <div className="qi-page">
      <IdentityBar />

      <section className="qi-drop-drawer" aria-label="Document drop">
        <div className="qi-drop-drawer__intro">
          <h3 className="qi-drop-drawer__title">Drop documents</h3>
          <p className="qi-drop-drawer__sublabel">
            Nova classifies, OCRs, and routes each file. Matched documents fill
            placeholders on the Documents tab and surface their extractions in
            Field Review.
          </p>
        </div>
        <DropZone
          size="default"
          label="Drop or click to upload"
          sublabel="PDF, JPEG, PNG, HEIC. Multi-file supported."
          onFiles={handleFiles}
        />
      </section>

      <div className="qi-sections-stack">
        <LoanSection defaultOpen />
        <PropertySection />
        <ApplicantsSection />
        <IncomeAffordabilitySection />
        <ThirdPartiesSection />
        <ConsentsDeclarationsSection />
      </div>

      <TallyBar />
      <QuickInputFooter />
    </div>
  );
}
