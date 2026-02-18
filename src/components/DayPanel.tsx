import { useEffect, useState } from "react";
import { toJalali } from "../lib/jalali";
import { promptForDate } from "../lib/prompts";
import { getEntry, saveEntry } from "../lib/db";
import type { JournalEntry } from "../lib/db";
import { IllustrationCard } from "./IllustrationCard";

export function DayPanel(props: { date: Date }) {
  const j = toJalali(props.date);
  const id = props.date.toISOString().slice(0, 10);
  const prompt = promptForDate(props.date);

  const [text, setText] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("ok");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const e = await getEntry(id);
      if (!cancelled) {
        setText(e?.text ?? "");
        setMood(e?.mood ?? "ok");
        setStatus("idle");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function onSave() {
    setStatus("saving");
    await saveEntry({ id, dateISO: id, text, mood, updatedAt: Date.now() });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1200);
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      {prompt.hasIllustration ? (
        <IllustrationCard
          title="تو قرار نیست بجنگی؛ قرار است جلو بروی."
          subtitle="یک قدم کوچک امروز، مسیر را عوض می‌کند."
        />
      ) : null}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900 }}>{j.format("dddd، D MMMM YYYY")}</div>
            <div className="small">{prompt.title}</div>
          </div>
          <span className="badge">{prompt.tags.join(" • ")}</span>
        </div>

        <div className="sep" />

        <div style={{ fontWeight: 900, marginBottom: 6 }}>یادآوری امروز</div>
        <div style={{ lineHeight: 1.85 }}>{prompt.body}</div>

        <div className="sep" />

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 900 }}>حال امروز:</div>
          <select className="input" value={mood} onChange={(ev) => setMood(ev.target.value as JournalEntry["mood"])} style={{ maxWidth: 220 }}>
            <option value="low">کم‌انرژی</option>
            <option value="ok">معمولی</option>
            <option value="good">خوب</option>
          </select>
        </div>

        <div style={{ fontWeight: 900, marginBottom: 6 }}>ژورنال</div>
        <textarea
          value={text}
          onChange={(ev) => setText(ev.target.value)}
          placeholder="۳ تا ۱۰ خط کافی است. مهم استمرار است، نه ادبیات."
        />

        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={onSave}>ذخیره</button>
          <span className="small">
            {status === "saving" ? "در حال ذخیره..." : status === "saved" ? "ذخیره شد ✓" : "آفلاین هم ذخیره می‌شود."}
          </span>
        </div>
      </div>
    </div>
  );
}