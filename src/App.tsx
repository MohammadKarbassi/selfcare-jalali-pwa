import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { CalendarJalali } from "./components/CalendarJalali";
import { DayPanel } from "./components/DayPanel";
import { Login } from "./components/Login";
import { Shell, type AppTab } from "./components/Shell";
import { Settings } from "./components/Settings";
import { JournalReview } from "./components/JournalReview";
import { WeekReview } from "./components/WeekReview";
import { WomanProfile } from "./components/WomanProfile";
import { ExperienceTracker } from "./components/ExperienceTracker";
import { getUser, logout } from "./lib/auth";
import type { CalendarView } from "./lib/jalali";
import { jalaliWeekId, jalaliWeekNumber } from "./lib/jalali";
import { getWomanForWeek } from "./lib/women";

export default function App() {
  const u = getUser();
  const [email, setEmail] = useState<string | null>(u?.email ?? null);

  const [selected,      setSelected]      = useState<Date>(new Date());
  const [anchor,        setAnchor]        = useState<Date>(new Date());
  const [calendarView,  setCalendarView]  = useState<CalendarView>("week");
  const [tab,           setTab]           = useState<AppTab>("calendar");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (!email) return <Login onDone={(e) => setEmail(e)} />;

  function handleShift(amount: number) {
    const unit = calendarView === "month" ? "month" : "week";
    setAnchor(dayjs(anchor).add(amount, unit).toDate());
  }

  function handleToday() {
    const t = new Date();
    setAnchor(t);
    setSelected(t);
  }

  function handleSelect(d: Date) {
    setSelected(d);
    setAnchor(d);
  }

  function handlePickDate(iso: string) {
    const d = new Date(iso);
    setAnchor(d);
    setSelected(d);
    setCalendarView("week");
    setTab("calendar");
  }

  // Right-panel content depends on view
  const weekId  = jalaliWeekId(anchor);
  const weekNum = jalaliWeekNumber(anchor);
  const woman   = getWomanForWeek(weekNum);

  const rightPanel =
    calendarView === "week" ? (
      <div className="grid" style={{ gap: 14 }}>
        <WomanProfile woman={woman} />
        <WeekReview weekId={weekId} />
      </div>
    ) : (
      <DayPanel date={selected} />
    );

  return (
    <Shell
      userEmail={email}
      onLogout={() => { logout(); setEmail(null); }}
      activeTab={tab}
      onTabChange={setTab}
    >
      {tab === "review" ? (
        <JournalReview onPickDate={handlePickDate} />

      ) : tab === "experiences" ? (
        <ExperienceTracker />

      ) : tab === "settings" ? (
        <Settings />

      ) : (
        /* Calendar tab */
        <div className="grid grid-planner">
          <CalendarJalali
            anchor={anchor}
            selected={selected}
            view={calendarView}
            onViewChange={setCalendarView}
            onSelect={handleSelect}
            onShift={handleShift}
            onToday={handleToday}
          />
          {rightPanel}
        </div>
      )}
    </Shell>
  );
}
