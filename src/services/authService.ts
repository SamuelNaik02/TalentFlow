import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Google Sign-In Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: userCredential.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message || 'An error occurred'
    };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send welcome email verification
    try {
      await sendEmailVerification(userCredential.user);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.log('Could not send welcome email:', emailError);
      // Don't fail the sign up if email fails
    }
    
    return {
      user: userCredential.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message || 'An error occurred'
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: result.user,
      error: null
    };
  } catch (error: any) {
    return {
      user: null,
      error: error.message || 'An error occurred'
    };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred'
    };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred'
    };
  }
};

// Send welcome email verification
export const sendWelcomeEmail = async () => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      return {
        success: true,
        message: 'Welcome email sent! Please check your inbox.',
        error: null
      };
    }
    return {
      success: true,
      message: 'User already verified',
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      message: null,
      error: error.message || 'Failed to send welcome email'
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
