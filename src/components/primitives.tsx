import React from "react";

export const Container = ({ children }: { children: React.ReactNode }) =>
  <div className="app-shell">{children}</div>;

export const Row = ({ children, wrap=false, justify, align }:{
  children: React.ReactNode; wrap?: boolean; justify?: "start"|"end"|"between"; align?: "start"|"center";
}) => (
  <div className={`row${wrap?" row--wrap":""}${justify?" row--"+justify:""}${align?" row--"+align:""}`}>
    {children}
  </div>
);

export const Stack = ({ children, gap="md" }:{ children: React.ReactNode; gap?: "sm"|"md"|"lg"}) =>
  <div className={`stack stack--${gap}`}>{children}</div>;

export const Card = ({ title, right, helper, children }:{
  title?: string; right?: React.ReactNode; helper?: string; children: React.ReactNode;
}) => (
  <section className="card">
    {(title || right) && (
      <div className="card__bar">
        {title ? <h2 className="section-title">{title}</h2> : <span/>}
        {right}
      </div>
    )}
    {helper && <p className="helper-text">{helper}</p>}
    {children}
  </section>
);

export const Button = ({ kind="neutral", children, ...props }:{
  kind?: "neutral"|"primary"; children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) =>
  <button className={`btn ${kind==="primary" ? "btn--accent":""}`} {...props}>{children}</button>;

export const Chip = ({
  active, children, activeBg, activeColor, ...props
}:{
  active?: boolean; children: React.ReactNode;
  activeBg?: string; activeColor?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`chip ${active ? "chip--active":""}`}
    style={active ? { background: activeBg, color: activeColor } : undefined}
    aria-pressed={active}
    {...props}
  >
    {children}
  </button>
);

export const Tabs = ({ tabs, active, onSelect, right }:{
  tabs: string[]; active: number; onSelect: (i:number)=>void; right?: React.ReactNode;
}) => (
  <div className="tabbar">
    {tabs.map((t,i)=>(
      <button key={t} className={`tab ${i===active?"tab--active":""}`} onClick={()=>onSelect(i)}>{t}</button>
    ))}
    {right}
  </div>
);