import { useEffect, useState } from "react";
import type { JournalEntry } from "../lib/db";
import { listEntries } from "../lib/db";
import { toJalali } from "../lib/jalali";

export function JournalReview(props: { onPickDate: (iso: string) => void }) {
  const [items, setItems] = useState<JournalEntry[]>([]);

  useEffect(() => {
    (async () => {
      const all = await listEntries();
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setItems(all);
    })();
  }, []);

  return (
    <div className="card">
      <div style={{ fontWeight: 900, marginBottom: 8 }}>مرور ژورنال‌ها</div>
      {items.length === 0 ? (
        <div className="small">هنوز چیزی ثبت نشده.</div>
      ) : (
        <div className="grid" style={{ gap: 10 }}>
          {items.slice(0, 20).map((e) => {
            const d = new Date(e.dateISO);
            return (
              <div key={e.id} className="card" style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{toJalali(d).format("dddd، D MMMM YYYY")}</div>
                  <span className="badge">{e.mood ?? "ok"}</span>
                </div>
                <div className="small" style={{ marginTop: 6, lineHeight: 1.8 }}>
                  {(e.text || "").slice(0, 140)}{(e.text || "").length > 140 ? "…" : ""}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => props.onPickDate(e.dateISO)}>
                    باز کردن روز
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}