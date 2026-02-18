import { openDB } from "idb";

export type JournalEntry = {
  id: string;       // yyyy-mm-dd
  dateISO: string;  // yyyy-mm-dd
  text: string;
  mood?: "low" | "ok" | "good";
  tasks?: Array<{ id: string; title: string; done: boolean }>;
  meetings?: Array<{ id: string; title: string; time: string }>; // HH:mm
  updatedAt: number;
};

const DB_NAME = "selfcare-db";
const STORE = "journal";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export async function saveEntry(entry: JournalEntry) {
  const db = await getDB();
  const prev = (await db.get(STORE, entry.id)) as JournalEntry | undefined;
  await db.put(STORE, {
    ...prev,
    ...entry,
    tasks: entry.tasks ?? prev?.tasks ?? [],
    meetings: entry.meetings ?? prev?.meetings ?? [],
  });
}

export async function getEntry(id: string) {
  const db = await getDB();
  return (await db.get(STORE, id)) as JournalEntry | undefined;
}

export async function listEntries() {
  const db = await getDB();
  return (await db.getAll(STORE)) as JournalEntry[];
}
