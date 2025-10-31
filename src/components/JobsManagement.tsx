import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  X,
  FileText,
  Tag,
  CheckCircle
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Job, PaginatedResponse } from '../types';
import { apiCall } from '../services/api';
import Shuffle from './Shuffle';
import JobModal from './JobModal';

interface JobsManagementProps {
  onLogout: () => void;
}

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onView: (job: Job) => void;
  onToggleArchive: (job: Job) => void;
  moveJob: (dragIndex: number, hoverIndex: number) => void;
  index: number;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onEdit, 
  onView,
  onToggleArchive,
  moveJob,
  index 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'job',
    item: { id: job.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'job',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        moveJob(item.index, index);
        item.index = index;
      }
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity,
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        marginBottom: '20px',
        cursor: 'move',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '4px',
        background: job.status === 'active' 
          ? 'linear-gradient(90deg, #1A3C34 0%, #2d5a4f 100%)' 
          : 'linear-gradient(90deg, #666666 0%, #999999 100%)',
        borderRadius: '16px 16px 0 0'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#222222', 
            margin: '0 0 8px 0',
            fontFamily: '"Montserrat", Arial, sans-serif',
            lineHeight: '1.3'
          }}>
            {job.title}
          </h3>
          <p style={{ 
            fontSize: '15px', 
            color: '#666666', 
            margin: '0 0 16px 0',
            fontFamily: '"Inter", Arial, sans-serif',
            lineHeight: '1.5'
          }}>
            {job.description || 'No description provided'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: job.status === 'active' ? '#E8F5E8' : '#F5F5F5',
            color: job.status === 'active' ? '#1A3C34' : '#666666',
            textTransform: 'uppercase',
            fontFamily: '"Inter", Arial, sans-serif',
            letterSpacing: '0.5px'
          }}>
            {job.status}
          </span>
          <div style={{ position: 'relative' }}>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
            >
              <MoreVertical size={18} color="#666666" />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        {job.location && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#666666',
            background: '#F8F9FA',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: '"Inter", Arial, sans-serif'
          }}>
            <MapPin size={14} />
            <span>{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#666666',
            background: '#F8F9FA',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: '"Inter", Arial, sans-serif'
          }}>
            <DollarSign size={14} />
            <span>
              ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
            </span>
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          color: '#666666',
          background: '#F8F9FA',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: '"Inter", Arial, sans-serif'
        }}>
          <Clock size={14} />
          <span>
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {job.tags.map((tag, index) => (
          <span key={index} style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, #F05A3C 0%, #e04a2b 100%)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: '"Inter", Arial, sans-serif',
            boxShadow: '0 2px 8px rgba(240, 90, 60, 0.3)'
          }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} color="#666666" />
          <span style={{ 
            fontSize: '14px', 
            color: '#666666', 
            fontFamily: '"Inter", Arial, sans-serif',
            fontWeight: '500'
          }}>
            {Math.floor(Math.random() * 50) + 1} applicants
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onView(job)}
            style={{
              background: 'none',
              border: '2px solid #E0E0E0',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#666666',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1A3C34';
              e.currentTarget.style.color = '#1A3C34';
              e.currentTarget.style.background = '#F8F9FA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E0E0E0';
              e.currentTarget.style.color = '#666666';
              e.currentTarget.style.background = 'none';
            }}
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => onEdit(job)}
            style={{
              background: 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'white',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(26, 60, 52, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 60, 52, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 60, 52, 0.3)';
            }}
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => onToggleArchive(job)}
            style={{
              background: job.status === 'archived' ? 'white' : 'white',
              border: `2px solid ${job.status === 'archived' ? '#28A745' : '#F05A3C'}`,
              color: job.status === 'archived' ? '#28A745' : '#F05A3C',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: '"Inter", Arial, sans-serif',
              fontWeight: 600
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8F5E8';
              e.currentTarget.style.borderColor = '#1A3C34';
              e.currentTarget.style.color = '#1A3C34';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = job.status === 'archived' ? '#28A745' : '#F05A3C';
              e.currentTarget.style.color = job.status === 'archived' ? '#28A745' : '#F05A3C';
            }}
          >
            {job.status === 'archived' ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
};

const JobsManagement: React.FC<JobsManagementProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreationChoiceModal, setShowCreationChoiceModal] = useState(false);
  const [useAICreation, setUseAICreation] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs with apiCall...');
      const response = await apiCall<PaginatedResponse<Job>>(`/jobs?search=${searchTerm}&status=${statusFilter}&page=${currentPage}&pageSize=10&sort=${sortBy}`);
      console.log('Jobs fetched successfully:', response);
      console.log('Jobs data count:', response.data.length);
      console.log('Total jobs:', response.total);
      console.log('Total pages:', response.totalPages);
      setJobs(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const moveJob = async (dragIndex: number, hoverIndex: number) => {
    const draggedJob = jobs[dragIndex];
    const targetJob = jobs[hoverIndex];
    
    if (!draggedJob || !targetJob) return;

    // Optimistic update
    const newJobs = [...jobs];
    newJobs[dragIndex] = targetJob;
    newJobs[hoverIndex] = draggedJob;
    setJobs(newJobs);

    try {
      await apiCall(`/jobs/${draggedJob.id}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({
          fromOrder: draggedJob.order,
          toOrder: targetJob.order
        })
      });
    } catch (error) {
      console.error('Failed to reorder job:', error);
      // Rollback on failure
      fetchJobs();
    }
  };

  const handleView = (job: Job) => {
    // deep link to job details route
    navigate(`/jobs/${job.id}`);
  };

  const handleCloseDetails = () => {
    setViewingJob(null);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setUseAICreation(false);
    setShowCreateModal(true);
  };

  const handleCreateClick = () => {
    setEditingJob(null);
    setShowCreationChoiceModal(true);
  };

  const handleCreationChoice = (useAI: boolean) => {
    setUseAICreation(useAI);
    setShowCreationChoiceModal(false);
    setShowCreateModal(true);
  };

  const handleSaveJob = () => {
    fetchJobs();
    setEditingJob(null);
    setUseAICreation(false);
  };

  const handleToggleArchive = async (job: Job) => {
    const newStatus = job.status === 'archived' ? 'active' : 'archived';
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    try {
      await apiCall<Job>(`/jobs/${job.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      // rollback on failure
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: job.status } : j));
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingJob(null);
    setUseAICreation(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div style={{ 
        minHeight: '100vh', 
        background: '#F8F9FA',
        fontFamily: '"Inter", Arial, sans-serif',
      display: 'flex', 
      flexDirection: 'column', 
        margin: 0,
        padding: 0,
        width: '100%',
        overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        borderBottom: '1px solid #E0E0E0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        zIndex: 1000,
        overflow: 'visible'
      }}>
        <div
          onClick={() => navigate('/dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Shuffle
              text="TalentFlow."
              tag="div"
              style={{
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1A3C34',
                fontFamily: '"Montserrat", Arial, sans-serif',
                letterSpacing: '0.5px',
                margin: 0,
                padding: 0
              }}
              shuffleDirection="right"
              duration={0.6}
              stagger={0.05}
              scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
              colorFrom="#F05A3C"
              colorTo="#1A3C34"
              triggerOnHover={true}
              threshold={0.8}
              onShuffleComplete={() => {}}
            />
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#F05A3C', 
            borderRadius: '50%' 
          }}></div>
        </div>
        
         <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'visible' }}>
          {/* Services Dropdown */}
          <div 
            style={{ position: 'relative', overflow: 'visible' }}
            onMouseEnter={() => setShowServicesDropdown(true)}
            onMouseLeave={() => setShowServicesDropdown(false)}
          >
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: '#222222', 
              fontSize: '16px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: '500'
            }}>
              Services
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            
            {showServicesDropdown && (
              <div 
                onMouseEnter={() => setShowServicesDropdown(true)}
                onMouseLeave={() => setShowServicesDropdown(false)}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: '0',
                  background: 'white',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  padding: '20px',
                  width: '500px',
                  zIndex: 10000,
                  maxHeight: '75vh',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#222222', 
                  margin: '0 0 20px 0',
                  textAlign: 'center'
                }}>
                  Our Services
                </h3>
                
                {/* Job Management */}
                <div 
                  onClick={() => navigate('/jobs')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Job Management
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Create, manage, and track job postings with advanced filtering.
                  </p>
                </div>

                {/* Candidates */}
                <div 
                  onClick={() => navigate('/candidates-list-page')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Candidates
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    View and manage all candidates with search and filters.
                  </p>
                </div>

                {/* Candidate Pipeline */}
                <div 
                  onClick={() => navigate('/candidates')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Candidate Pipeline
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Streamline your hiring process with kanban boards.
                  </p>
                </div>

                {/* Candidates */}
                <div 
                  onClick={() => navigate('/candidates-list-page')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Candidates
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    View all candidates from job management seed data.
                  </p>
                </div>

                {/* Assessment Builder */}
                <div 
                  onClick={() => navigate('/assessments')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Assessment Builder
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Create custom assessments with multiple question types.
                  </p>
                </div>

                {/* Team Collaboration */}
                <div 
                  onClick={() => navigate('/collaboration')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Team Collaboration
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Collaborate with your team on hiring decisions.
                  </p>
                </div>

                {/* Workflow Automation */}
                <div 
                  onClick={() => navigate('/automation')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Workflow Automation
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Automate repetitive tasks and streamline workflows.
                  </p>
                </div>

                {/* Analytics & Reports */}
                <div 
                  onClick={() => navigate('/analytics')}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Analytics & Reports
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Track hiring metrics and generate detailed reports.
                  </p>
                </div>

              </div>
            )}
          </div>
          
          <button style={{ 
            background: '#F5EDE0', 
            color: '#1A3C34', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '14px', 
            fontWeight: '500', 
              cursor: 'pointer'
          }}>
            Join our team!
          </button>
          
          {/* My Account Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowAccountDropdown(true)}
            onMouseLeave={() => setShowAccountDropdown(false)}
          >
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: '#222222', 
              fontSize: '16px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: '500'
            }}>
              My Account
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </button>
            
            {showAccountDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '20px',
                  width: '400px',
                  zIndex: 1000,
                  maxHeight: '80vh',
                  overflowY: 'auto'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#222222', 
                  margin: '0 0 20px 0',
                  textAlign: 'center'
                }}>
                  Account Settings
                </h3>
                
                {/* Profile Settings */}
                  <div onClick={() => navigate('/profile')} style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#F06B4E';
                    if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    const h4 = e.currentTarget.querySelector('h4');
                    const p = e.currentTarget.querySelector('p');
                    if (h4) h4.style.color = '#222222';
                    if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Profile Settings
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Update your personal information and preferences.
                  </p>
                </div>

                

              {/* Logout */}
                <div 
                onClick={onLogout}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                  const h4 = e.currentTarget.querySelector('h4');
                  const p = e.currentTarget.querySelector('p');
                  if (h4) h4.style.color = '#F06B4E';
                  if (p) p.style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                  const h4 = e.currentTarget.querySelector('h4');
                  const p = e.currentTarget.querySelector('p');
                  if (h4) h4.style.color = '#222222';
                  if (p) p.style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                  Logout
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                  Sign out of your account.
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
        <div style={{
        flex: 1, 
          maxWidth: '1400px',
        margin: '0 auto', 
          padding: '32px',
          width: '100%',
          background: 'transparent'
      }}>
        {/* Page Header and Filters */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            marginBottom: '32px'
          }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
            <h1 style={{ 
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                fontFamily: '"Montserrat", Arial, sans-serif'
              }}>
                <span style={{ color: '#F05A3C' }}>Jobs</span>{' '}<span style={{ color: '#222222' }}>Management</span>
            </h1>
              <p style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: '1.5',
                margin: '0',
                fontFamily: '"Inter", Arial, sans-serif',
                fontWeight: '400'
              }}>
                Manage job postings, track applications, and organize your hiring pipeline
              </p>
            </div>
            <button 
              onClick={handleCreateClick}
              style={{
                background: 'linear-gradient(135deg, #F05A3C 0%, #e04a2b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: '"Montserrat", Arial, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 60, 52, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #F05A3C 0%, #e04a2b 100%)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={16} />
              Create New Job
            </button>
          </div>
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666666' }} />
              <input
                type="text"
                  placeholder="Search jobs by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: '"Inter", Arial, sans-serif',
                  background: '#F8F9FA',
                  color: '#222222',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1A3C34';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E0E0E0';
                    e.target.style.background = '#F8F9FA';
                    e.target.style.boxShadow = 'none';
                  }}
                />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px 16px 12px 16px',
                border: '2px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: '"Inter", Arial, sans-serif',
                background: '#F8F9FA',
                color: '#222222',
                cursor: 'pointer',
                fontWeight: '500',
                minWidth: '160px',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '44px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1A3C34';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1A3C34';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
            </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px 16px 12px 16px',
                border: '2px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: '"Inter", Arial, sans-serif',
                background: '#F8F9FA',
                color: '#222222',
                cursor: 'pointer',
                fontWeight: '500',
                minWidth: '160px',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '44px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1A3C34';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1A3C34';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26, 60, 52, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <option value="order">Order</option>
                <option value="title">Title</option>
                <option value="created">Created Date</option>
              </select>
            </div>
          </div>

          {/* Jobs List */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '6px solid #F5F5F5',
                  borderTop: '6px solid #F05A3C',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
                  <p style={{ 
                  marginTop: '24px', 
                  color: '#666666', 
                  fontFamily: '"Inter", Arial, sans-serif',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  Loading jobs...
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ 
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #F5EDE0 0%, #F8F9FA 100%)',
                  borderRadius: '50%',
                display: 'flex', 
                alignItems: 'center',
            justifyContent: 'center', 
                  margin: '0 auto 24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}>
                  <Calendar size={40} color="#666666" />
            </div>
            <h3 style={{ 
              fontSize: '24px', 
                  fontWeight: '700',
              color: '#222222', 
                  margin: '0 0 12px 0',
                  fontFamily: '"Montserrat", Arial, sans-serif'
            }}>
              No jobs found
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#666666', 
                  margin: 0,
                  fontFamily: '"Inter", Arial, sans-serif',
                  fontWeight: '500'
                }}>
                  {searchTerm || statusFilter ? 'Try adjusting your search criteria' : 'Create your first job posting to get started'}
                </p>
          </div>
            ) : (
              <>
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    onEdit={handleEdit}
                    onView={handleView}
                    onToggleArchive={handleToggleArchive}
                    moveJob={moveJob}
                  />
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
              alignItems: 'center',
                    gap: '12px',
                    marginTop: '32px'
                  }}>
              <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                style={{
                        padding: '12px 20px',
                        border: '2px solid #E0E0E0',
                        borderRadius: '10px',
                        background: currentPage === 1 ? '#F5F5F5' : 'white',
                        color: currentPage === 1 ? '#999999' : '#666666',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontFamily: '"Inter", Arial, sans-serif',
                        fontSize: '16px',
                        fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.borderColor = '#1A3C34';
                          e.currentTarget.style.color = '#1A3C34';
                        }
                }}
                onMouseLeave={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.borderColor = '#E0E0E0';
                  e.currentTarget.style.color = '#666666';
                        }
                }}
              >
                      Previous
              </button>
                    <span style={{
                      padding: '12px 20px',
                      color: '#666666',
                      fontFamily: '"Inter", Arial, sans-serif',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      Page {currentPage} of {totalPages}
                    </span>
                        <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                          style={{
                        padding: '12px 20px',
                        border: '2px solid #E0E0E0',
                        borderRadius: '10px',
                        background: currentPage === totalPages ? '#F5F5F5' : 'white',
                        color: currentPage === totalPages ? '#999999' : '#666666',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontFamily: '"Inter", Arial, sans-serif',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.borderColor = '#1A3C34';
                          e.currentTarget.style.color = '#1A3C34';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.borderColor = '#E0E0E0';
                          e.currentTarget.style.color = '#666666';
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
                    </div>
                  </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {/* Creation Choice Modal */}
        {showCreationChoiceModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              padding: '32px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#222222',
                margin: '0 0 8px 0',
                fontFamily: '"Montserrat", Arial, sans-serif',
                textAlign: 'center'
              }}>
                How would you like to create this job?
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#666666',
                margin: '0 0 32px 0',
                fontFamily: '"Inter", Arial, sans-serif',
                textAlign: 'center'
              }}>
                Choose between AI-powered creation or manual entry
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <button
                  onClick={() => handleCreationChoice(true)}
                  style={{
                    background: 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontFamily: '"Montserrat", Arial, sans-serif',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(26, 60, 52, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 60, 52, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 60, 52, 0.3)';
                  }}
                >
                  <span>✨</span>
                  Create using AI
                </button>
                <button
                  onClick={() => handleCreationChoice(false)}
                  style={{
                    background: 'white',
                    color: '#1A3C34',
                    border: '2px solid #1A3C34',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    fontFamily: '"Montserrat", Arial, sans-serif',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8F9FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <span>✏️</span>
                  Create Manually
                </button>
              </div>
              <button
                onClick={() => setShowCreationChoiceModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  marginTop: '24px',
                  width: '100%',
                  color: '#666666',
                  fontFamily: '"Inter", Arial, sans-serif',
                  fontSize: '14px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F05A3C';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#666666';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Job Modal */}
        <JobModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSave={handleSaveJob}
          job={editingJob}
          useAI={useAICreation}
        />

        {/* Job Details Modal */}
        {viewingJob && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Header */}
              <div style={{
                padding: '24px 24px 0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E0E0E0',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#222222',
                  margin: 0,
                  fontFamily: '"Montserrat", Arial, sans-serif'
                }}>
                  Job Details
                </h2>
                <button
                  onClick={handleCloseDetails}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <X size={20} color="#666666" />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '0 24px 24px 24px' }}>
                {/* Title and Status */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#222222',
                      margin: 0,
                      fontFamily: '"Montserrat", Arial, sans-serif',
                      flex: 1,
                      marginRight: '16px'
                    }}>
                      {viewingJob.title}
                    </h1>
                    <span style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: viewingJob.status === 'active' 
                        ? 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)' 
                        : 'linear-gradient(135deg, #666666 0%, #999999 100%)',
                      color: 'white',
                      textTransform: 'uppercase',
                      fontFamily: '"Inter", Arial, sans-serif',
                      letterSpacing: '0.5px',
                      boxShadow: viewingJob.status === 'active' 
                        ? '0 2px 8px rgba(26, 60, 52, 0.3)' 
                        : '0 2px 8px rgba(102, 102, 102, 0.3)'
                    }}>
                      {viewingJob.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    {viewingJob.location && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#666666',
                        background: '#F8F9FA',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        <MapPin size={16} color="#1A3C34" />
                        <span>{viewingJob.location}</span>
                      </div>
                    )}
                    {viewingJob.salary && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#666666',
                        background: '#F8F9FA',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        <DollarSign size={16} color="#F05A3C" />
                        <span>
                          ${viewingJob.salary.min.toLocaleString()} - ${viewingJob.salary.max.toLocaleString()} {viewingJob.salary.currency}
                        </span>
                      </div>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: '#666666',
                      background: '#F8F9FA',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      <Clock size={16} color="#1A3C34" />
                      <span>
                        Created: {new Date(viewingJob.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewingJob.description && (
                  <div style={{ 
                    marginBottom: '24px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #F8F9FA 0%, #F5EDE0 100%)',
                    borderRadius: '12px',
                    border: '1px solid #E0E0E0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '12px' 
                    }}>
                      <FileText size={18} color="#1A3C34" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Description
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '15px',
                      color: '#666666',
                      lineHeight: '1.6',
                      margin: 0,
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      {viewingJob.description}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {viewingJob.requirements && viewingJob.requirements.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '16px' 
                    }}>
                      <CheckCircle size={18} color="#1A3C34" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Requirements
                      </h3>
                    </div>
                    <div style={{
                      background: 'white',
                      border: '2px solid #E0E0E0',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '24px',
                        color: '#666666',
                        fontFamily: '"Inter", Arial, sans-serif',
                        lineHeight: '1.8'
                      }}>
                        {viewingJob.requirements.map((req, index) => (
                          <li key={index} style={{ marginBottom: '8px', fontSize: '15px' }}>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {viewingJob.tags && viewingJob.tags.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '16px' 
                    }}>
                      <Tag size={18} color="#F05A3C" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Tags
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {viewingJob.tags.map((tag, index) => (
                        <span key={index} style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #F05A3C 0%, #e04a2b 100%)',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: '"Inter", Arial, sans-serif',
                          boxShadow: '0 2px 8px rgba(240, 90, 60, 0.3)'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    margin: '0 0 16px 0',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Job Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <p style={{
                        fontSize: '13px',
                        color: '#F5EDE0',
                        margin: '0 0 4px 0',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Job ID
                      </p>
                      <p style={{
                        fontSize: '16px',
                        color: 'white',
                        margin: 0,
                        fontWeight: '600',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        {viewingJob.id}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        fontSize: '13px',
                        color: '#F5EDE0',
                        margin: '0 0 4px 0',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Created Date
                      </p>
                      <p style={{
                        fontSize: '16px',
                        color: 'white',
                        margin: 0,
                        fontWeight: '600',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        {new Date(viewingJob.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    {viewingJob.updatedAt && (
                      <div>
                        <p style={{
                          fontSize: '13px',
                          color: '#F5EDE0',
                          margin: '0 0 4px 0',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          Last Updated
                        </p>
                        <p style={{
                          fontSize: '16px',
                          color: 'white',
                          margin: 0,
                          fontWeight: '600',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          {new Date(viewingJob.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '20px',
                  borderTop: '1px solid #E0E0E0'
                }}>
                  <button
                    onClick={handleCloseDetails}
                    style={{
                      background: 'none',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      color: '#666666',
                      fontFamily: '"Inter", Arial, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1A3C34';
                      e.currentTarget.style.color = '#1A3C34';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E0E0E0';
                      e.currentTarget.style.color = '#666666';
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleEdit(viewingJob);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #1A3C34 0%, #2d5a4f 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: '"Inter", Arial, sans-serif',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(26, 60, 52, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 60, 52, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 60, 52, 0.3)';
                    }}
                  >
                    <Edit size={16} />
                    Edit Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default JobsManagement;