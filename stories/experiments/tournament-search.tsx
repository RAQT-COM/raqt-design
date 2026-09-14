import { useMemo, useState } from "react";

import { BAND, Backdrop } from "./backdrop";
import { SNAP } from "./motion";

const courtSrc = new URL("./assets/court.png", import.meta.url).href;
const feedSrc = new URL("./assets/feed.png", import.meta.url).href;
const navMeSrc = new URL("./assets/nav-me.png", import.meta.url).href;

const DISPLAY = '"Archivo", ui-sans-serif, sans-serif';

type Tournament = {
  id: string;
  name: string;
  city: string;
  country: string;
  dates: string;
  open: boolean;
  image: string;
};

const TOURNAMENTS: Tournament[] = [
  { id: "sto", name: "Stockholm Pickleball Open", city: "Stockholm", country: "Sweden", dates: "Sep 22–24, 2023", open: true, image: feedSrc },
  { id: "got", name: "Göteborg Winter Slam", city: "Göteborg", country: "Sweden", dates: "Oct 6–8, 2023", open: true, image: courtSrc },
  { id: "cph", name: "Copenhagen Paddle Cup", city: "København", country: "Denmark", dates: "Oct 20–22, 2023", open: false, image: feedSrc },
  { id: "osl", name: "Oslo Indoor Championship", city: "Oslo", country: "Norway", dates: "Nov 3–5, 2023", open: true, image: courtSrc },
  { id: "mma", name: "Malmö Autumn Classic", city: "Malmö", country: "Sweden", dates: "Nov 17–19, 2023", open: false, image: feedSrc },
  { id: "hel", name: "Helsinki Nordic Masters", city: "Helsinki", country: "Finland", dates: "Dec 1–3, 2023", open: true, image: courtSrc },
];

const COUNTRIES = ["All countries", "Sweden", "Denmark", "Norway", "Finland"];
const STATUSES = ["All", "Open", "Closed"] as const;
type Status = (typeof STATUSES)[number];

function StatusBar() {
  return (
    <div className="flex h-[54px] shrink-0 items-center justify-between px-5">
      <span className="text-[15px] font-semibold tracking-[-0.02em]">9:41</span>
      <div className="flex items-center gap-[7px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="white" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
          <path d="M1 4.2a11 11 0 0 1 15 0M3.7 7a7.2 7.2 0 0 1 9.6 0" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="8.5" cy="10.3" r="1.5" fill="white" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="white" strokeOpacity="0.5" />
          <rect x="2" y="2" width="18" height="8" rx="2" fill="white" />
          <path d="M23 4.3v3.4a1.9 1.9 0 0 0 0-3.4Z" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

function StatusPill({ open }: { open: boolean }) {
  return (
    <span
      className={`rounded-full px-[8px] py-[2px] text-[11px] leading-[14px] font-bold ${
        open ? "bg-[#3fe176] text-black" : "bg-[#333333] text-[#8a8a8a]"
      }`}
    >
      {open ? "OPEN" : "CLOSED"}
    </span>
  );
}

function TournamentCard({ t }: { t: Tournament }) {
  return (
    <article
      className="overflow-hidden rounded-[20px] bg-[#282828] transition-transform duration-100 active:scale-[0.985]"
      style={{ transitionTimingFunction: SNAP }}
    >
      <img src={t.image} alt="" className="h-[112px] w-full object-cover" />
      <div className="px-[14px] pt-[12px] pb-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] leading-[14px] font-semibold tracking-[0.04em] text-[#9a9a9a] uppercase">
            {t.dates}
          </span>
          <StatusPill open={t.open} />
        </div>
        <h3
          className="mt-[8px] text-[18px] leading-[20px] font-extrabold tracking-[-0.01em] uppercase"
          style={{ fontFamily: DISPLAY }}
        >
          {t.name}
        </h3>
        <div className="mt-[9px] flex items-center gap-[5px]">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="white" aria-hidden>
            <path d="M6 .8a4 4 0 0 0-4 4c0 3 4 6.4 4 6.4s4-3.4 4-6.4a4 4 0 0 0-4-4Zm0 5.6a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z" />
          </svg>
          <span className="text-[11px] leading-[14px] font-medium">
            {t.city}, {t.country}
          </span>
        </div>
      </div>
    </article>
  );
}

function CountrySheet({
  value,
  onPick,
  onClose,
}: {
  value: string;
  onPick: (c: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        className="relative rounded-t-[24px] bg-[#1c1c1c] px-[15px] pt-[10px] pb-[22px]"
        style={{ animation: `sheet-up 180ms ${SNAP} both` }}
      >
        <span className="mx-auto mb-[14px] block h-[4px] w-[38px] rounded-full bg-[#464646]" />
        {COUNTRIES.map((c) => {
          const active = c === value;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onPick(c)}
              className={`flex w-full items-center justify-between rounded-[14px] px-[13px] py-[13px] text-left text-[15px] font-semibold transition-transform duration-100 active:scale-[0.98] ${
                active ? "bg-[#282828] text-white" : "text-[#8a8a8a]"
              }`}
              style={{ transitionTimingFunction: SNAP }}
            >
              {c}
              {active && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m5 13 4 4L19 7" stroke="#3fe176" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabBar() {
  const items = [
    <svg key="s" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="7.5" stroke="currentColor" strokeWidth="2.1" />
      <path d="m16.2 16.2 4.8 4.8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>,
    <svg key="c" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.8c-4.8 0-8.7 3.3-8.7 7.4 0 2.3 1.2 4.3 3.1 5.6v3.4l3.3-1.8c.7.1 1.5.2 2.3.2 4.8 0 8.7-3.3 8.7-7.4S16.8 3.8 12 3.8Z" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
    </svg>,
    <svg key="b" width="23" height="23" viewBox="0 0 18 22" fill="currentColor" aria-hidden>
      <path d="M9 1.2a6.4 6.4 0 0 0-6.4 6.4v3.7L1 15.1a.9.9 0 0 0 .8 1.3h14.4a.9.9 0 0 0 .8-1.3l-1.6-3.8V7.6A6.4 6.4 0 0 0 9 1.2Z" />
      <path d="M6.6 18a2.5 2.5 0 0 0 4.8 0H6.6Z" />
    </svg>,
  ];
  return (
    <nav className="relative h-[90px] shrink-0 bg-black">
      <div className="flex h-[80px] items-center px-[15px]">
        {items.map((icon, i) => (
          <div key={i} className="flex flex-1 justify-center">
            {/* §5 — active is full white, inactive dimmed. Same device as a won match. */}
            <span className={i === 0 ? "text-white" : "text-[#5f5f5f]"}>{icon}</span>
          </div>
        ))}
        <div className="flex flex-1 justify-center">
          <img src={navMeSrc} alt="Your profile" className="h-[31px] w-[31px] rounded-full opacity-60" />
        </div>
      </div>
      <span className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white" />
    </nav>
  );
}

export function TournamentSearch({
  backdrop = true,
  onBack,
}: {
  backdrop?: boolean;
  onBack?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [status, setStatus] = useState<Status>("All");
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOURNAMENTS.filter((t) => {
      if (country !== COUNTRIES[0] && t.country !== country) return false;
      if (status === "Open" && !t.open) return false;
      if (status === "Closed" && t.open) return false;
      if (q && !`${t.name} ${t.city} ${t.country}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, country, status]);

  return (
    <div
      className="relative h-[874px] w-[402px] overflow-hidden text-white antialiased"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {backdrop && <Backdrop pose={BAND.search} />}
      <div className="relative z-10 flex h-full flex-col">
      <style>{`@keyframes sheet-up{from{transform:translateY(100%)}to{transform:translateY(0)}}.no-bar{scrollbar-width:none}.no-bar::-webkit-scrollbar{display:none}`}</style>

      <StatusBar />

      <div className="shrink-0 px-[15px]">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white transition-transform duration-100 active:scale-[0.9]"
          style={{ transitionTimingFunction: SNAP }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 5l-7 7 7 7" stroke="black" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1
          className="mt-[18px] text-[28px] leading-[30px] font-extrabold tracking-[-0.01em] uppercase"
          style={{ fontFamily: DISPLAY }}
        >
          Tournaments
        </h1>

        <div className="mt-[18px] flex h-[46px] items-center gap-[9px] rounded-[14px] bg-[#1c1c1c] px-[13px]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
            <circle cx="10.5" cy="10.5" r="7.5" stroke="#8a8a8a" strokeWidth="2.2" />
            <path d="m16.2 16.2 4.8 4.8" stroke="#8a8a8a" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tournament or city"
            className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-[#6f6f6f] focus:outline-none"
          />
        </div>

        <div className="mt-[10px] flex gap-[10px]">
          {/* §9 — 5 options, so it collapses to a sheet rather than sitting on screen. */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex h-[40px] min-w-0 flex-1 items-center justify-between rounded-[13px] bg-[#1c1c1c] px-[13px] transition-transform duration-100 active:scale-[0.97]"
            style={{ transitionTimingFunction: SNAP }}
          >
            <span className="truncate text-[11px] font-bold tracking-[0.04em] uppercase">
              {country}
            </span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="ml-[6px] shrink-0" aria-hidden>
              <path d="m6 9 6 6 6-6" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* §9 — 3 options, so all of them stay visible. */}
          <div className="flex h-[40px] shrink-0 items-center rounded-[13px] bg-[#1c1c1c] p-[3px]">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`h-full rounded-[10px] px-[12px] text-[11px] font-bold tracking-[0.04em] uppercase transition-transform duration-100 active:scale-[0.94] ${
                  status === s ? "bg-[#333333] text-white" : "text-[#8a8a8a]"
                }`}
                style={{ transitionTimingFunction: SNAP }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-[20px] mb-[10px] text-[11px] leading-[14px] font-bold tracking-[0.06em] text-[#7a7a7a] uppercase">
          {results.length} {results.length === 1 ? "Tournament" : "Tournaments"}
        </p>
      </div>

      <div className="no-bar flex-1 overflow-y-auto px-[15px] pb-[14px]">
        <div className="flex flex-col gap-[12px]">
          {results.map((t) => (
            <TournamentCard key={t.id} t={t} />
          ))}
          {results.length === 0 && (
            <p
              className="pt-[40px] text-center text-[15px] font-extrabold tracking-[0.04em] text-[#5f5f5f] uppercase"
              style={{ fontFamily: DISPLAY }}
            >
              Nothing here
            </p>
          )}
        </div>
      </div>

      <TabBar />
      </div>

      {sheetOpen && (
        <CountrySheet
          value={country}
          onPick={(c) => {
            setCountry(c);
            setSheetOpen(false);
          }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
