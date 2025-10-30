import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Job } from '../types';
import { jobsApi } from '../services/api';

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('Missing job id');
        const data = await jobsApi.getById(id);
        setJob(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading job...</div>;
  }
  if (error) {
    return (
      <div style={{ padding: 24, color: '#C33' }}>
        {error}
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>Go Back</button>
        </div>
      </div>
    );
  }
  if (!job) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/jobs')} style={{ marginBottom: 16, padding: '8px 12px' }}>← Back to Jobs</button>
      <h1 style={{ marginTop: 0 }}>{job.title}</h1>
      <div style={{ color: '#666', marginBottom: 12 }}>{job.description}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <span>Status: <strong>{job.status}</strong></span>
        {job.location && <span>Location: {job.location}</span>}
        {job.salary && <span>Salary: {job.salary.min}-{job.salary.max} {job.salary.currency}</span>}
      </div>
      {job.tags?.length ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {job.tags.map((t) => (
            <span key={t} style={{ background: '#F0F8FF', padding: '4px 8px', borderRadius: 4 }}>{t}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default JobDetails;


