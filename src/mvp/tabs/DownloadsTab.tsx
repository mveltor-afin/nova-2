import { useCaseStore } from '../store/caseStore';
import DownloadRow from './downloads/DownloadRow';

/**
 * Downloads tab — Standalone v3 chapter 9. Generated outputs (DIP
 * certs + ESIS for the approved products), plus parked rows for
 * Mortgage Offer T&Cs and Audit pack. The audit pack switches from
 * "Not yet available" to active once the case has been submitted.
 *
 * `IsVisibleToBroker` is a model-level flag stubbed in `Document`
 * but not surfaced here — deferred to the Afin journey design pass.
 */
export default function DownloadsTab() {
  const submittedAt = useCaseStore((s) => s.case.submittedAt);
  const reference = useCaseStore((s) => s.case.reference);

  const submitted = !!submittedAt;
  const submittedDate = submitted
    ? new Date(submittedAt!).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="downloads-page">
      <header className="downloads-head">
        <h2 className="downloads-title">Downloads</h2>
        <p className="downloads-sub">
          Generated outputs from Nova and Afin. {reference}.
        </p>
      </header>

      <section className="downloads-section">
        <DownloadRow
          filename="dip-certificate-premier-2yr.pdf"
          reference={`${reference} · DIP-001`}
          date="7 May 2026"
          source="Generated"
        />
        <DownloadRow
          filename="esis-premier-2yr.pdf"
          reference={`${reference} · ESIS-001`}
          date="7 May 2026"
          source="Generated"
        />
        <DownloadRow
          filename="dip-certificate-standard-5yr.pdf"
          reference={`${reference} · DIP-002`}
          date="7 May 2026"
          source="Generated"
        />
        <DownloadRow
          filename="esis-standard-5yr.pdf"
          reference={`${reference} · ESIS-002`}
          date="7 May 2026"
          source="Generated"
        />
        <DownloadRow
          filename="mortgage-offer-terms.pdf"
          reference={`${reference} · OFFER`}
          date="—"
          source="Lender"
          parked
          parkedReason="Issued after offer"
        />
        <DownloadRow
          filename="audit-pack.pdf"
          reference={`${reference} · AUDIT`}
          date={submitted ? submittedDate : '—'}
          source="Generated"
          parked={!submitted}
          parkedReason="Not yet available · generates on submission"
        />
      </section>
    </div>
  );
}
