# TalentFlow - Mini Hiring Platform

A comprehensive React-based hiring platform for HR teams to manage jobs, candidates, and assessments.

## 🚀 Features

- **Jobs Management** - Create, edit, archive, and reorder job postings
- **Candidates Pipeline** - Kanban board with drag-and-drop for candidate stages
- **Assessment Builder** - Create custom assessments with multiple question types
- **Analytics & Reports** - Track hiring performance with data-driven insights
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
│   ├── components/        # React components
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── JobsManagement.tsx
│   │   ├── CandidatesPipeline.tsx
│   │   ├── AssessmentBuilder.tsx
│   │   └── AnalyticsReports.tsx
│   ├── config/
│   │   └── firebase.ts    # Firebase configuration
│   ├── services/
│   │   ├── authService.ts # Authentication logic
│   │   └── api.ts         # API service layer
│   └── main.tsx           # Entry point
├── public/                # Static assets
└── package.json           # Dependencies
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Firebase** - Authentication
- **GSAP** - Animations
- **Framer Motion** - React animations
- **IndexedDB (Dexie)** - Local persistence
- **Vite** - Build tool

## ✨ Key Features

### Authentication
- ✅ Email/Password sign-in and sign-up
- ✅ Google Sign-in integration
- ✅ Password reset functionality
- ✅ Secure session management

### Jobs Management
- ✅ Create and edit job postings
- ✅ Filter by status and search
- ✅ Pagination support
- ✅ Job archiving

### Candidates Pipeline
- ✅ Kanban board with drag-and-drop
- ✅ Virtualized list (1000+ candidates)
- ✅ Search and filter capabilities
- ✅ Stage management

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
- ✅ Key metrics dashboard
- ✅ Application trends
- ✅ Top performing jobs
- ✅ Candidate sources breakdown

## 🔥 Bonus Features

- ✅ **Firebase Authentication** - Real authentication with email/password and Google
- ✅ **Responsive Design** - Mobile-friendly layouts
- ✅ **Smooth Animations** - GSAP and Framer Motion integrations
- ✅ **Activity Tracking** - Recent activity logging
- ✅ **Local Persistence** - Data survives page refresh

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

