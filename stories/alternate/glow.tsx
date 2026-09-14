import { useState, type ReactNode } from 'react';
import { ArrowLeft, Bell, BatteryFull, Check, ChevronDown, ChevronRight, MapPin, MessageCircle, Navigation, Search, Users, CircleCheck, Clock3, Signal, Sparkles, Trophy, Wifi, Zap, Map, Swords, Ticket } from 'lucide-react';
import { Action, ChoiceGroup, IconButton, PageHeading, PlayerIdentity, Rating, Progress, Surface, Tile } from '../../components/alternate/primitives';

const logo = new URL('../../assets/brand/logotype.png', import.meta.url).href;
const asset = (name: string) => new URL(`./assets/${name}.png`, import.meta.url).href;
const assets = { court: asset('court'), feed: asset('feed'), hero: asset('atp-hero'), atp: asset('atp-tile'), niklas: asset('niklas'), me: asset('nav-me'), coaches: asset('coaches') };
export type Screen = 'feed' | 'discover' | 'play' | 'messages' | 'profile' | 'badges' | 'clinics' | 'live';
export type Theme = 'dark' | 'light';
const labels: Record<Screen, string> = { feed: 'Start feed', discover: 'Discover', play: 'Play', messages: 'Messages', profile: 'Profile', badges: 'Achievements', clinics: 'Clinics', live: 'ATP Live' };

function LivePanel({ hero = false, onClick }: { hero?: boolean; onClick: () => void }) {
  return <Tile className={`glow-live ${hero ? 'hero' : ''}`} onClick={onClick} aria-label="Open ATP Tour Live"><img src={hero ? assets.hero : assets.atp} alt="ATP Tour Live" /></Tile>;
}
function Feed({ go }: { go: (screen: Screen) => void }) {
  const [expanded, setExpanded] = useState(false);
  return <><LivePanel hero onClick={() => go('live')} />
    <div className="glow-grid">
      <Tile className="glow-feed-tile" onClick={() => go('badges')}><span className="glow-eyebrow">Badges</span><h2>Unlock<br />Achievements</h2><Progress value={17} label="Achievements unlocked" /></Tile>
      <LivePanel onClick={() => go('live')} />
      <Tile className="glow-feed-tile" onClick={() => go('clinics')}><span className="glow-eyebrow">Clinics</span><h2>Livechat with<br />pro coaches</h2><span className="glow-coaches"><img src={assets.coaches} alt="Three coaches" />+ 12 online now</span></Tile>
      <Tile className="glow-feed-tile glow-nearby" onClick={() => go('discover')}><img src={assets.court} alt="Players at a pickleball court" /><span><span className="glow-distance"><Navigation size={11} fill="currentColor" />5.3 km away from you</span><strong>Freddes Pickleballsällskap i Sundyberg &amp; Bromma</strong></span></Tile>
    </div>
    <article className="glow-post"><img className="glow-post-cover" src={assets.feed} alt="Friends playing pickleball" /><div className="glow-post-body"><img className="glow-avatar" src={assets.niklas} alt="" /><div className="glow-post-copy"><strong>Niklas Sidfalk</strong><p>{expanded ? 'Det var väldigt kul att spela idag! Ska vi kanske försöka att göra om detta nästa vecka?' : 'Det var väldigt kul att spela idag! Ska vi kanske försöka att göra om detta näst...'}</p></div><IconButton label={expanded ? 'Collapse post' : 'Read full post'} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><ChevronDown size={18} style={{ transform: expanded ? 'rotate(180deg)' : undefined }} /></IconButton></div></article>
  </>;
}
const tournaments = [
  { name: 'Stockholm Open', date: '21 Sep', place: 'Sundbyberg', distance: '5.3 km', level: '3.0–4.0', format: 'Doubles', spots: '6 spots', photo: assets.court },
  { name: 'Bromma Cup', date: '28 Sep', place: 'Bromma', distance: '6.1 km', level: '2.5–3.5', format: 'Singles', spots: '3 spots' },
  { name: 'Sunday Americano', date: '5 Oct', place: 'Solna', distance: '8.4 km', level: 'All levels', format: 'Doubles', spots: '12 spots' },
];
function Discover({ go }: { go: (screen: Screen) => void }) {
  const [query, setQuery] = useState('');
  const [when, setWhen] = useState('Upcoming');
  const [format, setFormat] = useState('All');
  const matches = tournaments.filter(t => (format === 'All' || t.format === format) && `${t.name} ${t.place}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeading title="Tournaments" />
    <Surface className="glow-filter-card glow-filter-inline"><ChoiceGroup label="Date" value={when} options={['Upcoming', 'Week', 'Month']} onChange={setWhen} /><ChoiceGroup label="Format" value={format} options={['All', 'Singles', 'Doubles']} onChange={setFormat} /><details className="glow-search-disclosure"><summary aria-label="Search tournaments"><Search size={17} aria-hidden="true" />{query && <span className="glow-active-dot" aria-label="Search active" />}</summary><input className="glow-search" aria-label="Search tournaments" placeholder="Tournament or place" value={query} onChange={e => setQuery(e.target.value)} /></details></Surface>
    <div className="glow-stack">{matches.map((t, index) => <Tile key={t.name} onClick={() => go('play')} className={index === 0 ? 'glow-tournament-featured' : 'glow-tournament-row'}>
      {t.photo && <img className="glow-tournament-photo" src={t.photo} alt="Pickleball tournament" />}
      <span className="glow-date-block"><strong>{t.date.split(' ')[0]}</strong><span>{t.date.split(' ')[1]}</span></span><span className="glow-tournament-copy"><strong>{t.name}</strong><span><MapPin size={15} />{t.place} · {t.distance}</span><span><Swords size={15} />{t.format} · {t.level}</span></span><span className="glow-entry"><Ticket size={16} />{t.spots}</span><ChevronRight size={20} aria-hidden="true" />
    </Tile>)}{matches.length === 0 && <Surface className="glow-notice">No tournaments match.<Action secondary onClick={() => { setWhen('Upcoming'); setFormat('All'); setQuery(''); }}>Reset filters</Action></Surface>}</div>
  </>;
}
function Play() {
  const [view, setView] = useState('My matches');
  const [joined, setJoined] = useState<string[]>([]);
  const games = [{ id: 'today', title: 'After-work doubles', time: 'Today · 18:00', place: 'Freddes, Sundbyberg' }, { id: 'sunday', title: 'Sunday social', time: 'Sunday · 10:00', place: 'Bromma Pickleball' }];
  return <><PageHeading title="Stockholm Open" />
    <Surface className="glow-filter-card"><ChoiceGroup label="View" value={view} options={['My matches', 'Draw', 'Scores']} onChange={setView} /></Surface>
    {view === 'My matches' && <div className="glow-stack"><Surface className="glow-next-match"><span className="glow-kicker"><Zap size={17} fill="currentColor" />NEXT MATCH</span><div className="glow-court">Court 4</div><div className="glow-score-players"><PlayerIdentity name="Oliver" avatar={assets.me} /><strong>vs</strong><PlayerIdentity name="Niklas Sidfalk" avatar={assets.niklas} /></div><div className="glow-match-meta"><Clock3 size={18} />Starts 18:00</div><Action>Open match</Action></Surface>{games.slice(1).map((game, index) => { const isJoined = joined.includes(game.id); return <section className={`glow-tile glow-match ${index === 0 ? 'glow-featured-match' : 'glow-compact-match'}`} key={game.id}>
      <span className="glow-row"><span className="glow-game-time"><Clock3 size={18} aria-hidden="true" />{game.time}</span><span className="glow-game-state">{isJoined ? <CircleCheck size={16} aria-hidden="true" /> : <Users size={16} aria-hidden="true" />}{isJoined ? 'Joined' : '1 spot'}</span></span>
      <h2>{game.title}</h2><span className="glow-row glow-muted"><MapPin size={18} aria-hidden="true" /><span>{game.place}</span></span>
      <PlayerIdentity name="Niklas Sidfalk" avatar={assets.niklas} />
      <Rating value="3.0–4.0" format="doubles" />
      <Action secondary={isJoined || index > 0} onClick={() => setJoined(isJoined ? joined.filter(x => x !== game.id) : [...joined, game.id])}>{isJoined ? 'Leave game' : 'Join game'}</Action>
    </section>; })}</div>}
    {view === 'Scores' && <div className="glow-stack"><Surface className="glow-score-card"><span>Quarter-final</span><div><PlayerIdentity name="Oliver" avatar={assets.me} /><strong>11&nbsp;&nbsp;8&nbsp;&nbsp;—</strong></div><div><PlayerIdentity name="Alex" avatar={assets.niklas} /><strong>7&nbsp;&nbsp;11&nbsp;&nbsp;—</strong></div><Action>Enter third game</Action></Surface><Surface className="glow-score-card glow-complete"><span>Round of 16 · Final</span><div><PlayerIdentity name="Oliver" avatar={assets.me} /><strong>11&nbsp;&nbsp;11</strong></div><div><PlayerIdentity name="Sam" avatar={assets.niklas} /><strong>5&nbsp;&nbsp;8</strong></div></Surface></div>}
    {view === 'Draw' && <Surface className="glow-draw"><Map size={28} /><strong>Quarter-final</strong><div className="glow-bracket-line"><PlayerIdentity name="Oliver" avatar={assets.me} /><span>18:00 · Court 4</span></div><div className="glow-bracket-line"><PlayerIdentity name="Niklas Sidfalk" avatar={assets.niklas} /><span>Winner advances</span></div></Surface>}
  </>;
}
function Profile({ go }: { go: (screen: Screen) => void }) {
  return <><div className="glow-profile"><img className="glow-avatar" src={assets.me} alt="Your profile" /><h1>Oliver</h1><Rating value="3.82" format="doubles" /></div><div className="glow-tile glow-stats"><div><strong>24</strong><span>Games played</span></div><div><strong>8</strong><span>Friends</span></div><div><strong>1,259</strong><span>Points</span></div></div><h2 className="glow-section-title">Achievements</h2><Tile className="glow-match" onClick={() => go('badges')}><span className="glow-row"><Trophy color="var(--glow-green)" /><strong>Your achievements</strong><ChevronRight size={18} /></span><span className="glow-muted">2 of 12 unlocked</span><Progress value={17} label="Achievements unlocked" /></Tile><h2 className="glow-section-title">Activity</h2><div className="glow-stack">{([['play', 'Upcoming games'], ['discover', 'Explore clubs'], ['messages', 'Your conversations']] as const).map(([screen, title]) => <Tile key={screen} onClick={() => go(screen)}><span className="glow-row"><strong>{title}</strong><ChevronRight size={18} /></span></Tile>)}</div></>;
}
function Messages() {
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState(''); const [sent, setSent] = useState<string[]>([]);
  return <><PageHeading title="Messages" />{open && <PlayerIdentity name="Niklas Sidfalk" avatar={assets.niklas} />}{open ? <><Action secondary onClick={() => setOpen(false)}>Back to conversations</Action><div className="glow-stack" style={{ marginTop: 20 }}><div className="glow-tile">Same time next week?</div>{sent.map((s, i) => <div className="glow-tile" key={i} style={{ marginLeft: 30 }}><PlayerIdentity name="Oliver" avatar={assets.me} />{s}</div>)}</div><form style={{ marginTop: 20 }} onSubmit={e => { e.preventDefault(); if (draft.trim()) { setSent([...sent, draft.trim()]); setDraft(''); } }}><input aria-label="Your message" className="glow-search" placeholder="Write a message…" value={draft} onChange={e => setDraft(e.target.value)} /><Action disabled={!draft.trim()}>Send</Action></form></> : <Tile onClick={() => setOpen(true)}><span className="glow-row"><img className="glow-avatar" src={assets.niklas} alt="" /><div><strong>Niklas Sidfalk</strong><p className="glow-muted">Same time next week?</p></div><ChevronRight size={18} /></span></Tile>}</>;
}
function Detail({ screen }: { screen: Screen }) {
  const [selected, setSelected] = useState(false);
  if (screen === 'badges') return <><PageHeading title="Achievements" /><section className="glow-tile glow-match"><Trophy color="var(--glow-green)" size={36} /><h2>2 of 12 unlocked</h2><Progress value={17} label="Achievements unlocked" /></section><div className="glow-grid">{['First serve', 'Team player', 'Court regular', 'Game changer'].map((title, i) => <section key={title} className="glow-tile glow-match"><Trophy size={32} color={i < 2 ? 'var(--glow-green)' : 'var(--glow-muted)'} /><h2>{title}</h2><span className="glow-muted">{i < 2 ? 'Unlocked' : 'Locked'}</span></section>)}</div></>;
  if (screen === 'clinics') return <><PageHeading title="Coaching" /><section className="glow-tile glow-match"><img src={assets.court} alt="Coach with a player" style={{ width: '100%', borderRadius: 8 }} /><span className="glow-pill">12 coaches online</span><h2>Live clinic</h2><Action onClick={() => setSelected(!selected)}>{selected ? 'Leave waiting room' : 'Join live clinic'}</Action>{selected && <p role="status">You’re in the demo waiting room. No live session is connected.</p>}</section></>;
  return <><PageHeading title="ATP Live" /><LivePanel hero onClick={() => setSelected(!selected)} /><h2 className="glow-section-title">Live coverage</h2><section className="glow-tile glow-match"><p className="glow-muted">No broadcast connected.</p><Action onClick={() => setSelected(!selected)}>{selected ? 'Reminder saved' : 'Notify me'}</Action>{selected && <span role="status" className="glow-row"><Check size={18} />Reminder enabled.</span>}</section></>;
}
export function GlowApp({ theme = 'dark', initialScreen = 'feed' }: { theme?: Theme; initialScreen?: Screen }) {
  const [screen, setScreen] = useState<Screen>(initialScreen); const [notifications, setNotifications] = useState(false);
  const go = (next: Screen) => { setScreen(next); setNotifications(false); };
  let content: ReactNode;
  switch (screen) { case 'feed': content = <Feed go={go} />; break; case 'discover': content = <Discover go={go} />; break; case 'play': content = <Play />; break; case 'profile': content = <Profile go={go} />; break; case 'messages': content = <Messages />; break; default: content = <Detail key={screen} screen={screen} />; }
  return <div className="raqt-glow glow-phone" data-theme={theme}><div className="glow-status" aria-hidden="true"><span>9:41</span><span><Signal size={19} fill="currentColor" /><Wifi size={17} /><BatteryFull size={25} /></span></div><header className="glow-header">{screen === 'feed' ? <img className="glow-logo" src={logo} alt="RAQT" /> : <IconButton label="Back to start feed" onClick={() => go('feed')}><ArrowLeft size={23} /></IconButton>}<div className="glow-header-actions"><button className="glow-points" onClick={() => go('badges')}><Sparkles size={19} />1259 points</button><IconButton label="Notifications" aria-expanded={notifications} onClick={() => setNotifications(!notifications)}><Bell size={21} fill="currentColor" /><span className="glow-dot" /></IconButton></div></header><main className="glow-content" key={screen} aria-label={labels[screen]}>{notifications && <div className="glow-notice" role="status"><strong>No new notifications</strong></div>}{content}</main><nav className="glow-nav" aria-label="Main navigation"><IconButton label="Discover courts" aria-current={screen === 'discover' ? 'page' : undefined} onClick={() => go('discover')}><Search /></IconButton><IconButton label="Nearby clubs" onClick={() => go('discover')}><MapPin /></IconButton><button className="glow-play" aria-label="Find a game to play" aria-current={screen === 'play' ? 'page' : undefined} onClick={() => go('play')}><Zap size={22} /><span>PLAY</span></button><IconButton label="Messages" aria-current={screen === 'messages' ? 'page' : undefined} onClick={() => go('messages')}><MessageCircle /></IconButton><IconButton label="Your profile" aria-current={screen === 'profile' ? 'page' : undefined} onClick={() => go('profile')}><img className="glow-avatar" src={assets.me} alt="" /></IconButton><span className="glow-home-indicator" aria-hidden="true" /></nav></div>;
}
export function GlowComparison() {
  const [screen, setScreen] = useState<Screen>('feed');
  return <div className="glow-preview"><div className="glow-preview-toolbar"><h1>RAQT / Glow exploration</h1><label>Screen <select aria-label="Preview screen" value={screen} onChange={e => setScreen(e.target.value as Screen)}>{(Object.keys(labels) as Screen[]).map(s => <option key={s} value={s}>{labels[s]}</option>)}</select></label><span className="glow-demo-note">Interactive preview · sample data · changes aren’t saved</span></div><div className="glow-preview-phones">{(['dark', 'light'] as Theme[]).map(theme => <div key={theme}><p className="glow-preview-label">{theme === 'dark' ? '01 / AFTER DARK' : '02 / DAYLIGHT'}</p><GlowApp key={`${theme}-${screen}`} theme={theme} initialScreen={screen} /></div>)}</div></div>;
}
