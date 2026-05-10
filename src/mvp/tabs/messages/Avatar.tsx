import type { Participant } from './types';

/** Stable palette index derived from participant id. Five low-chroma
 *  options scoped to .messages-scope as `--msg-av-{1..5}`. */
function paletteIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 5) + 1;
}

export interface AvatarProps {
  participant: Participant;
  size?: number;
  showPresence?: boolean;
}

export default function Avatar({
  participant,
  size = 36,
  showPresence = true,
}: AvatarProps) {
  const idx = paletteIndex(participant.id);
  const presenceClass =
    participant.presence === 'online' ? 'is-online' : 'is-offline';
  return (
    <span
      className={`messages-avatar palette-${idx}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="messages-avatar__inner">{participant.initials}</span>
      {showPresence && participant.presence === 'online' && (
        <span
          className={`messages-avatar__presence ${presenceClass}`}
          aria-label="Online"
        />
      )}
    </span>
  );
}
