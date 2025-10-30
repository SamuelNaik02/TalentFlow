import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Candidate } from '../types';
import { candidatesApi } from '../services/api';

const CandidateProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<Array<{ status: string; timestamp: string; note?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('Missing candidate id');
        const c = await candidatesApi.getById(id);
        setCandidate(c);
        try {
          const tl = await candidatesApi.getTimeline(id);
          setTimeline(tl as any);
        } catch {}
        try {
          const res = await candidatesApi.getAll({ page: 1, pageSize: 2000 });
          setAllCandidates(res.data);
        } catch {}
      } catch (e: any) {
        setError(e?.message || 'Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading candidate...</div>;
  if (error) return <div style={{ padding: 24, color: '#C33' }}>{error}</div>;
  if (!candidate) return null;

  const mentionSuggestions = useMemo(() => allCandidates.map(c => c.name), [allCandidates]);
  const renderWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return (
      <>
        {parts.map((p, i) => p.startsWith('@') ? (
          <span key={i} style={{ color: '#1A3C34', fontWeight: 600 }}>{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ))}
      </>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/candidates')} style={{ marginBottom: 16, padding: '8px 12px' }}>← Back to Candidates</button>
      <h1 style={{ marginTop: 0 }}>{candidate.name}</h1>
      <div style={{ color: '#666', marginBottom: 12 }}>{candidate.email} · {candidate.phone || '—'}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <span>Stage: <strong>{candidate.stage}</strong></span>
        {candidate.jobId && <span>Job: {candidate.jobId}</span>}
      </div>
      <h3>Timeline</h3>
      <div style={{ borderLeft: '2px solid #E0E0E0', paddingLeft: 12 }}>
        {timeline.length === 0 ? (
          <div style={{ color: '#666' }}>No timeline events.</div>
        ) : (
          timeline.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div><strong>{e.status}</strong> — {new Date(e.timestamp).toLocaleString()}</div>
              {e.note && <div style={{ color: '#666' }}>{renderWithMentions(e.note)}</div>}
            </div>
          ))
        )}
      </div>

      <h3 style={{ marginTop: 24 }}>Notes</h3>
      <div style={{ marginBottom: 12, color: '#666' }}>Type @ to mention a person. Suggestions provided from local candidates list.</div>
      <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', marginBottom: 8 }} list="mentions" placeholder="Add a note with @mentions" />
      <datalist id="mentions">
        {mentionSuggestions.map((n) => (
          <option value={`@${n.replace(/\s+/g, '')}`} key={n} />
        ))}
      </datalist>
      <div>
        {newNote && (
          <div style={{ padding: 12, background: '#F8F9FA', border: '1px solid #E0E0E0', borderRadius: 8 }}>
            Preview: {renderWithMentions(newNote)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;


