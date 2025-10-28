import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SimpleLoginPage from './components/SimpleLoginPage'
import SimpleDashboard from './components/SimpleDashboard'
import TestDashboard from './components/TestDashboard'
import SimpleDashboardMinimal from './components/SimpleDashboardMinimal'
import SimpleTest from './components/SimpleTest'
import UltraSimpleTest from './components/UltraSimpleTest'
import JobsManagement from './components/JobsManagement'
import CandidatesPipeline from './components/CandidatesPipeline'
import AssessmentBuilder from './components/AssessmentBuilder'
import AnalyticsReports from './components/AnalyticsReports'
// import { initializeDatabase } from './db'
import './App.css'

function App() {
  // Check if user was previously logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('talentflow-logged-in') === 'true'
  })
  useEffect(() => {
    // Initialize database
    // Temporarily disabled for debugging
    // initializeDatabase()
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem('talentflow-logged-in', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('talentflow-logged-in')
  }

  return (
    <Router>
      <div className="App">
        <Routes>
              <Route
                path="/login"
                element={
                  !isLoggedIn ? (
                    <SimpleLoginPage onLogin={handleLogin} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    <SimpleDashboard onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
          <Route 
            path="/jobs" 
            element={
              isLoggedIn ? (
                <JobsManagement onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/candidates" 
            element={
              isLoggedIn ? (
                <CandidatesPipeline onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/assessments" 
            element={
              isLoggedIn ? (
                <AssessmentBuilder onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/analytics" 
            element={
              isLoggedIn ? (
                <AnalyticsReports onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
