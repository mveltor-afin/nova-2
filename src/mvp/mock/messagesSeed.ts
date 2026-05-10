import type { Conversation } from '../tabs/messages/types';

/**
 * Seed conversation for the Okafor case. Times pinned around REL_NOW
 * (2026-02-26T10:00:00Z) so day separators and relative times stay
 * deterministic across screenshots. Broker is the "self" speaker;
 * James Morrish (Underwriter) and Lauren Wells (Case Manager) are
 * the other participants. Lauren is "typing" by default per the
 * dev-panel demo.
 */
export const MESSAGES_SEED_CONVERSATION: Conversation = {
  caseRef: 'ARR-2026-04-19847',
  participants: [
    {
      id: 'p_self',
      name: 'A. Okafor',
      initials: 'AO',
      role: 'Broker',
      presence: 'online',
      isSelf: true,
    },
    {
      id: 'p_jm',
      name: 'James Morrish',
      initials: 'JM',
      role: 'Underwriter',
      presence: 'offline',
    },
    {
      id: 'p_lw',
      name: 'Lauren Wells',
      initials: 'LW',
      role: 'Case Manager',
      presence: 'online',
    },
  ],
  messages: [
    {
      id: 'm1',
      ts: '2026-02-24T09:14:00Z',
      senderId: 'p_self',
      body:
        "Morning — I've uploaded the fact-find and the supporting docs for Okafor · Camberwell. Anything else you need from my side to start the assessment?",
    },
    {
      id: 'm2',
      ts: '2026-02-24T11:42:00Z',
      senderId: 'p_jm',
      body:
        "Thanks. I'll take a look this afternoon and come back if anything's missing.",
    },
    {
      id: 'm3',
      ts: '2026-02-25T14:18:00Z',
      senderId: 'p_jm',
      body:
        "Quick one on the deposit source — there's a mention of a property sale a couple of years ago. Do you have the completion statement?",
    },
    {
      id: 'm4',
      ts: '2026-02-25T16:02:00Z',
      senderId: 'p_jm',
      body:
        "And while you're there, the most recent payslip I'm seeing is January — is there a February one yet?",
    },
    {
      id: 'm5',
      ts: '2026-02-26T09:30:00Z',
      senderId: 'p_self',
      body:
        'The sale completed December 2023, net proceeds were £180,000. Happy to provide the completion statement if that helps.',
      attachments: [
        {
          name: 'Completion-Statement-Brixton-2023.pdf',
          type: 'PDF',
          size: '89 KB',
          version: 'v1',
          pages: 2,
          aiClass: 'Property completion statement',
          who: 'A. Okafor',
        },
      ],
    },
    {
      id: 'm6',
      ts: '2026-02-26T09:32:00Z',
      senderId: 'p_self',
      body:
        "February payslip should be with the applicant by the end of the week. I'll forward as soon as it lands.",
    },
    {
      id: 'm7',
      ts: '2026-02-26T09:48:00Z',
      senderId: 'p_jm',
      body:
        "That's exactly what I needed — thank you. The completion statement is helpful. I'll continue the assessment and come back if anything else arises.",
    },
    {
      id: 'm8',
      ts: '2026-02-26T10:42:00Z',
      senderId: 'p_lw',
      body:
        "I've reviewed the full fact-find alongside James's notes. A couple of items I'd like to clarify before we proceed to valuation:",
    },
    {
      id: 'm9',
      ts: '2026-02-26T10:43:00Z',
      senderId: 'p_lw',
      body:
        "1. Amara's secondary employment — is the tutoring income expected to continue, or is it winding down?\n2. The gifted deposit from family — do we have the donor's bank statements covering the last 3 months?",
    },
  ],
  unreadCount: 3,
  typingParticipantId: 'p_lw',
};
