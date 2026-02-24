import { openDB } from "idb";

export type JournalEntry = {
  id: string;       // yyyy-mm-dd
  dateISO: string;  // yyyy-mm-dd
  text: string;     // day notes / journal
  mood?: "low" | "ok" | "good";
  tasks?: Array<{ id: string; title: string; done: boolean }>;
  meetings?: Array<{ id: string; title: string; time: string }>;
  updatedAt: number;
};

export type WeekEntry = {
  id: string;       // e.g. "1405-W15"
  weekTasks: Array<{ id: string; title: string; done: boolean }>;
  mood: "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "";
  personalNotes: string;
  importantMoments: string;
  nextWeekAppointments: Array<{ id: string; title: string; time: string }>;
  updatedAt: number;
};

export type Experience = {
  id: string;
  type: "film" | "book" | "place" | "trip";
  title: string;
  notes?: string;
  rating?: number; // 1-5
  done: boolean;
  createdAt: number;
};

const DB_NAME = "selfcare-db";
const JOURNAL_STORE = "journal";
const WEEK_STORE = "weeks";
const EXP_STORE = "experiences";

async function getDB() {
  return openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(JOURNAL_STORE, { keyPath: "id" });
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(WEEK_STORE)) {
          db.createObjectStore(WEEK_STORE, { keyPath: "id" });
        }
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(EXP_STORE)) {
          db.createObjectStore(EXP_STORE, { keyPath: "id" });
        }
      }
    },
  });
}

// Journal (day) entries
export async function saveEntry(entry: JournalEntry) {
  const db = await getDB();
  const prev = (await db.get(JOURNAL_STORE, entry.id)) as JournalEntry | undefined;
  await db.put(JOURNAL_STORE, {
    ...prev,
    ...entry,
    tasks: entry.tasks ?? prev?.tasks ?? [],
    meetings: entry.meetings ?? prev?.meetings ?? [],
  });
}

export async function getEntry(id: string) {
  const db = await getDB();
  return (await db.get(JOURNAL_STORE, id)) as JournalEntry | undefined;
}

export async function listEntries() {
  const db = await getDB();
  return (await db.getAll(JOURNAL_STORE)) as JournalEntry[];
}

// Week entries
export async function saveWeekEntry(entry: WeekEntry) {
  const db = await getDB();
  const prev = (await db.get(WEEK_STORE, entry.id)) as WeekEntry | undefined;
  await db.put(WEEK_STORE, {
    ...prev,
    ...entry,
    weekTasks: entry.weekTasks ?? prev?.weekTasks ?? [],
    nextWeekAppointments: entry.nextWeekAppointments ?? prev?.nextWeekAppointments ?? [],
  });
}

export async function getWeekEntry(id: string) {
  const db = await getDB();
  return (await db.get(WEEK_STORE, id)) as WeekEntry | undefined;
}

// Experiences
export async function saveExperience(exp: Experience) {
  const db = await getDB();
  await db.put(EXP_STORE, exp);
}

export async function getExperiences(type: Experience["type"]) {
  const db = await getDB();
  const all = (await db.getAll(EXP_STORE)) as Experience[];
  return all.filter((e) => e.type === type).sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteExperience(id: string) {
  const db = await getDB();
  await db.delete(EXP_STORE, id);
}

export async function updateExperience(id: string, patch: Partial<Experience>) {
  const db = await getDB();
  const prev = (await db.get(EXP_STORE, id)) as Experience | undefined;
  if (!prev) return;
  await db.put(EXP_STORE, { ...prev, ...patch });
}
