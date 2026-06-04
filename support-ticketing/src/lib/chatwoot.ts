const BASE = import.meta.env.VITE_CHATWOOT_URL ?? '';
const TOKEN = import.meta.env.VITE_CHATWOOT_TOKEN as string;
const ACCOUNT = import.meta.env.VITE_CHATWOOT_ACCOUNT as string;
const INBOX = Number(import.meta.env.VITE_CHATWOOT_INBOX ?? '1');

function api(path: string, opts?: RequestInit) {
  return fetch(`${BASE}/api/v1/accounts/${ACCOUNT}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'api_access_token': TOKEN,
      ...(opts?.headers ?? {}),
    },
  });
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('98')) return '+' + digits;
  if (digits.startsWith('09')) return '+98' + digits.slice(1);
  if (digits.startsWith('9') && digits.length === 10) return '+98' + digits;
  return '+' + digits;
}

async function findOrCreateContact(name: string, phone: string): Promise<number> {
  const e164 = toE164(phone);

  const search = await api(`/contacts/search?q=${encodeURIComponent(e164)}&include_contacts=true`);
  if (search.ok) {
    const data = await search.json();
    const contacts = data.payload as Array<{ id: number }>;
    if (Array.isArray(contacts) && contacts.length > 0) return contacts[0].id;
  }

  const create = await api('/contacts', {
    method: 'POST',
    body: JSON.stringify({ name, phone_number: e164 }),
  });
  if (!create.ok) {
    const err = await create.json().catch(() => ({}));
    throw new Error(`خطا در ثبت مخاطب (${create.status}): ${JSON.stringify(err)}`);
  }
  const raw2 = await create.json();
  const contact = raw2.payload?.contact ?? raw2.payload ?? raw2;
  if (!contact?.id) throw new Error('خطا در دریافت شناسه مخاطب');
  return contact.id as number;
}

export interface SubmitForm {
  name: string;
  phone: string;
  orderNo: string;
  category: string;
  desc: string;
}

export async function submitTicket(form: SubmitForm): Promise<number> {
  const contactId = await findOrCreateContact(form.name, form.phone);

  const convRes = await api('/conversations', {
    method: 'POST',
    body: JSON.stringify({
      inbox_id: INBOX,
      contact_id: contactId,
      additional_attributes: { category: form.category, order_no: form.orderNo },
    }),
  });
  if (!convRes.ok) {
    const err = await convRes.json().catch(() => ({}));
    throw new Error(`خطا در ثبت تیکت (${convRes.status}): ${JSON.stringify(err)}`);
  }
  const conv = await convRes.json();
  const convId: number = conv.id;

  const orderLine = form.orderNo ? `\nشماره سفارش: ${form.orderNo}` : '';
  const msgBody = `دسته‌بندی: ${form.category}${orderLine}\n\n${form.desc}`;
  await api(`/conversations/${convId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: msgBody, message_type: 'incoming', private: false }),
  });

  return convId;
}

export interface TicketInfo {
  id: number;
  status: string;
  createdAt: number;
}

export async function fetchTicketFromApi(convId: number): Promise<TicketInfo> {
  const res = await api(`/conversations/${convId}`);
  if (!res.ok) throw new Error(`تیکت یافت نشد (${res.status})`);
  const data = await res.json();
  return {
    id: convId,
    status: data.status as string,
    createdAt: data.created_at as number,
  };
}

export function formatTicketNumber(convId: number): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
      year: 'numeric', month: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find(p => p.type === 'year')?.value?.replace(/\D/g, '') ?? '1405';
    const m = parts.find(p => p.type === 'month')?.value?.replace(/\D/g, '') ?? '01';
    const yy = y.slice(-2).padStart(2, '0');
    const mm = m.padStart(2, '0');
    const encoded = convId + 999;
    return `TK-${yy}${mm}${encoded}`;
  } catch {
    return `TK-${convId}`;
  }
}

export function decodeTicketNumber(tkNo: string): number {
  if (!tkNo.toUpperCase().startsWith('TK-')) throw new Error('شماره تیکت معتبر نیست');
  const digits = tkNo.replace(/\D/g, '');
  const encoded = parseInt(digits.slice(4), 10);
  const convId = encoded - 999;
  if (isNaN(convId) || convId <= 0) throw new Error('شماره تیکت معتبر نیست');
  return convId;
}
