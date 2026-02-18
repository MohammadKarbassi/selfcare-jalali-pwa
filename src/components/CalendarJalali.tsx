import { useEffect, useState } from "react";
import { type CalendarView, jalaliDayCell, jalaliMonthMatrix, jalaliPeriodLabel, jalaliWeekRange, toJalali, weekDaysFa } from "../lib/jalali";
import { promptForDate } from "../lib/prompts";
import { getEntry, saveEntry } from "../lib/db";
import type { JournalEntry } from "../lib/db";
import dayjs from "dayjs";

export function CalendarJalali(props: {
  anchor: Date;
  selected: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onSelect: (d: Date) => void;
  onShift: (amount: number) => void;
  onToday: () => void;
}) {
  const month = jalaliMonthMatrix(props.anchor);
  const cells = props.view === "month" ? month.cells : props.view === "week" ? jalaliWeekRange(props.anchor) : jalaliDayCell(props.anchor);
  const periodLabel = jalaliPeriodLabel(props.anchor, props.view);
  const visibleIdsKey = cells.map((c) => dayjs(c.date).format("YYYY-MM-DD")).join("|");
  const [hasNotes, setHasNotes] = useState<Record<string, boolean>>({});
  const [entriesByDay, setEntriesByDay] = useState<Record<string, JournalEntry | undefined>>({});
  const [taskDrafts, setTaskDrafts] = useState<Record<string, string>>({});
  const [meetingTitleDrafts, setMeetingTitleDrafts] = useState<Record<string, string>>({});
  const [meetingTimeDrafts, setMeetingTimeDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<string, boolean> = {};
      const entries: Record<string, JournalEntry | undefined> = {};
      for (const c of cells) {
        const id = dayjs(c.date).format("YYYY-MM-DD");
        const e = await getEntry(id);
        map[id] = !!(e?.text && e.text.trim().length > 0);
        entries[id] = e;
      }
      if (!cancelled) {
        setHasNotes(map);
        setEntriesByDay(entries);
      }
    })();
    return () => { cancelled = true; };
  }, [visibleIdsKey]);

  const selectedId = dayjs(props.selected).format("YYYY-MM-DD");

  async function upsertSchedule(id: string, updater: (e: JournalEntry) => JournalEntry) {
    const current = entriesByDay[id] ?? {
      id,
      dateISO: id,
      text: "",
      mood: "ok",
      tasks: [],
      meetings: [],
      updatedAt: Date.now(),
    };
    const updated = updater(current);
    updated.updatedAt = Date.now();
    await saveEntry(updated);
    setEntriesByDay((prev) => ({ ...prev, [id]: updated }));
  }

  async function addTask(id: string) {
    const title = (taskDrafts[id] ?? "").trim();
    if (!title) return;
    await upsertSchedule(id, (e) => ({
      ...e,
      tasks: [...(e.tasks ?? []), { id: `${Date.now()}-${Math.random()}`, title, done: false }],
    }));
    setTaskDrafts((prev) => ({ ...prev, [id]: "" }));
  }

  async function toggleTask(id: string, taskId: string) {
    await upsertSchedule(id, (e) => ({
      ...e,
      tasks: (e.tasks ?? []).map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
    }));
  }

  async function addMeeting(id: string) {
    const title = (meetingTitleDrafts[id] ?? "").trim();
    const time = (meetingTimeDrafts[id] ?? "").trim();
    if (!title || !time) return;
    await upsertSchedule(id, (e) => ({
      ...e,
      meetings: [...(e.meetings ?? []), { id: `${Date.now()}-${Math.random()}`, title, time }],
    }));
    setMeetingTitleDrafts((prev) => ({ ...prev, [id]: "" }));
    setMeetingTimeDrafts((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className={`card calendar-card view-${props.view}`}>
      <div className="header">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={() => props.onShift(1)}>
            {props.view === "month" ? "ماه بعد" : props.view === "week" ? "هفته بعد" : "روز بعد"}
          </button>
          <button className="btn btn-ghost" onClick={props.onToday}>امروز</button>
          <button className="btn btn-ghost" onClick={() => props.onShift(-1)}>
            {props.view === "month" ? "ماه قبل" : props.view === "week" ? "هفته قبل" : "روز قبل"}
          </button>
        </div>
        <div style={{ fontWeight: 900 }}>{periodLabel}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button className={`btn ${props.view === "month" ? "btn-primary" : "btn-ghost"}`} onClick={() => props.onViewChange("month")}>
          ماهانه
        </button>
        <button className={`btn ${props.view === "week" ? "btn-primary" : "btn-ghost"}`} onClick={() => props.onViewChange("week")}>
          هفتگی
        </button>
        <button className={`btn ${props.view === "day" ? "btn-primary" : "btn-ghost"}`} onClick={() => props.onViewChange("day")}>
          روزانه
        </button>
      </div>

      {props.view === "month" ? (
        <div className="k-calendar" style={{ marginBottom: 8 }}>
          {weekDaysFa.map((w) => (
            <div key={w} className="small" style={{ fontWeight: 900, textAlign: "center" }}>{w}</div>
          ))}
        </div>
      ) : null}

      <div
        className={`calendar-grid-wrap ${
          props.view === "week"
            ? "k-week-balanced"
            : props.view === "day"
            ? "k-day"
            : "k-calendar"
        }`}
      >
        {cells.map((c, idx) => {
          const j = toJalali(c.date);
          const dayNum = j.format("D");
          const id = dayjs(c.date).format("YYYY-MM-DD");
          const selected = id === selectedId;
          const prompt = promptForDate(c.date);
          const tasks = entriesByDay[id]?.tasks ?? [];
          const meetings = [...(entriesByDay[id]?.meetings ?? [])].sort((a, b) => a.time.localeCompare(b.time));
          const canPlan = props.view !== "month" && c.inMonth;

          return (
            <div
              key={idx}
              className={`daycell ${selected ? "selected" : ""}`}
              onClick={() => props.onSelect(c.date)}
              style={{ opacity: c.inMonth ? 1 : 0.45 }}
              role="button"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="daynum">
                  {props.view === "week" ? `${j.format("dddd")} ${dayNum}` : dayNum}
                </div>
                {hasNotes[id] ? <span className="badge">ژورنال</span> : null}
              </div>
              <div className="daymeta">{prompt.tags.slice(0, 2).join(" • ")}</div>

              {canPlan ? (
                <div className="planner" onClick={(ev) => ev.stopPropagation()}>
                  <div className="planner-sec">
                    <div className="small" style={{ fontWeight: 800 }}>تسک‌ها</div>
                    <div className="planner-list">
                      {tasks.length === 0 ? <div className="small">تسکی ثبت نشده</div> : null}
                      {tasks.map((t) => (
                        <label key={t.id} className="planner-row">
                          <input type="checkbox" checked={t.done} onChange={() => toggleTask(id, t.id)} />
                          <span className={t.done ? "task-done" : ""}>{t.title}</span>
                        </label>
                      ))}
                    </div>
                    <div className="planner-form">
                      <input
                        className="input"
                        value={taskDrafts[id] ?? ""}
                        onChange={(ev) => setTaskDrafts((prev) => ({ ...prev, [id]: ev.target.value }))}
                        placeholder="تسک جدید"
                      />
                      <button className="btn btn-ghost" onClick={() => addTask(id)}>افزودن</button>
                    </div>
                  </div>

                  <div className="planner-sec">
                    <div className="small" style={{ fontWeight: 800 }}>جلسات</div>
                    <div className="planner-list">
                      {meetings.length === 0 ? <div className="small">جلسه‌ای ثبت نشده</div> : null}
                      {meetings.map((m) => (
                        <div key={m.id} className="planner-row">
                          <span className="badge">{m.time}</span>
                          <span>{m.title}</span>
                        </div>
                      ))}
                    </div>
                    <div className="planner-form planner-form-meeting">
                      <input
                        className="input"
                        value={meetingTitleDrafts[id] ?? ""}
                        onChange={(ev) => setMeetingTitleDrafts((prev) => ({ ...prev, [id]: ev.target.value }))}
                        placeholder="عنوان جلسه"
                      />
                      <input
                        className="input"
                        type="time"
                        value={meetingTimeDrafts[id] ?? ""}
                        onChange={(ev) => setMeetingTimeDrafts((prev) => ({ ...prev, [id]: ev.target.value }))}
                      />
                      <button className="btn btn-ghost" onClick={() => addMeeting(id)}>ثبت</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
