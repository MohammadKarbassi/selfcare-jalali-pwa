import { useState, type FormEvent } from "react";
import { login } from "../lib/auth";

export function Login(props: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email.includes("@") || pass.length < 4) {
      setErr("ایمیل معتبر و رمز حداقل ۴ کاراکتر.");
      return;
    }
    const u = login(email, pass);
    props.onDone(u.email);
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto" }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>ورود</div>
        <div className="small" style={{ lineHeight: 1.8, marginTop: 6 }}>
          نسخه دمو: ورود محلی است (برای نمایش).
        </div>

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 12 }}>
          <input className="input" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="ایمیل" />
          <input className="input" type="password" value={pass} onChange={(ev) => setPass(ev.target.value)} placeholder="رمز" />

          {err ? <div className="small" style={{ color: "#b91c1c", fontWeight: 800 }}>{err}</div> : null}

          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => props.onDone(login("demo@khanoumi.local", "1234").email)}
          >
            ورود سریع (اکانت دمو)
          </button>

          <button className="btn btn-primary" type="submit">ادامه</button>
        </form>
      </div>
    </div>
  );
}