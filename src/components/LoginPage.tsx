import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [activeSlide, setActiveSlide] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const slides = [
    {
      title: "WE NEED A",
      subtitle: "DESIGNER",
      tagline: "Obviously.",
      strips: "Creative solutions needed"
    },
    {
      title: "HIRING MADE",
      subtitle: "EASY",
      tagline: "Streamlined.",
      strips: "Find the right talent"
    },
    {
      title: "TALENT",
      subtitle: "FLOW",
      tagline: "Efficiently.",
      strips: "Connect with candidates"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle login logic here
    onLogin();
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked');
    // Handle Google sign in logic here
  };

  return (
    <div className="login-container">
      {/* Left Panel */}
      <div className="login-left-panel">
        {/* Paper Flyer */}
        <div className="paper-flyer">
          <div className="flyer-text flyer-text-large">
            {slides[activeSlide].title}
          </div>
          <div className="flyer-text flyer-text-large">
            {slides[activeSlide].subtitle}
          </div>
          <div className="flyer-text flyer-text-small">
            {slides[activeSlide].tagline}
          </div>
          <div className="tear-strips">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="tear-strip">
                {slides[activeSlide].strips}
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome</h1>
          <p className="welcome-description">
            TalentFlow is here to revolutionize hiring by connecting businesses with top talent through our comprehensive recruitment platform. Streamline your hiring process with advanced candidate management, automated assessments, and intelligent matching.
          </p>
        </div>

        {/* Navigation Icons */}
        <div className="chat-icon">
          💬
        </div>
        <div className="clap-icon">
          👏
        </div>

        {/* Navigation Dots */}
        <div className="nav-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`nav-dot ${activeSlide === index ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <h1 className="login-title">Sign in to TalentFlow</h1>

          {/* Google Sign In */}
          <button className="google-signin-btn" onClick={handleGoogleSignIn}>
            <div className="google-logo">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            Sign in with Google
          </button>

          {/* Separator */}
          <div className="separator">
            <span>or sign in with email</span>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </div>
            <div 
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Username or email address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="remember-checkbox"
                id="rememberMe"
              />
              <label htmlFor="rememberMe" className="remember-label">
                Remember me
              </label>
            </div>

            <button type="submit" className="signin-btn">
              Sign In
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="shopping-cart">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <div className="cart-badge">0</div>
      </div>
    </div>
  );
};

export default LoginPage;
