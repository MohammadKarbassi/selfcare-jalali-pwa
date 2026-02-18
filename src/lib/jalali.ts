import dayjs from "dayjs";
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);

export function toJalali(date: Date) {
  return dayjs(date).calendar("jalali");
}

export function jalaliMonthMatrix(anchor: Date) {
  const d = toJalali(anchor);
  const startOfMonth = d.startOf("month");
  const endOfMonth = d.endOf("month");

  const dayjsDow = startOfMonth.toDate().getDay(); // 0 Sun ... 6 Sat
  const offset = (dayjsDow + 1) % 7; // Sat->0 ... Fri->6

  const daysInMonth = endOfMonth.date();
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < offset; i++) {
    const prev = startOfMonth.subtract(offset - i, "day").toDate();
    cells.push({ date: prev, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cur = startOfMonth.date(day).toDate();
    cells.push({ date: cur, inMonth: true });
  }

  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = dayjs(last).add(1, "day").toDate();
    cells.push({ date: next, inMonth: false });
  }

  return {
    monthLabel: `${d.format("MMMM")} ${d.format("YYYY")}`,
    cells,
  };
}

export const weekDaysFa = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"] as const;
export type CalendarView = "month" | "week" | "day";

export function weekdayIndexSaturdayFirst(date: Date) {
  const dow = date.getDay(); // 0 Sun ... 6 Sat
  return (dow + 1) % 7;
}

export function jalaliWeekRange(anchor: Date) {
  const offset = weekdayIndexSaturdayFirst(anchor);
  const start = dayjs(anchor).subtract(offset, "day").startOf("day");
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < 7; i++) {
    const current = start.add(i, "day").toDate();
    cells.push({ date: current, inMonth: true });
  }

  return cells;
}

export function jalaliDayCell(anchor: Date) {
  return [{ date: dayjs(anchor).startOf("day").toDate(), inMonth: true }];
}

export function jalaliPeriodLabel(anchor: Date, view: CalendarView) {
  if (view === "month") {
    const j = toJalali(anchor);
    return `${j.format("MMMM")} ${j.format("YYYY")}`;
  }

  if (view === "week") {
    const week = jalaliWeekRange(anchor);
    const start = toJalali(week[0].date);
    const end = toJalali(week[6].date);
    return `${start.format("D MMMM")} تا ${end.format("D MMMM YYYY")}`;
  }

  return toJalali(anchor).format("dddd، D MMMM YYYY");
}
