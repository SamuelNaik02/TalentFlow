import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Sparkles } from 'lucide-react';
import type { Job } from '../types';
import { apiCall } from '../services/api';
import { generateJobFromDescription, type GeneratedJobDetails } from '../services/geminiService';
import Stepper, { Step } from './Stepper';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  job?: Job | null;
  useAI?: boolean;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, job, useAI = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    tags: ['']
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedJob, setGeneratedJob] = useState<GeneratedJobDetails | null>(null);
  const [currentAIStep, setCurrentAIStep] = useState(1);
  const [currentManualStep, setCurrentManualStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description || '',
        requirements: job.requirements || [''],
        location: job.location || '',
        salaryMin: job.salary?.min?.toString() || '',
        salaryMax: job.salary?.max?.toString() || '',
        currency: job.salary?.currency || 'USD',
        tags: job.tags.length > 0 ? job.tags : ['']
      });
    } else {
      setFormData({
        title: '',
        description: '',
        requirements: [''],
        location: '',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        tags: ['']
      });
    }
    setErrors({});
    setCurrentManualStep(1);
    setCurrentAIStep(1);
  }, [job, useAI]);

  // When AI generation finishes, populate form without resetting the current AI step
  useEffect(() => {
    if (useAI && generatedJob && !job) {
      setFormData({
        title: generatedJob.title,
        description: generatedJob.description,
        requirements: generatedJob.requirements,
        location: generatedJob.location,
        salaryMin: generatedJob.salary.min.toString(),
        salaryMax: generatedJob.salary.max.toString(),
        currency: generatedJob.salary.currency,
        tags: generatedJob.tags
      });
    }
  }, [generatedJob, useAI, job]);

  // Reset AI state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setJobDescription('');
      setGeneratedJob(null);
      setCurrentAIStep(1);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.salaryMin && formData.salaryMax) {
      const min = parseInt(formData.salaryMin);
      const max = parseInt(formData.salaryMax);
      if (min >= max) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateJob = async () => {
    if (!jobDescription.trim()) {
      setErrors({ description: 'Please provide a job description' });
      return;
    }

    setGenerating(true);
    setErrors({});
    try {
      const generated = await generateJobFromDescription(jobDescription);
      setGeneratedJob(generated);
      setFormData({
        title: generated.title,
        description: generated.description,
        requirements: generated.requirements,
        location: generated.location,
        salaryMin: generated.salary.min.toString(),
        salaryMax: generated.salary.max.toString(),
        currency: generated.salary.currency,
        tags: generated.tags
      });
      // Advance to step 2 after generation (Basic Information)
      setCurrentAIStep(2);
    } catch (error) {
      console.error('Failed to generate job:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to generate job details. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  // removed unused handleSubmit (submit handled inline in buttons)

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .job-modal * {
            color: #222222 !important;
          }
          .job-modal h2 {
            color: #222222 !important;
          }
          .job-modal label {
            color: #222222 !important;
          }
          .job-modal input {
            color: #222222 !important;
          }
          .job-modal textarea {
            color: #222222 !important;
          }
          .job-modal select {
            color: #222222 !important;
          }
          .job-modal button {
            color: inherit !important;
          }
          .job-modal .error-text {
            color: #F44336 !important;
          }
        `}
      </style>
      <div className="job-modal" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
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
              {job ? 'Edit Job' : 'Create New Job'}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} color="#666666" />
            </button>
          </div>

          {/* Form with Stepper */}
          <div style={{ padding: '0 24px 24px 24px' }}>
            {useAI && !job ? (
              // AI Flow: 2 steps (custom implementation)
              <div>
                {/* Step Indicators - 4 Steps */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: currentAIStep >= step ? '#1A3C34' : '#E0E0E0',
                        color: currentAIStep >= step ? 'white' : '#666666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontFamily: '"Montserrat", Arial, sans-serif',
                        fontSize: '16px'
                      }}>
                        <span style={{
                          color: currentAIStep >= step ? '#FFFFFF' : '#666666',
                          WebkitTextFillColor: currentAIStep >= step ? '#FFFFFF' : '#666666'
                        }}>{step}</span>
                      </div>
                      {step < 4 && (
                        <div style={{
                          flex: 1,
                          height: '2px',
                          background: currentAIStep > step ? '#1A3C34' : '#E0E0E0',
                          maxWidth: '60px'
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step Content */}
                {currentAIStep === 1 ? (
                  /* Step 1: Job Description */
                  <div style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      <Sparkles size={24} color="#1A3C34" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Write Job Description
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '20px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Describe the job role, responsibilities, and what you're looking for. Our AI will generate a complete job posting.
                    </p>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Job Description *
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => {
                          setJobDescription(e.target.value);
                          setErrors({});
                        }}
                        rows={8}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `1px solid ${errors.description ? '#F44336' : '#E0E0E0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white',
                          resize: 'vertical'
                        }}
                        placeholder="e.g., We are looking for a senior frontend developer with 5+ years of React experience. The candidate should have strong TypeScript skills and experience with modern build tools. They will work on building scalable web applications and collaborate with a cross-functional team..."
                      />
                      {errors.description && (
                        <p className="error-text" style={{
                          color: '#F44336',
                          fontSize: '12px',
                          margin: '4px 0 0 0',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          {errors.description}
                        </p>
                      )}
                    </div>
                    {generating && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: '#F8F9FA',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          border: '3px solid #E0E0E0',
                          borderTop: '3px solid #1A3C34',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <span style={{
                          fontSize: '14px',
                          color: '#666666',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          AI is generating your job posting...
                        </span>
                      </div>
                    )}
                    {errors.submit && (
                      <div style={{
                        background: '#FFEBEE',
                        border: '1px solid #F44336',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px'
                      }}>
                        <p className="error-text" style={{
                          color: '#F44336',
                          fontSize: '14px',
                          margin: 0,
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          {errors.submit}
                        </p>
                      </div>
                    )}
                  </div>
                ) : currentAIStep === 2 ? (
                  /* Step 2: Basic Information */
                  <div style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      <Sparkles size={24} color="#1A3C34" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Basic Information
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '24px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Review and edit the basic job information.
                    </p>

                    {/* Title */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `1px solid ${errors.title ? '#F44336' : '#E0E0E0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white'
                        }}
                      />
                      {errors.title && (
                        <p className="error-text" style={{
                          color: '#F44336',
                          fontSize: '12px',
                          margin: '4px 0 0 0',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                ) : currentAIStep === 3 ? (
                  /* Step 3: Requirements & Location */
                  <div style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      <Sparkles size={24} color="#1A3C34" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Requirements & Location
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '24px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Review and edit the job requirements and location.
                    </p>

                    {/* Requirements */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Requirements
                      </label>
                      {formData.requirements.map((req, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => updateRequirement(index, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '1px solid #E0E0E0',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontFamily: '"Inter", Arial, sans-serif',
                              background: 'white'
                            }}
                          />
                          {formData.requirements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              style={{
                                background: '#F44336',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={16} color="white" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRequirement}
                        style={{
                          background: '#F05A3C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}
                      >
                        <Plus size={14} />
                        Add Requirement
                      </button>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white'
                        }}
                        placeholder="e.g., San Francisco, CA or Remote"
                      />
                    </div>
                  </div>
                ) : (
                  /* Step 4: Compensation & Tags */
                  <div style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      <Sparkles size={24} color="#1A3C34" />
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#222222',
                        margin: 0,
                        fontFamily: '"Montserrat", Arial, sans-serif'
                      }}>
                        Compensation & Tags
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      marginBottom: '24px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Set the salary range and add relevant tags.
                    </p>

                    {/* Salary */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Salary Range
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={formData.salaryMin}
                          onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: `1px solid ${errors.salaryMax ? '#F44336' : '#E0E0E0'}`,
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontFamily: '"Inter", Arial, sans-serif',
                            background: 'white'
                          }}
                          placeholder="Min"
                        />
                        <span style={{ color: '#666666', fontFamily: '"Inter", Arial, sans-serif' }}>to</span>
                        <input
                          type="number"
                          value={formData.salaryMax}
                          onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: `1px solid ${errors.salaryMax ? '#F44336' : '#E0E0E0'}`,
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontFamily: '"Inter", Arial, sans-serif',
                            background: 'white'
                          }}
                          placeholder="Max"
                        />
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                          style={{
                            padding: '12px 16px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontFamily: '"Inter", Arial, sans-serif',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                      {errors.salaryMax && (
                        <p className="error-text" style={{
                          color: '#F44336',
                          fontSize: '12px',
                          margin: '4px 0 0 0',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          {errors.salaryMax}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#222222',
                        marginBottom: '8px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        Tags
                      </label>
                      {formData.tags.map((tag, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '1px solid #E0E0E0',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontFamily: '"Inter", Arial, sans-serif',
                              background: 'white'
                            }}
                          />
                          {formData.tags.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              style={{
                                background: '#F44336',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={16} color="white" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addTag}
                        style={{
                          background: '#F05A3C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}
                      >
                        <Plus size={14} />
                        Add Tag
                      </button>
                    </div>

                    {errors.submit && (
                      <div style={{
                        background: '#FFEBEE',
                        border: '1px solid #F44336',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px'
                      }}>
                        <p className="error-text" style={{
                          color: '#F44336',
                          fontSize: '14px',
                          margin: 0,
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}>
                          {errors.submit}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '20px',
                  borderTop: '1px solid #E0E0E0',
                  marginTop: '24px'
                }}>
                  {currentAIStep === 1 ? (
                    <>
                      <div />
                      <button
                        type="button"
                        onClick={handleGenerateJob}
                        disabled={generating || !jobDescription.trim()}
                        style={{
                          background: generating || !jobDescription.trim() ? '#CCCCCC' : '#F05A3C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          cursor: generating || !jobDescription.trim() ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          fontWeight: '600',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!generating && jobDescription.trim()) {
                            e.currentTarget.style.background = '#e04a2b';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!generating && jobDescription.trim()) {
                            e.currentTarget.style.background = '#F05A3C';
                          }
                        }}
                      >
                        <Sparkles size={16} />
                        {generating ? 'Generating...' : 'Generate Job'}
                      </button>
                    </>
                  ) : currentAIStep === 4 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentAIStep(3)}
                        style={{
                          background: 'none',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          color: '#666666',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (validateForm()) {
                            setLoading(true);
                            try {
                              const jobData = {
                                title: formData.title.trim(),
                                slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
                                description: formData.description.trim(),
                                requirements: formData.requirements.filter(req => req.trim()),
                                location: formData.location.trim(),
                                salary: formData.salaryMin && formData.salaryMax ? {
                                  min: parseInt(formData.salaryMin),
                                  max: parseInt(formData.salaryMax),
                                  currency: formData.currency
                                } : undefined,
                                tags: formData.tags.filter(tag => tag.trim()),
                                status: 'active'
                              };

                              const savedJob = await apiCall<Job>('/jobs', {
                                method: 'POST',
                                body: JSON.stringify(jobData)
                              });

                              onSave(savedJob);
                              onClose();
                            } catch (error) {
                              console.error('Failed to save job:', error);
                              setErrors({ submit: 'Failed to save job. Please try again.' });
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        disabled={loading}
                        style={{
                          background: loading ? '#CCCCCC' : '#F05A3C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          fontWeight: '600',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.background = '#e04a2b';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.background = '#F05A3C';
                          }
                        }}
                      >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Create Job'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentAIStep(currentAIStep - 1)}
                        style={{
                          background: 'none',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          color: '#666666',
                          fontFamily: '"Inter", Arial, sans-serif'
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentAIStep(currentAIStep + 1)}
                        style={{
                          background: '#F05A3C',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          fontFamily: '"Inter", Arial, sans-serif',
                          fontWeight: '600',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e04a2b';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F05A3C';
                        }}
                      >
                        Next
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Manual Flow: 4 steps (existing)
              <Stepper
                initialStep={1}
                backButtonText="Back"
                nextButtonText="Next"
                stepCircleContainerClassName=""
                contentClassName=""
                footerClassName={currentManualStep === 4 ? "hide-footer" : ""}
                onStepChange={(((newStep: number) => setCurrentManualStep(newStep)) as unknown) as () => void}
                renderStepIndicator={undefined as any}
                backButtonProps={{
                  style: {
                    background: 'none',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: '#666666',
                    fontFamily: '"Inter", Arial, sans-serif'
                  }
                }}
                nextButtonProps={{
                  style: {
                    background: '#F05A3C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontFamily: '"Inter", Arial, sans-serif'
                  }
                }}
              >
                {/* Step 1: Basic Information */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#222222',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Basic Information
                  </h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222222',
                      marginBottom: '8px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `1px solid ${errors.title ? '#F44336' : '#E0E0E0'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="e.g., Senior Frontend Developer"
                    />
                    {errors.title && (
                      <p className="error-text" style={{
                        color: '#F44336',
                        fontSize: '12px',
                        margin: '4px 0 0 0',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222222',
                      marginBottom: '8px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white',
                        resize: 'vertical'
                      }}
                      placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    />
                  </div>
                </div>
              </Step>

              {/* Step 2: Requirements & Location */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#222222',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Requirements & Location
                  </h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222222',
                      marginBottom: '8px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Requirements
                    </label>
                    {formData.requirements.map((req, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontFamily: '"Inter", Arial, sans-serif',
                            background: 'white'
                          }}
                          placeholder="e.g., 5+ years React experience"
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            style={{
                              background: '#F44336',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={16} color="white" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRequirement}
                      style={{
                        background: '#F05A3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}
                    >
                      <Plus size={14} />
                      Add Requirement
                    </button>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222222',
                      marginBottom: '8px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        background: 'white'
                      }}
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>
                </div>
              </Step>

              {/* Step 3: Compensation & Tags */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#222222',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Compensation & Tags
                  </h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222222',
                      marginBottom: '8px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Salary Range
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: `1px solid ${errors.salaryMax ? '#F44336' : '#E0E0E0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white'
                        }}
                        placeholder="Min"
                      />
                      <span style={{ color: '#666666', fontFamily: '"Inter", Arial, sans-serif' }}>to</span>
                      <input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: `1px solid ${errors.salaryMax ? '#F44336' : '#E0E0E0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white'
                        }}
                        placeholder="Max"
                      />
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        style={{
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: '"Inter", Arial, sans-serif',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    {errors.salaryMax && (
                      <p className="error-text" style={{
                        color: '#F44336',
                        fontSize: '12px',
                        margin: '4px 0 0 0',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        {errors.salaryMax}
                      </p>
                    )}
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#222222',
                      marginBottom: '8px',
                      fontFamily: '"Inter", Arial, sans-serif'
                    }}>
                      Tags
                    </label>
                    {formData.tags.map((tag, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontFamily: '"Inter", Arial, sans-serif',
                            background: 'white'
                          }}
                          placeholder="e.g., React, TypeScript"
                        />
                        {formData.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            style={{
                              background: '#F44336',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={16} color="white" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTag}
                      style={{
                        background: '#F05A3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}
                    >
                      <Plus size={14} />
                      Add Tag
                    </button>
                  </div>
                </div>
              </Step>

              {/* Step 4: Review & Submit */}
              <Step>
                <div style={{ padding: '20px 0' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#222222',
                    marginBottom: '24px',
                    fontFamily: '"Montserrat", Arial, sans-serif'
                  }}>
                    Review & Submit
                  </h3>
                  <div style={{
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Job Title:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {formData.title || 'Not specified'}
                      </p>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Location:</strong>
                      <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {formData.location || 'Not specified'}
                      </p>
                    </div>
                    {formData.salaryMin && formData.salaryMax && (
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Salary Range:</strong>
                        <p style={{ color: '#666666', margin: '4px 0 0 0', fontFamily: '"Inter", Arial, sans-serif' }}>
                          {formData.salaryMin} - {formData.salaryMax} {formData.currency}
                        </p>
                      </div>
                    )}
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Requirements:</strong>
                      <ul style={{ color: '#666666', margin: '4px 0 0 0', paddingLeft: '20px', fontFamily: '"Inter", Arial, sans-serif' }}>
                        {formData.requirements.filter(r => r.trim()).map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                        {formData.requirements.filter(r => r.trim()).length === 0 && <li>None specified</li>}
                      </ul>
                    </div>
                    <div>
                      <strong style={{ color: '#222222', fontFamily: '"Inter", Arial, sans-serif' }}>Tags:</strong>
                      <div style={{ marginTop: '4px' }}>
                        {formData.tags.filter(t => t.trim()).map((tag, i) => (
                          <span key={i} style={{
                            display: 'inline-block',
                            background: '#F05A3C',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            marginRight: '8px',
                            marginBottom: '8px',
                            fontFamily: '"Inter", Arial, sans-serif'
                          }}>
                            {tag}
                          </span>
                        ))}
                        {formData.tags.filter(t => t.trim()).length === 0 && (
                          <span style={{ color: '#666666', fontFamily: '"Inter", Arial, sans-serif' }}>None specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {errors.submit && (
                    <div style={{
                      background: '#FFEBEE',
                      border: '1px solid #F44336',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '20px'
                    }}>
                      <p className="error-text" style={{
                        color: '#F44336',
                        fontSize: '14px',
                        margin: 0,
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}>
                        {errors.submit}
                      </p>
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid #E0E0E0'
                  }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        background: 'none',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        color: '#666666',
                        fontFamily: '"Inter", Arial, sans-serif'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (validateForm()) {
                          setLoading(true);
                          try {
                            const jobData = {
                              title: formData.title.trim(),
                              slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
                              description: formData.description.trim(),
                              requirements: formData.requirements.filter(req => req.trim()),
                              location: formData.location.trim(),
                              salary: formData.salaryMin && formData.salaryMax ? {
                                min: parseInt(formData.salaryMin),
                                max: parseInt(formData.salaryMax),
                                currency: formData.currency
                              } : undefined,
                              tags: formData.tags.filter(tag => tag.trim()),
                              status: job?.status || 'active'
                            };

                            let savedJob: Job;
                            if (job) {
                              savedJob = await apiCall<Job>(`/jobs/${job.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify(jobData)
                              });
                            } else {
                              savedJob = await apiCall<Job>('/jobs', {
                                method: 'POST',
                                body: JSON.stringify(jobData)
                              });
                            }

                            onSave(savedJob);
                            onClose();
                          } catch (error) {
                            console.error('Failed to save job:', error);
                            setErrors({ submit: 'Failed to save job. Please try again.' });
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      disabled={loading}
                      style={{
                        background: loading ? '#CCCCCC' : '#F05A3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontFamily: '"Inter", Arial, sans-serif',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <Save size={16} />
                      {loading ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
                    </button>
                  </div>
                </div>
              </Step>
            </Stepper>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .job-modal div[style*="#1A3C34"] {
          color: white !important;
        }
        .footer-container.hide-footer {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default JobModal;