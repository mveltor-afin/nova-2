import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../../store/caseStore';
import DocumentDrawer from '../timeline/DocumentDrawer';
import type { DrawerSourceContext } from '../timeline/types';
import { MESSAGES_SEED_CONVERSATION } from '../../mock/messagesSeed';
import Composer from './Composer';
import MessageList from './MessageList';
import MessagesHeader from './MessagesHeader';
import MessagesSkeleton from './MessagesSkeleton';
import {
  groupByDayThenSender,
  selectVisibleMessages,
} from './grouping';
import type { Message, MessageAttachment } from './types';
import './messages.css';

/**
 * Step 25 — Messages tab. Broker-only chat surface.
 *
 * Stub interactions (send, attach, emoji, attachment download,
 * attachment open-in-viewer) call `console.warn` rather than firing
 * real flows. None of the subcomponents throw or alert.
 */
export default function MessagesTab() {
  const { forceLoading, showTyping } = useCaseStore(
    useShallow((s) => ({
      forceLoading: s.dev.messagesForceLoading,
      showTyping: s.dev.messagesShowTyping,
    })),
  );

  if (forceLoading) {
    return (
      <div className="messages-scope">
        <MessagesSkeleton />
      </div>
    );
  }

  return <MessagesTabContent showTyping={showTyping} />;
}

function MessagesTabContent({ showTyping }: { showTyping: boolean }) {
  const conversation = MESSAGES_SEED_CONVERSATION;
  const [query, setQuery] = useState('');
  const [composerValue, setComposerValue] = useState('');
  const [drawerDoc, setDrawerDoc] = useState<{
    doc: MessageAttachment;
    source: DrawerSourceContext;
  } | null>(null);

  const visibleMessages = useMemo(
    () =>
      selectVisibleMessages(
        conversation.messages,
        query,
        conversation.participants,
      ),
    [conversation.messages, conversation.participants, query],
  );
  const days = useMemo(
    () => groupByDayThenSender(visibleMessages, conversation.participants),
    [visibleMessages, conversation.participants],
  );

  const typingParticipant =
    showTyping && conversation.typingParticipantId
      ? conversation.participants.find(
          (p) => p.id === conversation.typingParticipantId,
        )
      : undefined;

  function handleSend() {
    const trimmed = composerValue.trim();
    if (!trimmed) return;
    console.warn('[Messages stub] send not wired:', trimmed);
    setComposerValue('');
  }

  function handleOpenAttachment(a: MessageAttachment, m: Message) {
    const sender = conversation.participants.find((p) => p.id === m.senderId);
    setDrawerDoc({
      doc: a,
      source: {
        sourceTitle: `Message from ${sender?.name ?? 'broker'}`,
        sourceTs: m.ts,
        sourceWho: sender?.name ?? 'Unknown',
      },
    });
  }

  return (
    <div className="messages-scope">
      <MessagesHeader
        unreadCount={conversation.unreadCount}
        query={query}
        onQueryChange={setQuery}
      />
      {visibleMessages.length === 0 && conversation.messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList
          days={days}
          typingParticipant={typingParticipant}
          onOpenAttachment={handleOpenAttachment}
        />
      )}
      <Composer
        value={composerValue}
        onChange={setComposerValue}
        onSend={handleSend}
      />
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

function EmptyState() {
  return (
    <div className="messages-empty">
      <h3>No messages yet</h3>
      <p>
        Messages between you and the Afin team for this case will appear here.
      </p>
    </div>
  );
}
