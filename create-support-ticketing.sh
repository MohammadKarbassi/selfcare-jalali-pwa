#!/bin/bash
set -e
DIR="$HOME/support-ticketing"
mkdir -p "$DIR"
cd "$DIR"
git init
git checkout -b main

mkdir -p src/lib src/components/support chatwoot-server

# .gitignore
cat > .gitignore << 'EOF'
node_modules
dist
.env
.env.local
*.local
.DS_Store
EOF

# .env.example
cat > .env.example << 'EOF'
VITE_CHATWOOT_URL=
VITE_CHATWOOT_TOKEN=
VITE_CHATWOOT_ACCOUNT=
VITE_CHATWOOT_INBOX=
EOF

# package.json
cat > package.json << 'EOF'
{
  "name": "support-ticketing",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "typescript": "~5.9.3",
    "vite": "^7.3.1"
  }
}
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
EOF

cat > tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF

# vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
EOF

# index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>پشتیبانی خانومی</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# src/main.tsx
cat > src/main.tsx << 'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
EOF

# src/App.tsx
cat > src/App.tsx << 'EOF'
import { SupportPage } from './components/support/SupportPage';

export default function App() {
  return <SupportPage />;
}
EOF

# src/styles.css
cat > src/styles.css << 'EOF'
:root {
  --kh-magenta: #E3007F;
  --kh-ink: #1f1f1f;
  --kh-muted: #6b7280;
  --kh-bg: #ffffff;
  --kh-card: #ffffff;
  --kh-border: #e5e7eb;
  --kh-soft: #fff3fa;
  --radius: 16px;
}

* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, "Vazirmatn", "IRANSans", Arial;
  direction: rtl;
  background: var(--kh-bg);
  color: var(--kh-ink);
}

.card {
  background: var(--kh-card);
  border: 1px solid var(--kh-border);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,.05);
}

.btn {
  border: 0;
  border-radius: 14px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
}
.btn-primary { background: var(--kh-magenta); color: #fff; }
.btn-ghost { background: transparent; border: 1px solid var(--kh-border); }

.input, textarea, select {
  width: 100%;
  border: 1px solid var(--kh-border);
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  background: #fff;
}
textarea { min-height: 160px; resize: vertical; }

.small { font-size: 12px; color: var(--kh-muted); }
EOF

# src/lib/brand.ts
cat > src/lib/brand.ts << 'EOF'
export const brand = {
  name: 'خانومی',
  primary: '#E3007F',
  soft: '#FFF3FA',
};
EOF

# src/lib/chatwoot.ts
cat > src/lib/chatwoot.ts << 'EOF'
const BASE = import.meta.env.VITE_CHATWOOT_URL as string;
const TOKEN = import.meta.env.VITE_CHATWOOT_TOKEN as string;
const ACCOUNT = import.meta.env.VITE_CHATWOOT_ACCOUNT as string;
const INBOX_ID = parseInt(import.meta.env.VITE_CHATWOOT_INBOX as string);

const h = () => ({
  'api_access_token': TOKEN,
  'Content-Type': 'application/json',
});

export interface SubmitPayload {
  name: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
}

export interface TicketInfo {
  id: number;
  status: 'open' | 'resolved' | 'pending' | 'snoozed';
  subject: string;
  createdAt: number;
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '+98' + digits.slice(1);
  if (digits.startsWith('98')) return '+' + digits;
  return '+' + digits;
}

async function findOrCreateContact(name: string, phone: string): Promise<number> {
  const e164 = toE164(phone);

  const searchRes = await fetch(
    `${BASE}/api/v1/accounts/${ACCOUNT}/contacts/search?q=${encodeURIComponent(e164)}&include_contacts=true`,
    { headers: h() }
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    const list = data.payload ?? data;
    const found = Array.isArray(list) ? list[0] : null;
    if (found?.id) return found.id;
  }

  const res = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/contacts`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({ name, phone_number: e164 }),
  });
  if (!res.ok) {
    const raw = await res.text();
    let msg = `خطا در ثبت مخاطب (${res.status})`;
    try { msg = JSON.parse(raw)?.message ?? msg; } catch { /* */ }
    throw new Error(msg);
  }
  const raw2 = await res.json();
  const contact = raw2.payload ?? raw2;
  if (!contact.id) throw new Error('خطا در دریافت شناسه مخاطب');
  return contact.id;
}

export async function submitTicket(payload: SubmitPayload): Promise<number> {
  const contactId = await findOrCreateContact(payload.name, payload.phone);

  const convRes = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/conversations`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({
      inbox_id: INBOX_ID,
      contact_id: contactId,
      additional_attributes: { subject: payload.subject || payload.category, category: payload.category },
    }),
  });
  if (!convRes.ok) {
    const raw = await convRes.text();
    let msg = `خطا در ثبت تیکت (${convRes.status})`;
    try { msg = JSON.parse(raw)?.message ?? msg; } catch { /* */ }
    throw new Error(msg);
  }
  const conv = await convRes.json();

  const msgRes = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/conversations/${conv.id}/messages`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({
      content: `دسته‌بندی: ${payload.category}\nموضوع: ${payload.subject}\n\n${payload.message}`,
      message_type: 'incoming',
      private: false,
    }),
  });
  if (!msgRes.ok) {
    const err = await msgRes.json().catch(() => ({}));
    throw new Error((err as {message?: string})?.message ?? `خطا در ارسال پیام (${msgRes.status})`);
  }

  return conv.id;
}

export async function fetchTicket(ticketId: string): Promise<TicketInfo> {
  const res = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/conversations/${ticketId}`, {
    headers: h(),
  });
  if (!res.ok) throw new Error('تیکت یافت نشد');
  const d = await res.json();
  return {
    id: d.id,
    status: d.status,
    subject: d.additional_attributes?.subject ?? 'بدون موضوع',
    createdAt: d.created_at,
  };
}
EOF

# src/components/support/SupportPage.tsx
cat > src/components/support/SupportPage.tsx << 'TSX'
import { useState } from 'react';
import { brand } from '../../lib/brand';
import { submitTicket, fetchTicket, type TicketInfo } from '../../lib/chatwoot';

const CATEGORIES = [
  'مشکل فنی با اپلیکیشن',
  'سوال درباره اشتراک',
  'گزارش باگ',
  'پیشنهاد و انتقاد',
  'سایر',
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open:     { label: 'در حال بررسی',     color: '#3b82f6' },
  pending:  { label: 'در انتظار پاسخ',   color: '#f59e0b' },
  resolved: { label: 'حل شده',           color: '#10b981' },
  snoozed:  { label: 'به تعویق افتاده',  color: '#6b7280' },
};

type Tab = 'submit' | 'track';

export function SupportPage() {
  const [tab, setTab] = useState<Tab>('submit');
  const [form, setForm] = useState({ name: '', phone: '', category: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [trackId, setTrackId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [trackError, setTrackError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.category || !form.message) {
      setFormError('لطفاً همه فیلدهای ستاره‌دار را پر کنید');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const id = await submitTicket(form);
      setTicketId(id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'خطا در ثبت تیکت');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!trackId.trim()) return;
    setTrackError('');
    setTracking(true);
    try {
      setTicket(await fetchTicket(trackId.trim()));
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : 'خطا در پیگیری');
      setTicket(null);
    } finally {
      setTracking(false);
    }
  }

  function goTrack(id: number) {
    setTrackId(String(id));
    setTab('track');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '32px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 999,
            background: brand.primary,
            boxShadow: '0 6px 18px rgba(227,0,127,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff',
          }}>♥</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>پشتیبانی {brand.name}</div>
            <div className="small">چطور می‌تونیم کمکت کنیم؟</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`btn ${tab === 'submit' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('submit')} style={{ flex: 1 }}>
            ثبت تیکت جدید
          </button>
          <button className={`btn ${tab === 'track' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('track')} style={{ flex: 1 }}>
            پیگیری تیکت
          </button>
        </div>

        <div className="card">
          {tab === 'submit' ? (
            ticketId
              ? <SuccessState ticketId={ticketId} onTrack={() => goTrack(ticketId)} />
              : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <Field label="نام و نام خانوادگی" required>
                      <input className="input" placeholder="زهرا احمدی"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </Field>
                    <Field label="شماره تلفن" required>
                      <input className="input" placeholder="۰۹۱۲۳۴۵۶۷۸۹" type="tel" dir="ltr"
                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </Field>
                    <Field label="دسته‌بندی" required>
                      <select className="input" value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="">انتخاب کنید...</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="موضوع">
                      <input className="input" placeholder="خلاصه مشکل یا سوال"
                        value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                    </Field>
                    <Field label="توضیحات" required>
                      <textarea className="input" placeholder="لطفاً مشکل یا سوال خود را با جزئیات بیشتری توضیح دهید..."
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                    </Field>
                    {formError && <ErrorBox>{formError}</ErrorBox>}
                    <button className="btn btn-primary" type="submit" disabled={submitting}
                      style={{ padding: '14px', fontSize: 16 }}>
                      {submitting ? 'در حال ثبت...' : 'ثبت تیکت'}
                    </button>
                  </div>
                </form>
              )
          ) : (
            <div>
              <form onSubmit={handleTrack} style={{ marginBottom: 16 }}>
                <Field label="شماره تیکت">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="مثلاً: 42" dir="ltr"
                      value={trackId} onChange={e => setTrackId(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-primary" type="submit" disabled={tracking}>
                      {tracking ? '...' : 'جستجو'}
                    </button>
                  </div>
                </Field>
              </form>
              {trackError && <ErrorBox>{trackError}</ErrorBox>}
              {ticket && <TicketCard ticket={ticket} />}
            </div>
          )}
        </div>

        <div className="small" style={{ textAlign: 'center', marginTop: 20 }}>
          برای تماس فوری با پشتیبانی تلفن کنید
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 700, marginBottom: 6, fontSize: 14 }}>
        {label} {required && <span style={{ color: brand.primary }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: '#ef4444', fontSize: 13, padding: '10px 14px', background: '#fef2f2', borderRadius: 12 }}>
      {children}
    </div>
  );
}

function SuccessState({ ticketId, onTrack }: { ticketId: number; onTrack: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
      <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>تیکت شما ثبت شد</div>
      <div className="small" style={{ marginBottom: 24 }}>
        کارشناسان ما در اولین فرصت پاسخ خواهند داد
      </div>
      <div style={{
        background: brand.soft,
        border: '1px solid rgba(227,0,127,.18)',
        borderRadius: 16, padding: '16px 32px', marginBottom: 24, display: 'inline-block',
      }}>
        <div className="small" style={{ marginBottom: 4 }}>شماره پیگیری</div>
        <div style={{ fontWeight: 900, fontSize: 32, color: brand.primary, direction: 'ltr' }}>
          #{ticketId}
        </div>
      </div>
      <button className="btn btn-primary" onClick={onTrack} style={{ width: '100%', padding: 14, fontSize: 15 }}>
        پیگیری تیکت
      </button>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: TicketInfo }) {
  const s = STATUS_MAP[ticket.status] ?? { label: ticket.status, color: '#6b7280' };
  return (
    <div style={{ border: '1px solid var(--kh-border)', borderRadius: 14, padding: 16, background: brand.soft }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 900, fontSize: 17 }}>تیکت #{ticket.id}</span>
        <span style={{
          padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          background: s.color, color: '#fff',
        }}>{s.label}</span>
      </div>
      <div style={{ fontSize: 14, marginBottom: 6 }}>{ticket.subject}</div>
      <div className="small">
        ثبت شده: {new Date(ticket.createdAt * 1000).toLocaleDateString('fa-IR')}
      </div>
    </div>
  );
}
TSX

# chatwoot-server files
cat > chatwoot-server/docker-compose.yml << 'EOF'
version: '3'

services:
  base: &base
    image: chatwoot/chatwoot:latest
    env_file: .env
    volumes:
      - /data/storage:/app/storage

  rails:
    <<: *base
    depends_on:
      - postgres
      - redis
    ports:
      - '127.0.0.1:3000:3000'
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
    entrypoint: docker/entrypoints/rails.sh
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']

  sidekiq:
    <<: *base
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']

  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    ports:
      - '127.0.0.1:5432:5432'
    volumes:
      - /data/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=chatwoot
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=chatwoot_pg_pass

  redis:
    image: redis:alpine
    restart: always
    command: ['sh', '-c', 'redis-server --requirepass "$REDIS_PASSWORD"']
    env_file: .env
    volumes:
      - /data/redis:/data
    ports:
      - '127.0.0.1:6379:6379'
EOF

cat > chatwoot-server/chatwoot.env << 'EOF'
SECRET_KEY_BASE=REPLACE_WITH_64_CHAR_HEX
FRONTEND_URL=http://95.38.186.86:3000

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DATABASE=chatwoot
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=chatwoot_pg_pass

REDIS_URL=redis://:chatwoot_redis_pass@redis:6379
REDIS_PASSWORD=chatwoot_redis_pass

MAILER_SENDER_EMAIL=support@example.com
SMTP_ADDRESS=
SMTP_USERNAME=
SMTP_PASSWORD=

RAILS_ENV=production
NODE_ENV=production
INSTALLATION_ENV=docker

ACTIVE_STORAGE_SERVICE=local
FORCE_SSL=false
ENABLE_ACCOUNT_SIGNUP=true
EOF

cat > chatwoot-server/setup.sh << 'EOF'
#!/bin/bash
set -e
SECRET=$(openssl rand -hex 64)
sudo mkdir -p /data/storage /data/postgres /data/redis
sudo chown -R ubuntu:ubuntu /data
sed "s/REPLACE_WITH_64_CHAR_HEX/$SECRET/" chatwoot.env > .env
echo "==> Starting postgres and redis..."
docker compose up -d postgres redis
echo "==> Waiting 10s..."
sleep 10
echo "==> Running db:chatwoot_prepare..."
docker compose run --rm rails bundle exec rails db:chatwoot_prepare
echo "==> Starting all services..."
docker compose up -d
echo "Done! http://95.38.186.86:3000"
EOF
chmod +x chatwoot-server/setup.sh

# Git commit & push
git add -A
git commit -m "feat: initial support ticketing project — React + Chatwoot"
git remote add origin git@github.com:MohammadKarbassi/support-ticketing.git
git push -u origin main

echo ""
echo "✅ Done! https://github.com/MohammadKarbassi/support-ticketing"
