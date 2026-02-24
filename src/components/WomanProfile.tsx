import type { IranianWoman } from "../lib/women";

function initials(name: string) {
  return name.trim().charAt(0);
}

export function WomanProfile({ woman }: { woman: IranianWoman }) {
  return (
    <div className="card woman-card">
      <div
        className="woman-portrait"
        style={{ background: `linear-gradient(135deg, ${woman.color}, ${woman.color}cc)` }}
      >
        <span style={{ fontSize: 36, opacity: 0.9 }}>{initials(woman.name)}</span>
      </div>

      <div className="woman-name">{woman.name}</div>

      <span
        className="woman-field"
        style={{
          background: woman.accentColor,
          color: woman.color,
          border: `1px solid ${woman.color}44`,
        }}
      >
        {woman.field}
      </span>

      <div className="woman-years small">{woman.years}</div>

      <div className="woman-bio">{woman.bio}</div>
    </div>
  );
}

/** Compact version shown in the 8th grid slot of week view */
export function WomanSlot({ woman }: { woman: IranianWoman }) {
  return (
    <div className="day-woman-slot">
      <div
        className="day-woman-portrait"
        style={{ background: `linear-gradient(135deg, ${woman.color}, ${woman.color}cc)` }}
      >
        <span style={{ fontSize: 24, opacity: 0.9 }}>{initials(woman.name)}</span>
      </div>

      <div className="day-woman-name">{woman.name}</div>

      <span
        className="tag"
        style={{
          background: woman.accentColor,
          color: woman.color,
          border: `1px solid ${woman.color}33`,
        }}
      >
        {woman.field}
      </span>

      <div className="day-woman-bio">{woman.bio}</div>
    </div>
  );
}
