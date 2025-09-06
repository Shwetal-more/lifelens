import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDt0CG4R4Ivb_7oX9SR5a2JTqh_GzYcErw",
  authDomain: "lifelensapp-7191e.firebaseapp.com",
  projectId: "lifelensapp-7191e",
  storageBucket: "lifelensapp-7191e.firebasestorage.app",
  messagingSenderId: "125867442372",
  appId: "1:125867442372:web:188133444be162857f8991"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
