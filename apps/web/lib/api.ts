export const API = process.env.NEXT_PUBLIC_API || 'http://localhost:4000';

async function jsonFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
    }
    return res.json();
  } catch (e: any) {
    // Surface a clearer message in the UI when backend is down or CORS blocks
    const msg = e?.message || String(e);
    throw new Error(`Failed to reach API at ${API}. ${msg}`);
  }
}

export async function listJobs(orgId: string) {
  return jsonFetch(`${API}/jobs?orgId=${encodeURIComponent(orgId)}`);
}

export async function createJob(orgId: string, title: string) {
  return jsonFetch(`${API}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, title })
  });
}

export async function transitionJob(id: string, orgId: string, event: string) {
  return jsonFetch(`${API}/jobs/${id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, event, idempotencyKey: `${id}:${event}` })
  });
}

// Calendar helpers
export async function listCalendarEvents(orgId: string, from?: string, to?: string) {
  const p = new URLSearchParams({ orgId, ...(from && to ? { from, to } : {}) });
  return jsonFetch(`${API}/calendar/events?${p.toString()}`);
}

export async function createCalendarEvent(payload: {
  orgId: string; title: string; jobId?: string; start: string; end: string; color?: string; allDay?: boolean
}) {
  return jsonFetch(`${API}/calendar/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function moveCalendarEvent(id: string, orgId: string, start: string, end: string) {
  return jsonFetch(`${API}/calendar/events/${id}/times`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, start, end })
  });
}

export async function statusCalendarEvent(id: string, orgId: string, status: 'SCHEDULED'|'IN_PROGRESS'|'COMPLETE'|'INVOICED'|'CANCELLED') {
  return jsonFetch(`${API}/calendar/events/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, status })
  });
}

export async function flagCalendarEvent(id: string, flag?: string) {
  return jsonFetch(`${API}/calendar/events/${id}/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flag })
  });
}
