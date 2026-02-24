import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  type CalendarView,
  jalaliMonthMatrix,
  jalaliWeekRange,
  jalaliPeriodLabel,
  jalaliWeekId,
  jalaliWeekNumber,
  toJalali,
  weekDaysFa,
  weekDaysFaShort,
  weekdayIndexSaturdayFirst,
} from "../lib/jalali";
import { getEntry, saveEntry } from "../lib/db";
import type { JournalEntry } from "../lib/db";
import { getWomanForWeek } from "../lib/women";
import { WomanSlot } from "./WomanProfile";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function isoId(date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
}

function toGregorian(date: Date) {
  // Short Gregorian date in English
  return dayjs(date).format("D MMM");
}

function emptyEntry(id: string): JournalEntry {
  return { id, dateISO: id, text: "", mood: "ok", tasks: [], meetings: [], updatedAt: Date.now() };
}

// ─────────────────────────────────────────────────────────
// Inline day card (used inside week view)
// ─────────────────────────────────────────────────────────
function DayCardInline({
  date,
  entry,
  onUpdate,
}: {
  date: Date;
  entry: JournalEntry;
  onUpdate: (updated: JournalEntry) => void;
}) {
  const j = toJalali(date);
  const dayName = weekDaysFa[weekdayIndexSaturdayFirst(date)];
  const dayNum = j.format("D");
  const monthName = j.format("MMMM");
  const greg = toGregorian(date);

  const tasks    = entry.tasks    ?? [];
  const meetings = [...(entry.meetings ?? [])].sort((a, b) => a.time.localeCompare(b.time));
  const notes    = entry.text ?? "";

  const [taskDraft, setTaskDraft]         = useState("");
  const [meetTitle, setMeetTitle]         = useState("");
  const [meetTime,  setMeetTime]          = useState("");
  const [localNotes, setLocalNotes]       = useState(notes);
  const [notesSaved, setNotesSaved]       = useState(false);

  // Sync local notes when entry changes from outside
  useEffect(() => { setLocalNotes(entry.text ?? ""); }, [entry.id]);

  async function addTask() {
    const title = taskDraft.trim();
    if (!title) return;
    const updated: JournalEntry = {
      ...entry,
      tasks: [...tasks, { id: `${Date.now()}`, title, done: false }],
      updatedAt: Date.now(),
    };
    onUpdate(updated);
    setTaskDraft("");
  }

  async function toggleTask(tid: string) {
    const updated: JournalEntry = {
      ...entry,
      tasks: tasks.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)),
      updatedAt: Date.now(),
    };
    onUpdate(updated);
  }

  async function addMeeting() {
    const title = meetTitle.trim();
    if (!title || !meetTime) return;
    const updated: JournalEntry = {
      ...entry,
      meetings: [...(entry.meetings ?? []), { id: `${Date.now()}`, title, time: meetTime }],
      updatedAt: Date.now(),
    };
    onUpdate(updated);
    setMeetTitle("");
    setMeetTime("");
  }

  async function saveNotes() {
    const updated: JournalEntry = { ...entry, text: localNotes, updatedAt: Date.now() };
    onUpdate(updated);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 1200);
  }

  return (
    <div className="day-card">
      {/* Header */}
      <div className="day-card-head">
        <div>
          <div className="day-card-name">{dayName}</div>
        </div>
        <div className="day-card-dates" style={{ textAlign: "left" }}>
          <div className="day-card-jalali">{dayNum}</div>
          <div className="day-card-month">{monthName}</div>
          <div className="day-card-gregorian">{greg}</div>
        </div>
      </div>

      <div className="day-sep" />

      {/* Tasks */}
      <div className="day-section">
        <div className="day-section-label">کارها</div>
        {tasks.length > 0 && (
          <div className="day-task-list">
            {tasks.map((t) => (
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
          <button className="btn btn-icon btn-xs" onClick={addTask} title="افزودن">+</button>
        </div>
      </div>

      <div className="day-sep" />

      {/* Meetings */}
      <div className="day-section">
        <div className="day-section-label">قرارها</div>
        {meetings.length > 0 && (
          <div className="day-meeting-list">
            {meetings.map((m) => (
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

      <div className="day-sep" />

      {/* Notes */}
      <div className="day-section">
        <div className="day-section-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>یادداشت</span>
          {notesSaved && <span style={{ fontSize: 10, color: "var(--s-mid)", fontWeight: 700 }}>ذخیره شد ✓</span>}
        </div>
        <textarea
          className="day-notes-area"
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="یادداشت روز را اینجا بنویس..."
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Week Planner View
// ─────────────────────────────────────────────────────────
function WeekPlannerView({
  anchor,
}: {
  anchor: Date;
  onSelect?: (d: Date) => void;
}) {
  const weekCells = jalaliWeekRange(anchor);
  const periodLabel = jalaliPeriodLabel(anchor, "week");
  const weekNum = jalaliWeekNumber(anchor);
  const weekId  = jalaliWeekId(anchor);
  const woman   = getWomanForWeek(weekNum);

  const cellIds = weekCells.map((c) => isoId(c.date));
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<string, JournalEntry> = {};
      for (const c of weekCells) {
        const id = isoId(c.date);
        const e  = await getEntry(id);
        map[id]  = e ?? emptyEntry(id);
      }
      if (!cancelled) setEntries(map);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellIds.join("|")]);

  async function handleUpdate(id: string, updated: JournalEntry) {
    await saveEntry(updated);
    setEntries((prev) => ({ ...prev, [id]: updated }));
  }

  // Persian week number numeral
  const weekNumPersian = weekNum.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

  return (
    <div>
      {/* Week header */}
      <div style={{ marginBottom: 16 }}>
        <div className="week-num">هفته {weekNumPersian}</div>
        <div className="week-range">{periodLabel}</div>
        <div className="small mt-4" style={{ color: "var(--s-mid)" }}>
          شناسه: {weekId}
        </div>
      </div>

      {/* Day cards grid — 7 days + woman slot */}
      <div className="week-days-grid">
        {weekCells.map((c) => {
          const id = isoId(c.date);
          return (
            <DayCardInline
              key={id}
              date={c.date}
              entry={entries[id] ?? emptyEntry(id)}
              onUpdate={(updated) => handleUpdate(id, updated)}
            />
          );
        })}

        {/* 8th slot: woman profile */}
        <WomanSlot woman={woman} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Month Grid View
// ─────────────────────────────────────────────────────────
function MonthGridView({
  anchor,
  selected,
  onSelect,
}: {
  anchor: Date;
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const { cells } = jalaliMonthMatrix(anchor);
  const today = new Date();
  const todayId    = isoId(today);
  const selectedId = isoId(selected);

  const cellIds = cells.map((c) => isoId(c.date)).join("|");
  const [hasNotes, setHasNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<string, boolean> = {};
      for (const c of cells) {
        const id = isoId(c.date);
        const e  = await getEntry(id);
        map[id]  = !!(e?.text && e.text.trim().length > 0);
      }
      if (!cancelled) setHasNotes(map);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellIds]);

  return (
    <div>
      {/* Weekday headers */}
      <div className="cal-month-grid" style={{ marginBottom: 6 }}>
        {weekDaysFaShort.map((w) => (
          <div key={w} className="cal-weekday">{w}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="cal-month-grid">
        {cells.map((c, idx) => {
          const id       = isoId(c.date);
          const jDate    = toJalali(c.date);
          const dayNum   = jDate.format("D");
          const isToday  = id === todayId;
          const isSel    = id === selectedId;
          const inMonth  = c.inMonth;

          return (
            <div
              key={idx}
              className={[
                "daycell",
                isToday  ? "today"        : "",
                isSel && !isToday ? "selected" : "",
                !inMonth ? "out-of-month" : "",
              ].join(" ")}
              onClick={() => inMonth && onSelect(c.date)}
              role="button"
              tabIndex={inMonth ? 0 : -1}
            >
              {dayNum}
              {hasNotes[id] && <div className="has-note" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────
export function CalendarJalali(props: {
  anchor: Date;
  selected: Date;
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onSelect: (d: Date) => void;
  onShift: (amount: number) => void;
  onToday: () => void;
}) {
  const periodLabel = jalaliPeriodLabel(props.anchor, props.view);

  return (
    <div className="card">
      {/* Top navigation */}
      <div className="cal-month-header">
        <div className="cal-month-label">{periodLabel}</div>

        <div className="week-nav">
          <button className="btn btn-icon" onClick={() => props.onShift(1)} title="بعد">›</button>
          <button className="btn btn-ghost btn-xs" onClick={props.onToday}>امروز</button>
          <button className="btn btn-icon" onClick={() => props.onShift(-1)} title="قبل">‹</button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex mb-12" style={{ gap: 6 }}>
        <button
          className={`btn btn-xs ${props.view === "week" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => props.onViewChange("week")}
        >
          هفتگی
        </button>
        <button
          className={`btn btn-xs ${props.view === "month" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => props.onViewChange("month")}
        >
          ماهانه
        </button>
      </div>

      {/* Content */}
      {props.view === "week" ? (
        <WeekPlannerView
          anchor={props.anchor}
          onSelect={props.onSelect}
        />
      ) : (
        <MonthGridView
          anchor={props.anchor}
          selected={props.selected}
          onSelect={(d) => {
            props.onSelect(d);
          }}
        />
      )}
    </div>
  );
}
