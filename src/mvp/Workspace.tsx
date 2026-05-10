import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import './styles/workspace.css';

import Sidebar from './components/Sidebar';
import ContextHeader from './components/ContextHeader';
import TabStrip from './components/TabStrip';
import DocumentRail from './components/DocumentRail';
import DevPanel from './components/DevPanel';
import SubmitBanner from './components/SubmitBanner';
import { Drawers } from './components/drawers';
import { useCaseStore } from './store/caseStore';
import { selectIsCaseLocked } from './store/selectors';

import QuickInputTab from './tabs/QuickInputTab';
import ApplicantsTab from './tabs/ApplicantsTab';
import SecurityTab from './tabs/SecurityTab';
import ProductsTab from './tabs/ProductsTab';
import ConnectedPartiesTab from './tabs/ConnectedPartiesTab';
import ConsentsTab from './tabs/ConsentsTab';
import DocumentsTab from './tabs/DocumentsTab';
import MessagesTab from './tabs/MessagesTab';
import TimelineTab from './tabs/TimelineTab';
import DownloadsTab from './tabs/DownloadsTab';

function WorkspaceLayout() {
  const location = useLocation();
  // Documents has its own full surface; rail hides on that route to avoid duplication.
  const showRail = location.pathname !== '/documents';
  const caseState = useCaseStore((s) => s.case);
  const phase = caseState.phase;
  // Step 16 + 23 — `is-locked` covers the disbursed full lock;
  // `is-locked-fields` adds the post-submission partial lock that
  // covers fields/applicants/security/consents/products but leaves
  // documents editable so the lender can still receive uploads.
  const lockState = selectIsCaseLocked(caseState);
  const rootClass = [
    'nova-mvp-root',
    phase === 'disbursed' ? 'is-locked' : '',
    lockState.fields && phase !== 'disbursed' ? 'is-locked-fields' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <Sidebar />
      <main className="nova-mvp-main">
        <SubmitBanner />
        <ContextHeader />
        <TabStrip />
        <div className="nova-tab-content">
          <Routes>
            <Route path="/" element={<Navigate to="/quick-input" replace />} />
            <Route path="/quick-input" element={<QuickInputTab />} />
            <Route path="/applicants" element={<ApplicantsTab />} />
            <Route path="/security" element={<SecurityTab />} />
            <Route path="/products" element={<ProductsTab />} />
            <Route path="/connected-parties" element={<ConnectedPartiesTab />} />
            <Route
              path="/consents"
              element={
                phase === 'dip' ? (
                  <Navigate to="/quick-input" replace />
                ) : (
                  <ConsentsTab />
                )
              }
            />
            <Route path="/documents" element={<DocumentsTab />} />
            <Route path="/messages" element={<MessagesTab />} />
            <Route path="/timeline" element={<TimelineTab />} />
            <Route path="/downloads" element={<DownloadsTab />} />
            <Route path="*" element={<Navigate to="/quick-input" replace />} />
          </Routes>
        </div>
      </main>
      {showRail && <DocumentRail />}
      <DevPanel />
      <Drawers />
    </div>
  );
}

export default function Workspace() {
  return (
    <BrowserRouter>
      <WorkspaceLayout />
    </BrowserRouter>
  );
}
