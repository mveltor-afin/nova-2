import { dayKey } from '../timeline/helpers';
import type { Message, Participant } from './types';

const FIVE_MIN_MS = 5 * 60 * 1000;

export function shouldGroupWithPrevious(
  prev: Message | undefined,
  curr: Message,
): boolean {
  if (!prev) return false;
  if (prev.senderId !== curr.senderId) return false;
  const ms =
    new Date(curr.ts).getTime() - new Date(prev.ts).getTime();
  if (ms < 0 || ms > FIVE_MIN_MS) return false;
  return dayKey(prev.ts) === dayKey(curr.ts);
}

export interface MessageGroup {
  id: string;
  sender: Participant;
  messages: Message[];
  /** Newest timestamp in the group — drives the meta-line time. */
  firstTs: string;
}

export interface MessageDayGroup {
  dayKey: string;
  groups: MessageGroup[];
}

export function groupByDayThenSender(
  messages: Message[],
  participants: Participant[],
): MessageDayGroup[] {
  const senderById = new Map(participants.map((p) => [p.id, p]));
  const days: MessageDayGroup[] = [];
  let currentDay: MessageDayGroup | undefined;
  let currentGroup: MessageGroup | undefined;
  let prev: Message | undefined;

  for (const m of messages) {
    const k = dayKey(m.ts);
    if (!currentDay || currentDay.dayKey !== k) {
      currentDay = { dayKey: k, groups: [] };
      days.push(currentDay);
      currentGroup = undefined;
      prev = undefined;
    }
    const sender = senderById.get(m.senderId);
    if (!sender) continue;
    if (currentGroup && shouldGroupWithPrevious(prev, m)) {
      currentGroup.messages.push(m);
    } else {
      currentGroup = {
        id: `${m.senderId}-${m.id}`,
        sender,
        messages: [m],
        firstTs: m.ts,
      };
      currentDay.groups.push(currentGroup);
    }
    prev = m;
  }
  return days;
}

export function selectVisibleMessages(
  messages: Message[],
  query: string,
  participants: Participant[],
): Message[] {
  const q = query.trim().toLowerCase();
  if (!q) return messages.slice();
  const senderById = new Map(participants.map((p) => [p.id, p]));
  return messages.filter((m) => {
    if (m.body?.toLowerCase().includes(q)) return true;
    const sender = senderById.get(m.senderId);
    if (sender?.name.toLowerCase().includes(q)) return true;
    if (m.attachments?.some((a) => a.name.toLowerCase().includes(q))) {
      return true;
    }
    return false;
  });
}
