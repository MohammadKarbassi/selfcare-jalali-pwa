import { useEffect, useState } from "react";
import type { WeekEntry } from "../lib/db";
import { getWeekEntry, saveWeekEntry } from "../lib/db";

type Mood = WeekEntry["mood"];

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "sunny",         emoji: "☀️",  label: "عالی" },
  { value: "partly-cloudy", emoji: "⛅",  label: "خوب" },
  { value: "cloudy",        emoji: "☁️",  label: "معمولی" },
  { value: "rainy",         emoji: "🌧️", label: "سخت" },
];

const emptyWeek = (id: string): WeekEntry => ({
  id,
  weekTasks: [],
  mood: "",
  personalNotes: "",
  importantMoments: "",
  nextWeekAppointments: [],
  updatedAt: Date.now(),
});

export function WeekReview({ weekId }: { weekId: string }) {
  const [entry, setEntry] = useState<WeekEntry>(emptyWeek(weekId));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Drafts for adding new week tasks
  const [taskDraft, setTaskDraft] = useState("");
  // Drafts for next-week appointments
  const [apptTitle, setApptTitle] = useState("");
  const [apptTime, setApptTime]   = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const e = await getWeekEntry(weekId);
      if (!cancelled) setEntry(e ?? emptyWeek(weekId));
    })();
    return () => { cancelled = true; };
  }, [weekId]);

  async function save(updated: WeekEntry) {
    setSaveStatus("saving");
    await saveWeekEntry({ ...updated, updatedAt: Date.now() });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1400);
  }

  function update(patch: Partial<WeekEntry>) {
    setEntry((prev) => ({ ...prev, ...patch }));
  }

  async function addWeekTask() {
    const title = taskDraft.trim();
    if (!title) return;
    const updated: WeekEntry = {
      ...entry,
      weekTasks: [
        ...entry.weekTasks,
        { id: `${Date.now()}`, title, done: false },
      ],
    };
    setEntry(updated);
    setTaskDraft("");
    await save(updated);
  }

  async function toggleWeekTask(tid: string) {
    const updated: WeekEntry = {
      ...entry,
      weekTasks: entry.weekTasks.map((t) =>
        t.id === tid ? { ...t, done: !t.done } : t
      ),
    };
    setEntry(updated);
    await save(updated);
  }

  async function addAppt() {
    const title = apptTitle.trim();
    if (!title || !apptTime) return;
    const updated: WeekEntry = {
      ...entry,
      nextWeekAppointments: [
        ...entry.nextWeekAppointments,
        { id: `${Date.now()}`, title, time: apptTime },
      ],
    };
    setEntry(updated);
    setApptTitle("");
    setApptTime("");
    await save(updated);
  }

  async function setMood(mood: Mood) {
    const updated = { ...entry, mood };
    setEntry(updated);
    await save(updated);
  }

  async function saveNotes() {
    await save(entry);
  }

  const sortedAppts = [...entry.nextWeekAppointments].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <div className="card review-card">
      <div className="bold mb-8" style={{ fontSize: 15, color: "var(--s-dark)" }}>
        مرور هفته
      </div>

      {/* Mood */}
      <div className="review-section">
        <div className="review-section-label">حال و هوای من این هفته</div>
        <div className="mood-options">
          {MOODS.map((m) => (
            <button
              key={m.value}
              className={`mood-btn ${entry.mood === m.value ? "mood-active" : ""}`}
              onClick={() => setMood(m.value)}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly tasks (کارهای باقی‌مانده) */}
      <div className="review-section">
        <div className="review-section-label">کارهای مهم هفته</div>
        <div className="review-task-list">
          {entry.weekTasks.length === 0 && (
            <div className="small">هنوز کاری ثبت نشده.</div>
          )}
          {entry.weekTasks.map((t) => (
            <label key={t.id} className="week-task-row">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleWeekTask(t.id)}
              />
              <span className={t.done ? "task-done" : ""}>{t.title}</span>
            </label>
          ))}
        </div>
        <div className="week-tasks-form">
          <input
            className="input"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addWeekTask()}
            placeholder="کار مهم هفتگی..."
          />
          <button className="btn btn-icon btn-xs" onClick={addWeekTask}>+</button>
        </div>
      </div>

      {/* Personal notes */}
      <div className="review-section">
        <div className="review-section-label">چند خط برای خودم</div>
        <textarea
          className="input"
          value={entry.personalNotes}
          onChange={(e) => update({ personalNotes: e.target.value })}
          onBlur={saveNotes}
          placeholder="آزادانه بنویس..."
        />
      </div>

      {/* Important moments */}
      <div className="review-section">
        <div className="review-section-label">لحظه‌های مهم من این هفته</div>
        <textarea
          className="input"
          value={entry.importantMoments}
          onChange={(e) => update({ importantMoments: e.target.value })}
          onBlur={saveNotes}
          placeholder="لحظه‌هایی که یادت می‌ماند..."
        />
      </div>

      {/* Next week appointments */}
      <div className="review-section">
        <div className="review-section-label">هفته بعد چه قرارهایی دارم؟</div>
        <div className="review-appt-list">
          {sortedAppts.length === 0 && (
            <div className="small">قراری ثبت نشده.</div>
          )}
          {sortedAppts.map((a) => (
            <div key={a.id} className="review-appt-row">
              <span className="meeting-time-badge">{a.time}</span>
              <span style={{ fontSize: 13 }}>{a.title}</span>
            </div>
          ))}
        </div>
        <div className="day-meeting-form">
          <input
            className="input"
            value={apptTitle}
            onChange={(e) => setApptTitle(e.target.value)}
            placeholder="عنوان قرار"
          />
          <input
            className="input"
            type="time"
            value={apptTime}
            onChange={(e) => setApptTime(e.target.value)}
          />
          <button className="btn btn-ghost btn-xs day-meeting-add-btn" onClick={addAppt}>
            ثبت قرار
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex mt-8">
        <button className="btn btn-primary" onClick={saveNotes}>
          ذخیره
        </button>
        {saveStatus !== "idle" && (
          <span className={`save-status ${saveStatus === "saved" ? "saved" : ""}`}>
            {saveStatus === "saving" ? "در حال ذخیره..." : "ذخیره شد ✓"}
          </span>
        )}
      </div>
    </div>
  );
}
