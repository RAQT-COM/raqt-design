import type { ReactNode } from "react";

import { BAND, Backdrop } from "./backdrop";
import { NotificationBell, TabBar } from "./tab-bar";

const logotype = new URL("../../assets/brand/logotype.png", import.meta.url).href;
const courtSrc = new URL("./assets/court.png", import.meta.url).href;
const feedSrc = new URL("./assets/feed.png", import.meta.url).href;
const atpHeroSrc = new URL("./assets/atp-hero.png", import.meta.url).href;
const atpTileSrc = new URL("./assets/atp-tile.png", import.meta.url).href;
const niklasSrc = new URL("./assets/niklas.png", import.meta.url).href;
const coachesSrc = new URL("./assets/coaches.png", import.meta.url).href;


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
          <path
            d="M1 4.2a11 11 0 0 1 15 0M3.7 7a7.2 7.2 0 0 1 9.6 0"
            stroke="white"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
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

function Header() {
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between px-5">
      <img src={logotype} alt="RAQT" className="h-[26px] w-auto" />
      <div className="flex items-center gap-[11px]">
        <div className="flex h-[32px] items-center gap-[6px] rounded-full bg-[#282828] px-[11px]">
          <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden>
            <defs>
              <linearGradient id="raqt-sparkle" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0" stopColor="#ecd70f" />
                <stop offset="1" stopColor="#17d172" />
              </linearGradient>
            </defs>
            <path
              d="M10 0c.5 5.2 4.3 9 9.5 10-5.2 1-9 4.8-9.5 10-.5-5.2-4.3-9-9.5-10C5.7 9 9.5 5.2 10 0Z"
              fill="url(#raqt-sparkle)"
            />
          </svg>
          <span className="text-[13.5px] font-bold tracking-[-0.01em]">1259 points</span>
        </div>
        <NotificationBell unread />
      </div>
    </header>
  );
}

function TileLabel({ children }: { children: string }) {
  return <span className="text-[10px] leading-[12px] font-semibold text-white">{children}</span>;
}

function TileTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-[8px] text-[16px] leading-[17px] font-bold tracking-[-0.015em] text-white">
      {children}
    </h2>
  );
}

function BadgesTile() {
  return (
    <section className="flex h-[157px] flex-col rounded-[20px] bg-[#282828] px-[13px] pt-[16px] pb-[13px]">
      <TileLabel>Badges</TileLabel>
      <TileTitle>Unlock Achievements</TileTitle>
      <span className="mt-auto text-[16px] leading-[19px] font-bold tracking-[-0.02em]">17%</span>
      <div className="mt-[9px] h-[8px] w-full overflow-hidden rounded-full bg-[#464646]">
        <div className="h-full w-[18%] rounded-full bg-[#3fe176]" />
      </div>
    </section>
  );
}

function AtpTile() {
  return (
    <section className="grid h-[157px] place-items-center rounded-[20px] bg-[#0f192b]">
      <img src={atpTileSrc} alt="ATP Tour Live" className="h-[64px] w-[64px] rounded-full" />
    </section>
  );
}

function ClinicsTile() {
  return (
    <section className="flex h-[157px] flex-col rounded-[20px] bg-[#282828] px-[13px] pt-[16px] pb-[13px]">
      <TileLabel>Clinics</TileLabel>
      {/* The Figma text box is narrower than the tile, so this break is authored
          rather than a consequence of the available width. */}
      <TileTitle>
        Livechat with
        <br />
        pro coaches
      </TileTitle>
      <div className="mt-auto flex items-center gap-[11px]">
        <img src={coachesSrc} alt="Coaches online" className="h-[32px] w-[82px]" />
        <span className="text-[9px] leading-[11px] font-medium whitespace-nowrap text-white">
          + 12 online now
        </span>
      </div>
    </section>
  );
}

function NearbyTile() {
  return (
    <section className="flex h-[157px] flex-col overflow-hidden rounded-[20px] bg-[#1c1c1c]">
      <img src={courtSrc} alt="" className="h-[70px] w-full object-cover" />
      <div className="px-[7px] pt-[12px]">
        <div className="flex items-center gap-[4px]">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="white" aria-hidden>
            <path d="M11.4.6 1 4.9c-.6.3-.5 1.1.1 1.3l4 1.3 1.3 4c.2.6 1 .7 1.3.1L11.4.6Z" />
          </svg>
          <span className="text-[11px] leading-[13px] font-medium">5.3 km away from you</span>
        </div>
        <p className="mt-[7px] text-[11px] leading-[15px] font-bold tracking-[-0.005em]">
          Freddes Pickleballsällskap i Sundyberg &amp; Bromma
        </p>
      </div>
    </section>
  );
}

function FeedCard() {
  return (
    <section className="relative h-[153px] overflow-hidden rounded-[20px] bg-[#3a3d27]">
      <img src={feedSrc} alt="" className="absolute inset-x-0 top-0 h-[68px] w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex h-[88px] items-center rounded-[20px] bg-[#333333] px-[25px]">
        <img src={niklasSrc} alt="" className="h-[42px] w-[42px] shrink-0 rounded-full" />
        <div className="ml-[19px] w-[218px] shrink-0">
          <p className="text-[16px] leading-[18px] font-bold tracking-[-0.01em]">Niklas Sidfalk</p>
          <p className="text-[16px] leading-[18px] text-white">
            Det var väldigt kul att spela idag! Ska vi kanske försöka att göra om detta näst...
          </p>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className="ml-auto shrink-0"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}

export function StartFeed({
  backdrop = true,
  onOpenSearch,
}: {
  backdrop?: boolean;
  onOpenSearch?: () => void;
}) {
  return (
    <div
      className="relative h-[874px] w-[402px] overflow-hidden text-white antialiased"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {backdrop && <Backdrop pose={BAND.feed} />}
      <div className="relative z-10 flex h-full flex-col">
      <StatusBar />
      <Header />
      <div className="flex flex-col gap-[10px] px-[10px]">
        <section
          className="grid h-[157px] place-items-center rounded-[20px]"
          style={{ background: "linear-gradient(162deg, #373f4e 2%, #0f192b 70%)" }}
        >
          <img src={atpHeroSrc} alt="ATP Tour Live" className="h-[58px] w-[58px] rounded-full" />
        </section>
        <div className="grid grid-cols-2 gap-[10px]">
          <BadgesTile />
          <AtpTile />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <ClinicsTile />
          <NearbyTile />
        </div>
        <FeedCard />
      </div>
      <TabBar onSearch={onOpenSearch} />
      </div>
    </div>
  );
}
