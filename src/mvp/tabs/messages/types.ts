import type { TimelineDoc } from '../timeline/types';

export type ParticipantRole =
  | 'Broker'
  | 'Underwriter'
  | 'Case Manager'
  | 'Document Reviewer'
  | 'Compliance';

export interface Participant {
  id: string;
  name: string;
  /** 2 chars max — derived once at seed-time so render is stable. */
  initials: string;
  role: ParticipantRole;
  presence: 'online' | 'offline';
  isSelf?: boolean;
}

/** Reuse Step 24's TimelineDoc shape so the DocumentDrawer can mount
 *  attachments directly without conversion. */
export type MessageAttachment = TimelineDoc;

export interface Message {
  id: string;
  ts: string;
  senderId: string;
  body?: string;
  attachments?: MessageAttachment[];
  readBySelf?: boolean;
}

export interface Conversation {
  caseRef: string;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
  typingParticipantId?: string;
}
