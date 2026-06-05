import { useState, useRef, useEffect, type ReactNode } from 'react';
import { submitTicket, fetchTicketFromApi, formatTicketNumber, decodeTicketNumber, toWesternDigits } from '../../lib/osticket';

/* ── inline SVG icons ── */
function IcUser({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IcPhone({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.46 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.38 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function IcReceipt({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
}
function IcTag({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/></svg>;
}
function IcText({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h16M4 14h12M4 18h8"/></svg>;
}
function IcUpload({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function IcPlay({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function IcCheck({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IcClose({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IcChevron({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IcSpark({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2H22l-6.4 4.8 2.4 7.2L12 17l-6 4.2 2.4-7.2L2 9.2h7.6z"/></svg>;
}
function IcSearch({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IcBack({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IcClock({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IcChat({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IcCopy({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function IcPackage({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function IcTruck({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function IcCard({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function IcWrench({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}
function IcDots({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg>;
}
function IcReturn({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>;
}

/* ── categories ── */
type IconComp = React.FC<{ size?: number }>;
interface Category { id: string; label: string; Icon: IconComp; }

const CATEGORIES: Category[] = [
  { id: 'delivery',    label: 'ارسال و تحویل سفارش',       Icon: IcTruck   },
  { id: 'issue',       label: 'ویرایش سفارش',              Icon: IcWrench  },
  { id: 'return',      label: 'درخواست مرجوعی',            Icon: IcReturn  },
  { id: 'mismatch',    label: 'مغایرت سفارش',              Icon: IcReceipt },
  { id: 'damage',      label: 'آسیب کالا یا بسته‌بندی',   Icon: IcPackage },
  { id: 'refund',      label: 'تاخیر در بازگشت وجه',      Icon: IcCard    },
  { id: 'technical',   label: 'خطای سایت',                 Icon: IcWrench  },
  { id: 'guidance',    label: 'درخواست راهنمایی',          Icon: IcChat    },
  { id: 'other',       label: 'سایر موارد',                Icon: IcDots    },
];

/* ── lifecycle stages ── */
const STAGES = [
  { key: 'submitted', label: 'ثبت درخواست',         desc: 'درخواست شما در سامانه ثبت شد.' },
  { key: 'review',    label: 'در حال بررسی',        desc: 'کارشناسان پشتیبانی در حال بررسی درخواست شما هستند.' },
  { key: 'answered',  label: 'پاسخ پشتیبانی',      desc: 'پاسخ یا اقدام لازم برای درخواست شما انجام شد.' },
  { key: 'closed',    label: 'بسته‌شدن درخواست',   desc: 'درخواست شما با موفقیت بسته شد.' },
];

/* ── helpers ── */
function fmtSize(b: number) {
  return b < 1024 * 1024
    ? Math.max(1, Math.round(b / 1024)) + ' کیلوبایت'
    : (b / 1024 / 1024).toFixed(1) + ' مگابایت';
}

function jalaliDate(d = new Date()) {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(d);
  } catch { return ''; }
}

/* ── saved tickets ── */
interface SavedTicket {
  no: string;
  name: string;
  cat: string;
  date: string;
  status: number;
  ticketId: string;
}

function saveTicket(obj: SavedTicket) {
  try {
    const all = JSON.parse(localStorage.getItem('kh_tickets') || '{}') as Record<string, SavedTicket>;
    all[obj.no] = obj;
    localStorage.setItem('kh_tickets', JSON.stringify(all));
    localStorage.setItem('kh_last_tk', obj.no);
  } catch { /* */ }
}

function getTicket(no: string): SavedTicket | null {
  try {
    const all = JSON.parse(localStorage.getItem('kh_tickets') || '{}') as Record<string, SavedTicket>;
    return all[no.trim().toUpperCase()] ?? null;
  } catch { return null; }
}

/* ── Dropdown ── */
interface DropdownProps {
  value: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPick: (id: string) => void;
  error: boolean;
}

function Dropdown({ value, open, onToggle, onClose, onPick, error }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onClose]);

  const sel = CATEGORIES.find(c => c.id === value);
  const SelIcon = sel ? sel.Icon : IcTag;

  return (
    <div className="dd" ref={ref}>
      <button
        type="button"
        className={['dd-trigger', open ? 'open' : '', error ? 'err' : ''].filter(Boolean).join(' ')}
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={'dd-trigico' + (sel ? ' on' : '')}><SelIcon size={19} /></span>
        <span className={'dd-val' + (sel ? '' : ' ph')}>
          {sel ? sel.label : 'یک موضوع انتخاب کنید'}
        </span>
        <span className="dd-chev"><IcChevron size={18} /></span>
      </button>
      {open && (
        <div className="dd-menu fade-up" role="listbox">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={value === id}
              className={'dd-item' + (value === id ? ' on' : '')}
              onClick={() => onPick(id)}
            >
              <span className="dd-item-ico"><Icon size={19} /></span>
              <span className="dd-item-txt">{label}</span>
              {value === id && <span className="dd-item-chk"><IcCheck size={15} /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── SubmitForm ── */
interface SubmitFormProps {
  onDone: (tkNo: string, cat: string) => void;
}

function SubmitForm({ onDone }: SubmitFormProps) {
  const [f, setF] = useState({ fullName: '', phone: '', orderNo: '', cat: '', desc: '' });
  const [catOpen, setCatOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [file, setFile] = useState<{ name: string; size: number; url: string; kind: 'image' | 'video' } | null>(null);
  const [fileErr, setFileErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [tries, setTries] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));
  const blur = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const errs = {
    fullName: f.fullName.trim().length < 3 ? 'نام و نام خانوادگی را وارد کنید' : '',
    phone: !/^09\d{9}$/.test(f.phone.trim()) ? 'شماره موبایل ۱۱ رقمی و با ۰۹ شروع شود' : '',
    cat: !f.cat ? 'یک موضوع انتخاب کنید' : '',
    desc: f.desc.trim().length < 10 ? 'توضیحات حداقل ۱۰ کاراکتر باشد' : '',
  };
  const valid = Object.values(errs).every(e => !e);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file0 = e.target.files?.[0];
    e.target.value = '';
    if (!file0) return;
    setFileErr('');
    if (!/^(image|video)\//.test(file0.type)) { setFileErr('فقط عکس یا فیلم مجاز است'); return; }
    if (file0.size > 2 * 1024 * 1024) { setFileErr('حجم فایل باید حداکثر ۲ مگابایت باشد'); return; }
    setFile({
      name: file0.name, size: file0.size,
      url: URL.createObjectURL(file0),
      kind: file0.type.startsWith('video') ? 'video' : 'image',
    });
  };

  const submit = async () => {
    if (!valid) {
      setTouched({ fullName: true, phone: true, cat: true, desc: true });
      setTries(n => n + 1);
      return;
    }
    setSubmitting(true);
    setApiErr('');
    try {
      const ticketId = await submitTicket({
        name: f.fullName.trim(),
        phone: f.phone.trim(),
        orderNo: f.orderNo.trim(),
        category: CATEGORIES.find(c => c.id === f.cat)?.label ?? f.cat,
        desc: f.desc.trim(),
      });
      const tkNo = formatTicketNumber(ticketId);
      saveTicket({ no: tkNo, name: f.fullName.trim(), cat: f.cat, date: jalaliDate(), status: 1, ticketId });
      onDone(tkNo, f.cat);
    } catch (err) {
      setApiErr(err instanceof Error ? err.message : 'خطا در ارسال. دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  const showErr = (k: string) => touched[k] && errs[k as keyof typeof errs];

  return (
    <>
      <h1 className="page-title">چطور می‌توانیم کمک‌تان کنیم؟</h1>
      <p className="page-sub">برای پیگیری مشکل یا پاسخ به سوال‌تان فرم زیر را ثبت کنید.</p>

      {/* name */}
      <div className="field">
        <label className="lbl"><IcUser size={15} />نام و نام خانوادگی<span className="req">*</span></label>
        <input
          className={'inp' + (showErr('fullName') ? ' err' : '')}
          value={f.fullName}
          onChange={e => set('fullName', e.target.value)}
          onBlur={() => blur('fullName')}
          placeholder="مثلاً مریم احمدی"
        />
        {showErr('fullName') && <div className="err-msg"><IcClose size={13} />{errs.fullName}</div>}
      </div>

      {/* phone */}
      <div className="field">
        <label className="lbl"><IcPhone size={15} />شماره موبایل ثبت سفارش<span className="req">*</span></label>
        <div className="inp-wrap">
          <input
            className={'inp' + (showErr('phone') ? ' err' : '')}
            value={f.phone}
            inputMode="numeric"
            maxLength={11}
            onChange={e => set('phone', e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => blur('phone')}
            placeholder="09—"
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
          {!errs.phone && f.phone && <span className="ok-check"><IcCheck size={17} /></span>}
        </div>
        {showErr('phone') && <div className="err-msg"><IcClose size={13} />{errs.phone}</div>}
      </div>

      {/* order number */}
      <div className="field">
        <label className="lbl">
          <IcReceipt size={15} />شماره سفارش
          <span className="opt-tag">در صورت وجود</span>
        </label>
        <input
          className="inp"
          value={f.orderNo}
          inputMode="numeric"
          onChange={e => set('orderNo', e.target.value.replace(/[^\d]/g, ''))}
          placeholder="مثلاً ۱۲۳۴۵۶۷۸"
          style={{ direction: 'ltr', textAlign: 'right' }}
        />
      </div>

      {/* topic dropdown */}
      <div className="field" style={{ marginTop: 22 }}>
        <h2 className="cat-head">موضوع درخواست<span className="req">*</span></h2>
        <p className="cat-help">
          در صورتی که مشکل یا سوال شما در دسته‌بندی‌های اعلام‌شده نیست، گزینه <b>«سایر موارد»</b> را انتخاب کنید.
        </p>
        <Dropdown
          value={f.cat}
          open={catOpen}
          onToggle={() => setCatOpen(o => !o)}
          onClose={() => setCatOpen(false)}
          onPick={(id) => { set('cat', id); blur('cat'); setCatOpen(false); }}
          error={!!showErr('cat')}
        />
        {showErr('cat') && <div className="err-msg"><IcClose size={13} />{errs.cat}</div>}
      </div>

      {/* description */}
      <div className="field">
        <label className="lbl"><IcText size={15} />توضیحات<span className="req">*</span></label>
        <textarea
          className={'ta' + (showErr('desc') ? ' err' : '')}
          value={f.desc}
          onChange={e => set('desc', e.target.value.slice(0, 1000))}
          onBlur={() => blur('desc')}
          placeholder="جزئیات درخواست یا سوال خود را بنویسید تا سریع‌تر بتوانیم آن را پیگیری کنیم."
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {showErr('desc')
            ? <div className="err-msg"><IcClose size={13} />{errs.desc}</div>
            : <span />}
          <span className={'cc' + (f.desc.length > 900 ? ' warn' : '')}>{f.desc.length} / ۱۰۰۰</span>
        </div>
      </div>

      {/* attachment */}
      <div className="field">
        <label className="lbl">
          <IcUpload size={15} />ارسال عکس یا فیلم
          <span className="opt-tag">اختیاری</span>
        </label>
        <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={pickFile} />
        {!file ? (
          <div className="drop" onClick={() => fileRef.current?.click()}>
            <span className="drop-ico"><IcUpload size={22} /></span>
            <span className="drop-t">برای انتخاب فایل کلیک کنید</span>
            <span className="drop-s">عکس یا فیلم — حداکثر ۲ مگابایت</span>
          </div>
        ) : (
          <div className="preview fade-up">
            {file.kind === 'image'
              ? <img className="thumb" src={file.url} alt="" />
              : <div className="thumb-vid"><IcPlay size={24} /></div>}
            <div className="pv-meta">
              <div className="pv-name">{file.name}</div>
              <div className="pv-size">{fmtSize(file.size)} · آماده ارسال</div>
              <div className="pv-bar"><i style={{ width: '100%' }} /></div>
            </div>
            <button className="pv-del" onClick={() => { setFile(null); setFileErr(''); }} aria-label="حذف">
              <IcClose size={16} />
            </button>
          </div>
        )}
        {fileErr && <div className="err-msg"><IcClose size={13} />{fileErr}</div>}
      </div>

      {apiErr && (
        <div className="err-msg" style={{ marginBottom: 12, background: '#fbe9ee', borderRadius: 10, padding: '10px 14px' }}>
          <IcClose size={13} />{apiErr}
        </div>
      )}

      {/* submit */}
      <button
        className={'submit' + (tries && !valid ? ' shake' : '')}
        onClick={submit}
        disabled={submitting}
        key={tries}
      >
        {submitting
          ? <><span className="spin" />در حال ثبت…</>
          : <><IcSpark size={18} />ثبت درخواست</>}
      </button>
    </>
  );
}

/* ── TicketStatus ── */
interface TicketStatusProps {
  ticket: SavedTicket;
}

function TicketStatus({ ticket }: TicketStatusProps) {
  const cat = CATEGORIES.find(c => c.id === ticket.cat);
  const cur = Math.max(0, Math.min(STAGES.length - 1, ticket.status));

  return (
    <div className="status-card fade-up">
      <div className="st-head">
        <div>
          <div className="st-num">{ticket.no}</div>
          {cat
            ? <div className="st-cat"><cat.Icon size={14} />{cat.label}</div>
            : <div className="st-cat"><IcChat size={14} />درخواست پشتیبانی</div>}
        </div>
        <span className={`st-badge s${cur}`}>{STAGES[cur].label}</span>
      </div>
      <div className="st-meta">تاریخ ثبت: {ticket.date}</div>
      <div className="timeline">
        {STAGES.map((s, i) => (
          <div key={s.key} className={['tl-step', i < cur ? 'done' : i === cur ? 'active' : ''].filter(Boolean).join(' ')}>
            <div className="tl-dot">
              {i < cur ? <IcCheck size={13} /> : i === cur ? <span className="tl-pulse" /> : null}
            </div>
            <div className="tl-body">
              <div className="tl-label">{s.label}</div>
              <div className="tl-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── TrackPanel ── */
interface TrackPanelProps {
  prefill?: string;
}

function TrackPanel({ prefill }: TrackPanelProps) {
  const lastTk = (() => { try { return localStorage.getItem('kh_last_tk') || ''; } catch { return ''; } })();
  const [q, setQ] = useState(prefill || lastTk || '');
  const [result, setResult] = useState<{ ticket?: SavedTicket; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = async (val?: string) => {
    const v = toWesternDigits(String(val != null ? val : q).trim().toUpperCase());
    if (!/^TK-\d+$/.test(v)) {
      setResult({ error: 'شماره تیکت معتبر نیست. مثال: TK-0503123456' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const local = getTicket(v) ?? getTicket(q.trim().toUpperCase());
      if (local) {
        setResult({ ticket: local });
      } else {
        setResult({ error: 'تیکتی با این شماره در این دستگاه یافت نشد.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prefill) { setQ(prefill); doSearch(prefill); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  return (
    <>
      <h1 className="page-title">پیگیری درخواست</h1>
      <p className="page-sub">شماره تیکت خود را وارد کنید تا وضعیت رسیدگی به درخواست‌تان را ببینید.</p>

      <div className="field">
        <label className="lbl"><IcSearch size={15} />شماره تیکت<span className="req">*</span></label>
        <div className="track-row">
          <input
            className="inp"
            value={q}
            onChange={e => setQ(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
            placeholder="TK-0503123456"
            style={{ direction: 'ltr', textAlign: 'left' }}
          />
          <button className="track-btn" onClick={() => doSearch()} disabled={loading}>
            {loading ? <span className="spin" /> : <><IcSearch size={17} />پیگیری</>}
          </button>
        </div>
      </div>

      {result?.error && (
        <div className="track-empty fade-up">
          <span className="te-ico"><IcSearch size={22} /></span>
          <div className="te-t">{result.error}</div>
        </div>
      )}
      {result?.ticket && <TicketStatus ticket={result.ticket} />}
      {!result && !loading && (
        <div className="track-hint">
          <IcReceipt size={16} />
          <span>شماره تیکت پس از ثبت درخواست به شما نمایش داده می‌شود و با <b>TK-</b> شروع می‌شود.</span>
        </div>
      )}
    </>
  );
}

/* ── SharedFooter ── */
function SharedFooter() {
  return (
    <>
      <div className="support">
        <div className="support-row">
          <span className="support-ico"><IcClock size={18} /></span>
          <div>
            <div className="support-t">ساعات پاسخگویی</div>
            <div className="support-d">روزهای شنبه تا پنجشنبه، از ساعت ۹ الی ۲۱ پاسخگوی سوالات شما هستیم.</div>
          </div>
        </div>
        <div className="phones">
          <a className="phone" href="tel:02191200500"><IcPhone size={16} />۰۲۱۹۱۲۰۰۵۰۰</a>
          <a className="phone" href="tel:02192005221"><IcPhone size={16} />۰۲۱۹۲۰۰۵۲۲۱</a>
        </div>
      </div>
      <a className="faq-link" href="https://www.khanoumi.com/profile/support" target="_blank" rel="noopener noreferrer">
        <IcChat size={17} /><span><u>سوالات متداول</u></span>
      </a>
    </>
  );
}

/* ── Confirmation ── */
interface ConfirmationProps {
  ticketNo: string;
  onNew: () => void;
  onTrack: () => void;
}

function Confirmation({ ticketNo, onNew, onTrack }: ConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(ticketNo).then(done, done);
    else done();
  };

  return (
    <div className="kh-screen">
      <div className="confirm">
        <div className="cf-hero">
          <div className="cf-badge">
            <svg className="cf-ring" width="104" height="104" viewBox="0 0 104 104" fill="none">
              <circle
                cx="52" cy="52" r="34"
                stroke="#27cccc" strokeWidth="3.5"
                strokeDasharray="214" strokeDashoffset="214"
                strokeLinecap="round"
                transform="rotate(-90 52 52)"
              >
                <animate attributeName="stroke-dashoffset" from="214" to="0" dur="0.6s" begin="0.1s" fill="freeze" />
              </circle>
              <path
                d="M40 53l9 9 17-19"
                stroke="#27cccc" strokeWidth="4.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="44" strokeDashoffset="44"
              >
                <animate attributeName="stroke-dashoffset" from="44" to="0" dur="0.35s" begin="0.6s" fill="freeze" />
              </path>
            </svg>
          </div>
        </div>

        <h1 className="cf-title fade-up">درخواست شما با موفقیت ثبت شد</h1>
        <p className="cf-desc fade-up">همکاران ما در اسرع وقت آن را پیگیری و در صورت نیاز با شما تماس خواهند گرفت.</p>

        <div className="cf-ticket fade-up">
          <div className="ct-lbl">شماره پیگیری تیکت</div>
          <div className="ct-num">{ticketNo}</div>
          <button className={'copy-btn' + (copied ? ' copied' : '')} onClick={copy}>
            {copied ? <><IcCheck size={15} />کپی شد</> : <><IcCopy size={15} />کپی شماره</>}
          </button>
        </div>

        <div className="support" style={{ marginTop: 22, textAlign: 'right' }}>
          <div className="support-row">
            <span className="support-ico"><IcClock size={18} /></span>
            <div>
              <div className="support-t">ساعات پاسخگویی</div>
              <div className="support-d">شنبه تا پنجشنبه، ۹ الی ۲۱ پاسخگوی شما هستیم.</div>
            </div>
          </div>
          <div className="phones">
            <a className="phone" href="tel:02191200500"><IcPhone size={16} />۰۲۱۹۱۲۰۰۵۰۰</a>
            <a className="phone" href="tel:02192005221"><IcPhone size={16} />۰۲۱۹۲۰۰۵۲۲۱</a>
          </div>
        </div>

        <div className="cf-actions">
          <button className="submit" style={{ marginTop: 0 }} onClick={onTrack}>
            <IcSearch size={18} />پیگیری وضعیت درخواست
          </button>
          <button className="btn-ghost" onClick={onNew}>
            <IcBack size={18} />ثبت درخواست جدید
          </button>
          <a
            className="faq-link"
            href="https://www.khanoumi.com/profile/support"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 0 }}
          >
            <IcChat size={17} /><span><u>سوالات متداول</u></span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main shell ── */
interface MainProps {
  tab: 'submit' | 'track';
  setTab: (t: 'submit' | 'track') => void;
  onSubmitDone: (tkNo: string, cat: string) => void;
  trackPrefill?: string;
  children?: ReactNode;
}

function Main({ tab, setTab, onSubmitDone, trackPrefill }: MainProps) {
  return (
    <div className="kh-screen">
      <div className="hero">
        <img src="/assets/header.png" alt="خانومی — به خاطر خودت" />
        <div className="topbar">
          <button className="iconbtn" aria-label="بازگشت" onClick={() => window.history.back()}>
            <span style={{ color: '#fff', display: 'flex' }}><IcBack size={20} /></span>
          </button>
          <span className="tb-title">پشتیبانی آنلاین خانومی</span>
          <span style={{ width: 38 }} />
        </div>
      </div>

      <div className="sheet">
        <div className="sheet-handle" />

        <div className="tabs">
          <button className={'tab' + (tab === 'submit' ? ' on' : '')} onClick={() => setTab('submit')}>
            <IcSpark size={16} />ثبت درخواست
          </button>
          <button className={'tab' + (tab === 'track' ? ' on' : '')} onClick={() => setTab('track')}>
            <IcSearch size={16} />پیگیری درخواست
          </button>
        </div>

        {tab === 'submit'
          ? <SubmitForm onDone={onSubmitDone} />
          : <TrackPanel prefill={trackPrefill} />}

        <SharedFooter />
      </div>
    </div>
  );
}

/* ── SupportPage (root) ── */
export function SupportPage() {
  const [view, setView] = useState<'main' | 'confirm'>('main');
  const [tab, setTab] = useState<'submit' | 'track'>('submit');
  const [ticketNo, setTicketNo] = useState('');
  const [trackPrefill, setTrackPrefill] = useState('');

  const handleSubmitDone = (no: string) => {
    setTicketNo(no);
    setView('confirm');
  };

  const goTrack = (no?: string) => {
    setTrackPrefill(no || '');
    setTab('track');
    setView('main');
  };

  const goNew = () => {
    setTab('submit');
    setView('main');
  };

  if (view === 'confirm') {
    return (
      <Confirmation
        ticketNo={ticketNo}
        onNew={goNew}
        onTrack={() => goTrack(ticketNo)}
      />
    );
  }

  return (
    <Main
      tab={tab}
      setTab={(t) => { if (t !== 'track') setTrackPrefill(''); setTab(t); }}
      onSubmitDone={handleSubmitDone}
      trackPrefill={trackPrefill}
    />
  );
}
