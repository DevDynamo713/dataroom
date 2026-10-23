"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [source, setSource] = useState('api');
  const [destination, setDestination] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://dataroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'pipeline') {
        setPipelines(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://dataroom.devdynamo713.com/room/${params.id}/pipelines`);
      if (res.ok) setPipelines(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addPipeline = async () => {
    const data = { name, source, destination, status: 'idle' };
    await fetch(`https://dataroom.devdynamo713.com/room/${params.id}/pipeline`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setDestination('');
  };
  const statusColor: Record<string, string> = { idle: '#a1a1aa', running: '#60a5fa', success: '#4ade80', failed: '#f87171', paused: '#fbbf24' };
  const healthScore = pipelines.length > 0 ? Math.round(pipelines.reduce((s, p) => {
    if (p.status === 'failed') return s;
    if (p.status === 'paused') return s + 25;
    if (p.status === 'idle') return s + 50;
    if (p.status === 'running') return s + 75;
    return s + Math.max(0, 100 - p.errorCount * 10);
  }, 0) / pipelines.length) : 100;
  const totalRecs = pipelines.reduce((s, p) => s + p.recordsProcessed, 0);
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>DataRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, border: `1px solid ${healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171'}`, borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Fleet Health</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171' }}>{healthScore}%</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Total Records</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>{totalRecs.toLocaleString()}</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Pipelines</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a78bfa' }}>{pipelines.length}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="pipeline name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={source} onChange={(e) => setSource(e.target.value)} className="source-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="api">api</option>
          <option value="database">database</option>
          <option value="file">file</option>
          <option value="stream">stream</option>
          <option value="manual">manual</option>
        </select>
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="destination" className="destination-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addPipeline} disabled={!name.trim() || !destination.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create Pipeline</button>
      </div>
      <div className="pipeline-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {pipelines.map(p => (
          <div key={p.id} style={{ padding: 16, border: `1px solid ${statusColor[p.status]}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: statusColor[p.status] }}>{p.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>{p.source} → {p.destination}</div>
            <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>Records: {p.recordsProcessed.toLocaleString()} | Errors: {p.errorCount}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: statusColor[p.status], textTransform: 'uppercase' }}>{p.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}