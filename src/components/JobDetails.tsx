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
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontSize: '18px', color: '#666666' }}>Loading job...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F8F9FA',
        padding: 24,
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ color: '#C33', fontSize: '16px', marginBottom: 12 }}>{error}</div>
        <button
          onClick={() => navigate('/jobs')}
          style={{
            padding: '8px 16px',
            background: '#F05A3C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#222222',
            fontFamily: 'Arial, sans-serif',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F8F9FA';
            e.currentTarget.style.borderColor = '#1A3C34';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E0E0E0';
          }}
        >
          ← Back to Jobs
        </button>

        {/* Main Content Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          {/* Header Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#222222',
                  margin: '0 0 12px 0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  {job.title}
                </h1>
                {job.description && (
                  <p style={{
                    fontSize: '16px',
                    color: '#666666',
                    lineHeight: '1.6',
                    margin: '0 0 20px 0'
                  }}>
                    {job.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate(`/jobs?edit=${job.id}`)}
                style={{
                  padding: '10px 20px',
                  background: '#F05A3C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Arial, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E04A2C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F05A3C';
                }}
              >
                Edit Job
              </button>
            </div>

            {/* Job Meta Information */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '16px',
              background: '#F8F9FA',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#666666', fontSize: '14px' }}>Status:</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: job.status === 'active' ? '#E8F5E8' : '#F5F5F5',
                  color: job.status === 'active' ? '#1A3C34' : '#666666'
                }}>
                  {job.status}
                </span>
              </div>
              {job.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#666666', fontSize: '14px' }}>Location:</span>
                  <span style={{ color: '#222222', fontSize: '14px', fontWeight: '500' }}>
                    {job.location}
                  </span>
                </div>
              )}
              {job.salary && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#666666', fontSize: '14px' }}>Salary:</span>
                  <span style={{ color: '#222222', fontSize: '14px', fontWeight: '500' }}>
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#666666', fontSize: '14px' }}>Created:</span>
                <span style={{ color: '#222222', fontSize: '14px', fontWeight: '500' }}>
                  {new Date(job.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '16px'
              }}>
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: '#F5EDE0',
                      color: '#1A3C34',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'Arial, sans-serif'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Requirements Section */}
          {job.requirements && job.requirements.length > 0 && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #E0E0E0' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#222222',
                margin: '0 0 16px 0',
                fontFamily: '"Montserrat", Arial, sans-serif'
              }}>
                Requirements
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {job.requirements.map((req, index) => (
                  <li
                    key={index}
                    style={{
                      padding: '12px 0',
                      borderBottom: index < job.requirements!.length - 1 ? '1px solid #F0F0F0' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <span style={{
                      color: '#F05A3C',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      marginTop: '2px'
                    }}>
                      •
                    </span>
                    <span style={{
                      color: '#222222',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      flex: 1
                    }}>
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info Section */}
          <div style={{
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '1px solid #E0E0E0',
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ color: '#666666', fontSize: '13px', marginBottom: '4px' }}>Job ID</div>
              <div style={{ color: '#222222', fontSize: '14px', fontFamily: 'monospace' }}>{job.id}</div>
            </div>
            {job.updatedAt && (
              <div>
                <div style={{ color: '#666666', fontSize: '13px', marginBottom: '4px' }}>Last Updated</div>
                <div style={{ color: '#222222', fontSize: '14px' }}>
                  {new Date(job.updatedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;