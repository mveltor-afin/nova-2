import { NavLink } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';

type DotState = 'empty' | 'partial' | 'complete' | 'attention';

interface TabDef {
  path: string;
  name: string;
  dot: DotState;
  count?: number;
}

const DATA_TABS: TabDef[] = [
  { path: 'quick-input', name: 'Quick input', dot: 'empty' },
  { path: 'applicants', name: 'Applicants', dot: 'empty' },
  { path: 'security', name: 'Security', dot: 'empty' },
  { path: 'connected-parties', name: 'Connected Parties', dot: 'empty' },
  { path: 'products', name: 'Products', dot: 'empty' },
  { path: 'consents', name: 'Consents', dot: 'empty' },
];

const OPS_TABS: TabDef[] = [
  { path: 'documents', name: 'Documents', dot: 'empty' },
  { path: 'messages', name: 'Messages', dot: 'empty' },
  { path: 'timeline', name: 'Timeline', dot: 'empty' },
  { path: 'downloads', name: 'Downloads', dot: 'empty' },
];

function dotClass(state: DotState): string {
  return state === 'empty' ? 'dot' : `dot ${state}`;
}

function TabLink({ tab }: { tab: TabDef }) {
  return (
    <NavLink
      to={`/${tab.path}`}
      className={({ isActive }) => `nova-tab ${isActive ? 'active' : ''}`}
    >
      <span className={dotClass(tab.dot)} />
      {tab.name}
      {tab.count !== undefined && <span className="count">{tab.count}</span>}
    </NavLink>
  );
}

export default function TabStrip() {
  const phase = useCaseStore((s) => s.case.phase);
  // Step 21 — Consents is hidden at DIP. The tab strip simply omits
  // the link; the route itself redirects in Workspace.tsx.
  const dataTabs =
    phase === 'dip'
      ? DATA_TABS.filter((t) => t.path !== 'consents')
      : DATA_TABS;
  return (
    <nav className="nova-tabs" aria-label="Case sections">
      {dataTabs.map((tab) => (
        <TabLink key={tab.path} tab={tab} />
      ))}

      <div className="nova-tab-divider" aria-hidden="true" />

      {OPS_TABS.map((tab) => (
        <TabLink key={tab.path} tab={tab} />
      ))}
    </nav>
  );
}
