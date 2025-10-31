import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Shuffle from './Shuffle';
import { createAssessmentActivity } from '../services/activityService';
import Stepper, { Step } from './Stepper';
import { assessmentsApi } from '../services/api';
import type { Assessment as ApiAssessment } from '../types';
import { generateAssessmentFromBrief } from '../services/geminiService';

interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  conditional?: {
    dependsOn: string;
    condition: string;
    value: string;
  };
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  jobId: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

const AssessmentBuilder: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [assessmentFormMode, setAssessmentFormMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    jobId: ''
  });
  const [creationMode, setCreationMode] = useState<'ai' | 'manual' | ''>('');
  const [aiBrief, setAiBrief] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

  // Helper to map API assessment to UI assessment format
  const mapApiAssessmentToUi = (apiAssessment: ApiAssessment): Assessment => {
    // Flatten sections into questions array
    const questions: Question[] = [];
    apiAssessment.sections.forEach((section) => {
      section.questions.forEach((apiQuestion) => {
        questions.push({
          id: apiQuestion.id,
          type: apiQuestion.type === 'multi-choice' ? 'multiple-choice' : apiQuestion.type,
          title: apiQuestion.question,
          description: undefined,
          required: apiQuestion.required,
          options: apiQuestion.options,
          min: apiQuestion.min,
          max: apiQuestion.max,
          maxLength: apiQuestion.maxLength,
          conditional: apiQuestion.conditional ? {
            dependsOn: apiQuestion.conditional.dependsOn,
            condition: apiQuestion.conditional.condition,
            value: (apiQuestion.conditional as any).value || ''
          } : undefined
        });
      });
    });

    return {
      id: apiAssessment.id,
      title: apiAssessment.title,
      description: apiAssessment.description || '',
      jobId: apiAssessment.jobId,
      questions: questions,
      createdAt: typeof apiAssessment.createdAt === 'string' 
        ? apiAssessment.createdAt 
        : new Date(apiAssessment.createdAt).toISOString().split('T')[0],
      updatedAt: typeof apiAssessment.updatedAt === 'string'
        ? apiAssessment.updatedAt
        : new Date(apiAssessment.updatedAt).toISOString().split('T')[0]
    };
  };

  // Load assessments from API
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const apiAssessments = await assessmentsApi.getAll();
        const uiAssessments = apiAssessments.map(mapApiAssessmentToUi);
        setAssessments(uiAssessments);
        console.log(`Loaded ${uiAssessments.length} assessments from API`);
      } catch (error) {
        console.error('Failed to load assessments from API:', error);
      }
    };
    loadAssessments();
  }, []);

  const handleCreateAssessment = () => {
    if (newAssessment.title.trim()) {
      const assessment: Assessment = {
        id: Date.now().toString(),
        title: newAssessment.title,
        description: newAssessment.description,
        jobId: newAssessment.jobId,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        questions: []
      };
      setAssessments([...assessments, assessment]);
      
      // Log assessment creation activity
      createAssessmentActivity('assessment_created', assessment.title, assessment.id);
      
      setCurrentAssessment(null); // Don't auto-open the assessment
      setNewAssessment({ title: '', description: '', jobId: '' });
      setShowCreateModal(false);
      
      // Show success message
      alert('Assessment created successfully! You can now click on it to start building questions.');
    }
  };

  const handleAddQuestion = (type: Question['type']) => {
    if (currentAssessment) {
      const newQuestion: Question = {
        id: `q${Date.now()}`,
        type,
        title: '',
        required: true,
        options: type === 'single-choice' || type === 'multiple-choice' ? ['Option 1', 'Option 2'] : undefined,
        maxLength: type === 'short-text' ? 100 : type === 'long-text' ? 500 : undefined
      };
      
      const updatedAssessment = {
        ...currentAssessment,
        questions: [...currentAssessment.questions, newQuestion],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setCurrentAssessment(updatedAssessment);
      setAssessments(assessments.map(a => a.id === currentAssessment.id ? updatedAssessment : a));
      setIsSaved(false); // Reset saved state when questions are added
      
      // Log question addition activity
      createAssessmentActivity('assessment_question_added', currentAssessment.title, currentAssessment.id);
    }
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (currentAssessment) {
      const updatedQuestions = currentAssessment.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      
      const updatedAssessment = {
        ...currentAssessment,
        questions: updatedQuestions,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setCurrentAssessment(updatedAssessment);
      setAssessments(assessments.map(a => a.id === currentAssessment.id ? updatedAssessment : a));
      setIsSaved(false); // Reset saved state when questions are modified
    }
  };

  // Helper to convert UI assessment to API format
  const mapUiAssessmentToApi = (uiAssessment: Assessment): ApiAssessment => {
    // Convert flat questions array to sections format
    // Group questions into a single default section for simplicity
    const apiQuestions = uiAssessment.questions.map((q, index) => ({
      id: q.id,
      type: q.type === 'multiple-choice' ? 'multi-choice' : q.type,
      question: q.title,
      required: q.required,
      options: q.options,
      min: q.min,
      max: q.max,
      maxLength: q.maxLength,
      conditional: q.conditional ? {
        dependsOn: q.conditional.dependsOn,
        condition: q.conditional.condition,
        value: (q.conditional as any).value
      } : undefined,
      order: index
    }));

    return {
      id: uiAssessment.id,
      jobId: uiAssessment.jobId,
      title: uiAssessment.title,
      description: uiAssessment.description,
      sections: [
        {
          id: `section-${uiAssessment.id}-1`,
          title: 'Assessment Questions',
          questions: apiQuestions,
          order: 0
        }
      ],
      createdAt: uiAssessment.createdAt,
      updatedAt: new Date().toISOString()
    };
  };

  const handleSaveAssessment = async () => {
    if (currentAssessment) {
      try {
        // Convert to API format
        const normalizedJobId = currentAssessment.jobId && currentAssessment.jobId.trim().length > 0
          ? currentAssessment.jobId
          : currentAssessment.id; // fallback to assessment id for demo storage
        const apiAssessment = mapUiAssessmentToApi({ ...currentAssessment, jobId: normalizedJobId });
        
        // Save via API
        await assessmentsApi.save(normalizedJobId, apiAssessment);
        
        const updatedAssessment = {
          ...currentAssessment,
          jobId: normalizedJobId,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        setAssessments(assessments.map(a => a.id === currentAssessment.id ? updatedAssessment : a));
        setCurrentAssessment(updatedAssessment);
        setIsSaved(true);
        
        // Log assessment update activity
        createAssessmentActivity('assessment_updated', currentAssessment.title, currentAssessment.id);
        
        // Show success message
        alert('Assessment saved successfully!');
        
        // Reset saved state after 3 seconds
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      } catch (error) {
        console.error('Failed to save assessment:', error);
        alert('Failed to save assessment. Please try again.');
      }
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (currentAssessment) {
      const updatedQuestions = currentAssessment.questions.filter(q => q.id !== questionId);
      
      const updatedAssessment = {
        ...currentAssessment,
        questions: updatedQuestions,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setCurrentAssessment(updatedAssessment);
      setAssessments(assessments.map(a => a.id === currentAssessment.id ? updatedAssessment : a));
      setIsSaved(false); // Reset saved state when questions are deleted
    }
  };

  const renderQuestionBuilder = (question: Question, index: number) => {
    return (
      <div key={question.id} style={{
        background: 'white',
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        {/* Question Preview */}
        <div style={{ 
          background: '#F8F9FA', 
          padding: '16px', 
          borderRadius: '6px', 
          marginBottom: '16px',
          border: '1px solid #E9ECEF'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#222222' }}>
            {index + 1}. {question.title || 'Untitled Question'}
            {question.required && <span style={{ color: '#DC3545' }}> *</span>}
          </h4>
          {question.description && (
            <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 12px 0' }}>
              {question.description}
            </p>
          )}
          <div style={{ fontSize: '12px', color: '#666666', textTransform: 'capitalize', marginBottom: '8px' }}>
            Type: {question.type.replace('-', ' ')}
          </div>
          
          {/* Question Preview Content */}
          {question.type === 'single-choice' && question.options && question.options.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {question.options.map((option, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #E0E0E0', borderRadius: '50%' }}></div>
                  <span style={{ fontSize: '14px', color: '#222222' }}>{option}</span>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {question.options.map((option, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #E0E0E0', borderRadius: '2px' }}></div>
                  <span style={{ fontSize: '14px', color: '#222222' }}>{option}</span>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'short-text' && (
            <div style={{ marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Enter your answer"
                disabled
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#F8F9FA',
                  color: '#666666'
                }}
              />
            </div>
          )}
          
          {question.type === 'long-text' && (
            <div style={{ marginTop: '8px' }}>
              <textarea
                placeholder="Enter your answer"
                disabled
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#F8F9FA',
                  color: '#666666',
                  resize: 'none'
                }}
              />
            </div>
          )}
          
          {question.type === 'numeric' && (
            <div style={{ marginTop: '8px' }}>
              <input
                type="number"
                placeholder="Enter a number"
                disabled
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#F8F9FA',
                  color: '#666666'
                }}
              />
            </div>
          )}
          
          {question.type === 'file-upload' && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                border: '2px dashed #E0E0E0',
                borderRadius: '6px',
                padding: '16px',
                textAlign: 'center',
                background: '#F8F9FA'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>📁</div>
                <p style={{ fontSize: '12px', color: '#666666', margin: '0' }}>
                  Click to upload or drag and drop
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Edit Fields */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Question title"
              value={question.title}
              onChange={(e) => handleUpdateQuestion(question.id, { title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E0E0E0',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '8px',
                color: '#222222',
                background: 'white'
              }}
            />
            <input
              type="text"
              placeholder="Question description (optional)"
              value={question.description || ''}
              onChange={(e) => handleUpdateQuestion(question.id, { description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E0E0E0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#666666',
                marginBottom: '8px',
                background: 'white'
              }}
            />
            <select
              value={question.type}
              onChange={(e) => handleUpdateQuestion(question.id, { type: e.target.value as Question['type'] })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E0E0E0',
                borderRadius: '6px',
                fontSize: '12px',
                background: 'white',
                color: '#222222',
                cursor: 'pointer'
              }}
            >
              <option value="single-choice">Single Choice</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="short-text">Short Text</option>
              <option value="long-text">Long Text</option>
              <option value="numeric">Numeric</option>
              <option value="file-upload">File Upload</option>
            </select>
          </div>
          <button
            onClick={() => handleDeleteQuestion(question.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC3545',
              cursor: 'pointer',
              padding: '4px',
              marginLeft: '12px'
            }}
          >
            🗑️
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => handleUpdateQuestion(question.id, { required: e.target.checked })}
            />
            Required
          </label>
          <span style={{ fontSize: '12px', color: '#666666', textTransform: 'capitalize' }}>
            {question.type.replace('-', ' ')}
          </span>
        </div>

        {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Options:
            </label>
            {question.options?.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = e.target.value;
                    handleUpdateQuestion(question.id, { options: newOptions });
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={() => {
                    const newOptions = question.options?.filter((_, i) => i !== index) || [];
                    handleUpdateQuestion(question.id, { options: newOptions });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC3545',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOptions = [...(question.options || []), 'New Option'];
                handleUpdateQuestion(question.id, { options: newOptions });
              }}
              style={{
                background: '#F8F9FA',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#222222',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E9ECEF';
                e.currentTarget.style.borderColor = '#F06B4E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8F9FA';
                e.currentTarget.style.borderColor = '#E0E0E0';
              }}
            >
              + Add Option
            </button>
          </div>
        )}

        {(question.type === 'short-text' || question.type === 'long-text') && (
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
              Max Length:
            </label>
            <input
              type="number"
              value={question.maxLength || ''}
              onChange={(e) => handleUpdateQuestion(question.id, { maxLength: parseInt(e.target.value) || undefined })}
              style={{
                padding: '6px 8px',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                fontSize: '12px',
                width: '100px'
              }}
            />
          </div>
        )}

        {question.type === 'numeric' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Min Value:
              </label>
              <input
                type="number"
                value={question.min || ''}
                onChange={(e) => handleUpdateQuestion(question.id, { min: parseInt(e.target.value) || undefined })}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  width: '100px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Max Value:
              </label>
              <input
                type="number"
                value={question.max || ''}
                onChange={(e) => handleUpdateQuestion(question.id, { max: parseInt(e.target.value) || undefined })}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  width: '100px'
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionPreview = (question: Question, index: number) => {
    // Conditional visibility
    if (question.conditional && currentAssessment) {
      const targetId = question.conditional.dependsOn;
      const targetVal = previewAnswers[targetId];
      const condVal = (question.conditional as any).value;
      const shouldShow = question.conditional.condition === 'equals' ? targetVal === condVal : true;
      if (!shouldShow) return null;
    }
    return (
      <div key={question.id} style={{
        background: 'white',
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          margin: '0 0 8px 0',
          color: '#222222',
          lineHeight: '1.4'
        }}>
          {index + 1}. {question.title || 'Untitled Question'}
          {question.required && <span style={{ color: '#DC3545' }}> *</span>}
        </h4>
        {question.description && (
          <p style={{ fontSize: '14px', color: '#666666', margin: '0 0 16px 0' }}>
            {question.description}
          </p>
        )}

        {question.type === 'single-choice' && (
          <div>
            {question.options?.map((option, index) => (
              <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input type="radio" name={question.id} onChange={() => setPreviewAnswers(prev => ({ ...prev, [question.id]: option }))} />
                <span style={{ fontSize: '14px', color: '#222222' }}>{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'multiple-choice' && (
          <div>
            {question.options?.map((option, index) => (
              <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input type="checkbox" onChange={(e) => setPreviewAnswers(prev => {
                  const cur = Array.isArray(prev[question.id]) ? prev[question.id] as string[] : [];
                  const next = e.target.checked ? [...cur, option] : cur.filter(o => o !== option);
                  return { ...prev, [question.id]: next };
                })} />
                <span style={{ fontSize: '14px', color: '#222222' }}>{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'short-text' && (
          <input
            type="text"
            placeholder="Enter your answer"
            maxLength={question.maxLength}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E0E0E0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#222222',
              background: 'white'
            }}
          onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
          />
        )}

        {question.type === 'long-text' && (
          <textarea
            placeholder="Enter your answer"
            maxLength={question.maxLength}
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E0E0E0',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              color: '#222222',
              background: 'white'
            }}
          onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
          />
        )}

        {question.type === 'numeric' && (
          <input
            type="number"
            placeholder="Enter a number"
            min={question.min}
            max={question.max}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E0E0E0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#222222',
              background: 'white'
            }}
          onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
          />
        )}

        {question.type === 'file-upload' && (
          <div style={{
            border: '2px dashed #E0E0E0',
            borderRadius: '6px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
            <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
              Click to upload or drag and drop
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderAssessmentForm = (assessment: Assessment) => {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#222222', 
            margin: '0 0 10px 0' 
          }}>
            {assessment.title}
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#666666', 
            margin: '0' 
          }}>
            {assessment.description}
          </p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          alert('Assessment submitted successfully!');
        }}>
          {assessment.questions.map((question, index) => (
            <div key={question.id} style={{
              background: '#F8F9FA',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#222222', 
                margin: '0 0 10px 0' 
              }}>
                {index + 1}. {question.title}
                {question.required && <span style={{ color: '#DC3545' }}> *</span>}
              </h3>
              
              {question.description && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0 0 15px 0' 
                }}>
                  {question.description}
                </p>
              )}

              {question.type === 'single-choice' && (
                <div>
                  {question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      marginBottom: '10px',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="radio" 
                        name={question.id} 
                        value={option}
                        required={question.required}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontSize: '16px', color: '#222222' }}>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'multiple-choice' && (
                <div>
                  {question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      marginBottom: '10px',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        name={`${question.id}[]`}
                        value={option}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontSize: '16px', color: '#222222' }}>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'short-text' && (
                <input
                  type="text"
                  name={question.id}
                  placeholder="Enter your answer"
                  maxLength={question.maxLength}
                  required={question.required}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222222',
                    background: 'white'
                  }}
                />
              )}

              {question.type === 'long-text' && (
                <textarea
                  name={question.id}
                  placeholder="Enter your answer"
                  maxLength={question.maxLength}
                  rows={4}
                  required={question.required}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222222',
                    background: 'white',
                    resize: 'vertical'
                  }}
                />
              )}

              {question.type === 'numeric' && (
                <input
                  type="number"
                  name={question.id}
                  placeholder="Enter a number"
                  min={question.min}
                  max={question.max}
                  required={question.required}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#222222',
                    background: 'white'
                  }}
                />
              )}

              {question.type === 'file-upload' && (
                <div style={{
                  border: '2px dashed #E0E0E0',
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  background: 'white'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📁</div>
                  <p style={{ fontSize: '16px', color: '#666666', margin: '0 0 10px 0' }}>
                    Click to upload or drag and drop your file
                  </p>
                  <input
                    type="file"
                    name={question.id}
                    required={question.required}
                    style={{
                      padding: '10px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <div style={{ 
            textAlign: 'center', 
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #E0E0E0'
          }}>
            <button
              type="submit"
              style={{
                background: '#F06B4E',
                color: 'white',
                padding: '15px 40px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E55A3A';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F06B4E';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Submit Assessment
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <>
    <div className="assessments-page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: '#F8F7F5'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '16px 24px', 
        borderBottom: '1px solid #E0E0E0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
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
        
         <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Services Dropdown */}
          <div 
            style={{ position: 'relative' }}
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
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                background: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '20px',
                minWidth: '400px',
                zIndex: 1000
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
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
            cursor: 'pointer',
            fontFamily: '"Montserrat", Arial, sans-serif'
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
                minWidth: '400px',
                zIndex: 1000
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
                <div 
                  onClick={() => navigate('/profile')}
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
                    Profile Settings
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Manage your personal information and preferences.
                  </p>
                </div>

                

                {/* Log Out */}
                <div 
                  onClick={() => { onLogout(); navigate('/login'); }}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F06B4E';
                    e.currentTarget.querySelector('h4').style.color = '#F06B4E';
                    e.currentTarget.querySelector('p').style.color = '#F06B4E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#222222';
                    e.currentTarget.querySelector('h4').style.color = '#222222';
                    e.currentTarget.querySelector('p').style.color = '#666666';
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 6px 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Log Out
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: '0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Sign out of your account securely.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hide-scrollbar assessments-content" style={{ 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        {/* Page Header */}
        <div className="assessments-hero" style={{ 
          background: 'linear-gradient(135deg, #1A3C34 0%, #2D5A4F 100%)', 
          padding: '40px', 
          borderRadius: '12px', 
          marginBottom: '30px', 
          boxShadow: '0 4px 12px rgba(26, 60, 52, 0.3)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 1
          }}></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: 'white',
              margin: '0',
              fontFamily: '"Montserrat", Arial, sans-serif'
            }}>
              <span style={{ color: '#F06B4E' }}>Assessment</span> Builder
            </h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              {currentAssessment && (
                <button 
                  onClick={() => setCurrentAssessment(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '10px 20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ← Back to Assessments
                </button>
              )}
              {currentAssessment && (
                <button 
                  onClick={() => setPreviewMode(!previewMode)}
                  style={{
                    background: previewMode ? '#F06B4E' : 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '10px 20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = previewMode ? '#E55A3A' : 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = previewMode ? '#F06B4E' : 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  {previewMode ? 'Edit Mode' : 'Preview Mode'}
                </button>
              )}
              <button 
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: '#F06B4E',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E55A3A';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F06B4E';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                + New Assessment
              </button>
            </div>
          </div>
          
          <p style={{ 
            fontSize: '16px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            margin: '0'
          }}>
            Create custom assessments with multiple question types, conditional logic, and live preview functionality.
          </p>
          </div>
        </div>

        {/* Assessment List */}
        {!currentAssessment && (
          <div className="assessments-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '24px',
            marginBottom: '40px'
          }}>
            {assessments.map((assessment) => (
              <div 
                key={assessment.id}
                onClick={() => setCurrentAssessment(assessment)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #F0F0F0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                }}
              >
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#222222', 
                  margin: '0 0 8px 0' 
                }}>
                  {assessment.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0 0 16px 0' 
                }}>
                  {assessment.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #F0F0F0'
                }}>
                  <span style={{ fontSize: '12px', color: '#666666' }}>
                    {assessment.questions.length} questions
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    Updated {new Date(assessment.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assessment Builder */}
        {currentAssessment && (
          <div className="assessments-two-col" style={{ display: 'flex', gap: '30px' }}>
            {/* Builder Panel */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                background: 'white', 
                padding: '30px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#222222', 
                  margin: '0 0 20px 0' 
                }}>
                  {currentAssessment.title}
                </h2>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666', 
                  margin: '0 0 20px 0' 
                }}>
                  {currentAssessment.description}
                </p>
                
                {!previewMode && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
                      Add Question:
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { type: 'single-choice', label: 'Single Choice', icon: '🔘' },
                        { type: 'multiple-choice', label: 'Multiple Choice', icon: '☑️' },
                        { type: 'short-text', label: 'Short Text', icon: '📝' },
                        { type: 'long-text', label: 'Long Text', icon: '📄' },
                        { type: 'numeric', label: 'Numeric', icon: '🔢' },
                        { type: 'file-upload', label: 'File Upload', icon: '📁' }
                      ].map((questionType) => (
                        <button
                          key={questionType.type}
                          onClick={() => handleAddQuestion(questionType.type as Question['type'])}
                          style={{
                            background: 'white',
                            border: '1px solid #E0E0E0',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease',
                            color: '#222222'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F8F9FA';
                            e.currentTarget.style.borderColor = '#F06B4E';
                            e.currentTarget.style.color = '#F06B4E';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#E0E0E0';
                            e.currentTarget.style.color = '#222222';
                          }}
                        >
                          <span>{questionType.icon}</span>
                          {questionType.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  {previewMode ? (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                        Preview:
                      </h3>
                      {currentAssessment.questions.map((q, i) => renderQuestionPreview(q, i))}
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                        Questions:
                      </h3>
                      {currentAssessment.questions.map((q, i) => renderQuestionBuilder(q, i))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Save Assessment Button */}
              <div style={{ 
                marginTop: '30px', 
                paddingTop: '20px', 
                borderTop: '1px solid #E0E0E0',
                textAlign: 'center'
              }}>
                <button
                  onClick={handleSaveAssessment}
                  style={{
                    background: isSaved ? '#F06B4E' : '#6C757D',
                    color: 'white',
                    padding: '12px 30px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isSaved ? '#E55A3A' : '#5A6268';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSaved ? '#F06B4E' : '#6C757D';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isSaved ? 'Saved!' : 'Save Assessment'}
                </button>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666666', 
                  margin: '8px 0 0 0' 
                }}>
                  Save your changes to the assessment
                </p>
              </div>
            </div>

            {/* Preview Panel */}
            {!previewMode && (
              <div className="preview-panel" style={{ width: '400px' }}>
                <div style={{ 
                  background: 'white', 
                  padding: '30px', 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  position: 'sticky',
                  top: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#222222', 
                    margin: '0 0 20px 0' 
                  }}>
                    Live Preview
                  </h3>
                  <div style={{ 
                    border: '1px solid #E0E0E0', 
                    borderRadius: '8px', 
                    padding: '20px',
                    background: '#F8F9FA'
                  }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      margin: '0 0 8px 0',
                      color: '#222222'
                    }}>
                      {currentAssessment.title}
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666666', 
                      margin: '0 0 20px 0' 
                    }}>
                      {currentAssessment.description}
                    </p>
                    {currentAssessment.questions.map(renderQuestionPreview)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Assessment Modal with Stepper */}
        {showCreateModal && (
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
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px',
              width: '600px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  margin: '0',
                  color: '#1A3C34',
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  Create New Assessment
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666666',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8F9FA';
                    e.currentTarget.style.color = '#222222';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#666666';
                  }}
                >
                  ×
                </button>
              </div>

              <Stepper
                onFinalStepCompleted={() => {
                  handleCreateAssessment();
                  setShowCreateModal(false);
                }}
                backButtonText="Back"
                nextButtonText="Continue"
                stepCircleContainerClassName=""
                stepContainerClassName=""
                contentClassName=""
                footerClassName={creationMode === 'ai' ? 'ai-hide-footer' : ''}
              >
                <Step>
                  <div style={{ padding: '20px' }}>
                    {/* Mode selection */}
                    <div style={{
                      background: '#FFF7F3',
                      border: '1px solid #FFE1D6',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      color: '#8A3B2E'
                    }}>
                      Choose how you want to create this assessment: using AI or manually.
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                      <button
                        type="button"
                        onClick={() => setCreationMode('ai')}
                        style={{
                          background: creationMode === 'ai' ? '#F06B4E' : 'white',
                          color: creationMode === 'ai' ? 'white' : '#222222',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          cursor: 'pointer'
                        }}
                      >
                        🤖 Use AI
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreationMode('manual')}
                        style={{
                          background: creationMode === 'manual' ? '#1A3C34' : 'white',
                          color: creationMode === 'manual' ? 'white' : '#222222',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          cursor: 'pointer'
                        }}
                      >
                        ✍️ Build Manually
                      </button>
                    </div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      marginBottom: '20px',
                      color: '#1A3C34',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      Step 1: Basic Information
                    </h3>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Assessment Title *
                      </label>
                      <input
                        type="text"
                        value={newAssessment.title}
                        onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                        placeholder="Enter assessment title"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#222222',
                          background: 'white',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      />
                    </div>
                    
                    {creationMode !== 'ai' && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Description *
                      </label>
                      <textarea
                        value={newAssessment.description}
                        onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                        placeholder="Enter assessment description"
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical',
                          color: '#222222',
                          background: 'white',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          fontFamily: 'Glacial Indifference, Arial, sans-serif'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      />
                    </div>
                    )}
                    
                    {creationMode !== 'ai' && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#222222',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Job ID
                      </label>
                      <input
                        type="text"
                        value={newAssessment.jobId}
                        onChange={(e) => setNewAssessment({ ...newAssessment, jobId: e.target.value })}
                        placeholder="Enter job ID (optional)"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#222222',
                          background: 'white',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1A3C34'}
                        onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                      />
                    </div>
                    )}

                    {creationMode === 'ai' && (
                      <div style={{ marginTop: '16px' }}>
                        <label style={{
                          display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#222222'
                        }}>
                          AI Brief (what skills to test, seniority, focus areas)
                        </label>
                        <textarea
                          value={aiBrief}
                          onChange={(e) => setAiBrief(e.target.value)}
                          placeholder="E.g., Senior Frontend Developer; React, TypeScript, accessibility, problem solving; include a short case study and a file upload for code sample."
                          rows={4}
                          style={{
                            width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: '8px', background: 'white', color: '#222222'
                          }}
                        />
                        {aiError && (
                          <div style={{ color: '#C62828', fontSize: '12px', marginTop: '8px' }}>{aiError}</div>
                        )}
                        <div style={{ marginTop: '12px' }}>
                          <button
                            type="button"
                            disabled={aiLoading || !newAssessment.title.trim()}
                            onClick={async () => {
                              setAiError('');
                              setAiLoading(true);
                              try {
                                const result = await generateAssessmentFromBrief(aiBrief || newAssessment.description, newAssessment.title);
                                // Create assessment locally and open builder populated with questions
                                const generatedId = Date.now().toString();
                                const assessment: Assessment = {
                                  id: generatedId,
                                  title: result.title,
                                  description: result.description,
                                  jobId: newAssessment.jobId || generatedId,
                                  createdAt: new Date().toISOString().split('T')[0],
                                  updatedAt: new Date().toISOString().split('T')[0],
                                  questions: result.questions.map((q, idx) => ({
                                    id: q.id || `q${idx+1}`,
                                    type: q.type,
                                    title: q.title,
                                    description: q.description,
                                    required: q.required,
                                    options: q.options,
                                    min: q.min,
                                    max: q.max,
                                    maxLength: q.maxLength
                                  }))
                                };
                                setAssessments([...assessments, assessment]);
                                setCurrentAssessment(assessment);
                                setShowCreateModal(false);
                              } catch (err: any) {
                                setAiError(err?.message || 'Failed to generate assessment');
                              } finally {
                                setAiLoading(false);
                              }
                            }}
                            style={{
                              background: aiLoading ? '#CCCCCC' : '#F06B4E',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 16px',
                              cursor: aiLoading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {aiLoading ? 'Generating…' : 'Generate with AI'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Step>

                {creationMode !== 'ai' && (
                <Step>
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      marginBottom: '20px',
                      color: '#1A3C34',
                      fontFamily: 'Montserrat, Arial, sans-serif'
                    }}>
                      Step 2: Confirmation
                    </h3>
                    <div style={{
                      background: '#F8F9FA',
                      borderRadius: '12px',
                      padding: '24px',
                      marginBottom: '20px'
                    }}>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666666',
                        marginBottom: '16px',
                        fontFamily: 'Glacial Indifference, Arial, sans-serif'
                      }}>
                        Review your assessment details:
                      </p>
                      <div style={{ textAlign: 'left', background: 'white', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Title:</strong> {newAssessment.title || 'Not specified'}
                        </p>
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Description:</strong> {newAssessment.description || 'Not specified'}
                        </p>
                        <p style={{ fontSize: '14px', margin: '8px 0', color: '#222222', fontFamily: 'Glacial Indifference, Arial, sans-serif' }}>
                          <strong>Job ID:</strong> {newAssessment.jobId || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#666666',
                      fontFamily: 'Glacial Indifference, Arial, sans-serif'
                    }}>
                      Click "Complete" to create your assessment and start adding questions.
                    </p>
                  </div>
                </Step>
                )}
              </Stepper>
              {creationMode === 'ai' && (
                <style>{`
                  .ai-hide-footer { display: none !important; }
                `}</style>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div style={{ 
        position: 'fixed', 
        bottom: '40px', 
        right: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#1A3C34',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          💬
        </button>
        <button style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#F06B4E',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          👋
        </button>
      </div>
    </div>
    <style>{`
      /* Responsive tweaks for assessments page */
      @media (max-width: 1200px) {
        .assessments-content { padding: 24px !important; }
      }
      @media (max-width: 1024px) {
        .assessments-two-col { flex-direction: column !important; }
        .preview-panel { width: 100% !important; position: static !important; top: auto !important; margin-top: 20px !important; }
        .assessments-hero { padding: 24px !important; }
      }
      @media (max-width: 768px) {
        .assessments-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 600px) {
        .assessments-content { padding: 16px !important; }
        .assessments-hero h1 { font-size: 22px !important; }
        .assessments-hero p { font-size: 14px !important; }
      }
    `}</style>
    </>
  );
};

export default AssessmentBuilder;
