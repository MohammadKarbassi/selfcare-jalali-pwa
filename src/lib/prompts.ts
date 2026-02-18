import { weekdayIndexSaturdayFirst } from "./jalali";

export type Prompt = {
  title: string;
  body: string;
  tags: string[];
  hasIllustration?: boolean;
};

const weekly: Record<number, Prompt> = {
  0: { title: "شنبه | ریست بدن و ذهن", body: "۱۰ دقیقه کشش + ۲ لیوان آب. یک کار کوچک را همین امروز تمام کن.", tags: ["بدن", "تمرکز"], hasIllustration: true },
  1: { title: "یکشنبه | مراقبت پوستی", body: "پاکسازی ملایم + مرطوب‌کننده. اگر بیرون می‌روی، ضدآفتاب.", tags: ["پوست", "روتین"] },
  2: { title: "دوشنبه | مرزبندی روانی", body: "یک «نه» محترمانه برای این هفته تعریف کن. انرژی‌دزدها را شناسایی کن.", tags: ["روان", "مرزبندی"], hasIllustration: true },
  3: { title: "سه‌شنبه | تغذیه هوشمند", body: "پروتئین را جدی بگیر. یک خوراکی قندی را با گزینه بهتر جایگزین کن.", tags: ["تغذیه"] },
  4: { title: "چهارشنبه | حرکت", body: "۲۰ دقیقه پیاده‌روی تند یا تمرین کوتاه. هدف: حرکت، نه کمال‌گرایی.", tags: ["ورزش"], hasIllustration: true },
  5: { title: "پنجشنبه | روابط امن", body: "به یک آدم امن پیام بده. بعدش باید سبک‌تر شوی، نه بدهکارتر.", tags: ["روابط", "حمایت"] },
  6: { title: "جمعه | مرور و ریکاوری", body: "۳ خط بنویس: چی یاد گرفتم؟ چی را رها می‌کنم؟ چی را نگه می‌دارم؟", tags: ["مرور", "ژورنال"], hasIllustration: true },
};

export function promptForDate(date: Date): Prompt {
  const idx = weekdayIndexSaturdayFirst(date);
  return weekly[idx];
}