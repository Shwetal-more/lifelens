import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDt0CG4R4Ivb_7oX9SR5a2JTqh_GzYcErw",
  authDomain: "lifelensapp-7191e.firebaseapp.com",
  projectId: "lifelensapp-7191e",
  storageBucket: "lifelensapp-7191e.appspot.com",
  messagingSenderId: "125867442372",
  appId: "1:125867442372:web:188133444be162857f8991"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
