import { useEffect, useState } from "react";
import type { JournalEntry } from "../lib/db";
import { listEntries } from "../lib/db";
import { toJalali } from "../lib/jalali";

const MOOD_EMOJI: Record<string, string> = { low: "😔", ok: "😐", good: "😊" };

export function JournalReview(props: { onPickDate: (iso: string) => void }) {
  const [items, setItems] = useState<JournalEntry[]>([]);

  useEffect(() => {
    (async () => {
      const all = await listEntries();
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setItems(all);
    })();
  }, []);

  const withContent = items.filter(
    (e) => (e.text && e.text.trim().length > 0) || (e.tasks ?? []).length > 0
  );

  return (
    <div className="card">
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, color: "var(--s-dark)" }}>
        مرور یادداشت‌ها
      </div>

      {withContent.length === 0 ? (
        <div className="empty-state">
          📝 هنوز یادداشتی ثبت نشده.<br />
          <span className="small">از نمای هفتگی یا ماهانه شروع کن.</span>
        </div>
      ) : (
        <div className="review-list">
          {withContent.slice(0, 30).map((e) => {
            const d = new Date(e.dateISO);
            const tasksDone = (e.tasks ?? []).filter((t) => t.done).length;
            const tasksTotal = (e.tasks ?? []).length;

            return (
              <div
                key={e.id}
                className="review-entry"
                onClick={() => props.onPickDate(e.dateISO)}
              >
                <div className="review-entry-head">
                  <div className="review-entry-date">
                    {toJalali(d).format("dddd، D MMMM YYYY")}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {e.mood && (
                      <span title={e.mood} style={{ fontSize: 16 }}>
                        {MOOD_EMOJI[e.mood] ?? ""}
                      </span>
                    )}
                    {tasksTotal > 0 && (
                      <span className="badge" style={{ fontSize: 11 }}>
                        {tasksDone}/{tasksTotal} کار
                      </span>
                    )}
                  </div>
                </div>

                {e.text && e.text.trim().length > 0 && (
                  <div className="review-entry-preview">
                    {e.text.slice(0, 160)}{e.text.length > 160 ? "…" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
