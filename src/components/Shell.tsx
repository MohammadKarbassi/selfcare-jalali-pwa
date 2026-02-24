import React from "react";
import { getSeasonForDate, seasonNames } from "../lib/jalali";

export type AppTab = "calendar" | "review" | "experiences" | "settings";

const TABS: { id: AppTab; label: string }[] = [
  { id: "calendar",    label: "تقویم"    },
  { id: "review",      label: "مرور"     },
  { id: "experiences", label: "تجربه‌ها" },
  { id: "settings",    label: "تنظیمات"  },
];

export function Shell(props: {
  userEmail: string;
  onLogout: () => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children: React.ReactNode;
}) {
  const season      = getSeasonForDate(new Date());
  const seasonLabel = seasonNames[season];

  return (
    <div className={`season-${season}`} style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="app-header">
        <div className="app-brand">
          <div className="app-brand-dot">🌸</div>
          <div className="app-brand-text">
            <div className="app-brand-name">تقویم مراقبت از خود</div>
            <div className="app-brand-sub">
              همراه روزهای تو · {seasonLabel} ۱۴۰۵
            </div>
          </div>
        </div>

        <div className="app-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`app-tab ${props.activeTab === t.id ? "active" : ""}`}
              onClick={() => props.onTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <span className="badge" style={{ fontSize: 11 }}>
            {props.userEmail.split("@")[0]}
          </span>
          <button className="btn btn-ghost btn-xs" onClick={props.onLogout}>
            خروج
          </button>
        </div>
      </div>

      <div className="container">
        {props.children}
      </div>
    </div>
  );
}
