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
export function PageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="glow-page-heading"><span className="glow-eyebrow glow-muted">{eyebrow}</span><h1>{title}</h1>{children && <p className="glow-muted">{children}</p>}</div>;
}
