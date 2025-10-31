import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SimpleLoginPage from './components/SimpleLoginPage'
import SimpleDashboard from './components/SimpleDashboard'
import JobsManagement from './components/JobsManagement'
import JobDetails from './components/JobDetails'
import CandidateProfile from './components/CandidateProfile'
import VirtualizedCandidatesList from './components/VirtualizedCandidatesList'
import CandidatesPipeline from './components/CandidatesPipeline'
import CandidatesListPage from './components/CandidatesListPage'
import AssessmentBuilder from './components/AssessmentBuilder'
import AssessmentsList from './components/AssessmentsList'
import AnalyticsReports from './components/AnalyticsReports'
import TeamCollaboration from './components/TeamCollaboration'
import WorkflowAutomation from './components/WorkflowAutomation'
import ProfilePage from './components/ProfilePage'
import OfflineIndicator from './components/OfflineIndicator'
import './App.css'

function App() {
  // Check if user was previously logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('talentflow-logged-in') === 'true'
  })

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
        <OfflineIndicator />
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
            path="/jobs/:id" 
            element={
              isLoggedIn ? (
                <JobDetails />
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
            path="/candidates-list" 
            element={
              isLoggedIn ? (
                <VirtualizedCandidatesList />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/candidates/:id" 
            element={
              isLoggedIn ? (
                <CandidateProfile />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/candidates-list-page" 
            element={
              isLoggedIn ? (
                <CandidatesListPage onLogout={handleLogout} />
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
            path="/assessments-seed" 
            element={
              isLoggedIn ? (
                <AssessmentsList onLogout={handleLogout} />
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
            path="/collaboration" 
            element={
              isLoggedIn ? (
                <TeamCollaboration onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/automation" 
            element={
              isLoggedIn ? (
                <WorkflowAutomation onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <ProfilePage onLogout={handleLogout} />
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
