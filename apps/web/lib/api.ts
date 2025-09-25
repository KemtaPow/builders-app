export const API = process.env.NEXT_PUBLIC_API || 'http://localhost:4000';


export async function listJobs(orgId: string) {
const res = await fetch(`${API}/jobs?orgId=${encodeURIComponent(orgId)}`);
return res.json();
}


export async function createJob(orgId: string, title: string) {
const res = await fetch(`${API}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId, title }) });
return res.json();
}


export async function transitionJob(id: string, orgId: string, event: string) {
const res = await fetch(`${API}/jobs/${id}/transition`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId, event, idempotencyKey: `${id}:${event}` }) });
return res.json();
}