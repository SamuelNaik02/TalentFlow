import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3DhQakWUByf0endFgeb4-HeL_GHzWpd8",
  authDomain: "talentflow-demo.firebaseapp.com",
  projectId: "talentflow-demo",
  storageBucket: "talentflow-demo.firebasestorage.app",
  messagingSenderId: "525765819309",
  appId: "1:525765819309:web:a9c0551e426d30ea87ff24",
  measurementId: "G-CS84WBGTL5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
