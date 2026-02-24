import { useState, type FormEvent } from "react";
import { login } from "../lib/auth";

export function Login(props: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email.includes("@") || pass.length < 4) {
      setErr("ایمیل معتبر و رمز حداقل ۴ کاراکتر وارد کن.");
      return;
    }
    const u = login(email, pass);
    props.onDone(u.email);
  }

  return (
    <div className="login-wrap season-spring">
      <div className="login-card">
        <div className="login-logo">🌸</div>

        <div className="login-title">تقویم مراقبت از خود</div>
        <div className="login-sub">
          همراه روزهای تو · بر پایه‌ی ریتم زندگی زنان ایرانی
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل"
            type="email"
            autoComplete="email"
          />
          <input
            className="input"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="رمز عبور"
            autoComplete="current-password"
          />

          {err && <div className="login-err">{err}</div>}

          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => props.onDone(login("demo@planner.local", "1234").email)}
          >
            ورود سریع (اکانت دمو)
          </button>

          <button className="btn btn-season" type="submit">
            ورود
          </button>
        </form>

        <div className="small" style={{ textAlign: "center", marginTop: 16 }}>
          داده‌ها فقط روی دستگاه شما ذخیره می‌شوند.
        </div>
      </div>
    </div>
  );
}
