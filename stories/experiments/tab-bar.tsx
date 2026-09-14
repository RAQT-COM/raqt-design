import { FOCUS } from "./theme";

const navMeSrc = new URL("./assets/nav-me.png", import.meta.url).href;

/**
 * The footer is identical on every screen: four destinations either side of the
 * primary action. Anything screen-specific — a back button, a participant
 * count, notifications — belongs in the header, not in here.
 *
 * No active state yet: the reference frames show every icon at full white, and
 * which destination owns the start feed is still an open IA question.
 */
export function TabBar({ onSearch }: { onSearch?: () => void }) {
  return (
    <nav className="relative mt-auto h-[90px] shrink-0 border-t border-[var(--hairline)] bg-[var(--chrome)]">
      <div className="flex h-[80px] items-center px-[15px]">
        <div className="flex flex-1 justify-center">
          <button type="button" aria-label="Search" onClick={onSearch} className={`rounded-full ${FOCUS}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="10.5" cy="10.5" r="7.5" stroke="var(--ink)" strokeWidth="2.1" />
              <path d="m16.2 16.2 4.8 4.8" stroke="var(--ink)" strokeWidth="2.1" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 justify-center">
          <button type="button" aria-label="Near me" className={`rounded-full ${FOCUS}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 21.5s7.5-6.1 7.5-11.5a7.5 7.5 0 0 0-15 0c0 5.4 7.5 11.5 7.5 11.5Z"
              stroke="var(--ink)"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="2.9" stroke="var(--ink)" strokeWidth="2.1" />
          </svg>
          </button>
        </div>
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            aria-label="Play"
            className={`flex h-[52px] w-[52px] flex-col items-center justify-center gap-[1px] rounded-[17px] transition-transform duration-100 active:scale-[0.94] ${FOCUS}`}
            style={{
              background:
                "radial-gradient(120% 120% at 50% 58%, #5ae78e 0%, #35d46c 62%, #2bc75e 100%)",
            }}
          >
            {/* on a green fill, so it is white on both grounds — not --ink */}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff" aria-hidden>
              <path d="M13.6 2 4 13.4h6.1L9.4 22 20 10.2h-6.7L13.6 2Z" />
            </svg>
            <span className="text-[10px] leading-[11px] font-extrabold tracking-[0.02em] text-white">
              PLAY
            </span>
          </button>
        </div>
        <div className="flex flex-1 justify-center">
          <button type="button" aria-label="Messages" className={`rounded-full ${FOCUS}`}>
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3.8c-4.8 0-8.7 3.3-8.7 7.4 0 2.3 1.2 4.3 3.1 5.6v3.4l3.3-1.8c.7.1 1.5.2 2.3.2 4.8 0 8.7-3.3 8.7-7.4S16.8 3.8 12 3.8Z"
              stroke="var(--ink)"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
          </svg>
          </button>
        </div>
        <div className="flex flex-1 justify-center">
          <button type="button" aria-label="Your profile" className={`rounded-full ${FOCUS}`}>
            <img src={navMeSrc} alt="" className="h-[33px] w-[33px] rounded-full" />
          </button>
        </div>
      </div>
      <span className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[var(--ink)]" />
    </nav>
  );
}

/** The bell lives in the header now that the footer is fixed. */
export function NotificationBell({ unread = false }: { unread?: boolean }) {
  return (
    <button
      type="button"
      aria-label={unread ? "Notifications, unread" : "Notifications"}
      className={`relative rounded-full ${FOCUS}`}
    >
      <svg width="18" height="22" viewBox="0 0 18 22" fill="var(--ink)" aria-hidden>
        <path d="M9 1.2a6.4 6.4 0 0 0-6.4 6.4v3.7L1 15.1a.9.9 0 0 0 .8 1.3h14.4a.9.9 0 0 0 .8-1.3l-1.6-3.8V7.6A6.4 6.4 0 0 0 9 1.2Z" />
        <path d="M6.6 18a2.5 2.5 0 0 0 4.8 0H6.6Z" />
      </svg>
      {unread && (
        <span className="absolute -top-[1px] -right-[1px] block h-[7px] w-[7px] rounded-full bg-[#ff3b30] ring-2 ring-[var(--bg)]" />
      )}
    </button>
  );
}
