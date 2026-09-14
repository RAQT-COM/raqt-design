import { User, Users } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './theme.css';

export function Tile({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`glow-tile ${className}`} {...props}>{children}</button>;
}
export function Action({ children, secondary = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return <button className={`glow-button${secondary ? ' secondary' : ''}`} {...props}>{children}</button>;
}
export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button className="glow-icon" aria-label={label} {...props}>{children}</button>;
}
export function Progress({ value, label }: { value: number; label: string }) {
  return <div className="glow-progress"><strong>{value}%</strong><progress max={100} value={value} aria-label={label} /></div>;
}
export function PageHeading({ title }: { title: string }) {
  return <div className="glow-page-heading glow-tile"><h1>{title}</h1></div>;
}
export function ChoiceGroup({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  if (options.length > 4) throw new Error('ChoiceGroup displays at most four options; collapse larger sets.');
  return <fieldset className="glow-choice"><legend>{label}</legend><div>{options.map(option => <button key={option} type="button" aria-pressed={option === value} onClick={() => onChange(option)}>{option}</button>)}</div></fieldset>;
}
export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`glow-tile ${className}`}>{children}</section>;
}
export function PlayerIdentity({ name, avatar }: { name: string; avatar: string }) {
  return <span className="glow-player"><img className="glow-avatar" src={avatar} alt="" /><strong>{name}</strong></span>;
}
export function Rating({ value, format }: { value: string; format: 'singles' | 'doubles' }) {
  const Icon = format === 'doubles' ? Users : User;
  return <span className="glow-rating" aria-label={`DUPR ${format}: ${value}`}><Icon size={18} aria-hidden="true" /><strong>{value}</strong><span>DUPR · {format}</span></span>;
}
