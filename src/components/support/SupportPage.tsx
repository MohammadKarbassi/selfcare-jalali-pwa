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
  open:     { label: 'در حال بررسی',      color: '#3b82f6' },
  pending:  { label: 'در انتظار پاسخ',    color: '#f59e0b' },
  resolved: { label: 'حل شده',            color: '#10b981' },
  snoozed:  { label: 'به تعویق افتاده',   color: '#6b7280' },
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

        {/* Header */}
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

        {/* Tabs */}
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
