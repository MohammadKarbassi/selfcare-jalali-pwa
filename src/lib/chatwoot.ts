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

async function findOrCreateContact(name: string, phone: string): Promise<number> {
  const searchRes = await fetch(
    `${BASE}/api/v1/accounts/${ACCOUNT}/contacts/search?q=${encodeURIComponent(phone)}&include_contacts=true`,
    { headers: h() }
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.payload?.length > 0) return data.payload[0].id;
  }
  const res = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT}/contacts`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({ name, phone_number: phone }),
  });
  if (!res.ok) throw new Error('خطا در ثبت اطلاعات تماس');
  return (await res.json()).id;
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
  if (!convRes.ok) throw new Error('خطا در ثبت تیکت');
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
  if (!msgRes.ok) throw new Error('خطا در ارسال پیام');

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
