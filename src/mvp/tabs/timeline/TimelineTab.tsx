import { useMemo, useState } from 'react';
import { useCaseStore } from '../../store/caseStore';
import DocumentDrawer from './DocumentDrawer';
import TimelineActiveFilters from './TimelineActiveFilters';
import TimelineFilterChips from './TimelineFilterChips';
import TimelineList from './TimelineList';
import TimelineSkeleton from './TimelineSkeleton';
import TimelineToolbar from './TimelineToolbar';
import {
  groupByDayKey,
  selectVisibleTimelineEvents,
} from './helpers';
import { TIMELINE_SEED_EVENTS } from '../../mock/timelineSeed';
import type {
  DrawerSourceContext,
  TimelineDensity,
  TimelineDoc,
  TimelineEvent,
  TimelineEventType,
  TimelineSort,
} from './types';
import './timeline.css';

/**
 * Step 24 — Timeline tab. Broker-only event log.
 *
 * Stub interactions (Reply, Reply all, Forward, Open in mail viewer,
 * Download, Open in viewer, Reclassify, Jump to event, More filters)
 * call `console.warn` rather than firing real flows. None of the
 * payload renderers throw or alert.
 */
export default function TimelineTab() {
  const forceLoading = useCaseStore((s) => s.dev.timelineForceLoading);

  if (forceLoading) {
    return (
      <div className="timeline-scope">
        <TimelineSkeleton />
      </div>
    );
  }
  return <TimelineTabContent />;
}

function TimelineTabContent() {
  const events = TIMELINE_SEED_EVENTS;

  const [density, setDensity] = useState<TimelineDensity>('comfortable');
  const [sort, setSort] = useState<TimelineSort>('newest');
  const [filters, setFilters] = useState<Set<TimelineEventType>>(new Set());
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(events.filter((e) => e.expanded).map((e) => e.id)),
  );
  const [groupOpenIds, setGroupOpenIds] = useState<Set<string>>(
    () => new Set(events.filter((e) => e.groupExpanded).map((e) => e.id)),
  );
  const [drawerDoc, setDrawerDoc] = useState<{
    doc: TimelineDoc;
    source: DrawerSourceContext;
  } | null>(null);

  const visibleEvents = useMemo(
    () => selectVisibleTimelineEvents(events, filters, query, sort),
    [events, filters, query, sort],
  );
  const byDay = useMemo(() => groupByDayKey(visibleEvents), [visibleEvents]);

  function toggleFilter(id: TimelineEventType) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function clearFilters() {
    setFilters(new Set());
    setQuery('');
  }
  function toggleEmail(id: string) {
    setExpandedIds((prev) => toggleSet(prev, id));
  }
  function toggleGroup(id: string) {
    setGroupOpenIds((prev) => toggleSet(prev, id));
  }
  function openDoc(doc: TimelineDoc, ctx: TimelineEvent) {
    setDrawerDoc({
      doc,
      source: {
        sourceTitle: ctx.title,
        sourceTs: ctx.ts,
        sourceWho: ctx.who,
      },
    });
  }

  return (
    <div className="timeline-scope">
      <TimelineToolbar
        query={query}
        onQueryChange={setQuery}
        density={density}
        onDensityChange={setDensity}
        sort={sort}
        onSortChange={setSort}
      />
      <TimelineFilterChips active={filters} onToggle={toggleFilter} />
      <TimelineActiveFilters
        active={filters}
        query={query}
        visibleCount={visibleEvents.length}
        totalCount={events.length}
        onRemoveType={toggleFilter}
        onClearQuery={() => setQuery('')}
        onClearAll={clearFilters}
      />

      {events.length === 0 ? (
        <EmptyCaseState />
      ) : visibleEvents.length === 0 ? (
        <EmptyFilterState onClear={clearFilters} />
      ) : (
        <TimelineList
          groups={byDay}
          density={density}
          expandedIds={expandedIds}
          groupOpenIds={groupOpenIds}
          onToggleEmail={toggleEmail}
          onToggleGroup={toggleGroup}
          onOpenDoc={openDoc}
        />
      )}

      {drawerDoc && (
        <DocumentDrawer
          doc={drawerDoc.doc}
          source={drawerDoc.source}
          onClose={() => setDrawerDoc(null)}
        />
      )}
    </div>
  );
}

function EmptyFilterState({ onClear }: { onClear: () => void }) {
  return (
    <div className="timeline-empty">
      <p>No events match your filters.</p>
      <button type="button" className="timeline-empty__clear" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}

function EmptyCaseState() {
  return (
    <div className="timeline-empty timeline-empty--case">
      <h3>Nothing has happened on this case yet</h3>
      <p>
        The first event will appear here. Documents and emails copying{' '}
        <code>case@afinbank.com</code> land automatically; broker chat is
        captured.
      </p>
    </div>
  );
}

function toggleSet<T>(set: Set<T>, id: T): Set<T> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
