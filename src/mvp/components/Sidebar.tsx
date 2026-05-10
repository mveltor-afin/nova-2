import { useState } from 'react';

type NavId = 'pipeline' | 'applications' | 'clients' | 'messages';

const ICON = {
  pipeline: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  applications: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  clients: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  messages: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

const ITEMS: { id: NavId; label: string }[] = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'applications', label: 'Applications' },
  { id: 'clients', label: 'Clients' },
  { id: 'messages', label: 'Messages' },
];

export default function Sidebar() {
  const [active, setActive] = useState<NavId>('applications');

  return (
    <aside className="nova-sidebar" aria-label="Primary navigation">
      <div className="nova-brand-mark" aria-hidden="true">A</div>

      {ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nova-nav-icon ${active === item.id ? 'active' : ''}`}
          onClick={() => setActive(item.id)}
          title={item.label}
          aria-label={item.label}
          aria-current={active === item.id ? 'page' : undefined}
        >
          {ICON[item.id]}
        </button>
      ))}

      <div className="nova-sidebar-spacer" />

      <div className="nova-user-avatar" title="A. Okafor (broker)" aria-label="A. Okafor (broker)">
        AO
      </div>
    </aside>
  );
}
