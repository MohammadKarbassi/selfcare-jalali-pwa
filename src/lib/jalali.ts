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
export const weekDaysFaShort = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

export type CalendarView = "month" | "week";

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

export function jalaliPeriodLabel(anchor: Date, view: CalendarView) {
  if (view === "month") {
    const j = toJalali(anchor);
    return `${j.format("MMMM")} ${j.format("YYYY")}`;
  }

  const week = jalaliWeekRange(anchor);
  const start = toJalali(week[0].date);
  const end = toJalali(week[6].date);
  return `${start.format("D MMMM")} تا ${end.format("D MMMM YYYY")}`;
}

// Approximate day-of-year in Jalali calendar
// Months 1-6: 31 days each; months 7-11: 30 days; month 12: 29/30
const JALALI_MONTH_OFFSET = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];

export function jalaliDayOfYear(date: Date): number {
  const j = toJalali(date);
  const month = parseInt(j.format("M"));
  const day = parseInt(j.format("D"));
  return JALALI_MONTH_OFFSET[month - 1] + day;
}

export function jalaliWeekNumber(date: Date): number {
  return Math.ceil(jalaliDayOfYear(date) / 7);
}

export function jalaliWeekId(date: Date): string {
  const j = toJalali(date);
  const year = j.format("YYYY");
  const weekNum = jalaliWeekNumber(date);
  return `${year}-W${weekNum.toString().padStart(2, "0")}`;
}

export function getSeasonFromJalaliMonth(month: number): "spring" | "summer" | "fall" | "winter" {
  if (month <= 3) return "spring";
  if (month <= 6) return "summer";
  if (month <= 9) return "fall";
  return "winter";
}

export function getSeasonForDate(date: Date): "spring" | "summer" | "fall" | "winter" {
  const j = toJalali(date);
  const month = parseInt(j.format("M"));
  return getSeasonFromJalaliMonth(month);
}

export const seasonNames: Record<string, string> = {
  spring: "بهار",
  summer: "تابستان",
  fall: "پاییز",
  winter: "زمستان",
};
