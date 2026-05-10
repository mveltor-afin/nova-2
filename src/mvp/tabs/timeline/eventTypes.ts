import type { TimelineEventType } from './types';

export interface EventTypeDef {
  id: TimelineEventType;
  label: string;
  /** CSS variable consumed by `.timeline-scope`. */
  accentVar: string;
}

export const EVENT_TYPES: EventTypeDef[] = [
  { id: 'status',   label: 'Status',   accentVar: '--tl-c-status' },
  { id: 'email',    label: 'Email',    accentVar: '--tl-c-email' },
  { id: 'doc',      label: 'Documents',accentVar: '--tl-c-doc' },
  { id: 'chat',     label: 'Chat',     accentVar: '--tl-c-chat' },
  { id: 'ai',       label: 'AI',       accentVar: '--tl-c-ai' },
  { id: 'task',     label: 'Tasks',    accentVar: '--tl-c-task' },
  { id: 'data',     label: 'Data',     accentVar: '--tl-c-data' },
  { id: 'people',   label: 'People',   accentVar: '--tl-c-people' },
  { id: 'external', label: 'External', accentVar: '--tl-c-external' },
  { id: 'note',     label: 'Notes',    accentVar: '--tl-c-note' },
];
