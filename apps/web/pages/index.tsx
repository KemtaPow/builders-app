import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { createJob, listJobs, transitionJob } from '../lib/api';


const ORG = 'demo-org';


export default function Home() {
const { data, mutate } = useSWR(['jobs', ORG], () => listJobs(ORG));
const [title, setTitle] = useState('New Job');


useEffect(() => { mutate(); }, [mutate]);


return (
<main style={{ maxWidth: 800, margin: '32px auto', fontFamily: 'system-ui, sans-serif' }}>
<h1>Jobs (framework slice)</h1>
<form onSubmit={async (e) => { e.preventDefault(); await createJob(ORG, title); setTitle('New Job'); mutate(); }}>
<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ padding: 8, width: 300 }} />
<button style={{ marginLeft: 8, padding: '8px 12px' }}>Create</button>
</form>


<div style={{ marginTop: 24 }}>
{(data?.items || []).map((j: any) => (
<div key={j.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}>
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
<strong>{j.title}</strong>
<span>Status: <b>{j.status}</b></span>
</div>
<div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
{['SCHEDULE','START','COMPLETE','INVOICE','CANCEL'].map(ev => (
<button key={ev} onClick={async () => { await transitionJob(j.id, ORG, ev); mutate(); }}>
{ev}
</button>
))}
</div>
</div>
))}
</div>
</main>
);
}