import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { CalendarJalali } from "./components/CalendarJalali";
import { DayPanel } from "./components/DayPanel";
import { Login } from "./components/Login";
import { Shell } from "./components/Shell";
import { Settings } from "./components/Settings";
import { JournalReview } from "./components/JournalReview";
import { SupportPage } from "./components/support/SupportPage";
import { getUser, logout } from "./lib/auth";
import type { CalendarView } from "./lib/jalali";

export default function App() {
  if (window.location.pathname.startsWith("/support")) return <SupportPage />;

  const u = getUser();
  const [email, setEmail] = useState<string | null>(u?.email ?? null);

  const [selected, setSelected] = useState<Date>(new Date());
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [tab, setTab] = useState<"calendar" | "settings" | "review">("calendar");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (!email) return <Login onDone={(e) => setEmail(e)} />;

  return (
    <Shell
      userEmail={email}
      onLogout={() => {
        logout();
        setEmail(null);
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button className={`btn ${tab === "calendar" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("calendar")}>
          تقویم
        </button>
        <button className={`btn ${tab === "review" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("review")}>
          مرور
        </button>
        <button className={`btn ${tab === "settings" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("settings")}>
          تنظیمات
        </button>
      </div>

      {tab === "review" ? (
        <JournalReview
          onPickDate={(iso) => {
            const d = new Date(iso);
            setAnchor(d);
            setSelected(d);
            setTab("calendar");
          }}
        />
      ) : tab === "settings" ? (
        <Settings />
      ) : (
        <div className="grid grid-2">
          <CalendarJalali
            anchor={anchor}
            selected={selected}
            view={calendarView}
            onViewChange={setCalendarView}
            onSelect={(d) => {
              setSelected(d);
              setAnchor(d);
            }}
            onShift={(amount) =>
              setAnchor(
                dayjs(anchor).add(amount, calendarView === "month" ? "month" : calendarView === "week" ? "week" : "day").toDate(),
              )
            }
            onToday={() => {
              const t = new Date();
              setAnchor(t);
              setSelected(t);
            }}
          />
          <DayPanel date={selected} />
        </div>
      )}
    </Shell>
  );
}
