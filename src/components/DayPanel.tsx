import { useEffect, useState } from "react";
import { toJalali } from "../lib/jalali";
import { promptForDate } from "../lib/prompts";
import { getEntry, saveEntry } from "../lib/db";
import type { JournalEntry } from "../lib/db";

const MOOD_OPTIONS = [
  { value: "low",  label: "کم‌انرژی",  emoji: "😔" },
  { value: "ok",   label: "معمولی",    emoji: "😐" },
  { value: "good", label: "خوب",       emoji: "😊" },
] as const;

function isoId(date: Date) {
  return date.toISOString().slice(0, 10);
}

function emptyEntry(id: string): JournalEntry {
  return { id, dateISO: id, text: "", mood: "ok", tasks: [], meetings: [], updatedAt: Date.now() };
}

export function DayPanel({ date }: { date: Date }) {
  const j      = toJalali(date);
  const id     = isoId(date);
  const prompt = promptForDate(date);

  const [text,   setText]   = useState("");
  const [mood,   setMood]   = useState<JournalEntry["mood"]>("ok");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Tasks & meetings (inline planning in day panel)
  const [tasks,    setTasks]    = useState<JournalEntry["tasks"]>([]);
  const [meetings, setMeetings] = useState<JournalEntry["meetings"]>([]);
  const [taskDraft, setTaskDraft]   = useState("");
  const [meetTitle, setMeetTitle]   = useState("");
  const [meetTime,  setMeetTime]    = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const e = await getEntry(id);
      if (!cancelled) {
        const entry = e ?? emptyEntry(id);
        setText(entry.text ?? "");
        setMood(entry.mood ?? "ok");
        setTasks(entry.tasks ?? []);
        setMeetings(entry.meetings ?? []);
        setStatus("idle");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function saveAll(patch: Partial<JournalEntry> = {}) {
    setStatus("saving");
    await saveEntry({
      id,
      dateISO: id,
      text,
      mood,
      tasks:    tasks    ?? [],
      meetings: meetings ?? [],
      updatedAt: Date.now(),
      ...patch,
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1200);
  }

  async function addTask() {
    const title = taskDraft.trim();
    if (!title) return;
    const updated = [...(tasks ?? []), { id: `${Date.now()}`, title, done: false }];
    setTasks(updated);
    setTaskDraft("");
    await saveAll({ tasks: updated });
  }

  async function toggleTask(tid: string) {
    const updated = (tasks ?? []).map((t) => (t.id === tid ? { ...t, done: !t.done } : t));
    setTasks(updated);
    await saveAll({ tasks: updated });
  }

  async function addMeeting() {
    const title = meetTitle.trim();
    if (!title || !meetTime) return;
    const updated = [...(meetings ?? []), { id: `${Date.now()}`, title, time: meetTime }];
    setMeetings(updated);
    setMeetTitle("");
    setMeetTime("");
    await saveAll({ meetings: updated });
  }

  const sortedMeetings = [...(meetings ?? [])].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="day-panel">
      {/* Day info card */}
      <div className="card">
        <div className="day-panel-header">
          <div>
            <div className="day-panel-date">{j.format("dddd، D MMMM YYYY")}</div>
            <div className="small mt-4">{prompt.tags.join(" • ")}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                className={`mood-btn ${mood === m.value ? "mood-active" : ""}`}
                onClick={() => setMood(m.value as JournalEntry["mood"])}
                title={m.label}
                style={{ width: 40, height: 40, fontSize: 18 }}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="sep" />

        <div className="day-panel-prompt-title">{prompt.title}</div>
        <div className="day-panel-prompt-body">{prompt.body}</div>
      </div>

      {/* Tasks card */}
      <div className="card card-sm">
        <div className="day-section-label">کارهای امروز</div>
        {(tasks ?? []).length > 0 && (
          <div className="day-task-list mb-8">
            {(tasks ?? []).map((t) => (
              <label key={t.id} className="day-task-row">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t.id)}
                />
                <span className={t.done ? "task-done" : ""}>{t.title}</span>
              </label>
            ))}
          </div>
        )}
        <div className="day-add-form">
          <input
            className="input"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="کار جدید..."
          />
          <button className="btn btn-icon btn-xs" onClick={addTask}>+</button>
        </div>

        <div className="sep" />

        <div className="day-section-label">قرارهای امروز</div>
        {sortedMeetings.length > 0 && (
          <div className="day-meeting-list mb-8">
            {sortedMeetings.map((m) => (
              <div key={m.id} className="day-meeting-row">
                <span className="meeting-time-badge">{m.time}</span>
                <span>{m.title}</span>
              </div>
            ))}
          </div>
        )}
        <div className="day-meeting-form">
          <input
            className="input"
            value={meetTitle}
            onChange={(e) => setMeetTitle(e.target.value)}
            placeholder="عنوان قرار"
          />
          <input
            className="input"
            type="time"
            value={meetTime}
            onChange={(e) => setMeetTime(e.target.value)}
          />
          <button className="btn btn-ghost btn-xs day-meeting-add-btn" onClick={addMeeting}>
            ثبت قرار
          </button>
        </div>
      </div>

      {/* Journal/notes card */}
      <div className="card card-sm">
        <div className="day-section-label" style={{ marginBottom: 8 }}>یادداشت و ژورنال</div>
        <textarea
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="آزادانه بنویس. ۳ تا ۱۰ خط کافی است."
          style={{ minHeight: 140 }}
        />

        <div className="flex mt-8">
          <button className="btn btn-primary" onClick={() => saveAll()}>ذخیره</button>
          <span className={`save-status ${status === "saved" ? "saved" : ""}`}>
            {status === "saving" ? "در حال ذخیره..." : status === "saved" ? "ذخیره شد ✓" : "آفلاین ذخیره می‌شود"}
          </span>
        </div>
      </div>
    </div>
  );
}
