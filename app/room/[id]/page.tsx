"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://dataroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'dataset') {
        setDatasets(prev => {
          const idx = prev.findIndex(d => d.id === data.data.id);
          if (idx >= 0) { const n = [...prev]; n[idx] = data.data; return n; }
          return [...prev, data.data];
        });
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://dataroom.devdynamo713.com/room/${params.id}/datasets`);
      if (res.ok) setDatasets(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addDataset = async () => {
    const data = { id: Date.now().toString(), name, owner, lineage: [], status: 'active' };
    await fetch(`https://dataroom.devdynamo713.com/room/${params.id}/dataset`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setOwner('');
  };
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>DataRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="dataset name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="owner" className="owner-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addDataset} disabled={!name.trim() || !owner.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add Dataset</button>
      </div>
      <div className="dataset-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {datasets.map(d => (
          <div key={d.id} style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18 }}>{d.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Owner: {d.owner}</div>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Lineage: {d.lineage.length} upstream(s)</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: d.status === 'active' ? '#4ade80' : d.status === 'deprecated' ? '#f87171' : '#fbbf24' }}>{d.status.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}