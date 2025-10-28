# Firebase Email Templates Setup

This guide explains how to set up custom welcome emails in Firebase Authentication.

## 📧 Setting Up Welcome Emails

### 1. Access Email Templates

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **talentflow-demo** project
3. Navigate to **Authentication** → **Templates**
4. Click on **Email address verification**

### 2. Customize Welcome Email Template

**Subject Line:**
```
Welcome to TalentFlow! 📋
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Roboto Slab', 'Georgia', serif;
      line-height: 1.6;
      color: #222222;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #1A3C34;
      margin-bottom: 10px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #F05A3C;
      border-radius: 50%;
      margin: 0 auto;
    }
    .welcome-title {
      font-size: 24px;
      color: #1A3C34;
      margin-bottom: 20px;
    }
    .content {
      margin: 20px 0;
      color: #666666;
    }
    .button {
      display: inline-block;
      background: #F05A3C;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E0E0E0;
      font-size: 14px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TalentFlow.</div>
      <div class="dot"></div>
    </div>
    
    <h2 class="welcome-title">Welcome to TalentFlow! 🎉</h2>
    
    <div class="content">
      <p>Hi there!</p>
      
      <p>Thank you for joining TalentFlow! We're excited to have you on board.</p>
      
      <p>TalentFlow is a comprehensive hiring platform designed to help you:</p>
      <ul>
        <li>📋 Manage job postings efficiently</li>
        <li>👥 Track candidates through your hiring pipeline</li>
        <li>📝 Create custom assessments</li>
        <li>📊 Analyze your hiring performance</li>
      </ul>
      
      <p>Please verify your email address to get started:</p>
      
      <a href="{{link}}" class="button">Verify Email Address</a>
      
      <p style="margin-top: 30px; font-size: 14px; color: #999999;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <span style="color: #F05A3C;">{{link}}</span>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2024 TalentFlow. All rights reserved.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
```

### 3. Customize the Template

1. Click **Edit** on the "Email address verification" template
2. Enable **Custom template**
3. Paste the HTML above into the editor
4. Customize the subject line
5. Click **Save**

### 4. Test the Email

**Important Firebase Variables:**
- `{{link}}` - Verification link (automatically replaced by Firebase)
- `{{displayName}}` - User's display name (optional)
- `{{email}}` - User's email (optional)

### 5. For Google Sign-In Users

Google-authenticated users don't need email verification, but you can:

**Option A: Console Welcome Message**
- Already implemented in the code
- Shows a welcome message in the console when signing in

**Option B: Cloud Function (Advanced)**
If you want to send actual welcome emails for Google sign-ins, you'll need to set up Firebase Cloud Functions (requires backend setup).

## 🔧 Current Implementation

The current implementation:

✅ **Sign Up** - Automatically sends welcome email verification  
✅ **Google Sign-In** - Logs welcome message to console  
✅ **Email Verification** - Users receive beautiful HTML welcome email

## 📝 Email Features Included

- Professional HTML template
- Responsive design
- TalentFlow branding
- Call-to-action button
- Link fallback for email clients
- Footer with copyright info

## 🎯 Result

When users sign up with email/password, they will automatically receive a beautiful welcome email like:

```
Subject: Welcome to TalentFlow! 📋

Welcome to TalentFlow! 🎉

Hi there!

Thank you for joining TalentFlow! We're excited to have you on board.

TalentFlow is a comprehensive hiring platform designed to help you:
• Manage job postings efficiently
• Track candidates through your hiring pipeline
• Create custom assessments
• Analyze your hiring performance

Please verify your email address to get started:

[Verify Email Address Button]
```

## 🔄 Next Steps

1. Set up the email template in Firebase Console (follow steps above)
2. Test by signing up a new user
3. Check the user's email inbox for the welcome message
4. Customize the template to match your brand colors and style

---

**Need Help?**
- [Firebase Email Templates Docs](https://firebase.google.com/docs/auth/custom-email)
- [Firebase Console](https://console.firebase.google.com/)

