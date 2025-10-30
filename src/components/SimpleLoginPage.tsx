import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Shuffle from './Shuffle';
import LightRays from './LightRays';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, getGoogleRedirectResult } from '../services/authService';

const SimpleLoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [activeDot, setActiveDot] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (activeTab === 'signin') {
      const result = await signInWithEmail(email, password);
      if (result.user) {
        localStorage.setItem('talentflow-user', JSON.stringify({
          uid: result.user.uid,
          displayName: result.user.displayName || email.split('@')[0],
          email: result.user.email || email
        }));
        onLogin();
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } else {
      const result = await signUpWithEmail(email, password);
      if (result.user) {
        localStorage.setItem('talentflow-user', JSON.stringify({
          uid: result.user.uid,
          displayName: username || email.split('@')[0],
          email: result.user.email || email
        }));
        onLogin();
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to sign up');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.user) {
      localStorage.setItem('talentflow-user', JSON.stringify({
        uid: result.user.uid,
        displayName: result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'User'),
        email: result.user.email || ''
      }));
      onLogin();
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }
    setLoading(false);
  };

  // Handle Google redirect result (after COOP-safe fallback)
  useEffect(() => {
    (async () => {
      const user = await getGoogleRedirectResult();
      if (user) {
        localStorage.setItem('talentflow-user', JSON.stringify({
          uid: user.uid,
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
          email: user.email || ''
        }));
        onLogin();
        navigate('/dashboard');
      }
    })();
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    if (result.success) {
      setError('Password reset email sent! Please check your inbox.');
    } else {
      setError(result.error || 'Failed to send reset email');
    }
    setLoading(false);
  };

  const handleDotClick = (index: number) => {
    if (index === activeDot || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveDot(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  // Content for each dot
  const dotContent = [
    {
      title: "Welcome to TalentFlow",
      description: "TalentFlow is here to revolutionize hiring by connecting businesses with top talent through our comprehensive recruitment platform."
    },
    {
      title: "Smart Candidate Matching",
      description: "Our AI-powered platform analyzes job requirements and candidate profiles to find the perfect match, saving you time and improving hiring quality."
    },
    {
      title: "Streamlined Hiring Process",
      description: "From job posting to candidate assessment, TalentFlow provides all the tools you need to manage your entire recruitment pipeline in one place."
    }
  ];

  // Auto-rotate dots every 4 seconds with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveDot((prev) => (prev + 1) % dotContent.length);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 50);
        }, 300);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [dotContent.length, isTransitioning]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      {/* Top Left Logo */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        zIndex: 1000,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => navigate('/dashboard')}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <Shuffle
            text="TalentFlow."
            tag="div"
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
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
            colorTo="white"
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
      </div>
      
      <div className="login-container" style={{ 
        display: 'flex', 
        height: '100vh', 
        fontFamily: 'Arial, sans-serif' 
      }}>
      {/* Left Panel */}
      <div className="login-left-panel" style={{ 
        backgroundColor: '#1A3C34', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px 40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Light Rays Background Effect */}
        <LightRays 
          raysOrigin="top-left"
          raysColor="#1A3C34"
          raysSpeed={0.5}
          lightSpread={0.8}
          rayLength={1.5}
          pulsating={false}
          fadeDistance={0.8}
          saturation={0.9}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.0}
          distortion={0.1}
        />
        <div style={{ 
          background: 'white', 
          width: '280px', 
          height: '200px', 
          borderRadius: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: '40px',
          color: '#222222',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '19px', 
            fontWeight: '700', 
            marginBottom: '8px',
            fontFamily: '"Montserrat", Arial, sans-serif',
            letterSpacing: '1px'
          }}>
            WE NEED A
          </div>
          <div style={{ 
            fontSize: '26px', 
            fontWeight: '700', 
            marginBottom: '8px',
            fontFamily: '"Montserrat", Arial, sans-serif',
            letterSpacing: '2px'
          }}>
            DESIGNER
          </div>
          <div style={{ 
            fontSize: '13px', 
            fontStyle: 'italic',
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: '300'
          }}>
            Obviously.
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          position: 'relative',
          minHeight: '200px'
        }}>
          <div style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateX(-30px)' : 'translateX(0)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}>
             <h1 style={{ 
               fontSize: '30px', 
               fontWeight: '700', 
               marginBottom: '20px',
               textAlign: 'center',
               lineHeight: '1.1',
               fontFamily: '"Montserrat", Arial, sans-serif',
               letterSpacing: '0.5px'
             }}>
               {dotContent[activeDot].title.split('TalentFlow').map((part, index) => (
                 <span key={index}>
                   {part}
                   {index < dotContent[activeDot].title.split('TalentFlow').length - 1 && (
                     <span style={{ color: '#F05A3C', fontFamily: '"Roboto Slab", Georgia, serif', fontWeight: '200' }}>TalentFlow</span>
                   )}
                 </span>
               ))}
             </h1>
            <p style={{ 
              fontSize: '13px', 
              lineHeight: '1.5', 
              maxWidth: '300px',
              textAlign: 'center',
              margin: '0 auto',
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: '300',
              letterSpacing: '0.3px'
            }}>
              {dotContent[activeDot].description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {dotContent.map((_, index) => (
            <div
              key={index}
              onClick={() => handleDotClick(index)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: activeDot === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: isTransitioning ? 'default' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeDot === index ? 'scale(1.3)' : 'scale(1)',
                opacity: isTransitioning && activeDot !== index ? 0.6 : 1
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right-panel" style={{ 
        backgroundColor: '#FFFFFF', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '60px' 
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
           {/* Google Sign In Button */}
           <button
             onClick={handleGoogleSignIn}
             disabled={loading}
             style={{
               width: '100%',
               padding: '12px 16px',
               background: 'white',
               border: '1px solid #E0E0E0',
               borderRadius: '4px',
               fontSize: '16px',
               color: '#222222',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '12px',
               marginBottom: '24px',
               fontFamily: '"Roboto Slab", Georgia, serif',
               fontWeight: '400',
               transition: 'all 0.3s ease'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = '#F5F5F5';
               e.currentTarget.style.borderColor = '#CCCCCC';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = 'white';
               e.currentTarget.style.borderColor = '#E0E0E0';
             }}
           >
             <svg width="20" height="20" viewBox="0 0 24 24">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
             </svg>
             <span>Sign in with Google</span>
           </button>
           
           {/* Separator */}
           <div style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '16px',
             marginBottom: '24px'
           }}>
             <div style={{ 
               flex: 1, 
               height: '1px', 
               background: '#E0E0E0' 
             }}></div>
             <span style={{ 
               fontSize: '14px', 
               color: '#999999',
               fontFamily: '"Roboto Slab", Georgia, serif',
               fontWeight: '300'
             }}>
               or {activeTab === 'signin' ? 'sign in' : 'sign up'} with email
             </span>
             <div style={{ 
               flex: 1, 
               height: '1px', 
               background: '#E0E0E0' 
             }}></div>
           </div>
           
           {/* Tab Navigation */}
           <div style={{ 
             display: 'flex', 
             gap: '24px', 
             marginBottom: '30px',
             borderBottom: '1px solid #E0E0E0'
           }}>
             <button
               onClick={() => setActiveTab('signin')}
               style={{
                 background: 'none',
                 border: 'none',
                 padding: '0',
                 fontSize: '18px',
                 color: activeTab === 'signin' ? '#222222' : '#999999',
                 fontWeight: activeTab === 'signin' ? 'bold' : 'normal',
                 cursor: 'pointer',
                 fontFamily: '"Roboto Slab", Georgia, serif',
                 fontWeight: activeTab === 'signin' ? '700' : '400',
                 borderBottom: activeTab === 'signin' ? '2px solid #F05A3C' : '2px solid transparent',
                 paddingBottom: '12px',
                 marginBottom: '-1px',
                 transition: 'all 0.3s ease'
               }}
             >
               Sign In
             </button>
             <button
               onClick={() => setActiveTab('signup')}
               style={{
                 background: 'none',
                 border: 'none',
                 padding: '0',
                 fontSize: '18px',
                 color: activeTab === 'signup' ? '#222222' : '#999999',
                 fontWeight: activeTab === 'signup' ? 'bold' : 'normal',
                 cursor: 'pointer',
                 fontFamily: '"Roboto Slab", Georgia, serif',
                 fontWeight: activeTab === 'signup' ? '700' : '400',
                 borderBottom: activeTab === 'signup' ? '2px solid #F05A3C' : '2px solid transparent',
                 paddingBottom: '12px',
                 marginBottom: '-1px',
                 transition: 'all 0.3s ease'
               }}
             >
               Sign Up
             </button>
           </div>

          <form onSubmit={handleSubmit}>
            {/* Sign Up form fields */}
            {activeTab === 'signup' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '16px', 
                  color: '#222222', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: '200'
                }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E0E0E0',
                    background: '#F5F5F5',
                    borderRadius: '4px',
                    fontSize: '16px',
                    color: '#222222',
                    fontFamily: '"Roboto Slab", Georgia, serif',
                    fontWeight: '200'
                  }}
                  required
                />
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '16px', 
                color: '#222222', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontWeight: '200'
              }}>
                {activeTab === 'signup' ? 'Email address *' : 'Username or email address *'}
              </label>
              <input
                type={activeTab === 'signup' ? 'email' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  background: '#F5F5F5',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#222222',
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: '200'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '16px', 
                color: '#222222', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontFamily: '"Roboto Slab", Georgia, "Times New Roman", serif',
             fontWeight: '200'
              }}>
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E0E0E0',
                  background: '#F5F5F5',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#222222',
                  fontFamily: '"Roboto Slab", Georgia, "Times New Roman", serif',
             fontWeight: '200'
                }}
                required
              />
            </div>

            {activeTab === 'signin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  style={{ width: '16px', height: '16px' }}
                />
                <label style={{ 
                  fontSize: '14px', 
                  color: '#222222',
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: '200'
                }}>
                  Remember me
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: loading ? '#CCCCCC' : '#F05A3C',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '"Roboto Slab", Georgia, "Times New Roman", serif',
                letterSpacing: '0.5px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Please wait...' : (activeTab === 'signin' ? 'Sign In →' : 'Sign Up →')}
            </button>
          </form>
          
          {/* Error message */}
          {error && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: error.includes('sent') ? '#E8F5E8' : '#FEE',
              color: error.includes('sent') ? '#2E7D32' : '#C62828',
              borderRadius: '4px',
              fontSize: '14px',
              textAlign: 'center',
              fontFamily: '"Roboto Slab", Georgia, serif'
            }}>
              {error}
            </div>
          )}

          {/* Lost password link */}
          {activeTab === 'signin' && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleResetPassword();
                }}
                style={{
                  color: '#F05A3C',
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: '400',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Lost password?
              </a>
            </div>
          )}
         </div>
       </div>
     </div>
    <style>{`
      /* Force mobile stacking in case inline styles conflict */
      @media (max-width: 768px) {
        .login-container { flex-direction: column !important; }
        .login-left-panel, .login-right-panel { width: 100% !important; padding: 40px 20px !important; }
        .login-left-panel { height: auto !important; min-height: 40vh !important; }
        .login-right-panel { height: auto !important; min-height: 60vh !important; }
      }
    `}</style>
     </>
   );
 };

export default SimpleLoginPage;
