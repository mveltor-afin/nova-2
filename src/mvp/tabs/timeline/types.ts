export type TimelineEventType =
  | 'status'
  | 'email'
  | 'doc'
  | 'chat'
  | 'ai'
  | 'task'
  | 'data'
  | 'people'
  | 'external'
  | 'note';

export type TimelineBadge = 'AI' | 'System';

export interface TimelineDoc {
  name: string;
  type: string;
  size: string;
  version: string;
  pages?: number;
  aiClass?: string;
  who?: string;
}

export type TimelineEventPayload =
  | { single: TimelineDoc }
  | { docs: TimelineDoc[] }
  | {
      from: string;
      to: string;
      cc: string;
      subject: string;
      preview?: string;
      body?: string[];
      attachments?: TimelineDoc[];
    };

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  ts: string;
  title: string;
  desc?: string;
  who: string;
  source?: string;
  badges?: TimelineBadge[];
  meta?: Record<string, string>;
  grouped?: boolean;
  groupExpanded?: boolean;
  expanded?: boolean;
  payload?: TimelineEventPayload;
}

export type TimelineSort = 'newest' | 'oldest';
export type TimelineDensity = 'comfortable' | 'compact';

export interface DrawerSourceContext {
  sourceTitle: string;
  sourceTs: string;
  sourceWho: string;
}
