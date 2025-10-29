import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shuffle from './Shuffle';

interface AssessmentListItem {
  id: string;
  jobId: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  sections?: { id: string; title: string; questions: { id: string }[] }[];
}

const AssessmentsList: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/assessments');
        const data = await res.json();
        setAssessments(data);
      } catch (e) {
        console.error('Failed to load assessments', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8F9FA' }}>
      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Shuffle text="TalentFlow." tag="div" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A3C34', fontFamily: '"Montserrat", Arial, sans-serif' }} shuffleDirection="right" duration={0.6} stagger={0.05} scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" colorFrom="#F05A3C" colorTo="#1A3C34" triggerOnHover={true} threshold={0.8} onShuffleComplete={() => {}} />
          <div style={{ width: '8px', height: '8px', background: '#F05A3C', borderRadius: '50%' }} />
        </div>
        <button onClick={() => { onLogout(); navigate('/login'); }} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#666' }}>Logout</button>
      </div>

      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: 24, width: '100%' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A3C34', marginBottom: 16, fontFamily: '"Montserrat", Arial, sans-serif' }}>Assessments (seed)</h1>
        {loading ? (
          <p style={{ color: '#666' }}>Loading assessments…</p>
        ) : assessments.length === 0 ? (
          <p style={{ color: '#666' }}>No assessments found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {assessments.map((a) => (
              <div key={a.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #EEE', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 16 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#222', fontFamily: '"Montserrat", Arial, sans-serif' }}>{a.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: 13 }}>Job: {a.jobId}</p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 13 }}>Questions: {a.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0}</p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 12 }}>Updated: {new Date(a.updatedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsList;


