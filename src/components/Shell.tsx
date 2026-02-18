import React from "react";
import { brand } from "../lib/brand";

export function Shell(props: { userEmail: string; onLogout: () => void; children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <div className="logoDot" />
          <div>
            <div style={{ fontWeight: 900 }}>تقویم مراقبت از خود</div>
            <div className="small">بر پایه‌ی ریتم زندگی زنان ایرانی • {brand.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge">{props.userEmail}</span>
          <button className="btn btn-ghost" onClick={props.onLogout}>خروج</button>
        </div>
      </div>
      {props.children}
      <div className="small" style={{ marginTop: 14 }}>
        یادآوری پس‌زمینه در PWA محدود است؛ برای نسخه محصولی Push/Backend لازم می‌شود.
      </div>
    </div>
  );
}