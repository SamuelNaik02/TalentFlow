# Firebase Authentication Setup

This document explains how to set up Firebase Authentication for the TalentFlow application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "TalentFlow")
   - Enable Google Analytics (optional)
   - Click "Create project"

### 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Enable the following sign-in providers:

#### Email/Password Authentication
- Click on **Email/Password**
- Toggle "Enable" switch
- Click **Save**

#### Google Authentication
- Click on **Google**
- Toggle "Enable" switch
- Select project support email
- Click **Save**

### 3. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your local development domain: `localhost`

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the Web app icon (`</>`)
4. Register your app (if not already done)
5. Copy the configuration object

### 5. Update Firebase Config

Open `src/config/firebase.ts` and replace the placeholder config with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 6. Install Dependencies

The Firebase package is already installed. If you need to reinstall:

```bash
npm install firebase
```

## Features Implemented

✅ **Email/Password Authentication**
- Sign in with email and password
- Sign up with email and password
- Password reset functionality

✅ **Google Sign-In**
- One-click authentication with Google account
- Opens Google sign-in popup

✅ **Error Handling**
- User-friendly error messages
- Loading states
- Disabled buttons during processing

✅ **Password Reset**
- "Lost password?" link functionality
- Sends password reset email
- Success/error feedback

## Usage

### Sign In
1. Enter email and password
2. Click "Sign In →"
3. User is authenticated and redirected to dashboard

### Sign Up
1. Switch to "Sign Up" tab
2. Enter username, email, and password
3. Click "Sign Up →"
4. Account is created and user is redirected to dashboard

### Google Sign-In
1. Click "Sign in with Google" button
2. Popup opens for Google authentication
3. After sign-in, user is redirected to dashboard

### Reset Password
1. Click "Lost password?" link
2. Password reset email is sent to the entered email
3. Check inbox for reset instructions

## Security Notes

⚠️ **Important**: This is a demo configuration. For production:

1. **Restrict Firebase API keys** in Firebase Console
2. **Enable email verification** for production accounts
3. **Add rate limiting** to prevent brute force attacks
4. **Use Firebase Security Rules** to protect user data
5. **Implement proper error logging** and monitoring

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that your API key in `firebase.ts` is correct
- Ensure the API key is not restricted in Firebase Console

### "Popup blocked"
- Allow popups for localhost in your browser
- Check browser settings for popup blockers

### "Network error"
- Check your internet connection
- Verify Firebase project status in console

## Support

For Firebase documentation:
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
