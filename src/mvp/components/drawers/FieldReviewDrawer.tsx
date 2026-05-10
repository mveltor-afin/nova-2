import { useEffect, useRef, useState } from 'react';
import Drawer from './Drawer';
import FieldReviewCard, { type RecentAction } from './FieldReviewCard';
import { useCaseStore } from '../../store/caseStore';
import type { FieldExtraction } from '../../model/extraction';

/**
 * The "5 awaiting your review" queue. Filter chips at top let the
 * broker narrow to pending / conflicts. Each row is a
 * `<FieldReviewCard />`; once an action lands, the card flashes a
 * "Accepted ✓" success state for 3s before the underlying store
 * change drops it from the queue.
 */
type Filter = 'all' | 'pending' | 'conflicts';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'conflicts', label: 'Conflicts' },
];

export default function FieldReviewDrawer() {
  const drawer = useCaseStore((s) => s.drawer);
  const closeDrawer = useCaseStore((s) => s.closeDrawer);
  const openDrawer = useCaseStore((s) => s.openDrawer);
  const allExtractions = useCaseStore((s) => s.case.extractions);

  const initialFilter = drawer.kind === 'field-review' ? drawer.filter ?? 'all' : 'all';
  const [filter, setFilter] = useState<Filter>(initialFilter);

  // Recently-actioned UUIDs map to their action verb so the card can
  // render the success state. Auto-cleared after 3s.
  const [recent, setRecent] = useState<Map<string, RecentAction>>(new Map());
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      // Clear any pending timers on unmount.
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  function recordAction(uuid: string, action: RecentAction) {
    setRecent((prev) => {
      const next = new Map(prev);
      next.set(uuid, action);
      return next;
    });
    // Schedule cleanup.
    const t = window.setTimeout(() => {
      setRecent((prev) => {
        const next = new Map(prev);
        next.delete(uuid);
        return next;
      });
      timersRef.current.delete(uuid);
    }, 3000);
    timersRef.current.set(uuid, t);
  }

  if (drawer.kind !== 'field-review') return null;

  // Optional document scoping — when the drawer was opened from a
  // document card, only show extractions from that document.
  const scopedExtractions = drawer.documentId
    ? allExtractions.filter((e) => e.documentId === drawer.documentId)
    : allExtractions;

  const queue = buildQueue(scopedExtractions, filter, recent);

  return (
    <Drawer
      title="Field review"
      subtitle={
        <>
          {queue.length} {queue.length === 1 ? 'item' : 'items'} in queue
        </>
      }
      width={520}
      onClose={closeDrawer}
      variant="field-review-drawer"
    >
      <div className="review-filters" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            className={`review-filter ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {queue.length === 0 ? (
        <div className="review-empty">
          <div className="review-empty-title">All clear</div>
          <div className="review-empty-body">
            Nothing in this filter. Switch tabs or upload more documents to keep the
            queue moving.
          </div>
        </div>
      ) : (
        <ul className="review-queue">
          {queue.map((item) => (
            <li key={item.cardKey}>
              <FieldReviewCard
                extractionUuid={item.primary.uuid}
                recentAction={recent.get(item.primary.uuid)}
                onAction={(action) => recordAction(item.primary.uuid, action)}
                onViewEvidence={() =>
                  openDrawer({
                    kind: 'source-evidence',
                    documentId: item.primary.documentId,
                    pageNumber: item.primary.evidencePageNumber,
                    snippet: item.primary.evidenceSnippet,
                    extractionId: item.primary.uuid,
                  })
                }
                onResolveConflict={() =>
                  openDrawer({
                    kind: 'conflict-resolver',
                    targetEntity: item.primary.targetEntity,
                    targetEntityId: item.primary.targetEntityId,
                    targetAttribute: item.primary.targetAttribute,
                  })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

// === Queue building =========================================

interface QueueItem {
  /** Stable key for React. */
  cardKey: string;
  /** Primary extraction shown on the card. */
  primary: FieldExtraction;
  /** True when there's a competing extraction for the same target. */
  isConflict: boolean;
}

/**
 * Group extractions by `targetEntity:targetEntityId:targetAttribute`
 * so a conflict (two extractions for one field) shows as one card.
 * Keep entries that are pending or recently actioned; surface the
 * conflict bucket separately when the filter requires it.
 */
function buildQueue(
  extractions: FieldExtraction[],
  filter: Filter,
  recent: Map<string, RecentAction>,
): QueueItem[] {
  const groups = new Map<string, FieldExtraction[]>();
  for (const e of extractions) {
    const key = `${e.targetEntity}:${e.targetEntityId}:${e.targetAttribute}`;
    const arr = groups.get(key) ?? [];
    arr.push(e);
    groups.set(key, arr);
  }

  const items: QueueItem[] = [];
  for (const [key, group] of groups) {
    const isConflict = group.length > 1 && group.some((e) => e.status === 'Proposed');
    const pendingInGroup = group.filter((e) => e.status === 'Proposed');
    const recentInGroup = group.filter((e) => recent.has(e.uuid));

    if (filter === 'conflicts' && !isConflict) continue;
    if (filter === 'pending' && pendingInGroup.length === 0 && recentInGroup.length === 0) {
      continue;
    }
    if (filter === 'all' && pendingInGroup.length === 0 && recentInGroup.length === 0) {
      continue;
    }

    // Pick the primary: prefer a pending extraction; fall back to the recently-actioned one.
    const primary = pendingInGroup[0] ?? recentInGroup[0] ?? group[0];
    items.push({ cardKey: key, primary, isConflict });
  }

  return items;
}
