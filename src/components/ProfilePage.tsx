import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shuffle from './Shuffle'

type ProfilePageProps = {
  onLogout: () => void
}

// TalentFlow palette (kept inline to match existing components' style approach)
const COLORS = {
  brand: '#1A3C34',
  accent: '#F06B4E',
  bg: '#F8F9FA',
  text: '#222222',
  muted: '#666666',
  border: '#E0E0E0',
  white: '#FFFFFF',
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  background: COLORS.white,
  color: COLORS.text,
}

const sectionCardStyle: React.CSSProperties = {
  background: COLORS.white,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: 16,
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const navigate = useNavigate()

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('talentflow-user') || 'null') } catch { return null }
  })()
  const initialFirst = storedUser?.displayName ? String(storedUser.displayName).split(' ')[0] : 'Alex'
  const initialLast = storedUser?.displayName && String(storedUser.displayName).includes(' ')
    ? String(storedUser.displayName).split(' ').slice(1).join(' ')
    : 'Morgan'
  const initialEmail = storedUser?.email || 'alex.morgan@example.com'

  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [email, setEmail] = useState(initialEmail)
  const [role, setRole] = useState('Recruiter')
  const [twoFA, setTwoFA] = useState(false)
  const [newsletter, setNewsletter] = useState(true)

  const saveProfile = () => {
    // In real app, persist to API
    // For now, provide a subtle feedback
    localStorage.setItem('talentflow-user', JSON.stringify({
      ...(storedUser || {}),
      displayName: `${firstName} ${lastName}`.trim(),
      email
    }))
    alert('Profile updated successfully')
  }

  const saveSecurity = () => {
    alert('Security preferences saved')
  }

  const savePreferences = () => {
    alert('Preferences saved')
  }

  const [showServicesDropdown, setShowServicesDropdown] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: COLORS.bg,
      fontFamily: '"Inter", Arial, sans-serif',
      color: COLORS.text,
    }}>
      {/* Header (matching Dashboard) */}
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
          onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.opacity = '0.8'}
          onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
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
                width: '500px',
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
                  Our Services
                </h3>
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
                <div 
                  onClick={() => navigate('/analytics')}
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
                    margin: 0,
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease'
                  }}>
                    Manage your personal information and preferences.
                  </p>
                </div>
                <div 
                  onClick={() => { onLogout(); navigate('/login') }}
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
                    Log Out
                  </h4>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#666666', 
                    margin: 0,
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

      {/* Content */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, margin: '0 0 16px 0', fontWeight: 'bold', fontFamily: '"Montserrat", Arial, sans-serif' }}>
          <span style={{ color: '#F05A3C' }}>PRO</span><span style={{ color: '#1A3C34' }}>FILE</span>
        </h1>
        <p style={{ 
          color: COLORS.muted, 
          margin: '0 0 20px 0',
          fontFamily: '"Inter", Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.5',
          fontWeight: '400'
        }}>Manage your personal information, security, and preferences.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {/* Header card: Avatar and summary */}
          <div style={sectionCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: COLORS.brand,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.white,
                fontWeight: 'bold',
                fontSize: 20,
              }}>
                {firstName.charAt(0)}{lastName.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  fontWeight: 'bold',
                  fontFamily: '"Montserrat", Arial, sans-serif',
                  fontSize: '18px'
                }}>{firstName} {lastName}</div>
                <div style={{ 
                  color: COLORS.muted, 
                  fontSize: 13,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>{email}</div>
                <div style={{ 
                  color: COLORS.muted, 
                  fontSize: 13,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>{role}</div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div style={sectionCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ 
                fontSize: 18, 
                margin: 0,
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: '600'
              }}>Personal Information</h2>
              <button
                onClick={saveProfile}
                style={{
                  padding: '8px 12px',
                  background: COLORS.accent,
                  color: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.accent}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.brand
                  ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${COLORS.brand}`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.accent
                  ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${COLORS.accent}`
                }}
              >
                Save
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={fieldStyle}>
                <label style={{ 
                  fontSize: 13, 
                  color: COLORS.muted,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>First name</label>
                <input style={{
                  ...inputStyle,
                  fontFamily: '"Inter", Arial, sans-serif'
                }} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={{ 
                  fontSize: 13, 
                  color: COLORS.muted,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>Last name</label>
                <input style={{
                  ...inputStyle,
                  fontFamily: '"Inter", Arial, sans-serif'
                }} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={{ 
                  fontSize: 13, 
                  color: COLORS.muted,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>Email</label>
                <input style={{
                  ...inputStyle,
                  fontFamily: '"Inter", Arial, sans-serif'
                }} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={{ 
                  fontSize: 13, 
                  color: COLORS.muted,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>Role</label>
                <input style={{
                  ...inputStyle,
                  fontFamily: '"Inter", Arial, sans-serif'
                }} value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Security */}
          <div style={sectionCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ 
                fontSize: 18, 
                margin: 0,
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: '600'
              }}>Security</h2>
              <button
                onClick={saveSecurity}
                style={{
                  padding: '8px 12px',
                  background: COLORS.accent,
                  color: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.accent}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.brand
                  ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${COLORS.brand}`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.accent
                  ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${COLORS.accent}`
                }}
              >
                Save
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: `1px dashed ${COLORS.border}`, borderRadius: 8 }}>
              <div>
                <div style={{ 
                  fontWeight: 600,
                  fontFamily: '"Montserrat", Arial, sans-serif',
                  fontSize: '16px'
                }}>Two-factor authentication</div>
                <div style={{ 
                  color: COLORS.muted, 
                  fontSize: 13,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>Add an extra layer of security to your account.</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
                <span style={{ color: twoFA ? COLORS.accent : COLORS.muted }}>{twoFA ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div style={sectionCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ 
                fontSize: 18, 
                margin: 0,
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: '600'
              }}>Preferences</h2>
              <button
                onClick={savePreferences}
                style={{
                  padding: '8px 12px',
                  background: COLORS.accent,
                  color: COLORS.white,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.accent}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.brand
                  ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${COLORS.brand}`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = COLORS.accent
                  ;(e.currentTarget as HTMLButtonElement).style.border = `1px solid ${COLORS.accent}`
                }}
              >
                Save
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: `1px dashed ${COLORS.border}`, borderRadius: 8 }}>
              <div>
                <div style={{ 
                  fontWeight: 600,
                  fontFamily: '"Montserrat", Arial, sans-serif',
                  fontSize: '16px'
                }}>Product updates</div>
                <div style={{ 
                  color: COLORS.muted, 
                  fontSize: 13,
                  fontFamily: '"Inter", Arial, sans-serif'
                }}>Receive occasional updates about new features.</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                <span style={{ color: newsletter ? COLORS.accent : COLORS.muted }}>{newsletter ? 'Subscribed' : 'Unsubscribed'}</span>
              </label>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage


