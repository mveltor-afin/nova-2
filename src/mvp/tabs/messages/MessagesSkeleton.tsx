import Composer from './Composer';
import MessagesHeader from './MessagesHeader';

const ROWS: { side: 'self' | 'other'; barW: number; showSender: boolean }[] = [
  { side: 'other', barW: 50, showSender: true },
  { side: 'self', barW: 55, showSender: false },
  { side: 'other', barW: 38, showSender: true },
  { side: 'self', barW: 42, showSender: false },
];

export default function MessagesSkeleton() {
  return (
    <div className="messages-skeleton">
      <MessagesHeader
        unreadCount={0}
        query=""
        onQueryChange={() => {}}
        disabled
      />
      <div className="messages-list">
        <div className="messages-list__inner">
          <div className="messages-skeleton__day" />
          {ROWS.map((r, i) => (
            <div
              key={i}
              className={`messages-skeleton__row messages-skeleton__row--${r.side}`}
            >
              {r.side === 'other' && (
                <span className="messages-skeleton__avatar" />
              )}
              <div className="messages-skeleton__column">
                {r.showSender && (
                  <span
                    className="messages-skeleton__bar sender"
                    style={{ width: '32%' }}
                  />
                )}
                <span
                  className="messages-skeleton__bar bubble"
                  style={{ width: `${r.barW}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Composer
        value=""
        onChange={() => {}}
        onSend={() => {}}
        disabled
      />
    </div>
  );
}
