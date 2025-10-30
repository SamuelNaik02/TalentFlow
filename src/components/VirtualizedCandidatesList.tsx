import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesApi } from '../services/api';
import type { Candidate, PaginatedResponse } from '../types';

const ROW_HEIGHT = 64; // px
const BUFFER = 8; // extra rows above/below

const VirtualizedCandidatesList: React.FC = () => {
  const navigate = useNavigate();
  const [all, setAll] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res: PaginatedResponse<Candidate> = await candidatesApi.getAll({ page: 1, pageSize: 2000 });
        setAll(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    const onResize = () => setHeight(el.clientHeight);
    el.addEventListener('scroll', onScroll);
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return all.filter(c => (
      (!stage || c.stage === stage) &&
      (c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s))
    ));
  }, [all, search, stage]);

  const total = filtered.length;
  const visibleCount = Math.ceil(height / ROW_HEIGHT) + BUFFER * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIndex = Math.min(total, startIndex + visibleCount);
  const offsetY = startIndex * ROW_HEIGHT;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Candidates (Virtualized)</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input placeholder="Search name/email" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '10px 12px' }} />
        <select value={stage} onChange={e => setStage(e.target.value)} style={{ padding: '10px 12px' }}>
          <option value="">All stages</option>
          <option value="applied">Applied</option>
          <option value="screen">Screening</option>
          <option value="tech">Interview</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div ref={containerRef} style={{ height: 600, overflow: 'auto', border: '1px solid #E0E0E0', borderRadius: 8 }}>
          <div style={{ height: total * ROW_HEIGHT, position: 'relative' }}>
            <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
              {filtered.slice(startIndex, endIndex).map((c) => (
                <div key={c.id} style={{ height: ROW_HEIGHT, display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid #F0F0F0', cursor: 'pointer' }} onClick={() => navigate(`/candidates/${c.id}`)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: '#666' }}>{c.email}</div>
                  </div>
                  <div style={{ color: '#333' }}>{c.stage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedCandidatesList;


