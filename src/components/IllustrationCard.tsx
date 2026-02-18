import { brand } from "../lib/brand";

export function IllustrationCard(props: { title: string; subtitle: string }) {
  return (
    <div className="card" style={{ background: brand.soft, borderColor: "rgba(227,0,127,.18)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0" stopColor={brand.primary} stopOpacity="0.9" />
              <stop offset="1" stopColor={brand.primary} stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="30" fill="url(#g)" />
          <path d="M18 42c6-14 12-14 18 0s12 14 18 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
          <path d="M24 26h24" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontWeight: 900, color: brand.primary }}>{props.title}</div>
          <div className="small">{props.subtitle}</div>
        </div>
      </div>
    </div>
  );
}