import { useEffect, useState } from "react";
import type { Experience } from "../lib/db";
import {
  getExperiences,
  saveExperience,
  deleteExperience,
  updateExperience,
} from "../lib/db";

type ExpType = Experience["type"];

const CATEGORIES: { type: ExpType; label: string; emoji: string; placeholder: string }[] = [
  { type: "film",  label: "فیلم‌ها",  emoji: "🎬", placeholder: "نام فیلم..." },
  { type: "book",  label: "کتاب‌ها",  emoji: "📚", placeholder: "نام کتاب..." },
  { type: "place", label: "جاها",     emoji: "📍", placeholder: "نام مکان..." },
  { type: "trip",  label: "سفرها",    emoji: "✈️", placeholder: "مقصد سفر..." },
];

export function ExperienceTracker() {
  const [activeType, setActiveType] = useState<ExpType>("film");
  const [items, setItems]           = useState<Experience[]>([]);
  const [titleDraft, setTitleDraft] = useState("");

  async function load(type: ExpType) {
    const data = await getExperiences(type);
    setItems(data);
  }

  useEffect(() => {
    load(activeType);
  }, [activeType]);

  async function addItem() {
    const title = titleDraft.trim();
    if (!title) return;
    const exp: Experience = {
      id: `${Date.now()}-${Math.random()}`,
      type: activeType,
      title,
      done: false,
      rating: 0,
      createdAt: Date.now(),
    };
    await saveExperience(exp);
    setTitleDraft("");
    await load(activeType);
  }

  async function toggleDone(id: string, done: boolean) {
    await updateExperience(id, { done: !done });
    await load(activeType);
  }

  async function setRating(id: string, rating: number) {
    await updateExperience(id, { rating });
    await load(activeType);
  }

  async function remove(id: string) {
    await deleteExperience(id);
    await load(activeType);
  }

  const cat = CATEGORIES.find((c) => c.type === activeType)!;

  return (
    <div className="card">
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 16, color: "var(--s-dark)" }}>
        تجربه‌های امسال من
      </div>

      {/* Category tabs */}
      <div className="exp-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.type}
            className={`exp-tab ${activeType === c.type ? "active" : ""}`}
            onClick={() => setActiveType(c.type)}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
            {activeType !== c.type && (
              <span className="small" style={{ color: "inherit" }}>
                {/* count shown on active */}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="exp-add-form mb-12">
        <input
          className="input"
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder={cat.placeholder}
        />
        <button className="btn btn-primary" onClick={addItem}>
          افزودن
        </button>
      </div>

      {/* List */}
      <div className="exp-list">
        {items.length === 0 ? (
          <div className="empty-state">
            {cat.emoji} هنوز {cat.label.replace("ها", "ی")} ثبت نکرده‌ای.
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className={`exp-item ${item.done ? "exp-done exp-item-done" : ""}`}
            >
              {/* Index */}
              <span className="small" style={{ minWidth: 22, textAlign: "center", color: "var(--lighter)", fontWeight: 700 }}>
                {(idx + 1).toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}
              </span>

              {/* Done checkbox */}
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleDone(item.id, item.done)}
                style={{ width: 15, height: 15, accentColor: "var(--s-dark)", cursor: "pointer", flexShrink: 0 }}
              />

              {/* Title */}
              <span className="exp-item-title">{item.title}</span>

              {/* Star rating (only for films and books) */}
              {(activeType === "film" || activeType === "book") && (
                <div className="exp-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`exp-star ${(item.rating ?? 0) >= star ? "filled" : ""}`}
                      onClick={() => setRating(item.id, star === item.rating ? 0 : star)}
                      title={`${star} ستاره`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              )}

              {/* Delete */}
              <button className="exp-delete-btn" onClick={() => remove(item.id)} title="حذف">
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="small mt-8">
        {items.filter((i) => i.done).length} از {items.length} انجام شده
      </div>
    </div>
  );
}
