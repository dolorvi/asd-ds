import React from "react";
export function Card({ title, right, children }:{title?:string; right?:React.ReactNode; children:React.ReactNode}) {
  return (<section className="card stack">
    <div className="row" style={{justifyContent:"space-between"}}>
      {title ? <h2 className="section-title">{title}</h2> : <div/>}
      {right}
    </div>
    {children}
  </section>);
}
export function Field({label, children}:{label:string; children:React.ReactNode}) {
  return (<div className="control"><label>{label}</label>{children}</div>);
}
