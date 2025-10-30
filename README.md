# TalentFlow - Mini Hiring Platform

[![Deploy to GitHub Pages](https://github.com/SamuelNaik02/TalentFlow/actions/workflows/deploy.yml/badge.svg)](https://github.com/SamuelNaik02/TalentFlow/actions/workflows/deploy.yml)

Live demo: https://samuelnaik02.github.io/TalentFlow/

A comprehensive React-based hiring platform for HR teams to manage jobs, candidates, and assessments.

**Created by:** SamuelNaik02

## 🚀 Features

- **Jobs Management** - Create, edit, archive, and reorder job postings
- **Candidates Pipeline** - Kanban board with drag-and-drop for candidate stages
- **Assessment Builder** - Create custom assessments with multiple question types
- **Assessments List** - View and manage all assessments
- **Analytics & Reports** - Track hiring performance with data-driven insights
- **Team Collaboration** - Review candidates, add comments, assign tasks, and collaborate with team members
- **Workflow Automation** - Create automated workflows for hiring processes
- **Offline Support** - Work offline with automatic sync when connection is restored
- **Firebase Authentication** - Secure email/password and Google sign-in
- **Welcome Emails** - Automatic welcome emails for new users

## 📋 Test Credentials

### Sign In Credentials:
```
Username: TalentFlow
Email: hr@talentflow.com
Password: TalentFlow123!
```

### Alternative Test Accounts:
```
Email: admin@talentflow.com
Password: TalentFlow123!

Email: recruitment@talentflow.com
Password: TalentFlow123!
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration** (Required for authentication)
   
   Follow the instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:
   - Create a Firebase project
   - Enable Authentication methods
   - Add localhost to authorized domains
   - Update `src/config/firebase.ts` with your credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Sign in with the test credentials above

## 📁 Project Structure

```
talentflow/
├── src/
│   ├── components/              # React components
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── JobsManagement.tsx
│   │   ├── JobModal.tsx
│   │   ├── CandidatesPipeline.tsx
│   │   ├── AssessmentBuilder.tsx
│   │   ├── AssessmentsList.tsx
│   │   ├── AnalyticsReports.tsx
│   │   ├── TeamCollaboration.tsx
│   │   ├── WorkflowAutomation.tsx
│   │   └── OfflineIndicator.tsx
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── services/
│   │   ├── authService.ts       # Authentication logic
│   │   ├── api.ts               # API service layer
│   │   ├── offlineService.ts    # Offline queue and sync
│   │   └── activityService.ts   # Activity tracking
│   ├── db/
│   │   ├── database.ts          # IndexedDB setup (Dexie)
│   │   └── seedDataGenerator.ts # Seed data generation
│   ├── hooks/
│   │   └── useOfflineStatus.ts  # Offline status hook
│   ├── mocks/
│   │   ├── handlers.ts          # MSW request handlers
│   │   └── browser.ts           # MSW browser setup
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── main.tsx                 # Entry point
├── public/
│   └── mockServiceWorker.js     # MSW service worker
└── package.json                 # Dependencies
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Firebase** - Authentication
- **GSAP** - Animations
- **Framer Motion** - React animations
- **IndexedDB (Dexie)** - Local persistence
- **React Query (@tanstack/react-query)** - Data fetching and caching
- **React Virtual (@tanstack/react-virtual)** - Virtualized lists
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **MSW (Mock Service Worker)** - API mocking for development
- **Lucide React** - Icon library
- **React Beautiful DnD** - Drag and drop functionality
- **Vite** - Build tool

## ✨ Key Features

### Authentication
- ✅ Email/Password sign-in and sign-up
- ✅ Google Sign-in integration
- ✅ Password reset functionality
- ✅ Secure session management

### Jobs Management
- ✅ Create and edit job postings
- ✅ AI-powered job generation with Gemini integration
- ✅ Job modal with multi-step form (Stepper)
- ✅ Filter by status and search
- ✅ Pagination support
- ✅ Job archiving
- ✅ Reorder job listings

### Candidates Pipeline
- ✅ Kanban board with drag-and-drop
- ✅ Virtualized list (1000+ candidates)
- ✅ Search and filter capabilities
- ✅ Stage management
- ✅ Pipeline Analytics with detailed metrics and visualizations
- ✅ Real-time statistics: conversion rates, pipeline distribution, performance metrics

### Assessment Builder
- ✅ Multiple question types:
  - Single choice
  - Multiple choice
  - Short text
  - Long text
  - Numeric
  - File upload
- ✅ Live preview
- ✅ Form validation

### Analytics & Reports
- ✅ Key metrics dashboard with animated counters
- ✅ Advanced application trends chart (line/area chart with interactive tooltips)
- ✅ Top performing jobs
- ✅ Candidate sources breakdown
- ✅ CSV export functionality for comprehensive reports

### Profile Management
- ✅ User profile page with personal information
- ✅ Security settings
- ✅ Preferences management
- ✅ TalentFlow color scheme integration

### Team Collaboration
- ✅ Create collaboration items with multi-step form (Stepper)
- ✅ Candidate review and feedback system
- ✅ Comments and discussions
- ✅ Task assignment and tracking
- ✅ Team member management
- ✅ Priority and status management
- ✅ File attachments
- ✅ Search and filter collaboration items

### Workflow Automation
- ✅ Create automated workflows with multi-step form (Stepper)
- ✅ Trigger-based automation (e.g., new candidate, status change)
- ✅ Action configuration (emails, notifications, status updates)
- ✅ Workflow execution history
- ✅ Enable/disable workflows
- ✅ Duplicate workflows
- ✅ Category and status filtering

### Offline Support
- ✅ Offline queue for API requests
- ✅ Automatic sync when connection is restored
- ✅ Offline indicator component
- ✅ Local data persistence with IndexedDB
- ✅ Seamless online/offline transitions

## 🔥 Bonus Features

- ✅ **Firebase Authentication** - Real authentication with email/password and Google
- ✅ **AI Integration** - Google Gemini API for intelligent job generation
- ✅ **Stepper Components** - Multi-step forms for better UX (Jobs, Team Collaboration, Workflows)
- ✅ **Responsive Design** - Mobile-friendly layouts
- ✅ **Smooth Animations** - GSAP and Framer Motion integrations
- ✅ **Activity Tracking** - Recent activity logging
- ✅ **Local Persistence** - Data survives page refresh
- ✅ **Offline-First Architecture** - Work without internet connection
- ✅ **API Mocking** - MSW for development and testing
- ✅ **Form Validation** - Yup schema validation with React Hook Form
- ✅ **Virtualized Lists** - High-performance rendering for large datasets
- ✅ **Type-Safe Development** - Full TypeScript coverage
- ✅ **Custom Stepper Component** - Reusable multi-step form component with visual indicators
- ✅ **Data Export** - CSV export functionality for analytics reports
- ✅ **Interactive Charts** - SVG-based charts with hover effects and tooltips
- ✅ **Consistent UI/UX** - Unified color scheme and font styles across all pages

## 📝 Usage

### Sign In
1. Go to the login page
2. Enter email and password
3. Click "Sign In →"

### Sign Up
1. Click the "Sign Up" tab
2. Enter username, email, and password
3. Click "Sign Up →"

### Google Sign-In
1. Click "Sign in with Google" button
2. Complete Google authentication
3. Redirected to dashboard

### Reset Password
1. Click "Lost password?" link
2. Enter your email
3. Check inbox for reset instructions

## 🐛 Troubleshooting

### Blank White Page
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors
- Verify Firebase configuration is correct

### Authentication Not Working
- Ensure Firebase Auth is enabled in Firebase Console
- Check that `localhost` is added to authorized domains
- Verify Firebase config credentials are correct

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Restart the dev server

## 📚 Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Firebase Email Templates Setup](./FIREBASE_EMAIL_TEMPLATES.md)
- [Firebase Console](https://console.firebase.google.com/)

## 📧 Welcome Emails

TalentFlow automatically sends welcome emails to new users upon sign-up:

- **Email/Password Sign-Up**: Sends email verification with a welcome message
- **Google Sign-In**: Logs welcome message to console
- **Custom Template**: Beautiful HTML email with TalentFlow branding

To customize the welcome email template, see [FIREBASE_EMAIL_TEMPLATES.md](./FIREBASE_EMAIL_TEMPLATES.md)

## 👤 Demo Credentials

```
Email: hr@talentflow.com
Password: TalentFlow123!
```

## 🎯 Evaluation Criteria

- ✅ Code Quality
- ✅ App Structure
- ✅ Functionality
- ✅ UI/UX
- ✅ State Management
- ✅ Authentication (Firebase)
- ✅ Documentation

## 📧 Support

For issues or questions, please refer to the documentation or contact support.

---

**Built with ❤️ using React, TypeScript, and Firebase**

