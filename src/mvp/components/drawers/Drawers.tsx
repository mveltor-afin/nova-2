import { useCaseStore } from '../../store/caseStore';
import FieldReviewDrawer from './FieldReviewDrawer';
import SourceEvidenceDrawer from './SourceEvidenceDrawer';
import ConflictResolverDrawer from './ConflictResolverDrawer';
import PartyDetailsDrawer from './PartyDetailsDrawer';
import AddApplicantDrawer from '../../tabs/applicants/AddApplicantDrawer';

/**
 * Single mount point for every workspace drawer. Reads `drawer` state
 * from the store and renders whichever one is active. Mounted once at
 * the Workspace level — drawers themselves are responsible for their
 * own overlay + slide-in chrome via `<Drawer />`.
 */
export default function Drawers() {
  const drawer = useCaseStore((s) => s.drawer);

  switch (drawer.kind) {
    case 'field-review':
      return <FieldReviewDrawer />;
    case 'source-evidence':
      return <SourceEvidenceDrawer />;
    case 'conflict-resolver':
      return <ConflictResolverDrawer />;
    case 'party-details':
      return <PartyDetailsDrawer />;
    case 'add-applicant':
      return <AddApplicantDrawer />;
    case 'none':
    default:
      return null;
  }
}
