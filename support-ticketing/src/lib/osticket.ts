const BASE = import.meta.env.VITE_OSTICKET_URL ?? '';
const API_KEY = import.meta.env.VITE_OSTICKET_API_KEY as string;

function api(path: string, opts?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(opts?.headers ?? {}),
    },
  });
}

export interface SubmitForm {
  name: string;
  phone: string;
  orderNo: string;
  category: string;
  desc: string;
}

export async function submitTicket(form: SubmitForm): Promise<string> {
  const digits = form.phone.replace(/\D/g, '');
  const email = `${digits}@support.khanoumi.ir`;
  const subject = form.orderNo
    ? `${form.category} — سفارش ${form.orderNo}`
    : form.category;
  const message = form.orderNo
    ? `شماره سفارش: ${form.orderNo}\n\n${form.desc}`
    : form.desc;

  const res = await api('/api/tickets.json', {
    method: 'POST',
    body: JSON.stringify({
      name: form.name,
      email,
      subject,
      message,
      ip: '0.0.0.0',
      alert: true,
      autorespond: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`خطا در ثبت تیکت (${res.status}): ${err}`);
  }

  const ticketNumber = (await res.text()).trim();
  if (!ticketNumber) throw new Error('خطا در دریافت شماره تیکت');
  return ticketNumber;
}

export interface TicketInfo {
  id: string;
  status: string;
  createdAt: number;
}

export async function fetchTicketFromApi(_ticketNumber: string): Promise<TicketInfo> {
  throw new Error('تیکت یافت نشد');
}

export function formatTicketNumber(ticketNumber: string): string {
  return `TK-${ticketNumber}`;
}

export function decodeTicketNumber(tkNo: string): string {
  if (!tkNo.toUpperCase().startsWith('TK-')) throw new Error('شماره تیکت معتبر نیست');
  const num = tkNo.slice(3).replace(/\D/g, '');
  if (!num) throw new Error('شماره تیکت معتبر نیست');
  return num;
}
