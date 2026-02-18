import { useEffect, useState } from "react";

type ReminderConfig = { hour: number; minute: number; enabled: boolean };
const KEY = "selfcare_reminder";

function loadCfg(): ReminderConfig {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as ReminderConfig) : { hour: 21, minute: 0, enabled: false };
}
function saveCfg(cfg: ReminderConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export function Settings() {
  const [cfg, setCfg] = useState<ReminderConfig>(loadCfg());
  const [msg, setMsg] = useState<string>("");

  useEffect(() => saveCfg(cfg), [cfg]);

  async function askPermission() {
    if (!("Notification" in window)) {
      setMsg("این مرورگر نوتیفیکیشن را پشتیبانی نمی‌کند.");
      return;
    }
    const res = await Notification.requestPermission();
    setMsg(res === "granted" ? "دسترسی نوتیفیکیشن فعال شد." : "بدون دسترسی، یادآوری کار نمی‌کند.");
  }

  return (
    <div className="card">
      <div style={{ fontWeight: 900, marginBottom: 6 }}>یادآوری روزانه</div>
      <div className="small" style={{ lineHeight: 1.8 }}>
        برای دمو: دسترسی نوتیفیکیشن + ارسال تست کافی است. نسخه محصولی نیاز به Push/Backend دارد.
      </div>

      <div className="sep" />

      <button className="btn btn-ghost" onClick={askPermission}>فعال‌سازی دسترسی نوتیفیکیشن</button>

      <button
        className="btn btn-primary"
        onClick={() => {
          if (!("Notification" in window)) return;
          if (Notification.permission !== "granted") {
            setMsg("اول باید دسترسی نوتیفیکیشن را فعال کنی.");
            return;
          }
          new Notification("نمونه یادآوری", { body: "این یک یادآوری تست است." });
        }}
        style={{ marginTop: 10 }}
      >
        ارسال نوتیفیکیشن تست
      </button>

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label className="badge" style={{ gap: 8 }}>
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(ev) => setCfg({ ...cfg, enabled: ev.target.checked })}
          />
          فعال
        </label>

        <input
          className="input"
          type="number"
          min={0}
          max={23}
          value={cfg.hour}
          onChange={(ev) => setCfg({ ...cfg, hour: Number(ev.target.value) })}
          style={{ maxWidth: 110 }}
          placeholder="ساعت"
        />
        <input
          className="input"
          type="number"
          min={0}
          max={59}
          value={cfg.minute}
          onChange={(ev) => setCfg({ ...cfg, minute: Number(ev.target.value) })}
          style={{ maxWidth: 110 }}
          placeholder="دقیقه"
        />
      </div>

      {msg ? <div className="small" style={{ marginTop: 8 }}>{msg}</div> : null}
    </div>
  );
}